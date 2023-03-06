import React from 'react'
import { Chain } from './Chain'
import { Chart } from './Chart'
import { Market } from './Market'
import { Strategy } from './Strategy'
import { Strikes } from './Strikes'

import { LyraAccountContextProvider } from '../../context/LyraAccountContext';
import { useBuilderContext } from '../../context/BuilderContext'
import { StrikeTrade } from './StrikeTrade'
import { BuilderType } from '../../utils/types'
import { ArrowLeftCircleIcon } from '@heroicons/react/20/solid'

export const OptionsBuilder = () => {

  const {
    lyra,
    strikes,
    builderType,
  } = useBuilderContext();

  return <div className="grid sm:grid-cols-3 grid-cols-3 gap-8">

    <div className='col-span-2'>

      <div className='border border-zinc-800 rounded-sm shadow-sm'>
        <div className='p-6'>
          <Market />
        </div>

        <div className='border-b border-zinc-800'>
          <div className='px-6 pt-2 pb-4'>
            <BuilderSelect />
          </div>
        </div>

        {
          builderType === BuilderType.Builder &&
          <div className='border-b border-zinc-800'>
            <Strategy />
          </div>
        }

        <div>
          <Strikes />
        </div>
      </div>

      <div>

        <AccountInfoSelect />

        <div className='border border-zinc-800 rounded-sm p-6'>
          <AccountInfo />
        </div>

      </div>

    </div>



    <div className='col-span-1'>
      <div className=' border border-zinc-800 rounded-sm shadow-sm'>
        {
          lyra && strikes[0] ? <>
            <LyraAccountContextProvider lyra={lyra} strike={strikes[0]}>
              <StrikeTrade />
            </LyraAccountContextProvider>

            <div className='p-4 rounded-sm border-t border-zinc-800'>
              <Chart />
            </div>
          </> :
            <div className='bg-black p-4'>
              <div className="flex items-center p-2">
                <p className="truncate font-sans text-xs font-normal text-white">
                  <ArrowLeftCircleIcon className="h-5 w-5 text-white"
                    aria-hidden="true" />
                </p>
                <div className="ml-2 flex flex-shrink-0">
                  <p className="inline-flex font-mono text-sm font-normal leading-5 text-white">
                    Select Strikes
                  </p>
                </div>
              </div>
            </div>
        }
      </div>
    </div>

  </div>

}

const BuilderSelect = () => {

  const { builderType, handleSelectBuilderType } = useBuilderContext();

  return <div className='flex items-center gap-4 text-sm'>
    <div onClick={() => handleSelectBuilderType(BuilderType.Builder)} className={`cursor-pointer hover:text-white ${builderType === BuilderType.Builder ? 'text-white underline' : 'text-zinc-300'}`}>
      Builder
    </div>
    <div onClick={() => handleSelectBuilderType(BuilderType.Custom)} className={`cursor-pointer hover:text-white ${builderType === BuilderType.Custom ? 'text-white underline' : 'text-zinc-300'}`}>
      Custom
    </div>
  </div>
}

const AccountInfoSelect = () => {
  return <div className='flex items-center gap-8 text-sm px-6 pt-6 pb-2'>
    <div className='cursor-pointer text-zinc-300 hover:text-white'>
      Positions
    </div>
    <div className='cursor-pointer text-zinc-300 hover:text-white'>
      Orders
    </div>
    <div className='cursor-pointer text-zinc-300 hover:text-white'>
      Trades
    </div>
  </div>
}

const AccountInfo = () => {
  return <>test</>
}