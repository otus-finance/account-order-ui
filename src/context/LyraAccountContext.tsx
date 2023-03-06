import Lyra from '@lyrafinance/lyra-js'
import React, { createContext, ReactElement, useContext } from 'react'
import { useLyraTrade } from '../hooks'
import { LyraStrike } from '../queries/lyra/useLyra'
import {
  AccountProviderState,
  accountInitialState,
} from '../reducers'

const LyraAccountContext = createContext<AccountProviderState>(
  accountInitialState
)

export const LyraAccountContextProvider = ({ children, lyra, strike }: { children: ReactElement, lyra: Lyra, strike: LyraStrike }) => {
  const accountProviderState = useLyraTrade(lyra, strike)

  return (
    <LyraAccountContext.Provider value={accountProviderState}>
      {children}
    </LyraAccountContext.Provider>
  )
}

// ready
export function useAccountContext() {
  return useContext(LyraAccountContext)
}
