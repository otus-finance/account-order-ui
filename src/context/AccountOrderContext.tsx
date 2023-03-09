import React, { createContext, ReactElement, useContext } from 'react'
import { useAccountOrder } from '../hooks'
import {
  AccountOrderProviderState,
  accountOrderInitialState,
} from '../reducers'

// ready
const AccountOrderContext = createContext<AccountOrderProviderState>(
  accountOrderInitialState
)

// not ready
export const AccountOrderContextProvider = ({ children, owner }: { children: ReactElement, owner: string }) => {
  const accountOrderProviderState = useAccountOrder(owner);

  return (
    <AccountOrderContext.Provider value={accountOrderProviderState}>
      {children}
    </AccountOrderContext.Provider>
  )
}

// ready
export function useAccountOrderContext() {
  return useContext(AccountOrderContext)
}
