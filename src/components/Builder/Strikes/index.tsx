import React from 'react';
import { useBuilderContext } from '../../../context/BuilderContext';
import LyraIcon from '../../UI/Icons/Color/LYRA';
import { SelectStrikesTable } from './SelectStrikesTable';
import { StrikesTable } from './StrikesTable';
import { motion } from "framer-motion"

import { BuilderType } from '../../../utils/types';

export const Strikes = () => {

  const {
    builderType,
    isBuildingNewStrategy,
    showStrikesSelect,
    selectedStrategy,
    handleBuildNewStrategy
  } = useBuilderContext();

  return <div className='col-span-3 sm:col-span-3 px-6 pb-6 grid grid-cols-6'>

    {
      builderType === BuilderType.Custom &&
      <div className='col-span-6 overflow-x-scroll scrollbar scrollbar-thumb-zinc-700 scrollbar-track-zinc-500  mb-8'>
        <SelectStrikesTable />
      </div>

    }

    {/* custom strategy button */}
    <div className="sm:col-end-7 sm:col-span-2 col-start-1 col-end-7">
      <div className="col-span-1 grid grid-cols-3 gap-3 mt-2">
        {
          selectedStrategy && builderType === BuilderType.Builder &&
          <div onClick={() => handleBuildNewStrategy(!isBuildingNewStrategy)} className="cursor-pointer border border-zinc-800 hover:border-emerald-700 bg-zinc-900 p-2 col-span-3 font-semibold text-xs text-white text-center rounded-2xl">
            {isBuildingNewStrategy ? 'Reset Strategy' : 'Use Strategy as Template'}
          </div>
        }
      </div>
    </div>

    {
      showStrikesSelect && builderType === BuilderType.Builder &&
      <motion.div className='col-span-6 overflow-x-scroll scrollbar scrollbar-thumb-zinc-700 scrollbar-track-zinc-500  mb-8' animate={showStrikesSelect ? "open" : "closed"} variants={{
        open: { opacity: 1, x: 0 },
        closed: { opacity: 0, x: "-100%" },
      }}>
        <SelectStrikesTable />
      </motion.div>
    }

    <div className='col-span-6 overflow-x-scroll scrollbar scrollbar-thumb-zinc-700 scrollbar-track-zinc-500 rounded-sm'>
      <div className="flex items-center pt-2 pb-2">
        <LyraIcon className='h-4 w-4' />
        <div className='pl-2 font-light text-xs uppercase'>
          <strong>Powered by lyra.finance </strong>
        </div>
      </div>
      <StrikesTable />
    </div>

  </div>
}

