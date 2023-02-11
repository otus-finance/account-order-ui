import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';

import { formatUSD, fromBigNumber } from '../../../utils/formatters/numbers'

export const MarketDetails = () => {

  const { selectedMarket } = useBuilderContext();

  return <div className='grid grid-cols-1 divider '>

    <div className="grid grid-cols-2 border-b border-zinc-700 p-2">

      <div className='font-light text-xs uppercase'>Free Liquidity</div>

      <div className='font-light text-xs uppercase'>
        <strong>{selectedMarket && selectedMarket.liquidity && formatUSD(fromBigNumber(selectedMarket.liquidity))}  </strong>
      </div>
    </div>
    <div className="grid grid-cols-2 border-b border-zinc-700 p-2">

      <div className='font-light text-xs uppercase'>Spot Price</div>

      <div className='font-light text-xs uppercase'>
        <strong>{selectedMarket && selectedMarket.spotPrice && formatUSD(fromBigNumber(selectedMarket.spotPrice))}  </strong>
      </div>
    </div>
    <div className="grid grid-cols-2 border-b border-zinc-700 p-2">

      <div className='font-light text-xs uppercase'>TVL</div>

      <div className='font-light text-xs uppercase'>

        <strong>{selectedMarket && selectedMarket.tvl && formatUSD(fromBigNumber(selectedMarket.tvl))}  </strong>

      </div>
    </div>
  </div>
}
