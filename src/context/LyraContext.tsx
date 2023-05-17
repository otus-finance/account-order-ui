import React, { createContext, useContext } from "react";
import { useLyra } from "../hooks";
import { LyraProviderState, lyraInitialState } from "../reducers";

// ready
const LyraContext = createContext<LyraProviderState>(lyraInitialState);

// not ready
export const LyraContextProvider = ({ children }: any) => {
	const lyraProviderState = useLyra();

	return <LyraContext.Provider value={lyraProviderState}>{children}</LyraContext.Provider>;
};

// ready
export function useLyraContext() {
	return useContext(LyraContext);
}
