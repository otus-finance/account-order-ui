import Lyra, { OptionType } from "@lyrafinance/lyra-js";
import { ethers } from "ethers";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
	ActivityType,
	BuilderType,
	Strategy,
	StrategyDirection,
	StrategyStrikeTrade,
} from "../utils/types";
import {
	getStrikeQuote,
	LyraBoard,
	LyraMarket,
	LyraStrike,
	useLyraMarket,
} from "../queries/lyra/useLyra";

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
import { useNetwork } from "wagmi";
import { optimism, arbitrum, hardhat, Chain, optimismGoerli, arbitrumGoerli } from "wagmi/chains";
import {
	arbitrumGoerliUrl,
	arbitrumUrl,
	optimismGoerliUrl,
	optimismUrl,
} from "../constants/networks";
import { DirectionType } from "../utils/direction";

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
			console.log("are they all default?");
			return optimismUrl;
	}
};

const getLyra = async (chain: Chain) => {
	const provider = new ethers.providers.JsonRpcProvider(getRPCUrl(chain));
	await provider.getNetwork();
	const _lyra = new Lyra({ provider });
	return _lyra;
};

export const useBuilder = () => {
	const [state, dispatch] = useReducer(builderReducer, builderInitialState);

	const {
		lyra,
		activityType,
		builderType,
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
		isUpdating,
		isToggleStrikeLoading,
		toggleStrikeId,
		isValid,
		isBuildingNewStrategy,
	} = state;

	const { chain } = useNetwork();

	useEffect(() => {
		if (chain?.id) {
			dispatch({
				type: "SET_CHAIN",
				selectedChain: chain,
				selectedMarket: null,
				strikes: [],
				selectedExpirationDate: null,
				selectedStrategy: null,
			});
		}
	}, [chain]);

	const handleSelectedChain = (chain: Chain) => {
		dispatch({
			type: "SET_CHAIN",
			selectedChain: chain,
			selectedMarket: null,
			strikes: [],
			selectedExpirationDate: null,
			selectedStrategy: null,
		});
	};

	const updateSelectedChain = useCallback(async () => {
		if (selectedChain) {
			const lyra = await getLyra(selectedChain);
			dispatch({
				type: "SET_LYRA",
				lyra: lyra,
			});
		}
	}, [selectedChain]);

	useEffect(() => {
		try {
			updateSelectedChain();
		} catch (error) {
			console.warn({ error });
		}
	}, [updateSelectedChain, selectedChain]);

	useEffect(() => {
		dispatch({
			type: "SET_CHAIN",
			selectedChain: selectedChain,
			selectedMarket: null,
			strikes: [],
			selectedExpirationDate: null,
			selectedStrategy: null,
		});
	}, [selectedChain]);

	const { data, isLoading } = useLyraMarket(lyra);

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
					if (DirectionType[0] && DirectionType[1]) {
						handleSelectedDirectionTypes([DirectionType[0], DirectionType[1]]);
					}
				}
			}
		} else {
			dispatch({
				type: "SET_MARKETS_LOADING",
				isMarketLoading: true,
			});
		}
	}, [data, isLoading]);

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

	const handleSelectActivityType = (_type: ActivityType) => {
		dispatch({
			type: "SET_ACTIVITY_TYPE",
			activityType: _type,
		});
	};

	const handleSelectBuilderType = (_type: BuilderType) => {
		dispatch({
			type: "SET_BUILDER_TYPE",
			builderType: _type,
		});
	};

	const handleBuildNewStrategy = (_isBuildNewStrategy: boolean) => {
		dispatch({
			type: "SET_BUILD_NEW_STRATEGY",
			isBuildingNewStrategy: _isBuildNewStrategy,
		});
	};

	const handleSelectedMarket = (market: LyraMarket) => {
		dispatch({
			type: "SET_MARKET",
			selectedMarket: market,
			strikes: [],
			selectedExpirationDate: null,
			selectedStrategy: null,
		} as BuilderAction);
	};

	const handleSelectedDirectionTypes = (directionTypes: StrategyDirection[]) => {
		dispatch({
			type: "SET_DIRECTION_TYPES",
			selectedDirectionTypes: directionTypes,
		} as BuilderAction);
	};

	const handleSelectedStrategy = (strategy: any) => {
		dispatch({
			type: "SET_STRATEGY",
			selectedStrategy: strategy,
			isBuildingNewStrategy: false,
		});
	};

	const handleUpdateQuote = useCallback(
		async (_selectedStrategy: any, strikeUpdate: { strike: LyraStrike; size: string }) => {
			if (
				strikeUpdate &&
				strikes.length > 0 &&
				lyra &&
				selectedStrategy.id === _selectedStrategy.id
			) {
				dispatch({
					type: "SET_UPDATING_STRIKE",
					isUpdating: true,
				});

				const { strike: _strike, size } = strikeUpdate;
				const { id: _id, quote, isCall } = _strike;
				const { isBuy } = quote;

				const _quote = await getStrikeQuote(lyra, isCall, isBuy, toBN(size), _strike);

				const _updateStrikes: any = strikes.map((strike: LyraStrike) => {
					const { id } = strike;
					if (id == _id && isBuy == strike.quote.isBuy) {
						return { ...strike, quote: _quote };
					} else {
						return strike;
					}
				});
				dispatch({
					type: "UPDATE_STRIKES",
					strikes: _updateStrikes,
					isUpdating: false,
				});
			}
		},
		[lyra, strikes, selectedStrategy]
	);

	const filterStrikes = useCallback(() => {
		if (currentPrice > 0 && selectedStrategy != null && selectedExpirationDate != null) {
			const { strikesByOptionTypes, strikesWithQuotes } = selectedExpirationDate;

			// build indexes of
			const tradeOptionTypes = selectedStrategy.trade.reduce(
				(accum: Record<number, StrategyStrikeTrade[]>, trade: StrategyStrikeTrade) => {
					const trades = accum[trade.optionType]?.concat({ ...trade, matched: false });

					return { ...accum, [trade.optionType]: trades };
				},
				{
					0: [],
					1: [],
					3: [],
					4: [],
				} as Record<number, StrategyStrikeTrade[]>
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
		lyra,
		activityType,
		builderType,
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
		isValid,
		isBuildingNewStrategy,
		activeStrike,
		isUpdating,
		isToggleStrikeLoading,
		toggleStrikeId,
		setActiveStrike,
		handleSelectActivityType,
		handleSelectBuilderType,
		handleSelectedChain,
		handleSelectedMarket,
		handleSelectedExpirationDate,
		handleSelectedDirectionTypes,
		handleToggleSelectedStrike,
		handleSelectedStrategy,
		handleUpdateQuote,
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
