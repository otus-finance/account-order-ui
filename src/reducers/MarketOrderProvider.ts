import { BigNumber } from "ethers";
import { Dispatch } from "react";
import { ZERO_BN } from "../constants/bn";
import { MarketOrderTransaction, TradeInputParameters } from "../utils/types";
import { LyraStrike } from "../queries/lyra/useLyra";

export type MarketOrderProviderState = {
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
	otusMarket: MarketOrderTransaction | null;
	spreadMarket: MarketOrderTransaction | null;
	setSpreadSelected: Dispatch<boolean>;
	updateCollateralRequirement: ((any: any, any2: any) => void) | undefined;
	updateSize: ((any: any, any2: any) => void) | undefined;
	updateMultiSize: ((any: any) => void) | undefined;
};

export const marketOrderInitialState: MarketOrderProviderState = {
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
	updateCollateralRequirement: (any, any2) => {},
	updateSize: (any, any2) => {},
	updateMultiSize: (any) => {},
	setSpreadSelected: (any) => {},
	otusMarket: null,
	spreadMarket: null,
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
