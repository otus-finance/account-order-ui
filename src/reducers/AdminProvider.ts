export type AdminProviderState = {
	isAdmin: boolean;
	isNewVaultSuccess: boolean;
	isNewVaultLoading: boolean;
	isTxLoading: boolean;
	newVault: () => Promise<void>;
};

export const adminInitialState: AdminProviderState = {
	isAdmin: false,
	isNewVaultSuccess: false,
	isNewVaultLoading: false,
	isTxLoading: false,
	newVault: () => Promise.resolve(),
};

export type AdminAction =
	| {
			type: "SET_IS_ADMIN";
			isAdmin: AdminProviderState["isAdmin"];
	  }
	| {
			type: "RESET_ADMIN_PROVIDER";
	  };

export function adminReducer(state: AdminProviderState, action: AdminAction): AdminProviderState {
	switch (action.type) {
		case "SET_IS_ADMIN":
			return { ...state, isAdmin: action.isAdmin };
		case "RESET_ADMIN_PROVIDER":
			return adminInitialState;
		default:
			throw new Error();
	}
}
