import React, { createContext, useContext } from 'react'
import { useBuilder } from '../hooks'
import {
  BuilderProviderState,
  builderInitialState,
} from '../reducers'

// ready
const BuilderContext = createContext<BuilderProviderState>(
  builderInitialState
)

// not ready
export const BuilderContextProvider = ({ children }: any) => {
  const builderProviderState = useBuilder()

  return (
    <BuilderContext.Provider value={builderProviderState}>
      {children}
    </BuilderContext.Provider>
  )
}

// ready
export function useBuilderContext() {
  return useContext(BuilderContext)
}
