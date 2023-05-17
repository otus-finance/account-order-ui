import React, { createContext, ReactElement, useContext } from "react";
import { Address } from "wagmi";
import { useAdminVaultOrder } from "../../hooks";
import { AdminVaultOrderProviderState, adminVaultOrderInitialState } from "../../reducers";

// ready
const AdminVaultOrderContext = createContext<AdminVaultOrderProviderState>(
	adminVaultOrderInitialState
);

// not ready
export const AdminVaultOrderContextProvider = ({
	children,
	vaultId,
}: {
	children: ReactElement;
	vaultId: Address;
}) => {
	const adminVaultOrderProviderState = useAdminVaultOrder(vaultId);

	return (
		<AdminVaultOrderContext.Provider value={adminVaultOrderProviderState}>
			{children}
		</AdminVaultOrderContext.Provider>
	);
};

// ready
export function useAdminVaultOrderContext() {
	return useContext(AdminVaultOrderContext);
}
