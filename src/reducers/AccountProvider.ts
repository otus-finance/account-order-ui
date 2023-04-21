import { AccountQuoteBalance } from "@lyrafinance/lyra-js";
import { BigNumber } from "ethers";
import { ZERO_BN } from "../constants/bn";

export type AccountProviderState = {
	quoteAsset?: AccountQuoteBalance;
	quoteAssetBalance: BigNumber;
	fetchMarketQuoteBalance: () => void;
};

export const accountInitialState: AccountProviderState = {
	quoteAsset: undefined,
	quoteAssetBalance: ZERO_BN,
	fetchMarketQuoteBalance: () => {},
};

export type AccountAction = {
	type: "RESET_ACCOUNT_PROVIDER";
};
