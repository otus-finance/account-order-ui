import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { useBuilderProfitLossChart } from '../../../hooks/BuilderChart';
import { BuilderPNLChart } from './BuilderChart';

export const Chart = () => {

  const { selectedMarket, strikes, currentPrice, isValid } = useBuilderContext();

  const chartData = useBuilderProfitLossChart(selectedMarket?.name, currentPrice, strikes);

  return <div className='col-span-3 sm:col-span-3 p-4 bg-black rounded-sm'>
    {
      chartData.length > 0 && currentPrice > 0 && isValid && <BuilderPNLChart currentPrice={currentPrice} data={chartData} />
    }

    {
      !isValid && <div className='p-6 text-sm font-semibold'>Strategy not available for asset, expiration and for the strikes available on lyra.finance</div>
    }
  </div>
}



