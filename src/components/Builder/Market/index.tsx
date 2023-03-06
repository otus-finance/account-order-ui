import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { MarketDetails } from './MarketDetails';
import { LyraMarketOptions } from './SelectMarket';

export const Market = () => {

  const { markets, isMarketLoading, selectedMarket, handleSelectedMarket } = useBuilderContext();
  return <div className='flex justify-between bg-zinc-800 shadow-xl rounded-sm p-1'>

    <LyraMarketOptions
      markets={markets}
      isMarketLoading={isMarketLoading}
      selectedMarket={selectedMarket}
      handleSelectedMarket={handleSelectedMarket}
    />

    <MarketDetails />

  </div>

}

