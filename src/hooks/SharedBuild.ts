import { useRouter } from 'next/router';
import { useCallback, useEffect, useReducer, useState } from 'react'
import { StrategyDirection } from '../components/Builder/types';
import { getStrikeQuote, LyraBoard, LyraMarket, LyraStrike, useLyra, useLyraMarket } from '../queries/lyra/useLyra';

import {
  SharedBuildAction,
  sharedBuildReducer,
  sharedBuildInitialState,
  SharedBuildProviderState,
} from '../reducers'
import { fromBigNumber, toBN } from '../utils/formatters/numbers';
import { extrensicValueFilter } from '../utils/formatters/optiontypes';
import { trpc } from '../utils/trpc';

export const useSharedBuild = () => {
  const [state, dispatch] = useReducer(
    sharedBuildReducer,
    sharedBuildInitialState
  );

  const {
    errorInSharedStrategy,
    errorReason,
    markets,
    isMarketLoading,
    selectedMarket,
    currentPrice,
    selectedExpirationDate,
    strikes,
    positionPnl
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

  const { query: { id: strategy } } = useRouter();

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
    staleTime: Infinity,
    cacheTime: Infinity
  });

  const buildSharedStrategy = useCallback(async () => {
    if (buildURL.data && markets && markets.length > 0 && strikes.length == 0 && !errorInSharedStrategy) {
      const { asset, board, expiry, trades } = buildURL.data;

      if (expiry * 1000 > Date.now()) {
        dispatch({
          type: 'SET_IS_EXPIRED',
          errorReason: 'Expired Board',
          errorInSharedStrategy: true
        })
      }

      const _selectedMarket = markets.find((market) => market.name == asset);

      if (!_selectedMarket) {
        dispatch({
          type: 'SET_ERROR_SHARED_BUILD',
          errorInSharedStrategy: true
        } as SharedBuildAction)
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
              const _quote = await getStrikeQuote(isCall, isBuy, toBN(size.toString()), strike)
              return { ...strike, quote: _quote }
            }
          }
        }))

        if (!_strikes.some((_strike: any) => _strike == undefined)) {
          dispatch({
            type: 'SET_SHARED_BUILD',
            strikes: _strikes,
            selectedMarket: _selectedMarket,
            selectedExpirationDate: _expirationDate,
          } as SharedBuildAction)
        } else {
          dispatch({
            type: 'SET_ERROR_SHARED_BUILD',
            errorReason: 'Invalid Strikes',
            errorInSharedStrategy: true
          } as SharedBuildAction)
        }

      } else {
        dispatch({
          type: 'SET_ERROR_SHARED_BUILD',
          errorReason: 'Market Not Found',
          errorInSharedStrategy: true
        } as SharedBuildAction)
      }
    }
  }, [buildURL, markets, strikes, errorInSharedStrategy])

  useEffect(() => {
    if (selectedMarket) {
      dispatch({
        type: 'SET_CURRENT_PRICE',
        currentPrice: fromBigNumber(selectedMarket.spotPrice),
      } as SharedBuildAction)
    }
  }, [selectedMarket])

  useEffect(() => {
    if (buildURL.data && markets && markets.length > 0 && strikes.length == 0 && !errorInSharedStrategy) {
      buildSharedStrategy()
    }
  }, [buildSharedStrategy, buildURL, markets, strikes, errorInSharedStrategy])


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
      } as SharedBuildAction)
    }
  }, [strikes])

  return {
    errorInSharedStrategy,
    errorReason,
    markets,
    isMarketLoading,
    selectedMarket,
    currentPrice,
    selectedExpirationDate,
    strikes,
    positionPnl
  } as SharedBuildProviderState
}
