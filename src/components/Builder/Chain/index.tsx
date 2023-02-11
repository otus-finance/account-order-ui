import React from 'react'
import { useBuilderContext } from '../../../context/BuilderContext';
import { LyraChainOptions } from './SelectChain';

export const Chain = () => {

  const { selectedChain, handleSelectedChain } = useBuilderContext();
  return <div className='col-span-2 sm:col-span-2 mt-4'>
    <div className='font-bold'>
      Choose your preferred chain
    </div>
    <LyraChainOptions
      selectedChain={selectedChain}
      handleSelectedChain={handleSelectedChain}
    />
  </div>
}

