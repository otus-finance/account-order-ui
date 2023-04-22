import { BigNumber } from "ethers";
import { Dispatch } from "react";
import { ZERO_BN } from "../constants/bn";
import { TradeInputParameters } from "../utils/types";
import { LyraStrike } from "../queries/lyra/useLyra";

export type MarketOrderProviderState = {
	networkNotSupported: boolean;
	loading: boolean;
	validMaxPNL: any;
	updateStrikes: LyraStrike[];
	selectedStrikes: LyraStrike[];
	trades: TradeInputParameters[];
	isTxLoading: boolean;
	isApproveQuoteLoading: boolean;
	isOpenPositionLoading: boolean;
	isClosePositionLoading: boolean;
	userBalance: BigNumber;
	spreadMarketAllowance: BigNumber;
	allowanceAmount: BigNumber;
	setAllowanceAmount: Dispatch<BigNumber>;
	updateSize: ((any: any, any2: any) => void) | undefined;
	approveQuote: (() => void) | undefined;
	openPosition: (() => void) | undefined;
	closePosition: (() => void) | undefined;
};

export const marketOrderInitialState: MarketOrderProviderState = {
	networkNotSupported: true,
	loading: true,
	validMaxPNL: {
		validMaxLoss: false,
		maxLoss: 0,
		maxCost: 0,
		maxPremium: 0,
		fee: 0,
		maxLossPost: 0,
	},
	updateStrikes: [],
	selectedStrikes: [],
	trades: [],
	isTxLoading: false,
	isApproveQuoteLoading: false,
	isOpenPositionLoading: false,
	isClosePositionLoading: false,
	userBalance: ZERO_BN,
	spreadMarketAllowance: ZERO_BN,
	allowanceAmount: ZERO_BN,
	setAllowanceAmount: () => {},
	updateSize: (any, any2) => {},
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
