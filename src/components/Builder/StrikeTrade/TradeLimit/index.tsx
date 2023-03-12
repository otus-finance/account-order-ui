import React, { useCallback, useEffect, useState } from 'react'
import { useBuilderContext } from '../../../../context/BuilderContext';


import { useAccount } from 'wagmi'

import { DebounceInput } from 'react-debounce-input';
import { AccountOrderContextProvider, useAccountOrderContext } from '../../../../context/AccountOrderContext';
import { WalletConnect } from '../Common/WalletConnect';
import { CreateAccount } from '../../../Account/AccountOrderActions';
import { formatPercentage, formatUSD, fromBigNumber, toBN } from '../../../../utils/formatters/numbers';
import { ethers } from 'ethers';
import { calculateOptionType } from '../../../../utils/formatters/optiontypes';
import { OrderTypes } from '../../../../utils/types';

{/* limit market trigger details  */ }
export const TradeLimit = () => {

  const { address } = useAccount();



  return <div className="col-span-1 px-4 pb-2">
    <div className='p-4 border border-zinc-800'>
      <p className='text-zinc-200 text-xs leading-5'>
        Create a margin account to trade Lyra options with limit orders. Set limit price orders or limit votality orders. Coming Soon.
      </p>
    </div>

    {
      address ?
        <AccountOrderContextProvider owner={address}>
          <TradeLimitActions />
        </AccountOrderContextProvider> :
        <div className='py-4'>
          <WalletConnect />
        </div>
    }

  </div>


}

const getOrderDirection = (isBuy: boolean, isCall: boolean, orderType: OrderTypes) => {
  if (orderType === OrderTypes.LIMIT_VOL) {
    return isBuy ? '>=' : '<'
  } else {
    return isBuy ? '<=' : '>'
  }
}


