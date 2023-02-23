import Lyra from '@lyrafinance/lyra-js'
import React, { createContext, ReactElement, useContext } from 'react'
import { useLyraTrade } from '../hooks'
import { LyraStrike } from '../queries/lyra/useLyra'
import {
  AccountProviderState,
  accountInitialState,
} from '../reducers'

// ready
const AccountContext = createContext<AccountProviderState>(
  accountInitialState
)

// not ready
export const AccountContextProvider = ({ children, lyra, strike }: { children: ReactElement, lyra: Lyra, strike: LyraStrike }) => {
  const accountProviderState = useLyraTrade(lyra, strike)

  return (
    <AccountContext.Provider value={accountProviderState}>
      {children}
    </AccountContext.Provider>
  )
}

// ready
export function useAccountContext() {
  return useContext(AccountContext)
}
