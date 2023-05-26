import { useCallback, useEffect, useReducer, useState } from "react";
import { ActivityType, Strategy, StrategyDirection, StrategyStrikeTrade } from "../utils/types";
import { LyraBoard, LyraMarket, LyraStrike, useLyraMarket } from "../queries/lyra/useLyra";

import {
	BuilderProviderState,
	BuilderAction,
	builderInitialState,
	builderReducer,
} from "../reducers";
import { fromBigNumber, toBN } from "../utils/formatters/numbers";
import {
	extrensicValueFilter,
	calculateOptionType,
	orderFilter,
} from "../utils/formatters/optiontypes";
import { useAccount } from "wagmi";

import { DirectionType } from "../utils/direction";
import { useChainContext } from "../context/ChainContext";
import { useLyraContext } from "../context/LyraContext";

export const useBuilder = () => {
	const [state, dispatch] = useReducer(builderReducer, builderInitialState);

	const { isConnected } = useAccount();

	const {
		activityType,
		showStrikesSelect,
		markets,
		isMarketLoading,
		currentPrice,
		selectedMarket,
		selectedDirectionTypes,
		selectedExpirationDate,
		selectedStrategy,
		strikes,
		previousStrikes,
		isUpdating,
		isToggleStrikeLoading,
		toggleStrikeId,
		isValid,
		isBuildingNewStrategy,
	} = state;

	const { handleSelectedChain, selectedChain } = useChainContext();

	const { lyra } = useLyraContext();

	const { data, isLoading } = useLyraMarket(lyra);

	useEffect(() => {
		if (selectedChain?.id && !isConnected) {
			dispatch({
				type: "SET_CHAIN",
				selectedChain: selectedChain,
				selectedMarket: null,
				strikes: [],
				selectedExpirationDate: null,
				selectedStrategy: undefined,
			});
		}
	}, [selectedChain, isConnected]);

	const handleSelectedExpirationDate = (expirationDate: LyraBoard) => {
		const { strikesWithQuotes } = expirationDate;
		dispatch({
			type: "SET_STRIKES",
			strikes: strikesWithQuotes,
			isValid: true,
		});

		dispatch({
			type: "SET_EXPIRATION_DATE",
			selectedExpirationDate: expirationDate,
		} as BuilderAction);
	};

	const handleSelectActivityType = (_type: ActivityType) => {
		dispatch({
			type: "SET_ACTIVITY_TYPE",
			activityType: _type,
		});
	};

	const handleBuildNewStrategy = (_isBuildNewStrategy: boolean) => {
		dispatch({
			type: "SET_BUILD_NEW_STRATEGY",
			isBuildingNewStrategy: _isBuildNewStrategy,
		});
	};

	const handleSelectedMarket = useCallback((market: LyraMarket) => {
		dispatch({
			type: "SET_MARKET",
			selectedMarket: market,
			strikes: [],
			selectedExpirationDate: null,
			selectedStrategy: undefined,
		} as BuilderAction);

		handleSelectActivityType(ActivityType.Trade);
	}, []);

	const handleSelectedDirectionTypes = useCallback((directionTypes: StrategyDirection) => {
		dispatch({
			type: "SET_DIRECTION_TYPES",
			selectedDirectionTypes: directionTypes,
		} as BuilderAction);

		handleSelectActivityType(ActivityType.Trade);
	}, []);

	const handleSelectedStrategy = (strategy: Strategy) => {
		dispatch({
			type: "SET_STRATEGY",
			selectedStrategy: strategy,
			isBuildingNewStrategy: false,
		});

		handleSelectActivityType(ActivityType.Trade);
	};

	useEffect(() => {
		if (data && data?.length > 0) {
			dispatch({
				type: "SET_MARKETS",
				markets: data,
				isMarketLoading: isLoading,
			});
			if (data[0]) {
				handleSelectedMarket(data[0]);
				const market = data[0];
				if (market.liveBoards[0]) {
					handleSelectedExpirationDate(market.liveBoards[0]);
				}
			}
		} else {
			dispatch({
				type: "SET_MARKETS_LOADING",
				isMarketLoading: true,
			});
		}
	}, [data, isLoading, handleSelectedDirectionTypes, handleSelectedMarket]);

	useEffect(() => {
		if (selectedStrategy && isBuildingNewStrategy) {
			dispatch({
				type: "SET_STRIKES_SELECT_SHOW",
				showStrikesSelect: true,
			});
		}

		if (isBuildingNewStrategy) {
			dispatch({
				type: "SET_STRIKES_SELECT_SHOW",
				showStrikesSelect: true,
			});
		} else {
			dispatch({
				type: "SET_STRIKES_SELECT_SHOW",
				showStrikesSelect: false,
			});
		}
	}, [selectedStrategy, isBuildingNewStrategy]);

	useEffect(() => {
		if (selectedMarket) {
			dispatch({
				type: "SET_CURRENT_PRICE",
				currentPrice: fromBigNumber(selectedMarket.spotPrice),
			} as BuilderAction);
		}
	}, [selectedMarket]);

	const filterStrikes = useCallback(() => {
		if (currentPrice > 0 && selectedStrategy != null && selectedExpirationDate != null) {
			const { strikesByOptionTypes, strikesWithQuotes } = selectedExpirationDate;

			// build indexes of
			const tradeOptionTypes = selectedStrategy.trade.reduce(
				(accum: Record<0 | 1 | 2 | 3 | 4, StrategyStrikeTrade[]>, trade: StrategyStrikeTrade) => {
					const trades = accum[trade.optionType]?.concat({ ...trade, matched: false });

					return { ...accum, [trade.optionType]: trades };
				},
				{
					0: [] as StrategyStrikeTrade[],
					1: [] as StrategyStrikeTrade[],
					3: [] as StrategyStrikeTrade[],
					4: [] as StrategyStrikeTrade[],
				} as Record<0 | 1 | 2 | 3 | 4, StrategyStrikeTrade[]>
			);

			let found = {
				0: 0,
				1: 0,
				3: 0,
				4: 0,
			};

			const _strikes1 = Object.keys(strikesByOptionTypes || {})
				.reduce((combo: LyraStrike[], key: string) => {
					const _key = parseInt(key);
					combo =
						strikesByOptionTypes && strikesByOptionTypes[_key]
							? combo.concat(strikesByOptionTypes[_key] || [])
							: combo;
					return combo;
				}, [] as LyraStrike[])
				.map((strike: LyraStrike) => {
					const {
						strikePrice,
						isCall,
						quote: { isBuy },
					} = strike;

					const optionType = calculateOptionType(isBuy, isCall);

					if (tradeOptionTypes.hasOwnProperty(optionType)) {
						const _strikePrice = fromBigNumber(strikePrice);

						const trades = tradeOptionTypes[optionType];

						let strikeMatch = strike;

						trades.forEach((trade: StrategyStrikeTrade) => {
							if (!trade.matched) {
								let orderMatch = false;
								let valueMatch = extrensicValueFilter(
									trade.priceAt,
									isCall,
									currentPrice || 0,
									_strikePrice
								);

								if (valueMatch) {
									orderMatch = orderFilter(trade, found[optionType]);
								}

								if (orderMatch) {
									trade.matched = true;
									strikeMatch = { ...strike, selected: true } as LyraStrike;
								}

								if (valueMatch && !orderMatch) {
									found[optionType] = found[optionType] + 1;
								}
							}
						});

						tradeOptionTypes[optionType] = trades;

						return strikeMatch;
					} else {
						return strike;
					}
				});

			const isValid =
				_strikes1.filter((strike: LyraStrike) => strike.selected).length ==
				selectedStrategy.trade.length;

			dispatch({
				type: "SET_STRIKES",
				strikes: isValid ? (_strikes1 as LyraStrike[]) : strikesWithQuotes,
				isValid: isValid,
			});
		}
	}, [currentPrice, selectedStrategy, selectedExpirationDate]);

	useEffect(() => {
		if (selectedStrategy != null && selectedExpirationDate != null) {
			filterStrikes();
		}
	}, [filterStrikes, currentPrice, selectedStrategy, selectedExpirationDate]);

	const handleToggleSelectedStrike = (selectedStrike: LyraStrike, selected: boolean) => {
		const _toggleStrikes = strikes.map((strike: LyraStrike) => {
			const {
				quote: { isCall, isBuy },
			} = strike;
			const optionType = calculateOptionType(isBuy, isCall);
			return {
				...strike,
				selected: isStrikeSelected(selected, optionType, selectedStrike, strike),
			};
		}) as LyraStrike[];

		dispatch({
			type: "SET_STRIKES",
			strikes: _toggleStrikes,
			isValid: true,
		});
	};

	const [activeStrike, setActiveStrike] = useState({ strikeId: 0, isCall: false });

	return {
		activityType,
		selectedChain,
		showStrikesSelect,
		markets,
		isMarketLoading,
		currentPrice,
		selectedMarket,
		selectedDirectionTypes,
		selectedExpirationDate,
		selectedStrategy,
		strikes,
		previousStrikes,
		isValid,
		isBuildingNewStrategy,
		activeStrike,
		isUpdating,
		isToggleStrikeLoading,
		toggleStrikeId,
		setActiveStrike,
		handleSelectActivityType,
		handleSelectedChain,
		handleSelectedMarket,
		handleSelectedExpirationDate,
		handleSelectedDirectionTypes,
		handleToggleSelectedStrike,
		handleSelectedStrategy,
		handleBuildNewStrategy,
	} as BuilderProviderState;
};

const isStrikeSelected = (
	selected: boolean,
	optionType: number,
	selectedStrike: LyraStrike,
	currentStrike: LyraStrike
) => {
	const {
		quote: { isCall, isBuy, strikeId },
	} = selectedStrike;
	const selectedOptionType = calculateOptionType(isBuy, isCall);

	if (selectedOptionType == optionType && currentStrike.id == strikeId) {
		return selected;
	} else {
		return currentStrike.selected;
	}
};