const TradeLimitActions = () => {
  {/* can only place order for single strike at a time */ }
  {/* => 1. is user connected button */ }
  {/* => 2. does user has an accountorder button */ }
  {/* => 3. does user have a balance show  */ }
  {/* => 4 place order button */ }

  const { strikes } = useBuilderContext();

  const { accountOrder, accountBalance, accountAllowance, order, setOrder, placeOrder } = useAccountOrderContext();

  const [orderType, setOrderType] = useState(OrderTypes.LIMIT_PRICE);
  const [orderDirectionMessage, setOrderDirectionMessage] = useState('');

  const setOrderWithValues = useCallback(() => {
    if (strikes.length === 1 && strikes[0] && order) {
      const { market, quote: { isBuy, isCall, size }, id } = strikes[0];
      console.log({ market })
      if (!market) return;
      console.log({ market, isBuy, isCall, id, size: fromBigNumber(size) })
      console.log({ market })
      const _market = ethers.utils.formatBytes32String(market.substring(1, 4));
      console.log({ _market })
      const _optionType = calculateOptionType(isBuy, isCall);
      const _strikeId = toBN(id.toString());

      if (!(order.size.eq(size) && order.strikeId.eq(_strikeId) && order.optionType == _optionType)) {
        setOrder({
          ...order,
          market: _market,
          optionType: _optionType,
          strikeId: _strikeId,
          size: size,
          tradeDirection: toBN('0') // open
        })
      }

    }
  }, [order, setOrder, strikes])

  useEffect(() => {
    if (strikes.length === 1 && strikes[0] && order) {
      setOrderWithValues();
    }
  }, [setOrderWithValues, order, strikes])

  useEffect(() => {

    if (order && orderType != order.orderType) {
      setOrder({ ...order, orderType })
    }
  }, [setOrder, order, orderType])

  useEffect(() => {
    if (strikes.length === 1 && strikes[0] && order) {
      const { quote: { isBuy, isCall } } = strikes[0];
      const _orderTypeText = OrderTypes.LIMIT_VOL === orderType ? 'Implied Volatility' : 'Price';
      const _orderDirection = getOrderDirection(isBuy, isCall, orderType);
      const __orderLimitTarget = OrderTypes.LIMIT_VOL === orderType ? formatPercentage(fromBigNumber(order.targetVolatility)) : formatUSD(fromBigNumber(order.targetPrice));
      setOrderDirectionMessage(`Order will be executed if ${_orderTypeText} ${_orderDirection} ${__orderLimitTarget}`)
    }
  }, [order, strikes, orderType]);

  return <>
    {/* wallet action buttons */}
    {
      strikes.length === 1 && order ?
        <>
          <div className='pt-6'>
            <div className='flex justify-between'>
              <div
                onClick={() => setOrderType(OrderTypes.LIMIT_PRICE)}
                className={`hover:border-emerald-600 cursor-pointer p-2 font-normal text-center w-full rounded-l-full text-xs bg-zinc-900 border-2 ${OrderTypes.LIMIT_PRICE === orderType ? 'border-emerald-600' : 'border-zinc-800 border-r-transparent'}`}
              >
                Price
              </div>
              <div
                onClick={() => setOrderType(OrderTypes.LIMIT_VOL)}
                className={`hover:border-emerald-600 cursor-pointer p-2 font-normal text-center w-full rounded-r-full text-xs bg-zinc-900 border-2  ${OrderTypes.LIMIT_VOL === orderType ? 'border-emerald-600' : 'border-zinc-800 border-l-transparent'}`}
              >
                Volatility
              </div>
            </div>
          </div>

          <div className='pt-2 pb-2'>

            {
              orderType === OrderTypes.LIMIT_PRICE &&

              <div className='bg-black border border-zinc-800 py-4 p-2'>
                <div className="flex items-center justify-between px-2">
                  <p className="truncate font-sans text-xs font-normal text-zinc-400">
                    Entry Price Per Option
                  </p>
                  <div className="ml-2 flex flex-shrink-0">
                    <p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-400">
                      Current Price: {strikes[0] ? formatUSD(fromBigNumber(strikes[0].quote.pricePerOption)) : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-2">
                  <DebounceInput
                    minLength={1}
                    debounceTimeout={300}
                    onChange={async (e) => {
                      if (e.target.value == '') return
                      const value = parseFloat(e.target.value);
                      setOrder({ ...order, targetPrice: toBN(value.toString()) })
                    }}
                    type="number"
                    name="size"
                    id="size"
                    value={fromBigNumber(order?.targetPrice)}
                    className="block ring-transparent outline-none w-24 bg-transparent pr-2 text-left text-white font-normal text-2xl"
                  />
                  <div className="ml-2 flex flex-shrink-0">
                    <p className="inline-flex font-normal text-2xl text-white">
                      USD
                    </p>
                  </div>
                </div>
              </div>

            }


            {
              orderType === OrderTypes.LIMIT_VOL &&

              <div className='bg-black border border-zinc-800 py-4 p-2'>
                <div className="flex items-center justify-between px-2">
                  <p className="truncate font-sans text-xs font-normal text-zinc-400">
                    Entry Volatility
                  </p>
                  <div className="ml-2 flex flex-shrink-0">
                    <p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-400">
                      Current Volatility: {strikes[0] ? formatPercentage(fromBigNumber(strikes[0].quote.iv)) : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-2">
                  <DebounceInput
                    minLength={1}
                    debounceTimeout={300}
                    onChange={async (e) => {
                      if (e.target.value == '') return
                      const value = parseFloat(e.target.value) / 100;
                      setOrder({ ...order, targetVolatility: toBN(value.toString()) })
                    }}
                    type="number"
                    name="size"
                    id="size"
                    value={fromBigNumber(order.targetVolatility) * 100}
                    className="block ring-transparent outline-none w-24 bg-transparent pr-2 text-left text-white font-normal text-2xl"
                  />
                  <div className="ml-2 flex flex-shrink-0">
                    <p className="inline-flex font-normal text-2xl text-white">
                      %
                    </p>
                  </div>
                </div>
              </div>
            }



          </div>
          {
            orderDirectionMessage &&
            <div className='p-4 border border-zinc-800 font-normal text-zinc-200 text-xs'>
              {orderDirectionMessage}
            </div>
          }


          <div className='py-6'>
            {
              accountOrder ?
                <div onClick={() => placeOrder?.()} className="cursor-pointer border-2 bg-emerald-600 border-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 p-2 py-3 col-span-3 text-sm font-semibold text-white text-center rounded-full">
                  Place Order
                </div> :
                <CreateAccount />
            }

          </div>


        </> :
        <div className='p-4 border border-zinc-800 font-normal text-zinc-200 text-xs mt-4'>
          Currently only <span className='font-semibold'>1</span> strike at a time supported.
        </div>
    }

  </>
}

