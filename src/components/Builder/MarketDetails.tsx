import React from 'react'

import { LyraMarket } from '../../queries/lyra/useLyra'
import { formatUSD, fromBigNumber } from '../../utils/formatters/numbers'

export const MarketDetails = ({ market }: { market: LyraMarket | null }) => {

  return <div className='grid grid-cols-1 divider '>

    <div className="grid grid-cols-2 border-b border-zinc-700 p-2">
      <div className='font-light text-xs uppercase'>Open Interest</div>
      <div className='font-bold text-xs uppercase'>
        <strong>{market && market.openInterest && formatUSD(fromBigNumber(market.openInterest))}  </strong>
      </div>
    </div>

    <div className="grid grid-cols-2 border-b border-zinc-700 p-2">

      <div className='font-light text-xs uppercase'>Free Liquidity</div>

      <div className='font-light text-xs uppercase'>
        <strong>{market && market.liquidity.freeLiquidity && formatUSD(fromBigNumber(market.liquidity.freeLiquidity))}  </strong>
      </div>
    </div>
    <div className="grid grid-cols-2 border-b border-zinc-700 p-2">

      <div className='font-light text-xs uppercase'>Spot Price</div>

      <div className='font-light text-xs uppercase'>
        <strong>{market && market.spotPrice && formatUSD(fromBigNumber(market.spotPrice))}  </strong>
      </div>
    </div>
    <div className="grid grid-cols-2 border-b border-zinc-700 p-2">

      <div className='font-light text-xs uppercase'>TVL</div>

      <div className='font-light text-xs uppercase'>

        <strong>{market && market.tvl && formatUSD(fromBigNumber(market.tvl))}  </strong>

      </div>
    </div>
  </div>
}
