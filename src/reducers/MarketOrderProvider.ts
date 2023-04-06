import { BigNumber } from "ethers";
import { Dispatch } from "react";
import { ZERO_BN } from "../constants/bn";

export type MarketOrderProviderState = {
	isApproveQuoteLoading: boolean;
	isOpenPositionLoading: boolean;
	isClosePositionLoading: boolean;
	userBalance: BigNumber;
	spreadMarketAllowance: number | null;
	allowanceAmount: BigNumber;
	setAllowanceAmount: Dispatch<BigNumber>;
	approveQuote: (() => void) | undefined;
	openPosition: (() => void) | undefined;
	closePosition: (() => void) | undefined;
};

export const marketOrderInitialState: MarketOrderProviderState = {
	isApproveQuoteLoading: false,
	isOpenPositionLoading: false,
	isClosePositionLoading: false,
	userBalance: ZERO_BN,
	spreadMarketAllowance: null,
	allowanceAmount: ZERO_BN,
	setAllowanceAmount: () => {},
	approveQuote: () => {},
	openPosition: () => {},
	closePosition: () => {},
};

export type MarketOrderAction = {
	type: "RESET_MARKET_ORDER_PROVIDER";
};

export function marketOrderReducer(
	state: MarketOrderProviderState,
	action: MarketOrderAction
): MarketOrderProviderState {
	switch (action.type) {
		case "RESET_MARKET_ORDER_PROVIDER":
			return marketOrderInitialState;
		default:
			throw new Error();
	}
}
