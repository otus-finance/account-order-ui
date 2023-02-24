import Lyra, { AccountQuoteBalance, Chain, OptionType, Trade } from '@lyrafinance/lyra-js';
import { ethers, PopulatedTransaction } from 'ethers';
import { useCallback, useEffect, useReducer, useState } from 'react'
import { Strategy, StrategyDirection } from '../utils/types';
import { getStrikeQuote, LyraBoard, LyraChain, LyraMarket, LyraStrike, useLyraMarket } from '../queries/lyra/useLyra';

import {
  useSigner,
  useAccount
} from 'wagmi';

import {
  AccountProviderState,
  AccountAction,
  accountInitialState,
  accountReducer,
} from '../reducers'

export const useLyraTrade = (lyra: Lyra | null, strike: LyraStrike | null) => {
  const [state, dispatch] = useReducer(
    accountReducer,
    accountInitialState
  );

  const {
    isLoading,
    tradeInit,
    marketAddress,
    quoteAsset
  } = state;

  const { address } = useAccount();

  const buildLyraTrade = useCallback(async () => {
    if (lyra && address && strike) {
      dispatch({
        type: "SET_LOADING",
        isLoading: true
      })

      const { id, market, quote: { isCall, isBuy, size } } = strike;
      const trade = await lyra.trade(address, market, id, isCall, isBuy, size, 0.1 / 100);
      dispatch({
        type: "SET_TRADE_INIT",
        tradeInit: trade,
        marketAddress: trade.marketAddress
      } as AccountAction)
    }
  }, [lyra, address, strike])

  useEffect(() => {
    if (lyra && address && strike) {
      buildLyraTrade();
    }
  }, [lyra, address, strike, buildLyraTrade])

  const fetchMarketQuoteBalance = useCallback(async () => {
    if (lyra && address && marketAddress) {
      const account = lyra.account(address);
      const marketBalance = await account.marketBalances(marketAddress)
      const _quoteAsset = marketBalance.quoteAsset;
      dispatch({
        type: 'SET_QUOTE_ASSET',
        quoteAsset: _quoteAsset,
        isLoading: false
      } as AccountAction)
    }
  }, [lyra, address, marketAddress])


  useEffect(() => {
    if (lyra && address && marketAddress) {
      fetchMarketQuoteBalance();
    }
  }, [lyra, address, marketAddress, fetchMarketQuoteBalance])

  return {
    isLoading,
    tradeInit,
    marketAddress,
    quoteAsset,
    fetchMarketQuoteBalance
  } as AccountProviderState
}
