import { BigNumber, BigNumberish } from "ethers";
import { Id } from "react-toastify";
import { Address } from "wagmi";
import { TransactionReceipt } from "@ethersproject/providers";

export type StrategyStrikeTrade = {
	optionType: OptionType;
	priceAt: PriceAt; // change to enum
	order: number; // closer to strike // ex. if a sell call and a buy call are both otm, and sell call has order 0 and buy call order 1, sell call gets first strike
	matched?: boolean;
};

export type Strategy = {
	id: number;
	name: string;
	type: StrategyType[]; // change to enum
	tags: StrategyTag[];
	description: string;
	trade: StrategyStrikeTrade[];
};

export enum OptionType {
	LONG_CALL,
	LONG_PUT,
	SHORT_CALL_BASE,
	SHORT_CALL_QUOTE,
	SHORT_PUT_QUOTE,
}

export enum PriceAt {
	OTM = 0,
	ITM = 1,
	ATM = 2,
}

export enum StrategyType {
	Bearish = 0,
	Bullish = 1,
	Volatile = 2,
	Calm = 3,
	Neutral = 4,
}

export enum StrategyTag {
	PostMaxLossOnly = "Post Max Loss Only",
	LimitedLoss = "Limited Loss",
	LimitedGain = "Limited Gain",
	UnlimitedLoss = "Unlimited Loss",
	UnlimitedGain = "Unlimited Gain",
}

export type StrategyDirection = {
	id: StrategyType;
	name: string;
};

export enum ActivityType {
	Trade,
	Position,
}

export enum BuilderType {
	Builder,
	Custom,
}

// place orders types
export enum OrderTypes {
	MARKET,
	LIMIT_PRICE,
	LIMIT_VOL,
	TAKE_PROFIT,
	STOP_LOSS,
}

// vault types
export type LiquidityPool = {
	id: string;
	isActive: boolean;
	totalDeposits: BigNumber;
	quoteAsset: string;
	vaultCap: BigNumber;
};

export type Transaction = {
	hash: Address;
	toastId?: Id;
	receipt?: TransactionReceipt;
};

export type OrderInputParemeters = {
	orderType: OrderTypes;
	market: string;
	iterations: BigNumberish;
	collatPercent: BigNumber;
	optionType: BigNumberish;
	strikeId: BigNumber;
	size: BigNumber;
	positionId: BigNumberish;
	tradeDirection: BigNumberish;
	targetPrice: BigNumber;
	targetVolatility: BigNumber;
};

export type TradeInputParameters = {
	strikeId: BigNumberish;
	positionId: BigNumberish;
	iterations: BigNumberish;
	optionType: BigNumberish;
	amount: BigNumber;
	setCollateralTo: BigNumber;
	minTotalCost: BigNumber;
	maxTotalCost: BigNumber;
	rewardRecipient: string;
};

export type TradeInfo = {
	positionId: BigNumberish;
	market: string;
};

export type ContractInterface = {
	address: `0x${string}` | undefined;
	abi: any;
};

export type MarketOrderTransaction = {
	allowance: BigNumber;
	isApproveSuccess: boolean;
	isApproveLoading: boolean;
	isOpenConfigSuccess: boolean;
	openConfigError: any;
	isOpenPositionSuccess: boolean;
	isOpenPositionLoading: boolean;
	isTxLoading: boolean;
	approve: () => Promise<void>;
	open: () => Promise<void>;
};

export type PositionTransaction = {
	burnPositionConfigSuccess: boolean;
	burnPositionConfigError: any;
	isBurnPositionSuccess: boolean;
	isBurnPositionLoading: boolean;
	isTxLoading: boolean;
	burn: () => Promise<void>;
};

// PositionUpdate Event
// PositionUpdatedType
export enum PositionUpdatedType {
	OPENED,
	SPLIT_TRANSFER,
	ADJUSTED,
	CLOSED,
	SETTLED,
	LIQUIDATED,
	TRANSFER,
}
