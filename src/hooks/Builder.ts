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

export const useBuilder = () => {
  const [state, dispatch] = useReducer(
    builderReducer,
    builderInitialState
  );

  const {
    showStrikesSelect,
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
    generateURL
  } = state;

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
    if (strikeUpdate && strikes.length > 0) {
      const { strike: _strike, size } = strikeUpdate;
      const { id: _id, quote, isCall } = _strike;
      const { isBuy } = quote;

      const _quote = await getStrikeQuote(isCall, isBuy, toBN(size), _strike);

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

          // return id !== selectedStrike.id;

          const { id, isCall, quote: { isBuy } } = _strike
          // return selectedStrike.id !== id && selectedStrike.quote.isBuy != isBuy && !selectedStrike.isCall == isCall
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

  const handleUpdatePrebuilt = (_isPrebuilt: boolean) => {
    dispatch({
      type: 'SET_PREBUILT',
      isPrebuilt: _isPrebuilt
    })
  }

  return {
    showStrikesSelect,
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
    handleSelectedMarket,
    handleSelectedExpirationDate,
    handleSelectedDirectionTypes,
    handleToggleSelectedStrike,
    handleSelectedStrategy,
    handleUpdateQuote,
    handleUpdatePrebuilt,
    handleBuildNewStrategy
  } as BuilderProviderState
}
