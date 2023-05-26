import { useEffect, useReducer } from "react";
import { Chain, useNetwork } from "wagmi";
import { ChainProviderState, chainInitialState, chainReducer } from "../reducers/ChainProvider";

export const useChain = () => {
	const [state, dispatch] = useReducer(chainReducer, chainInitialState);

	const { selectedChain } = state;

	const { chain } = useNetwork();

	useEffect(() => {
		if (chain?.id) {
			dispatch({
				type: "SET_CHAIN",
				selectedChain: chain,
			});
		}
	}, [chain]);

	const handleSelectedChain = (chain: Chain) => {
		if (chain) {
			dispatch({
				type: "SET_CHAIN",
				selectedChain: chain,
			});
		}
	};

	return {
		selectedChain,
		handleSelectedChain,
	} as ChainProviderState;
};
