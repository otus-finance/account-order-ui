import { BigNumber } from "ethers";
import { Dispatch } from "react";
import { ZERO_BN } from "../constants/bn";
import { TradeInputParameters } from "../utils/types";
import { LyraStrike } from "../queries/lyra/useLyra";
import { OtusVault } from "../queries/otus/vaults";

export type AdminVaultOrderProviderState = {
	isVaultLoading: boolean;
	vault: OtusVault | null;
	otusFee: number;
	totalCollateral: number;
	spreadSelected: boolean;
	networkNotSupported: boolean;
	loading: boolean;
	validMaxPNL: any;
	updateStrikes: LyraStrike[];
	selectedStrikes: LyraStrike[];
	trades: TradeInputParameters[];
	userBalance: BigNumber;
	setSpreadSelected: Dispatch<boolean>;
	updateSize: ((any: any, any2: any) => void) | undefined;
	updateMultiSize: ((any: any) => void) | undefined;
	startNextRound: (() => void) | undefined;
};

export const adminVaultOrderInitialState: AdminVaultOrderProviderState = {
	isVaultLoading: false,
	vault: null,
	otusFee: 0,
	totalCollateral: 0,
	spreadSelected: false,
	networkNotSupported: true,
	loading: true,
	validMaxPNL: {
		validMaxLoss: false,
		maxLoss: 0,
		maxCost: 0,
		maxPremium: 0,
		maxLossPost: 0,
	},
	updateStrikes: [],
	selectedStrikes: [],
	trades: [],
	userBalance: ZERO_BN,
	updateSize: (any, any2) => {},
	updateMultiSize: (any) => {},
	setSpreadSelected: (any) => {},
	startNextRound: () => {},
};

export type AdminVaultOrderAction = {
	type: "RESET_ADMIN_VAULT_ORDER_PROVIDER";
};

export function adminVaultOrderReducer(
	state: AdminVaultOrderProviderState,
	action: AdminVaultOrderAction
): AdminVaultOrderProviderState {
	switch (action.type) {
		case "RESET_ADMIN_VAULT_ORDER_PROVIDER":
			return adminVaultOrderInitialState;
		default:
			throw new Error();
	}
}
