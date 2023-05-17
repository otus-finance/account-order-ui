import { BigNumber } from "ethers";
import { OtusVault } from "../queries/otus/vaults";
import { Dispatch } from "react";
import { ZERO_BN } from "../constants/bn";

export type VaultProviderState = {
	isVaultLoading: boolean;
	vault: OtusVault | null;
	decimals: number;
	isLoading: boolean;
	isTxLoading: boolean;
	isApproveQuoteLoading: boolean;
	isDepositLoading: boolean;
	isWithdrawLoading: boolean;
	userBalance: number;
	depositAmount: BigNumber;
	withdrawAmount: BigNumber;
	poolAllowance: BigNumber | null;
	lpSymbol: string | undefined;
	lpBalance: BigNumber;
	setDepositAmount: Dispatch<BigNumber>;
	setWithdrawAmount: Dispatch<BigNumber>;
	approveQuote: (() => void) | undefined;
	deposit: (() => void) | undefined;
	withdraw: (() => void) | undefined;
};

export const vaultInitialState: VaultProviderState = {
	isVaultLoading: false,
	vault: null,
	decimals: 18,
	isLoading: true,
	isTxLoading: true,
	isApproveQuoteLoading: false,
	isDepositLoading: false,
	isWithdrawLoading: false,
	userBalance: 0,
	depositAmount: ZERO_BN,
	withdrawAmount: ZERO_BN,
	poolAllowance: ZERO_BN,
	lpSymbol: "",
	lpBalance: ZERO_BN,
	setDepositAmount: () => {},
	setWithdrawAmount: () => {},
	approveQuote: () => {},
	deposit: () => {},
	withdraw: () => {},
};

export type VaultAction = {
	type: "RESET_VAULT_PROVIDER";
};

export function vaultReducer(state: VaultProviderState, action: VaultAction): VaultProviderState {
	switch (action.type) {
		case "RESET_VAULT_PROVIDER":
			return vaultInitialState;
		default:
			throw new Error();
	}
}
