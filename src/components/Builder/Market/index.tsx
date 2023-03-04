import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { MarketDetails } from './MarketDetails';
import { LyraMarketOptions } from './SelectMarket';

export const Market = () => {

  const { markets, isMarketLoading, selectedMarket, handleSelectedMarket } = useBuilderContext();
  return <div className='grid grid-cols-3 bg-zinc-800 shadow-sm rounded-sm p-2'>
    <div className='col-span-1'>
      <LyraMarketOptions
        markets={markets}
        isMarketLoading={isMarketLoading}
        selectedMarket={selectedMarket}
        handleSelectedMarket={handleSelectedMarket}
      />
    </div>

    <div className='col-span-2'>
      <MarketDetails />
    </div>
  </div>

}

