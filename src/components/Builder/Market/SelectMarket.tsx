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
  { markets, selectedMarket, handleSelectedMarket }:
    { markets: LyraMarket[] | null, selectedMarket: LyraMarket | null, handleSelectedMarket?: any }
) => {

  return markets && <div className='flex'>
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
            className={`p-2 px-3 border hover:border-emerald-600 hover:bg-zinc-900 rounded-sm first:mr-1  cursor-pointer ${selectedClass}`}>
            <div className="flex items-center">
              {name == 'sETH-sUSD' && <ETHIcon className="h-8 w-8" />}
              {name == 'ETH-USDC' && <ETHIcon className="h-8 w-8" />}

              {name == 'sBTC-sUSD' && <BTCIcon className="h-8 w-8" />}
              {name == 'WBTC-USDC' && <BTCIcon className="h-8 w-8" />}
              <div className="pl-2">
                <strong className='text-md'>{formatName(name)}</strong>
              </div>
            </div>
          </div>
        })
    }
  </div>
}
