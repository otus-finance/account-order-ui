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
import { formatName } from '../Market/SelectMarket';
import { DebounceInput } from 'react-debounce-input';

export const StrikeTrade = () => {

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const { openConnectModal } = useConnectModal();

  const { openChainModal } = useChainModal();

  const {
    selectedMarket,
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

  const { handleUpdateQuote } = useBuilderContext();

  return <>
    {
      selectedMarket &&
      <div className='col-span-1 sm:col-span-1 grid grid-cols-1'>

        <div className="col-span-1">

          {
            strikes.map((strike, index) => {
              const { quote: { size, pricePerOption, isCall, isBuy }, strikePrice } = strike;
              return <div key={index} className="border-b border-zinc-800">
                <div className='p-2'>
                  <div className='text-white font-semibold text-sm p-2'>
                    {`${isBuy ? 'Buy' : 'Sell'} ${formatName(selectedMarket?.name)} ${formatUSD(strikePrice, { dps: 2 })}  ${isCall ? 'Call' : 'Put'} `}
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <p className="truncate font-sans text-xs font-normal text-white">
                      Contracts
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      <label htmlFor="size" className="sr-only">
                        Size
                      </label>
                      <div className="mt-1">
                        <DebounceInput
                          minLength={1}
                          debounceTimeout={300}
                          onChange={async (e) => {
                            if (e.target.value == '') return
                            const value = parseFloat(e.target.value);
                            handleUpdateQuote({ size: value.toString(), strike: strike });
                          }}
                          type="number"
                          name="size"
                          id="size"
                          value={fromBigNumber(size)}
                          className="block w-24 rounded-sm border border-zinc-700 bg-transparent px-4 pr-2 py-2 text-right text-zinc-200 shadow-sm  sm:text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <p className="truncate font-sans text-xs font-normal text-white">
                      Price Per Option
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
                        {formatUSD(fromBigNumber(pricePerOption))}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            })
          }
        </div>

        <div className="col-span-1">
          <div className='p-2'>
            <div className='flex gap-8'>
              <div className='p-2 text-xs text-zinc-200 hover:font-semibold cursor-pointer'>Market</div>
              <div className='p-2 text-xs text-zinc-200 hover:font-semibold cursor-pointer'>Limit</div>
              <div className='p-2 text-xs text-zinc-200 hover:font-semibold cursor-pointer'>Trigger</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 border-b border-zinc-800">
          <div className='p-4'>

            <div className='border border-zinc-800 p-2'>
              <div className="flex items-center justify-between p-2">
                <div>
                  <p className="truncate font-sans text-xs font-normal text-white">
                    Price Per Option
                  </p>
                  <div>
                    test
                  </div>
                </div>

                <div className="ml-2 flex flex-shrink-0">
                  <p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
                    Current Price: $10.22
                  </p>
                  <div>
                    USD
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className='col-span-1 grid grid-cols-2'>

          <div className='text-xs text-zinc-200'>
            Min. Premium Received
          </div>
          <div className='text-xs text-white font-semibold col-span-1 text-right'>{formatUSD(netCreditDebit < 0 ? 0 : netCreditDebit)}</div>

          <div className=' col-span-1 text-xs text-zinc-200'>
            Collateral Required
          </div>
          <div className='text-xs text-white font-semibold col-span-1 text-right'>{formatUSD(collateralRequired)}</div>

          <div className=' col-span-1 text-xs text-zinc-200'>
            Max Cost
          </div>
          <div className='text-xs text-white font-semibold col-span-1 text-right'>{formatUSD(maxCost)}</div>

          <div className='text-xs text-zinc-200 border-t border-zinc-700'>
            Total Funds Required
          </div>
          <div className='text-xs text-white font-semibold col-span-1 text-right border-t border-zinc-700'>{formatUSD(collateralRequired + maxCost)}</div>


          <div className='text-xs text-zinc-200 border-t border-zinc-700'>
            {quoteAsset?.symbol} Balance
          </div>
          <div className='text-xs text-white font-semibold col-span-1 text-right border-t border-zinc-700'>{quoteAsset && formatUSD(fromBigNumber(quoteAsset.balance))}</div>

        </div>

        <div className="col-span-1 p-4">

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
  </>
}

const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
  return isBuy ? `(${usd})` : usd
}