import { ActivityType, Strategy, StrategyDirection } from "../utils/types";
import { LyraBoard, LyraMarket, LyraStrike } from "../queries/lyra/useLyra";
import { Chain } from "wagmi";
import { Dispatch } from "react";
import { DirectionType } from "../utils/direction";

export type BuilderProviderState = {
	activityType: ActivityType;
	showStrikesSelect: boolean;
	selectedChain: Chain | null;
	markets: LyraMarket[] | null;
	isMarketLoading: any | null | undefined;
	currentPrice: number;
	selectedMarket: LyraMarket | null;
	selectedDirectionTypes: StrategyDirection;
	selectedExpirationDate: LyraBoard | null;
	selectedStrategy?: Strategy;
	previousStrikes: LyraStrike[];
	strikes: LyraStrike[];
	isValid: boolean;
	isBuildingNewStrategy: boolean;
	activeStrike: any;
	isUpdating: boolean;
	isToggleStrikeLoading: boolean;
	toggleStrikeId: number;
	setActiveStrike: Dispatch<any>;
	handleSelectActivityType: (any: ActivityType) => void;
	handleSelectedChain: (any: Chain) => void;
	handleSelectedMarket: (any: LyraMarket | null) => void;
	handleSelectedDirectionTypes: (any: StrategyDirection) => void;
	handleSelectedExpirationDate: (any: LyraBoard | null) => void;
	handleSelectedStrategy: (any: Strategy | undefined) => void;
	handleToggleSelectedStrike: (strike: LyraStrike, selected: boolean) => void;
	handleBuildNewStrategy: (any: boolean) => void;
};

export const builderInitialState: BuilderProviderState = {
	activityType: ActivityType.Trade,
	showStrikesSelect: false,
	selectedChain: null,
	markets: [],
	isMarketLoading: true,
	currentPrice: 0,
	selectedMarket: null,
	selectedDirectionTypes: DirectionType[1] as StrategyDirection,
	selectedExpirationDate: null,
	selectedStrategy: undefined,
	previousStrikes: [],
	strikes: [],
	isValid: false,
	isBuildingNewStrategy: false,
	activeStrike: { strikeId: 0, isCall: false },
	isUpdating: false,
	isToggleStrikeLoading: false,
	toggleStrikeId: 0,
	setActiveStrike: () => {},
	handleSelectActivityType: (any) => void any,
	handleSelectedChain: (any) => void any,
	handleSelectedMarket: (any) => void any,
	handleSelectedDirectionTypes: (any) => void any,
	handleSelectedExpirationDate: (any) => void any,
	handleSelectedStrategy: (any) => void any,
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
			type: "CONNECT_CHAIN";
			selectedChain: BuilderProviderState["selectedChain"];
	  }
	| {
			type: "SET_MARKETS_LOADING";
			isMarketLoading: BuilderProviderState["isMarketLoading"];
	  }
	| {
			type: "SET_ACTIVITY_TYPE";
			activityType: BuilderProviderState["activityType"];
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
			isBuildingNewStrategy: BuilderProviderState["isBuildingNewStrategy"];
	  }
	| {
			type: "SET_STRIKES";
			strikes: BuilderProviderState["strikes"];
			isValid: BuilderProviderState["isValid"];
	  }
	| {
			type: "UPDATE_STRIKES";
			previousStrikes: BuilderProviderState["previousStrikes"];
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
			type: "TOGGLE_STRIKE_LOAD";
			isToggleStrikeLoading: BuilderProviderState["isToggleStrikeLoading"];
			toggleStrikeId: BuilderProviderState["toggleStrikeId"];
	  }
	// | {
	// 	type: "RESET_VALID_MAX_PNL";
	// }
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
		case "CONNECT_CHAIN":
			return {
				...state,
				selectedChain: action.selectedChain,
			};
		case "SET_MARKETS":
			return {
				...state,
				markets: action.markets,
				isMarketLoading: action.isMarketLoading,
			};
		case "SET_MARKETS_LOADING":
			return { ...state, isMarketLoading: action.isMarketLoading };
		case "SET_ACTIVITY_TYPE":
			return { ...state, activityType: action.activityType };
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
				isBuildingNewStrategy: action.isBuildingNewStrategy,
			};
		case "SET_STRIKES":
			return {
				...state,
				strikes: action.strikes,
				isValid: action.isValid,
			};
		case "UPDATE_STRIKES":
			return {
				...state,
				previousStrikes: action.previousStrikes,
				strikes: action.strikes,
				isUpdating: action.isUpdating,
			};
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
		case "TOGGLE_STRIKE_LOAD":
			return {
				...state,
				isToggleStrikeLoading: action.isToggleStrikeLoading,
				toggleStrikeId: action.toggleStrikeId,
			};
		case "RESET_BUILDER_PROVIDER":
			return builderInitialState;
		default:
			throw new Error();
	}
}
