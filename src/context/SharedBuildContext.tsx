import React, { createContext, useContext } from 'react'
import { useSharedBuild } from '../hooks'
import {
  SharedBuildProviderState,
  sharedBuildInitialState,
} from '../reducers'

// ready
const SharedBuildContext = createContext<SharedBuildProviderState>(
  sharedBuildInitialState
)

// not ready
export const SharedBuildContextProvider = ({ children }: any) => {
  const sharedBuildProviderState = useSharedBuild()

  return (
    <SharedBuildContext.Provider value={sharedBuildProviderState}>
      {children}
    </SharedBuildContext.Provider>
  )
}

// ready
export function useSharedBuildContext() {
  return useContext(SharedBuildContext)
}
