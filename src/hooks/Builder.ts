import Lyra, { Chain } from '@lyrafinance/lyra-js';
import { ethers } from 'ethers';
import { useCallback, useEffect, useReducer } from 'react'
import { StrategyDirection } from '../utils/types';
import { getStrikeQuote, LyraBoard, LyraChain, LyraMarket, LyraStrike, useLyraMarket } from '../queries/lyra/useLyra';

import {
  BuilderProviderState,
  BuilderAction,
  builderInitialState,
  builderReducer,
} from '../reducers'
import { fromBigNumber, toBN } from '../utils/formatters/numbers';
import { extrensicValueFilter } from '../utils/formatters/optiontypes';

const INFURA_ID_PUBLIC = process.env.NEXT_PUBLIC_INFURA_ID;
const arbitrumUrl = `https://arbitrum-mainnet.infura.io/v3/${INFURA_ID_PUBLIC}`;
const optimismUrl = `https://optimism-mainnet.infura.io/v3/${INFURA_ID_PUBLIC}`;

const getLyra = async (chain: LyraChain) => {
  const url = chain.name === Chain.Optimism ? optimismUrl : arbitrumUrl;
  const provider = new ethers.providers.JsonRpcProvider(url);
  await provider.getNetwork()
  {/* @ts-ignore  different types in JsonRpcProvider in lyra-js */ }
  return new Lyra({ provider });
}

