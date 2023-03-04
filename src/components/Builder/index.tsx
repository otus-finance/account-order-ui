import React from 'react'
import { Chain } from './Chain'
import { Chart } from './Chart'
import { Market } from './Market'
import { Strategy } from './Strategy'
import { Strikes } from './Strikes'

import { AccountContextProvider } from '../../context/AccountContext';
import { useBuilderContext } from '../../context/BuilderContext'
import { StrikeTrade } from './StrikeTrade'

export const OptionsBuilder = () => {

  const {
    lyra,
    strikes
  } = useBuilderContext();

  return <div className="grid sm:grid-cols-3 grid-cols-3 gap-8">

    <div className='col-span-2 '>

      <div className='border border-zinc-800 rounded-sm shadow-sm'>
        <div className='p-6'>
          <Market />
        </div>

        <div className='border-b border-zinc-800'>
          <div className='p-6'>
            <BuilderType />
          </div>
        </div>

        <div className='border-b border-zinc-800'>
          <Strategy />
        </div>

        <div className='border-b border-zinc-800'>
          <Strikes />
        </div>
      </div>

      <div>

        <AccountInfo />

        <div className='border border-zinc-800 rounded-sm p-6'>
          test
        </div>

      </div>


    </div>



    <div className='col-span-1'>
      <div className=' border border-zinc-800 rounded-sm shadow-sm'>
        {
          lyra && strikes[0] &&
          <AccountContextProvider lyra={lyra} strike={strikes[0]}>
            <StrikeTrade />
          </AccountContextProvider>
        }

        <div className='p-4 rounded-sm'>
          <Chart />
        </div>
      </div>
    </div>
    {/* 
    <Chain />

    <Market />

    <Strategy />

    <Strikes />

    <Chart /> */}

  </div>

}

const BuilderType = () => {
  return <div className='flex items-center gap-4 text-sm'>
    <div>
      Builder
    </div>
    <div>
      Custom
    </div>
  </div>
}

const AccountInfo = () => {
  return <div className='flex items-center gap-8 text-sm px-6 pt-6 pb-2'>
    <div>
      Positions
    </div>
    <div>
      Orders
    </div>
    <div>
      Trades
    </div>
  </div>
}
