import { Contract } from "ethers";
import { Dispatch } from "react";
import { AccountOrder } from "../queries/otus/account";
import { OrderInputParemeters } from "../utils/types";

export type AccountOrderProviderState = {
	isLoading: boolean;
	isApproveQuoteLoading: boolean;
	isDepositLoading: boolean;
	isWithdrawLoading: boolean;
	accountOrder: AccountOrder | null;
	userBalance: string | null;
	accountBalance: string | null;
	accountAllowance: number | null;
	quoteContract: Contract | null;
	order: OrderInputParemeters | null;
	depositAmount: number;
	withdrawAmount: number;
	allowanceAmount: number;
	setOrder: Dispatch<OrderInputParemeters>;
	setAllowanceAmount: Dispatch<number>;
	setDepositAmount: Dispatch<number>;
	setWithdrawAmount: Dispatch<number>;
	approveQuote: (() => void) | undefined;
	deposit: (() => void) | undefined;
	withdraw: (() => void) | undefined;
	placeOrder: (() => void) | undefined;
};

export const accountOrderInitialState: AccountOrderProviderState = {
	isLoading: true,
	isApproveQuoteLoading: false,
	isDepositLoading: false,
	isWithdrawLoading: false,
	accountOrder: null,
	userBalance: null,
	accountBalance: null,
	accountAllowance: null,
	quoteContract: null,
	order: null,
	depositAmount: 0,
	withdrawAmount: 0,
	allowanceAmount: 0,
	setOrder: () => {},
	setAllowanceAmount: () => {},
	setDepositAmount: () => {},
	setWithdrawAmount: () => {},
	approveQuote: () => {},
	deposit: () => {},
	withdraw: () => {},
	placeOrder: () => {},
};

export type AccountOrderAction =
	| {
			type: "SET_LOADING";
			isLoading: AccountOrderProviderState["isLoading"];
	  }
	| {
			type: "SET_ACCOUNT_ORDER";
			accountOrder: AccountOrderProviderState["accountOrder"];
			isLoading: AccountOrderProviderState["isLoading"];
	  }
	| {
			type: "RESET_ACCOUNT_ORDER_PROVIDER";
	  };

export function accountOrderReducer(
	state: AccountOrderProviderState,
	action: AccountOrderAction
): AccountOrderProviderState {
	switch (action.type) {
		case "SET_LOADING":
			return { ...state, isLoading: action.isLoading };
		case "SET_ACCOUNT_ORDER":
			return { ...state, accountOrder: action.accountOrder, isLoading: action.isLoading };
		case "RESET_ACCOUNT_ORDER_PROVIDER":
			return accountOrderInitialState;
		default:
			throw new Error();
	}
}
