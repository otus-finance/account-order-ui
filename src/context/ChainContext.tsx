import React, { createContext, useContext } from "react";
import { useChain } from "../hooks";
import { ChainProviderState, chainInitialState } from "../reducers";

// ready
const ChainContext = createContext<ChainProviderState>(chainInitialState);

// not ready
export const ChainContextProvider = ({ children }: any) => {
	const chainProviderState = useChain();

	return <ChainContext.Provider value={chainProviderState}>{children}</ChainContext.Provider>;
};

// ready
export function useChainContext() {
	return useContext(ChainContext);
}
