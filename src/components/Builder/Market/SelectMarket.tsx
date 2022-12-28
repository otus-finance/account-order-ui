import React, { Dispatch } from 'react'
import BTCIcon from '../../UI/Icons/Color/BTC'
import ETHIcon from '../../UI/Icons/Color/ETH'
import { LyraBoard, LyraMarket } from '../../../queries/lyra/useLyra'
import { useBuilderContext } from '../../../context/BuilderContext'
import { Spinner } from '../../UI/Components/Spinner'

//   const { markets, isMarketLoading, selectedMarket, handleSelectedMarket } = useBuilderContext();

export const LyraMarketOptions = (
  { markets, isMarketLoading, selectedMarket, handleSelectedMarket }:
    { markets: LyraMarket[] | null, isMarketLoading: boolean, selectedMarket: LyraMarket | null, handleSelectedMarket?: any }
) => {

  return isMarketLoading ?
    <div className='mt-4'><Spinner /></div> :
    markets && <div className='grid grid-cols-2'>
      {
        markets
          .filter(({ liveBoards }: { liveBoards: LyraBoard[] }) => liveBoards.length > 0)
          .map((market: LyraMarket, index: number) => {
            const { name } = market;
            const isSelected = selectedMarket?.name == name;
            const selectedClass = isSelected ? 'border-emerald-700' : 'border-zinc-700'
            return <div
              key={index}
              onClick={() => {
                handleSelectedMarket && handleSelectedMarket(market);
              }}
              className={`col-span-1 p-1 border hover:border-emerald-700 sm:mr-4 mt-4 cursor-pointer ${selectedClass}`}>
              <div className="flex items-center p-1">
                {name == 'ETH' && <ETHIcon />}
                {name == 'BTC' && <BTCIcon />}
                <div className="pl-2">
                  <strong> {name}</strong>
                </div>
              </div>
            </div>
          })
      }
    </div>
}
