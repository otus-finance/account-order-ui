import Lyra from "@lyrafinance/lyra-js";
import { BuilderType, Strategy, StrategyDirection } from "../utils/types";
import { LyraBoard, LyraChain, LyraMarket, LyraStrike } from "../queries/lyra/useLyra";
import { Chain } from "wagmi";
import { Dispatch } from "react";

export type BuilderProviderState = {
	fee: number;
	maxCost: number;
	maxPremium: number;
	maxLoss: number;
	maxLossPost: number;
	validMaxLoss: boolean;
	lyra: Lyra | null;
	builderType: BuilderType;
	showStrikesSelect: boolean;
	selectedChain: Chain | null;
	markets: LyraMarket[] | null;
	isMarketLoading: any | null | undefined;
	currentPrice: number;
	selectedMarket: LyraMarket | null;
	selectedDirectionTypes: StrategyDirection[];
	selectedExpirationDate: LyraBoard | null;
	selectedStrategy: any | null | undefined;
	strikes: LyraStrike[];
	isValid: boolean;
	isBuildingNewStrategy: boolean;
	activeStrike: any;
	isUpdating: boolean;
	setActiveStrike: Dispatch<any>;
	handleSelectBuilderType: (any: BuilderType) => void;
	handleSelectedChain: (any: Chain) => void;
	handleSelectedMarket: (any: LyraMarket | null) => void;
	handleSelectedDirectionTypes: (any: StrategyDirection[]) => void;
	handleSelectedExpirationDate: (any: LyraBoard | null) => void;
	handleSelectedStrategy: (any: Strategy | null) => void;
	handleUpdateQuote: (any: any) => void;
	handleToggleSelectedStrike: (strike: LyraStrike, selected: boolean) => void;
	handleBuildNewStrategy: (any: boolean) => void;
};

export const builderInitialState: BuilderProviderState = {
	fee: 0,
	maxCost: 0,
	maxPremium: 0,
	maxLoss: 0,
	maxLossPost: 0,
	validMaxLoss: false, // valid for max loss post spread
	lyra: null,
	builderType: BuilderType.Builder,
	showStrikesSelect: false,
	selectedChain: null,
	markets: [],
	isMarketLoading: true,
	currentPrice: 0,
	selectedMarket: null,
	selectedDirectionTypes: [],
	selectedExpirationDate: null,
	selectedStrategy: null,
	strikes: [],
	isValid: false,
	isBuildingNewStrategy: false,
	activeStrike: { strikeId: 0, isCall: false },
	isUpdating: false,
	setActiveStrike: () => {},
	handleSelectBuilderType: (any) => void any,
	handleSelectedChain: (any) => void any,
	handleSelectedMarket: (any) => void any,
	handleSelectedDirectionTypes: (any) => void any,
	handleSelectedExpirationDate: (any) => void any,
	handleSelectedStrategy: (any) => void any,
	handleUpdateQuote: (any) => void any,
	handleToggleSelectedStrike: (any) => void any,
	handleBuildNewStrategy: (any) => void any,
};

export type BuilderAction =
	| {
			type: "SET_BUILD_NEW_STRATEGY";
			isBuildingNewStrategy: BuilderProviderState["isBuildingNewStrategy"];
	  }
	| {
			type: "SET_STRIKES_SELECT_SHOW";
			showStrikesSelect: BuilderProviderState["showStrikesSelect"];
	  }
	| {
			type: "SET_CHAIN";
			selectedChain: BuilderProviderState["selectedChain"];
			selectedMarket: BuilderProviderState["selectedMarket"];
			strikes: BuilderProviderState["strikes"];
			selectedExpirationDate: BuilderProviderState["selectedExpirationDate"];
			selectedStrategy: BuilderProviderState["selectedStrategy"];
	  }
	| {
			type: "SET_LYRA";
			lyra: BuilderProviderState["lyra"];
	  }
	| {
			type: "SET_MARKETS_LOADING";
			isMarketLoading: BuilderProviderState["isMarketLoading"];
	  }
	| {
			type: "SET_BUILDER_TYPE";
			builderType: BuilderProviderState["builderType"];
	  }
	| {
			type: "SET_MARKETS";
			markets: BuilderProviderState["markets"];
			isMarketLoading: BuilderProviderState["isMarketLoading"];
	  }
	| {
			type: "SET_MARKET";
			selectedMarket: BuilderProviderState["selectedMarket"];
			strikes: BuilderProviderState["strikes"];
			selectedExpirationDate: BuilderProviderState["selectedExpirationDate"];
			selectedStrategy: BuilderProviderState["selectedStrategy"];
	  }
	| {
			type: "SET_CURRENT_PRICE";
			currentPrice: BuilderProviderState["currentPrice"];
	  }
	| {
			type: "SET_DIRECTION_TYPES";
			selectedDirectionTypes: BuilderProviderState["selectedDirectionTypes"];
	  }
	| {
			type: "SET_EXPIRATION_DATE";
			selectedExpirationDate: BuilderProviderState["selectedExpirationDate"];
	  }
	| {
			type: "SET_STRATEGY";
			selectedStrategy: BuilderProviderState["selectedStrategy"];
			strikes: BuilderProviderState["strikes"];
			isBuildingNewStrategy: BuilderProviderState["isBuildingNewStrategy"];
	  }
	| {
			type: "SET_STRIKES";
			strikes: BuilderProviderState["strikes"];
			isValid: BuilderProviderState["isValid"];
	  }
	| {
			type: "UPDATE_STRIKES";
			strikes: BuilderProviderState["strikes"];
			isUpdating: BuilderProviderState["isUpdating"];
	  }
	| {
			type: "SET_UPDATING_STRIKE";
			isUpdating: BuilderProviderState["isUpdating"];
	  }
	| {
			type: "RESET_MARKET";
			strikes: BuilderProviderState["strikes"];
			currentPrice: BuilderProviderState["currentPrice"];
			selectedExpirationDate: BuilderProviderState["selectedExpirationDate"];
			selectedStrategy: BuilderProviderState["selectedStrategy"];
	  }
	| {
			type: "SET_VALID_MAX_PNL";
			validMaxLoss: BuilderProviderState["validMaxLoss"];
			maxLossPost: BuilderProviderState["maxLossPost"];
			maxLoss: BuilderProviderState["maxLoss"];
			maxCost: BuilderProviderState["maxCost"];
			maxPremium: BuilderProviderState["maxPremium"];
			fee: BuilderProviderState["fee"];
	  }
	| {
			type: "RESET_VALID_MAX_PNL";
	  }
	| {
			type: "RESET_BUILDER_PROVIDER";
	  };

