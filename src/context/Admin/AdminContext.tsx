import React, { createContext, useContext } from "react";
import { useAdmin } from "../../hooks";
import { AdminProviderState, adminInitialState } from "../../reducers";

// ready
const AdminContext = createContext<AdminProviderState>(adminInitialState);

// not ready
export const AdminContextProvider = ({ children }: any) => {
	const adminProviderState = useAdmin();

	return <AdminContext.Provider value={adminProviderState}>{children}</AdminContext.Provider>;
};

// ready
export function useAdminContext() {
	return useContext(AdminContext);
}
