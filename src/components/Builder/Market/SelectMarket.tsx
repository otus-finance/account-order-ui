import React, { Dispatch } from 'react'
import BTCIcon from '../../UI/Icons/Color/BTC'
import ETHIcon from '../../UI/Icons/Color/ETH'
import { LyraBoard, LyraMarket } from '../../../queries/lyra/useLyra'
import { Spinner } from '../../UI/Components/Spinner'

export const formatName = (marketName: string) => {
  switch (marketName) {
    case 'sETH-sUSD':
    case 'ETH-USDC':
      return 'ETH';
    default:
      return 'BTC'
  }
}

export const LyraMarketOptions = (
  { markets, isMarketLoading, selectedMarket, handleSelectedMarket }:
    { markets: LyraMarket[] | null, isMarketLoading: boolean, selectedMarket: LyraMarket | null, handleSelectedMarket?: any }
) => {

  return isMarketLoading ?
    <div><Spinner /></div> :
    markets && <div className='grid grid-cols-2'>
      {
        markets
          .filter(({ liveBoards }: { liveBoards: LyraBoard[] }) => liveBoards.length > 0)
          .map((market: LyraMarket, index: number) => {
            const { name } = market;
            const isSelected = selectedMarket?.name == name;
            const selectedClass = isSelected ? 'bg-zinc-900 border-none' : 'border-none'
            return <div
              key={index}
              onClick={() => {
                handleSelectedMarket && handleSelectedMarket(market);
              }}
              className={`col-span-1 p-1 border hover:border-emerald-700 hover:bg-zinc-900 rounded-sm first:mr-2 last:ml-2 cursor-pointer ${selectedClass}`}>
              <div className="flex items-center p-1 py-0">
                {name == 'sETH-sUSD' && <ETHIcon />}
                {name == 'ETH-USDC' && <ETHIcon />}

                {name == 'sBTC-sUSD' && <BTCIcon />}
                {name == 'WBTC-USDC' && <BTCIcon />}
                <div className="pl-2">
                  <strong className='text-md'>{formatName(name)}</strong>
                </div>
              </div>
            </div>
          })
      }
    </div>
}
