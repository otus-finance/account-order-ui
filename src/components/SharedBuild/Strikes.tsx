import React, { useState } from 'react'
import { useSharedBuildContext } from '../../context/SharedBuildContext';
import { formatUSD } from '../../utils/formatters/numbers';
import LyraIcon from '../UI/Icons/Color/LYRA';
import { StrikesTable } from './StrikesTable';

export const Strikes = () => {

  const {
    positionPnl: { netCreditDebit, maxLoss, maxProfit },
  } = useSharedBuildContext();


  return <div className='col-span-3 sm:col-span-3 mt-4 grid grid-cols-6'>

    {/* profit loss data */}
    <div className="sm:col-end-7 sm:col-span-2 col-start-1 col-end-7">
      <div className="col-span-1 grid grid-cols-3 gap-3 mt-6">

        <div className="bg-zinc-800 p-4 pt-1">
          <span className="text-xs font-light text-zinc-100">{netCreditDebit && netCreditDebit > 0 ? 'Net Credit' : 'Net (Debit)'}</span>
          <div className='pt-4'>
            <span className="text-base font-semibold text-white">
              {netCreditDebit && formatUSD(Math.abs(netCreditDebit))}
            </span>
          </div>
        </div>

        <div className="bg-zinc-800 p-4 pt-1">
          <span className="text-xs font-light text-zinc-100">Max Loss</span>
          <div className='pt-4'>
            <span className="text-base font-semibold text-white">
              {maxLoss && formatUSD(maxLoss)}
            </span>
          </div>
        </div>

        <div className="bg-zinc-800 p-4 pt-1">
          <span className="text-xs font-light text-zinc-100">Max Profit</span>
          <div className='pt-4'>
            <span className="text-base font-semibold text-white">
              {maxProfit && formatUSD(maxProfit)}
            </span>
          </div>
        </div>
      </div>

    </div>

    <div className='col-span-6 '>
      <div className="flex items-center pt-2 pb-2">
        <LyraIcon />
        <div className='pl-2 font-light text-xs uppercase'>
          <strong> Powered by lyra.finance </strong>
        </div>
      </div>
      <StrikesTable />
    </div>

  </div>
}

