import React, { Dispatch } from 'react'
import { LyraChain } from '../../../queries/lyra/useLyra'
import { Chain } from '@lyrafinance/lyra-js'
import OptimismIcon from '../../UI/Icons/Color/OP'
import ArbitrumIcon from '../../UI/Icons/Color/ONE'

const chains: LyraChain[] = [
  {
    name: Chain.Optimism,
    chainId: 10
  },
  {
    name: Chain.Arbitrum,
    chainId: 42161
  }
]


export const LyraChainOptions = (
  { selectedChain, handleSelectedChain }:
    { selectedChain: LyraChain | null, handleSelectedChain?: any }
) => {

  return <div className='grid grid-cols-2'>
    {
      chains.map((chain: LyraChain, index: number) => {
        const { name } = chain;
        const isSelected = selectedChain?.name == name;
        const selectedClass = isSelected ? 'border-emerald-600' : 'border-zinc-700'
        return <div
          key={index}
          onClick={() => {
            handleSelectedChain && handleSelectedChain(chain);
          }}
          className={`col-span-1 p-2 border hover:border-emerald-600 mt-4 cursor-pointer ${selectedClass}`}>
          <div className="flex items-center p-1">
            {name == Chain.Arbitrum && <ArbitrumIcon />}
            {name == Chain.Optimism && <OptimismIcon />}
            <div className="pl-2">
              <strong className='capitalize'> {name}</strong>
            </div>
          </div>
        </div>
      })
    }
  </div>
}
