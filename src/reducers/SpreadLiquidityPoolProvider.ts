import { BigNumber, Contract } from "ethers";
import { Dispatch } from "react";
import { LiquidityPool } from "../queries/otus/liquidityPool";
import { ZERO_BN } from "../constants/bn";

export type SpreadLiquidityPoolProviderState = {
	decimals: number;
	liquidityPool: LiquidityPool | null;
	isLoading: boolean;
	isTxLoading: boolean;
	isApproveQuoteLoading: boolean;
	isDepositLoading: boolean;
	isWithdrawLoading: boolean;
	userBalance: number;
	depositAmount: BigNumber;
	withdrawAmount: BigNumber;
	poolAllowance: BigNumber | null;
	lpBalance: BigNumber;
	// allowanceAmount: BigNumber;
	// setAllowanceAmount: Dispatch<BigNumber>;
	setDepositAmount: Dispatch<BigNumber>;
	setWithdrawAmount: Dispatch<BigNumber>;
	approveQuote: (() => void) | undefined;
	deposit: (() => void) | undefined;
	withdraw: (() => void) | undefined;
};

export const spreadLiquidityPoolInitialState: SpreadLiquidityPoolProviderState = {
	decimals: 18,
	liquidityPool: null,
	isLoading: true,
	isTxLoading: true,
	isApproveQuoteLoading: false,
	isDepositLoading: false,
	isWithdrawLoading: false,
	userBalance: 0,
	depositAmount: ZERO_BN,
	withdrawAmount: ZERO_BN,
	poolAllowance: ZERO_BN,
	lpBalance: ZERO_BN,
	// allowanceAmount: ZERO_BN,
	// setAllowanceAmount: () => { },
	setDepositAmount: () => {},
	setWithdrawAmount: () => {},
	approveQuote: () => {},
	deposit: () => {},
	withdraw: () => {},
};

export type SpreadLiquidityPoolAction =
	| {
			type: "SET_LOADING";
			isLoading: SpreadLiquidityPoolProviderState["isLoading"];
	  }
	| {
			type: "SET_SPREAD_LIQUIDITY_POOL";
			liquidityPool: SpreadLiquidityPoolProviderState["liquidityPool"];
			isLoading: SpreadLiquidityPoolProviderState["isLoading"];
	  }
	| {
			type: "RESET_SPREAD_LIQUIDITY_PROVIDER";
	  };

export function spreadLiquidityPoolReducer(
	state: SpreadLiquidityPoolProviderState,
	action: SpreadLiquidityPoolAction
): SpreadLiquidityPoolProviderState {
	switch (action.type) {
		case "SET_LOADING":
			return { ...state, isLoading: action.isLoading };
		case "SET_SPREAD_LIQUIDITY_POOL":
			return { ...state, isLoading: action.isLoading, liquidityPool: action.liquidityPool };
		case "RESET_SPREAD_LIQUIDITY_PROVIDER":
			return spreadLiquidityPoolInitialState;
		default:
			throw new Error();
	}
}
