import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { MarketDetails } from './MarketDetails';
import { LyraMarketOptions } from './SelectMarket';

export const Market = () => {

  const { markets, isMarketLoading, selectedMarket, handleSelectedMarket } = useBuilderContext();
  return <>
    <div className='col-span-2 sm:col-span-4 my-8'>
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
    {/* <div className='bg-zinc-800 col-span-1 shadow-sm mt-6 p-4'>
      <MarketDetails />
    </div> */}
  </>
}

