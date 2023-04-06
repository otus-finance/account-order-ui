import { Contract } from "ethers";
import { Dispatch } from "react";
import { LiquidityPool } from "../queries/otus/liquidityPool";

export type SpreadLiquidityPoolProviderState = {
	liquidityPool: LiquidityPool | null;
	isLoading: boolean;
	isApproveQuoteLoading: boolean;
	isDepositLoading: boolean;
	isWithdrawLoading: boolean;
	userBalance: string | null;
	liquidityPoolBalance: number | null;
	quoteContract: Contract | null;
	depositAmount: number;
	withdrawAmount: number;
	poolAllowance: number | null;
	allowanceAmount: number;
	setAllowanceAmount: Dispatch<number>;
	setDepositAmount: Dispatch<number>;
	setWithdrawAmount: Dispatch<number>;
	approveQuote: (() => void) | undefined;
	deposit: (() => void) | undefined;
	withdraw: (() => void) | undefined;
};

export const spreadLiquidityPoolInitialState: SpreadLiquidityPoolProviderState = {
	liquidityPool: null,
	isLoading: true,
	isApproveQuoteLoading: false,
	isDepositLoading: false,
	isWithdrawLoading: false,
	userBalance: null,
	liquidityPoolBalance: null,
	quoteContract: null,
	depositAmount: 0,
	withdrawAmount: 0,
	poolAllowance: 0,
	allowanceAmount: 0,
	setAllowanceAmount: () => {},
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
