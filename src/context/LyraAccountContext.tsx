import React, { createContext, ReactElement, useContext } from "react";
import { useLyraTrade } from "../hooks";

import { AccountProviderState, accountInitialState } from "../reducers";
import { Address } from "wagmi";

const LyraAccountContext = createContext<AccountProviderState>(accountInitialState);

export const LyraAccountContextProvider = ({
	children,
	address,
}: {
	children: ReactElement;
	address: Address;
}) => {
	const accountProviderState = useLyraTrade(address);

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
