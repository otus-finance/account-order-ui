import React, { createContext, useContext } from "react";
import { useVault } from "../hooks";
import { VaultProviderState, vaultInitialState } from "../reducers";
import { Address } from "wagmi";

// ready
const VaultContext = createContext<VaultProviderState>(vaultInitialState);

// not ready
export const VaultContextProvider = ({
	children,
	vaultId,
}: {
	children: any;
	vaultId: Address;
}) => {
	const vaultProviderState = useVault(vaultId);

	return <VaultContext.Provider value={vaultProviderState}>{children}</VaultContext.Provider>;
};

// ready
export function useVaultContext() {
	return useContext(VaultContext);
}
