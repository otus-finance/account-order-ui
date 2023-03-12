import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';

import { formatUSD, fromBigNumber } from '../../../utils/formatters/numbers'

export const MarketDetails = () => {

  const { selectedMarket } = useBuilderContext();

  return <div className='flex divider items-center ml-4'>

    <div className='font-light text-lg uppercase text-zinc-200 p-2 px-4'>
      <strong>{selectedMarket && selectedMarket.spotPrice && formatUSD(fromBigNumber(selectedMarket.spotPrice))}  </strong>
    </div>

    {
      selectedMarket &&
      <div className='hidden sm:block px-4'>
        <div className='font-light text-xs text-zinc-400'>Free Liquidity</div>

        <div className='font-light text-sm uppercase text-zinc-200'>
          <strong>{selectedMarket && selectedMarket.liquidity && formatUSD(fromBigNumber(selectedMarket.liquidity))}  </strong>
        </div>
      </div>
    }



  </div>
}
