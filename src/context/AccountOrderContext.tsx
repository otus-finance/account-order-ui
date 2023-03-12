import React, { createContext, ReactElement, useContext } from 'react'
import { Address } from 'wagmi'
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
export const AccountOrderContextProvider = ({ children, owner }: { children: ReactElement, owner: Address | undefined }) => {
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
