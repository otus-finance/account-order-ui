import { Chain } from "wagmi";

export type ChainProviderState = {
	selectedChain: Chain | null;
	handleSelectedChain: (any: Chain) => void;
};

export const chainInitialState: ChainProviderState = {
	selectedChain: null,
	handleSelectedChain: (any) => void any,
};

export type ChainAction =
	| {
			type: "SET_CHAIN";
			selectedChain: ChainProviderState["selectedChain"];
	  }
	| {
			type: "RESET_CHAIN_PROVIDER";
	  };

export function chainReducer(state: ChainProviderState, action: ChainAction): ChainProviderState {
	switch (action.type) {
		case "SET_CHAIN":
			return {
				...state,
				selectedChain: action.selectedChain,
			};
		case "RESET_CHAIN_PROVIDER":
			return chainInitialState;
		default:
			throw new Error();
	}
}