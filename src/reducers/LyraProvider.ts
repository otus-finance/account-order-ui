import Lyra from "@lyrafinance/lyra-js";

export type LyraProviderState = {
	lyra?: Lyra;
};

export const lyraInitialState: LyraProviderState = {
	lyra: undefined,
};

export type LyraAction =
	| {
			type: "SET_LYRA";
			lyra: LyraProviderState["lyra"];
	  }
	| {
			type: "RESET_LYRA_PROVIDER";
	  };

export function lyraReducer(state: LyraProviderState, action: LyraAction): LyraProviderState {
	switch (action.type) {
		case "SET_LYRA":
			return {
				...state,
				lyra: action.lyra,
			};
		case "RESET_LYRA_PROVIDER":
			return lyraInitialState;
		default:
			throw new Error();
	}
}