export function builderReducer(
	state: BuilderProviderState,
	action: BuilderAction
): BuilderProviderState {
	switch (action.type) {
		case "SET_BUILD_NEW_STRATEGY":
			return { ...state, isBuildingNewStrategy: action.isBuildingNewStrategy };
		case "SET_STRIKES_SELECT_SHOW":
			return { ...state, showStrikesSelect: action.showStrikesSelect };
		case "SET_CHAIN":
			return {
				...state,
				selectedChain: action.selectedChain,
				selectedMarket: action.selectedMarket,
				strikes: action.strikes,
				selectedExpirationDate: action.selectedExpirationDate,
				selectedStrategy: action.selectedStrategy,
			};
		case "SET_LYRA":
			return {
				...state,
				lyra: action.lyra,
			};
		case "SET_MARKETS":
			return {
				...state,
				markets: action.markets,
				isMarketLoading: action.isMarketLoading,
			};
		case "SET_MARKETS_LOADING":
			return { ...state, isMarketLoading: action.isMarketLoading };
		case "SET_BUILDER_TYPE":
			return { ...state, builderType: action.builderType };
		case "SET_MARKET":
			return {
				...state,
				selectedMarket: action.selectedMarket,
				strikes: action.strikes,
				selectedExpirationDate: action.selectedExpirationDate,
				selectedStrategy: action.selectedStrategy,
			};
		case "SET_CURRENT_PRICE":
			return { ...state, currentPrice: action.currentPrice };
		case "SET_DIRECTION_TYPES":
			return {
				...state,
				selectedDirectionTypes: action.selectedDirectionTypes,
			};
		case "SET_EXPIRATION_DATE":
			return {
				...state,
				selectedExpirationDate: action.selectedExpirationDate,
			};
		case "SET_STRATEGY":
			return {
				...state,
				selectedStrategy: action.selectedStrategy,
				strikes: action.strikes,
				isBuildingNewStrategy: action.isBuildingNewStrategy,
			};
		case "SET_STRIKES":
			return { ...state, strikes: action.strikes, isValid: action.isValid };
		case "UPDATE_STRIKES":
			return { ...state, strikes: action.strikes, isUpdating: action.isUpdating };
		case "SET_UPDATING_STRIKE":
			return { ...state, isUpdating: action.isUpdating };
		case "RESET_MARKET":
			return {
				...state,
				strikes: action.strikes,
				currentPrice: action.currentPrice,
				selectedExpirationDate: action.selectedExpirationDate,
				selectedStrategy: action.selectedStrategy,
			};
		case "SET_VALID_MAX_PNL":
			return {
				...state,
				validMaxLoss: action.validMaxLoss,
				maxLoss: action.maxLoss,
				maxLossPost: action.maxLossPost,
				maxCost: action.maxCost,
				maxPremium: action.maxPremium,
				fee: action.fee,
			};
		case "RESET_VALID_MAX_PNL":
			return {
				...state,
				validMaxLoss: false,
				maxLoss: 0,
				maxLossPost: 0,
				maxCost: 0,
				maxPremium: 0,
				fee: 0,
			};
		case "RESET_BUILDER_PROVIDER":
			return builderInitialState;
		default:
			throw new Error();
	}
}
