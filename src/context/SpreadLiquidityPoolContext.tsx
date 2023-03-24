import React, { createContext, ReactElement, useContext } from "react";
import { useSpreadLiquidityPool } from "../hooks";
import { SpreadLiquidityPoolProviderState, spreadLiquidityPoolInitialState } from "../reducers";

// ready
const SpreadLiquidityPoolContext = createContext<SpreadLiquidityPoolProviderState>(
	spreadLiquidityPoolInitialState
);

// not ready
export const SpreadLiquidityPoolContextProvider = ({ children }: { children: ReactElement }) => {
	const spreadLiquidityPoolProviderState = useSpreadLiquidityPool();

	return (
		<SpreadLiquidityPoolContext.Provider value={spreadLiquidityPoolProviderState}>
			{children}
		</SpreadLiquidityPoolContext.Provider>
	);
};

// ready
export function useSpreadLiquidityPoolContext() {
	return useContext(SpreadLiquidityPoolContext);
}
