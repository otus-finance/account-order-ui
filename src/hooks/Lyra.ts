import { useCallback, useEffect, useReducer } from "react";
import { LyraProviderState, lyraInitialState, lyraReducer } from "../reducers/LyraProvider";
import { useChainContext } from "../context/ChainContext";
import { ethers } from "ethers";
import Lyra from "@lyrafinance/lyra-js";
import { optimism, arbitrum, hardhat, Chain, optimismGoerli, arbitrumGoerli } from "wagmi/chains";
import {
	arbitrumGoerliUrl,
	arbitrumUrl,
	optimismGoerliUrl,
	optimismUrl,
} from "../constants/networks";

const getRPCUrl = (chain: Chain) => {
	switch (chain.id) {
		case hardhat.id:
			return optimismUrl;
		case arbitrum.id:
			return arbitrumUrl;
		case optimism.id:
			return optimismUrl;
		case arbitrumGoerli.id:
			return arbitrumGoerliUrl;
		case optimismGoerli.id:
			return optimismGoerliUrl;
		default:
			return optimismUrl;
	}
};

const getLyra = async (chain: Chain) => {
	const provider = new ethers.providers.JsonRpcProvider(getRPCUrl(chain));
	await provider.getNetwork();
	const _lyra = new Lyra({ provider });
	return _lyra;
};

export const useLyra = () => {
	const [state, dispatch] = useReducer(lyraReducer, lyraInitialState);

	const { lyra } = state;

	const { selectedChain } = useChainContext();

	const updateSelectedChain = useCallback(async () => {
		if (selectedChain && lyra?.chainId != selectedChain.id) {
			const _lyra = await getLyra(selectedChain);
			dispatch({
				type: "SET_LYRA",
				lyra: _lyra,
			});
		}
	}, [lyra, selectedChain]);

	useEffect(() => {
		try {
			updateSelectedChain();
		} catch (error) {
			console.warn({ error });
		}
	}, [updateSelectedChain, selectedChain]);

	return {
		lyra,
	} as LyraProviderState;
};
