import { useRouter } from 'next/router';
import { useCallback, useEffect, useReducer, useState } from 'react'
import { StrategyDirection } from '../components/Builder/types';
import { getStrikeQuote, LyraBoard, LyraMarket, LyraStrike, useLyra, useLyraMarket } from '../queries/lyra/useLyra';

import {
  BuilderProviderState,
  BuilderAction,
  builderInitialState,
  builderReducer,
} from '../reducers'
import { fromBigNumber, toBN } from '../utils/formatters/numbers';
import { extrensicValueFilter } from '../utils/formatters/optiontypes';
import { trpc } from '../utils/trpc';

export const useBuilder = () => {
  const [state, dispatch] = useReducer(
    builderReducer,
    builderInitialState
  );

  const {
    isPrebuilt,
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
    generateURL,
    isSharedStrategy,
    errorInSharedStrategy,
    hasLoadedSharedStrategy
  } = state;

  const lyra = useLyra();
  const { data, isLoading } = useLyraMarket();

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

  const { query: { strategy } } = useRouter();

  const [strategyHash, setStrategyHash] = useState<string>('');

  useEffect(() => {
    if (strategy != null && !Array.isArray(strategy)) {
      setStrategyHash(strategy);
    }
  }, [strategy]);

  const buildURL = trpc.useQuery(['builder-id', { hash: strategyHash }], {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const buildSharedStrategy = useCallback(async () => {
    if (buildURL.data && markets && markets.length > 0 && !isSharedStrategy && !hasLoadedSharedStrategy) {
      const { asset, board, expiry, generatedBy, hash, trades } = buildURL.data;
      const _selectedMarket = markets.find((market) => market.name == asset);

      if (!_selectedMarket) {
        dispatch({
          type: 'SET_ERROR_SHARED_BUILD',
          errorInSharedStrategy: true
        } as BuilderAction)
        return;
      }; // dispatch something else

      const _expirationDate = _selectedMarket?.liveBoards.find(liveBoard => liveBoard.id == board);

      if (_expirationDate && _expirationDate.strikesByOptionTypes) {
        const strikesOptionTypesKeys = Object.keys(_expirationDate.strikesByOptionTypes);

        const _strikesByIdAndOptionTypes: Record<number, Record<number, LyraStrike>> =
          strikesOptionTypesKeys.reduce((accum: any, key: any) => {
            const strikes = _expirationDate.strikesByOptionTypes ? _expirationDate.strikesByOptionTypes[key] : [];
            const strikesById = strikes?.reduce((accum: any, strike: LyraStrike) => {
              return { ...accum, [strike.id]: strike }
            }, {})
            return { ...accum, [parseInt(key)]: strikesById }
          }, {})

        const _strikes: any = await Promise.all(trades.map(async trade => {
          const { optionType, strikeId, size } = trade;
          const strikesByOptionTypesMapping = _strikesByIdAndOptionTypes[optionType];
          if (strikesByOptionTypesMapping) {
            const strike = strikesByOptionTypesMapping[strikeId];
            if (strike) {
              const { isCall, quote: { isBuy } } = strike;
              const _quote = await getStrikeQuote(lyra, isCall, isBuy, toBN(size.toString()), strike)
              return { ...strike, quote: _quote }
            }
          }
        }))
        console.log({ _strikes })
        dispatch({
          type: 'SET_SHARED_BUILD',
          strikes: _strikes,
          selectedMarket: _selectedMarket,
          selectedExpirationDate: _expirationDate,
          isSharedStrategy: true,
          errorInSharedStrategy: false,
          isValid: true,
          hasLoadedSharedStrategy: true
        } as BuilderAction)

      } else {
        dispatch({
          type: 'SET_ERROR_SHARED_BUILD',
          errorInSharedStrategy: true
        } as BuilderAction)
      }

    }
  }, [buildURL, markets, lyra, isSharedStrategy, hasLoadedSharedStrategy])

  useEffect(() => {
    if (buildURL.data && markets && markets.length > 0 && !isSharedStrategy) {
      buildSharedStrategy()
    }
  }, [buildSharedStrategy, buildURL, markets, isSharedStrategy])

  useEffect(() => {
    if (strikes.length > 0) {
      // max profit 

      // net credit 
      const creditDebit = strikes.reduce((accum: any, strike: any) => {
        const { quote: { size, isBuy, pricePerOption } } = strike;
        const totalPriceForOptions = fromBigNumber(pricePerOption) * fromBigNumber(size);

        return isBuy ? accum - totalPriceForOptions : accum + totalPriceForOptions;
      }, 0);

      dispatch({
        type: 'SET_POSITION_PNL',
        positionPnl: {
          netCreditDebit: creditDebit,
          maxLoss: 0,
          maxProfit: 0
        },
      } as BuilderAction)
    }
  }, [strikes])

  useEffect(() => {
    if (selectedMarket) {
      dispatch({
        type: 'SET_CURRENT_PRICE',
        currentPrice: fromBigNumber(selectedMarket.spotPrice),
      } as BuilderAction)
    }
  }, [selectedMarket])

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
      selectedStrategy: strategy
    })
  }

  const handleUpdateQuote = async (strikeUpdate: { strike: LyraStrike, size: string }) => {
    if (lyra && strikeUpdate && strikes.length > 0) {
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
    console.log({ selectedStrategy, selectedExpirationDate, currentPrice })
    if (currentPrice > 0 && selectedStrategy != null && selectedExpirationDate != null) {
      const { strikesByOptionTypes } = selectedExpirationDate;
      // if a trade has 2 of same they need to be merged and include size update quote 
      const _strikes = selectedStrategy.trade.map((trade, index) => {
        const { optionType, priceAt, order } = trade;
        const _optionTypeStrikes: [] = strikesByOptionTypes[optionType];
        let found = 0;
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

      })
      // if any _strikes are undefined, most likely strategy not valid for asset 
      if (_strikes.filter(_strike => _strike == undefined).length > 0) {
        console.log('something happened here 1')
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
      console.log('something happened here2 ')

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

  const handleToggleSelectedStrike = (strike: LyraStrike, selected: boolean) => {
    if (selected) {
      dispatch({
        type: 'SET_STRIKES',
        strikes: [...strikes, strike],
        isValid: true
      })
    } else {
      dispatch({
        type: 'SET_STRIKES',
        strikes: strikes.filter(({ id }: { id: number }) => {
          return id !== strike.id;
        }),
        isValid: true
      })
    }
  }

  const handleUpdatePrebuilt = (_isPrebuilt: boolean) => {
    dispatch({
      type: 'SET_PREBUILT',
      isPrebuilt: _isPrebuilt
    })
  }

  return {
    isPrebuilt,
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
    generateURL,
    isSharedStrategy,
    errorInSharedStrategy,
    hasLoadedSharedStrategy,
    handleSelectedMarket,
    handleSelectedExpirationDate,
    handleSelectedDirectionTypes,
    handleToggleSelectedStrike,
    handleSelectedStrategy,
    handleUpdateQuote,
    handleUpdatePrebuilt
  } as BuilderProviderState
}
