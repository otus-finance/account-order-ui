import Lyra, { AccountQuoteBalance } from "@lyrafinance/lyra-js";
import { useCallback, useEffect, useReducer, useState } from "react";
import { LyraStrike } from "../queries/lyra/useLyra";

import { Address, useAccount } from "wagmi";

import { BigNumber } from "ethers";
import { ZERO_BN } from "../constants/bn";
import { AccountProviderState } from "../reducers";
import { useLyraContext } from "../context/LyraContext";

export const useLyraTrade = (address: Address) => {
	const { lyra } = useLyraContext();

	const [market, setMarket] = useState("");
	const [quoteAsset, setQuoteAsset] = useState<AccountQuoteBalance>();
	const [quoteAssetBalance, setQuoteAssetBalance] = useState<BigNumber>(ZERO_BN);

	const buildLyraMarket = useCallback(async () => {
		if (lyra && address) {
			const markets = await lyra.marketAddresses();
			if (markets.length > 0 && markets[0]) {
				setMarket(markets[0]);
			}
		}
	}, [lyra, address]);

	useEffect(() => {
		if (lyra && address) {
			buildLyraMarket();
		}
	}, [lyra, address, buildLyraMarket]);

	const fetchMarketQuoteBalance = useCallback(async () => {
		if (lyra && address && market) {
			const account = lyra.account(address);
			const marketBalance = await account.marketBalances(market);
			const _quoteAsset = marketBalance.quoteAsset;
			setQuoteAssetBalance(_quoteAsset.balance);
			setQuoteAsset(_quoteAsset);
		}
	}, [lyra, address, market]);

	useEffect(() => {
		if (lyra && address && market) {
			fetchMarketQuoteBalance();
		}
	}, [lyra, address, market, fetchMarketQuoteBalance]);

	return {
		quoteAsset,
		quoteAssetBalance,
		fetchMarketQuoteBalance,
	} as AccountProviderState;
};
