import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { MarketDetails } from './MarketDetails';
import { LyraMarketOptions } from './SelectMarket';

export const Market = () => {

  const { markets, isMarketLoading, selectedMarket, handleSelectedMarket } = useBuilderContext();
  return <div className='col-span-3 sm:col-span-1 mt-4'>
    <div className='font-bold'>
      I want to see strategies for
    </div>
    <LyraMarketOptions
      markets={markets}
      isMarketLoading={isMarketLoading}
      selectedMarket={selectedMarket}
      handleSelectedMarket={handleSelectedMarket}
    />
    <div className='bg-zinc-800 shadow-sm mt-6 p-4'>
      <MarketDetails />
    </div>
  </div>
}

