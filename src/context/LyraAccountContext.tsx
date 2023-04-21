import Lyra from "@lyrafinance/lyra-js";
import React, { createContext, ReactElement, useContext } from "react";
import { useLyraTrade } from "../hooks";

import { AccountProviderState, accountInitialState } from "../reducers";

const LyraAccountContext = createContext<AccountProviderState>(accountInitialState);

export const LyraAccountContextProvider = ({
	children,
	lyra,
}: {
	children: ReactElement;
	lyra: Lyra;
}) => {
	const accountProviderState = useLyraTrade(lyra);

	return (
		<LyraAccountContext.Provider value={accountProviderState}>
			{children}
		</LyraAccountContext.Provider>
	);
};

// ready
export function useLyraAccountContext() {
	return useContext(LyraAccountContext);
}