export const useBuilder = () => {
  const [state, dispatch] = useReducer(
    builderReducer,
    builderInitialState
  );

  const {
    lyra,
    selectedChain,
    showStrikesSelect,
    markets,
    isMarketLoading,
    currentPrice,
    selectedMarket,
    selectedDirectionTypes,
    selectedExpirationDate,
    selectedStrategy,
    strikes,
    positionPnl,
    isValid,
    isBuildingNewStrategy,
  } = state;

  const handleSelectedChain = (chain: LyraChain) => {
    dispatch({
      type: 'SET_CHAIN',
      selectedChain: chain,
      selectedMarket: null,
      strikes: [],
      selectedExpirationDate: null,
      selectedStrategy: null,
    })
  }

  const updateSelectedChain = useCallback(async () => {

    if (selectedChain) {
      const lyra = await getLyra(selectedChain);
      dispatch({
        type: 'SET_LYRA',
        lyra: lyra,
      })
    }
  }, [selectedChain])

  useEffect(() => {
    try {
      updateSelectedChain()
    } catch (error) {
      console.warn({ error })
    }

  }, [updateSelectedChain, selectedChain])

  useEffect(() => {
    if (!selectedChain) {
      dispatch({
        type: 'SET_CHAIN',
        selectedChain: {
          name: Chain.Optimism,
          chainId: 10
        },
        selectedMarket: null,
        strikes: [],
        selectedExpirationDate: null,
        selectedStrategy: null,
      })
    }

  }, [selectedChain])


  const { data, isLoading } = useLyraMarket(lyra);

  useEffect(() => {
    if (data && data?.length > 0) {
      dispatch({
        type: 'SET_MARKETS',
        markets: data,
        isMarketLoading: isLoading
      })
    } else {
      dispatch({
        type: 'SET_MARKETS_LOADING',
        isMarketLoading: isLoading
      })
    }
  }, [data, isLoading])

  useEffect(() => {
    if (strikes.length > 0) {

      const pnl = strikes.reduce((accum: any, strike: any) => {
        const { quote: { size, isBuy, pricePerOption, strikePrice } } = strike;

        const totalPriceForOptions = fromBigNumber(pricePerOption) * fromBigNumber(size);
        const totalCollateralUsed = fromBigNumber(strikePrice) * fromBigNumber(size);

        const { netCreditDebit, maxLoss, maxProfit } = accum;

        const _netCreditDebit = isBuy ? netCreditDebit - totalPriceForOptions : netCreditDebit + totalPriceForOptions;
        const _maxLoss = isBuy ? maxLoss + totalPriceForOptions : totalCollateralUsed;
        const _maxProfit = isBuy ? Infinity : maxProfit + totalPriceForOptions;

        return { netCreditDebit: _netCreditDebit, maxLoss: _maxLoss, maxProfit: _maxProfit }
      }, { netCreditDebit: 0, maxLoss: 0, maxProfit: 0 });


      dispatch({
        type: 'SET_POSITION_PNL',
        positionPnl: pnl,
      } as BuilderAction)
    }
  }, [strikes])

  useEffect(() => {

    if (selectedStrategy && isBuildingNewStrategy) {
      dispatch({
        type: 'SET_STRIKES_SELECT_SHOW',
        showStrikesSelect: true
      })
    }

    if (isBuildingNewStrategy) {
      dispatch({
        type: 'SET_STRIKES_SELECT_SHOW',
        showStrikesSelect: true
      })
    } else {
      dispatch({
        type: 'SET_STRIKES_SELECT_SHOW',
        showStrikesSelect: false
      })
    }


  }, [selectedStrategy, isBuildingNewStrategy])

  useEffect(() => {
    if (selectedMarket) {
      dispatch({
        type: 'SET_CURRENT_PRICE',
        currentPrice: fromBigNumber(selectedMarket.spotPrice),
      } as BuilderAction)
    }
  }, [selectedMarket])

  const handleBuildNewStrategy = (_isBuildNewStrategy: boolean) => {
    dispatch({
      type: 'SET_BUILD_NEW_STRATEGY',
      isBuildingNewStrategy: _isBuildNewStrategy
    })
  }

  const handleSelectedMarket = (market: LyraMarket) => {
    dispatch({
      type: 'SET_MARKET',
      selectedMarket: market,
      strikes: [],
      selectedExpirationDate: null,
      selectedStrategy: null,
    } as BuilderAction)

  }

  const handleSelectedDirectionTypes = (directionTypes: StrategyDirection[]) => {
    dispatch({
      type: 'SET_DIRECTION_TYPES',
      selectedDirectionTypes: directionTypes
    } as BuilderAction)
  }

  const handleSelectedExpirationDate = (expirationDate: LyraBoard) => {
    dispatch({
      type: 'SET_EXPIRATION_DATE',
      selectedExpirationDate: expirationDate
    } as BuilderAction)
  }

  const handleSelectedStrategy = (strategy: any) => {
    dispatch({
      type: 'SET_STRATEGY',
      selectedStrategy: strategy,
      strikes: [],
      isBuildingNewStrategy: false
    })
  }

  const handleUpdateQuote = async (strikeUpdate: { strike: LyraStrike, size: string }) => {
    if (strikeUpdate && strikes.length > 0 && lyra) {
      const { strike: _strike, size } = strikeUpdate;
      const { id: _id, quote, isCall } = _strike;
      const { isBuy } = quote;

      const _quote = await getStrikeQuote(lyra, isCall, isBuy, toBN(size), _strike);

      const _updateStrikes: any = strikes.map((strike: LyraStrike) => {
        const { id } = strike;
        if (id == _id) {
          return { ...strike, quote: _quote }
        } else {
          return strike;
        }

      });

      dispatch({
        type: 'UPDATE_STRIKES',
        strikes: _updateStrikes
      })
    }
  }

  const filterStrikes = useCallback(() => {

    if (currentPrice > 0 && selectedStrategy != null && selectedExpirationDate != null) {
      const { strikesByOptionTypes } = selectedExpirationDate;
      // if a trade has 2 of same they need to be merged and include size update quote 
      const _strikes = selectedStrategy.trade.map((trade: any) => {
        const { optionType, priceAt, order } = trade;
        if (strikesByOptionTypes) {
          const _optionTypeStrikes: LyraStrike[] | undefined = strikesByOptionTypes[optionType];
          let found = 0;
          {/* @ts-ignore */ }
          return _optionTypeStrikes.find(strike => {
            const { strikePrice, isCall } = strike;
            const _strikePrice = fromBigNumber(strikePrice);
            let foundMatch = extrensicValueFilter(priceAt, isCall, currentPrice || 0, _strikePrice);
            if (foundMatch && order == found) {
              return true;
            } if (foundMatch && order != found) {
              found++;
            } else {
              return false;
            }
          });
        }
      })
      // if any _strikes are undefined, most likely strategy not valid for asset 
      if (_strikes.filter((_strike: any) => _strike == undefined).length > 0) {
        dispatch({
          type: 'SET_STRIKES',
          strikes: [],
          isValid: false
        })
      } else {
        dispatch({
          type: 'SET_STRIKES',
          strikes: _strikes,
          isValid: true
        })
      }
    } else {
      dispatch({
        type: 'SET_STRIKES',
        strikes: [],
        isValid: true
      })
    }
  }, [currentPrice, selectedStrategy, selectedExpirationDate]);

  useEffect(() => {
    if (selectedStrategy != null && selectedExpirationDate != null) {
      filterStrikes();
    }
  }, [filterStrikes, currentPrice, selectedStrategy, selectedExpirationDate]);

  const handleToggleSelectedStrike = (selectedStrike: LyraStrike, selected: boolean) => {
    if (selected) {
      dispatch({
        type: 'SET_STRIKES',
        strikes: [...strikes, selectedStrike],
        isValid: true
      })
    } else {
      dispatch({
        type: 'SET_STRIKES',
        strikes: strikes.filter((_strike: LyraStrike) => {

          const { id, isCall, quote: { isBuy } } = _strike
          if (selectedStrike.id !== id) {
            return true;
          } else if (selectedStrike.quote.isBuy !== isBuy) {
            return true;
          } else if (selectedStrike.isCall !== isCall) {
            return true;
          } else {
            return false
          }
        }),
        isValid: true
      })
    }
  }

  return {
    lyra,
    selectedChain,
    showStrikesSelect,
    markets,
    isMarketLoading,
    currentPrice,
    selectedMarket,
    selectedDirectionTypes,
    selectedExpirationDate,
    selectedStrategy,
    strikes,
    positionPnl,
    isValid,
    isBuildingNewStrategy,
    handleSelectedChain,
    handleSelectedMarket,
    handleSelectedExpirationDate,
    handleSelectedDirectionTypes,
    handleToggleSelectedStrike,
    handleSelectedStrategy,
    handleUpdateQuote,
    handleBuildNewStrategy
  } as BuilderProviderState
}
