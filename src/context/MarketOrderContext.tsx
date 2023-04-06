import React, { createContext, ReactElement, useContext } from "react";
import { Address } from "wagmi";
import { useMarketOrder } from "../hooks";
import { MarketOrderProviderState, marketOrderInitialState } from "../reducers";

// ready
const MarketOrderContext = createContext<MarketOrderProviderState>(marketOrderInitialState);

// not ready
export const MarketOrderContextProvider = ({ children }: { children: ReactElement }) => {
	const marketOrderProviderState = useMarketOrder();

	return (
		<MarketOrderContext.Provider value={marketOrderProviderState}>
			{children}
		</MarketOrderContext.Provider>
	);
};

// ready
export function useMarketOrderContext() {
	return useContext(MarketOrderContext);
}
