import React, { useCallback, useState } from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { formatUSD, fromBigNumber, toBN } from '../../../utils/formatters/numbers';
import { MAX_BN, ZERO_BN } from '../../../constants/bn';

import {
  useConnectModal,
  useChainModal,
} from '@rainbow-me/rainbowkit'

import { useAccount, useNetwork } from 'wagmi'

import { useLyraTrade } from '../../../hooks';
import useTransaction from '../../../hooks/Transaction';
import { Spinner } from '../../UI/Components/Spinner';
import { useAccountContext } from '../../../context/AccountContext';

export const StrikeTrade = () => {

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const { openConnectModal } = useConnectModal();

  const { openChainModal } = useChainModal();

  const {
    selectedChain,
    lyra,
    strikes,
    positionPnl
  } = useBuilderContext();

  const {
    netCreditDebit,
    collateralRequired,
    maxCost
  } = positionPnl

  const { isLoading, quoteAsset, tradeInit, fetchMarketQuoteBalance } = useAccountContext();

  const [isLoadingTx, setLoadingTx] = useState(false);

  const execute = useTransaction(lyra?.provider || null, lyra?.network || null);

  const handleApproveQuote = useCallback(async () => {

    if (!tradeInit) {
      console.warn('No trade available');
      return null;
    }

    if (!address) {
      console.warn('No user address');
      return null;
    }

    setLoadingTx(true);

    const tx = await tradeInit.approveQuote(address, MAX_BN);

    await execute(tx, {
      onComplete: async () => {
        fetchMarketQuoteBalance();
        setLoadingTx(false);
        // logEvent(LogEvent.TradeApproveSuccess, {
        //   isBase: false,
        // })
      },
      onError: async () => {
        setLoadingTx(false);
      }
    });

  }, [fetchMarketQuoteBalance, execute, address, tradeInit])

  const handleExecuteMultiTrade = useCallback(async () => {

    if (!lyra) {
      console.warn('No lyra instance availalbe');
      return null;
    }

    if (!address) {
      console.warn('No user address');
      return null;
    }

    setLoadingTx(true);

    const trades = await Promise.all(strikes.map(async strike => {
      const { market, quote: { isCall, isBuy, size } } = strike;

      let _tradeOptions = { iterations: 3, setToCollateral: ZERO_BN, setToFullCollateral: false };

      if (!isBuy) {
        if (isCall) {
          const _collateral = fromBigNumber(size) * fromBigNumber(strike.strikePrice) * 2.5;
          _tradeOptions = { ..._tradeOptions, setToCollateral: toBN(_collateral.toString()) }
        } else {
          _tradeOptions = { ..._tradeOptions, setToFullCollateral: true }
        }
      }

      const _trade = await lyra.trade(address, market, strike.id, isCall, isBuy, size, 0.1 / 100, _tradeOptions);
      return _trade;
    }));

    const txs = trades.map(trade => {
      return trade.tx;
    })

    try {
      await Promise.all(txs.map(async tx => {
        await execute(tx, {});
      }))
      setLoadingTx(false);
    } catch (error) {
      setLoadingTx(false);
    }


  }, [strikes, lyra, address, execute])

  return <div className='col-span-2 sm:col-span-2 grid grid-cols-2'>

    <div className="col-span-2 my-8">
      <table className="min-w-full divide-y divide-zinc-700">
        <thead className="bg-zinc-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-light uppercase text-white">
              Option Type
            </th>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-light uppercase text-white sm:pl-6">
              Strike
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell">
              Size
            </th>
            <th scope="col" className="px-3 py-3.5 text-xs font-light uppercase text-white sm:table-cell text-right">
              Credit/(Debit)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700 bg-zinc-800">
          {
            strikes.map(strike => {
              const { quote: { size, premium, isCall, isBuy }, strikePrice } = strike;
              return <tr key={strike.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
                  {isBuy ? <span className='text-zinc-100 font-light p-1'>Buy</span> : <span className='text-zinc-100 font-light p-1'>Sell</span>}
                  {isCall ? <span className='text-emerald-700 font-light p-1 block'>Call</span> : <span className='text-pink-700 font-light p-1 block'>Put</span>}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
                  {formatUSD(fromBigNumber(strikePrice))}
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">{fromBigNumber(size)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell text-right">
                  {isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium)))}
                </td>
              </tr>
            })
          }

        </tbody>
      </table>
    </div>

    <div className='col-span-2 grid grid-cols-2'>
      <div className='text-xs text-zinc-200 py-2'>
        Min. Premium Received
      </div>
      <div className='text-xs text-white font-semibold col-span-1 text-right  py-2'>{formatUSD(netCreditDebit < 0 ? 0 : netCreditDebit)}</div>

      <div className=' col-span-1 text-xs text-zinc-200  py-2'>
        Collateral Required
      </div>
      <div className='text-xs text-white font-semibold col-span-1 text-right  py-2'>{formatUSD(collateralRequired)}</div>

      <div className=' col-span-1 text-xs text-zinc-200  py-2'>
        Max Cost
      </div>
      <div className='text-xs text-white font-semibold col-span-1 text-right  py-2'>{formatUSD(maxCost)}</div>

      <div className='text-xs text-zinc-200 py-4 border-t border-zinc-700'>
        Total Funds Required
      </div>
      <div className='text-xs text-white font-semibold col-span-1 text-right border-t border-zinc-700 py-4'>{formatUSD(collateralRequired + maxCost)}</div>


      <div className='text-xs text-zinc-200 py-4 border-t border-zinc-700'>
        {quoteAsset?.symbol} Balance
      </div>
      <div className='text-xs text-white font-semibold col-span-1 text-right border-t border-zinc-700 py-4'>{quoteAsset && formatUSD(fromBigNumber(quoteAsset.balance))}</div>

    </div>

    <div className="col-span-2 mt-3">

      {/* is loading */}
      {
        isLoading &&
        <div onClick={() => console.warn('Add funds')} className="cursor-disabled border border-zinc-800 hover:border-emerald-800 bg-zinc-800 p-2 col-span-3 font-normal text-sm text-white text-center rounded-2xl">
          <Spinner />
        </div>
      }

      {/* insufficient balance */}
      {
        isConnected && chain?.id === selectedChain?.chainId && quoteAsset && quoteAsset.balance.isZero() &&
        <div onClick={() => console.warn('Add funds')} className="cursor-disabled border border-zinc-800 hover:border-emerald-800 bg-zinc-800 p-2 col-span-3 font-normal text-sm text-white text-center rounded-2xl">
          Insufficient Balance
        </div>
      }


      {/* wallet connected / correct chain / quote asset not approved */}
      {
        isConnected && chain?.id === selectedChain?.chainId && quoteAsset && quoteAsset.tradeAllowance.isZero() && !quoteAsset.balance.isZero() &&
        <div onClick={() => handleApproveQuote()} className="cursor-pointer border border-zinc-800 hover:bg-emerald-600 bg-zinc-900 p-2 col-span-3 font-normal text-sm text-white text-center rounded-2xl">
          Approve Quote
        </div>
      }

      {/* wallet connected / correct chain / quote asset approved */}
      {
        isConnected && chain?.id === selectedChain?.chainId && quoteAsset && !quoteAsset.tradeAllowance.isZero() && !quoteAsset.balance.isZero() &&
        <div onClick={() => handleExecuteMultiTrade()} className="cursor-pointer border border-emerald-700 hover:bg-emerald-600 bg-zinc-900 p-2 col-span-3 font-normal text-sm text-white text-center rounded-2xl">
          {isLoadingTx ? <Spinner /> : 'Execute Trade'}
        </div>
      }

      {/* wallet connected but wrong chain */}
      {
        isConnected && chain?.id != selectedChain?.chainId &&

        <div onClick={openChainModal} className="cursor-pointer border border-zinc-700 hover:border-emerald-700 p-2 col-span-3 font-normal text-sm text-white text-center rounded-2xl">
          Wrong network
        </div>
      }

      {/* wallet not connected */}
      {
        !isLoading && !isConnected && openConnectModal &&
        <div onClick={openConnectModal} className="cursor-pointer border border-zinc-700 hover:border-emerald-700 p-2 col-span-3 font-normal text-sm text-white text-center rounded-2xl">
          Connect Wallet
        </div>
      }


    </div>

  </div>
}

const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
  return isBuy ? `(${usd})` : usd
}