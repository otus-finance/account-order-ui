import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { MarketDetails } from './MarketDetails';
import { LyraMarketOptions } from './SelectMarket';

export const Market = () => {

  const { markets, isMarketLoading, selectedMarket, handleSelectedMarket } = useBuilderContext();
  return <div className='grid grid-cols-2 col-span-2 my-8 gap-8'>
    <div className='col-span-2 sm:col-span-1'>
      <div className='font-bold'>
        I want to see strategies for
      </div>
      <LyraMarketOptions
        markets={markets}
        isMarketLoading={isMarketLoading}
        selectedMarket={selectedMarket}
        handleSelectedMarket={handleSelectedMarket}
      />
    </div>

    <div className='bg-zinc-800 col-span-2 sm:col-span-1 shadow-sm mt-6 p-4'>
      <MarketDetails />
    </div>
  </div>

}

