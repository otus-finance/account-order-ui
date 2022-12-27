import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext'
// import { MarketDetails } from './MarketDetails';
// import { LyraMarketOptions } from './SelectMarket';

export const StrategyType = () => {

  const { isPrebuilt, handleUpdatePrebuilt } = useBuilderContext();

  const selectedClassYes = isPrebuilt ? 'border-emerald-700' : 'border-zinc-700'
  const selectedClassNo = !isPrebuilt ? 'border-emerald-700' : 'border-zinc-700'

  return <div className='col-span-3 sm:col-span-3 mt-4'>
    <div className='font-bold'>
      I want to use a prebuilt strategy
    </div>

    <div className='grid grid-cols-6'>
      <div
        onClick={() => handleUpdatePrebuilt(true)}
        className={`col-span-3 sm:col-span-1 p-2 border hover:border-emerald-700 sm:mr-4 mt-4 cursor-pointer ${selectedClassYes}`}>
        <div className="flex items-center p-1">
          <div className="pl-2">
            <strong>True</strong>
          </div>
        </div>
      </div>
      <div
        onClick={() => handleUpdatePrebuilt(false)}
        className={`col-span-3 sm:col-span-1 p-2 border hover:border-emerald-700 sm:mr-4 mt-4 cursor-pointer  ${selectedClassNo}`}>
        <div className="flex items-center p-1">
          <div className="pl-2">
            <strong>False</strong>
          </div>
        </div>
      </div>
    </div>

  </div>
}

