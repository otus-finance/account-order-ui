import Lyra, { OptionType } from "@lyrafinance/lyra-js";
import { ethers } from "ethers";
import { useCallback, useEffect, useReducer, useState } from "react";
import { BuilderType, Strategy, StrategyDirection, StrategyStrikeTrade } from "../utils/types";
import {
	getStrikeQuote,
	LyraBoard,
	LyraMarket,
	LyraChain,
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
import { optimism, arbitrum, hardhat, Chain } from "wagmi/chains";
import { arbitrumUrl, optimismUrl } from "../constants/networks";
import { DirectionType } from "../utils/direction";
import { YEAR_SEC } from "../constants/dates";
import { string } from "zod";

const getRPCUrl = (chain: Chain) => {
	switch (chain) {
		case hardhat:
			return optimismUrl;
		case arbitrum:
			return arbitrumUrl;
		case optimism:
			return optimismUrl;
		default:
			return optimismUrl;
	}
};

const getLyra = async (chain: Chain) => {
	const provider = new ethers.providers.JsonRpcProvider(getRPCUrl(chain));
	await provider.getNetwork();
	{
		/* @ts-ignore  different types in JsonRpcProvider in lyra-js */
	}
	return new Lyra({ provider });
};

export const useBuilder = () => {
	const [state, dispatch] = useReducer(builderReducer, builderInitialState);

	const {
		maxLossPost,
		fee,
		maxCost,
		maxPremium,
		validMaxLoss,
		maxLoss,
		lyra,
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

	const network = useNetwork();

	useEffect(() => {
		if (network.chain?.id && !selectedChain) {
			dispatch({
				type: "SET_CHAIN",
				selectedChain: network.chain,
				selectedMarket: null,
				strikes: [],
				selectedExpirationDate: null,
				selectedStrategy: null,
			});
			dispatch({
				type: "RESET_VALID_MAX_PNL",
			});
		}
	}, [network, selectedChain]);

	const handleSelectedChain = (chain: Chain) => {
		dispatch({
			type: "SET_CHAIN",
			selectedChain: chain,
			selectedMarket: null,
			strikes: [],
			selectedExpirationDate: null,
			selectedStrategy: null,
		});
		dispatch({
			type: "RESET_VALID_MAX_PNL",
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
		if (!selectedChain) {
			dispatch({
				type: "SET_CHAIN",
				selectedChain: optimism,
				selectedMarket: null,
				strikes: [],
				selectedExpirationDate: null,
				selectedStrategy: null,
			});
			dispatch({
				type: "RESET_VALID_MAX_PNL",
			});
		}
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

	const calculateMaxPNL = useCallback(() => {
		let selected: LyraStrike[] = strikes.filter((strike: LyraStrike) => strike.selected);

		if (selected.length > 0) {
			let [maxCost, maxPremium] = _calculateMaxPremiums(selected);

			let [validMaxLoss, maxLoss, collateralLoan] = _calculateMaxLoss(selected);

			const spreadCollateralLoanDuration = _furthestOutExpiry(selected) - Date.now();

			let fee = 0;

			if (validMaxLoss && spreadCollateralLoanDuration > 0) {
				// get fee
				fee = (spreadCollateralLoanDuration / (YEAR_SEC * 1000)) * collateralLoan * 0.2;
			}

			dispatch({
				type: "SET_VALID_MAX_PNL",
				validMaxLoss,
				maxLoss,
				maxCost,
				maxPremium,
				fee,
				maxLossPost: maxLoss + maxCost - maxPremium + fee,
			});
		} else {
			dispatch({
				type: "SET_VALID_MAX_PNL",
				validMaxLoss: false,
				maxLoss: 0,
				maxCost: 0,
				maxPremium: 0,
				fee: 0,
				maxLossPost: 0,
			});
		}
	}, [strikes]);

	useEffect(() => {
		if (strikes.length > 0) {
			let selected: LyraStrike[] = strikes.filter((strike: LyraStrike) => strike.selected);
			if (selected.length > 0) {
				calculateMaxPNL();
			}
		}
	}, [strikes, calculateMaxPNL]);

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
		dispatch({
			type: "RESET_VALID_MAX_PNL",
		});
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
		// dispatch({
		// 	type: "TOGGLE_STRIKE_LOAD",
		// 	isToggleStrikeLoading: true,
		// 	toggleStrikeId: selectedStrike.id
		// })

		// if (selected) {

		// } else {
		// 	dispatch({
		// 		type: "SET_STRIKES",
		// 		// strikes: strikes.filter((_strike: LyraStrike) => {
		// 		// 	const {
		// 		// 		id,
		// 		// 		isCall,
		// 		// 		quote: { isBuy },
		// 		// 	} = _strike;
		// 		// 	if (selectedStrike.id !== id) {
		// 		// 		return true;
		// 		// 	} else if (selectedStrike.quote.isBuy !== isBuy) {
		// 		// 		return true;
		// 		// 	} else if (selectedStrike.isCall !== isCall) {
		// 		// 		return true;
		// 		// 	} else {
		// 		// 		return false;
		// 		// 	}
		// 		// }),
		// 		strikes: strikes.map((strike: LyraStrike) => {
		// 			const {
		// 				id,
		// 				isCall,
		// 				quote: { isBuy },
		// 			} = strike;
		// 			if (selectedStrike.id !== id) {
		// 				return strike;
		// 			} else if (selectedStrike.quote.isBuy !== isBuy) {
		// 				return strike;
		// 			} else if (selectedStrike.isCall !== isCall) {
		// 				return strike;
		// 			} else {
		// 				return { ...strike, selected: false };
		// 			}
		// 		}),
		// 		isValid: true,
		// 	});
		// }

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

		// dispatch({
		// 	type: "TOGGLE_STRIKE_LOAD",
		// 	isToggleStrikeLoading: false,
		// 	toggleStrikeId: selectedStrike.id
		// })
	};

	const [activeStrike, setActiveStrike] = useState({ strikeId: 0, isCall: false });

	return {
		maxLossPost,
		fee,
		maxCost,
		maxPremium,
		validMaxLoss,
		maxLoss,
		lyra,
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

const _calculateMaxLoss = (strikes: LyraStrike[]): [boolean, number, number] => {
	if (strikes.length > 0) {
		let strikesByOptionTypes: Record<number, number> = {
			0: 0,
			1: 0,
			2: 0,
			3: 0,
			4: 0,
		};

		const optionTypeMatch = strikes.reduce((accum: Record<number, number>, strike: LyraStrike) => {
			const {
				quote: { isBuy, isCall },
			} = strike;

			const optionType = calculateOptionType(isBuy, isCall);
			accum[optionType] += 1;

			return accum;
		}, strikesByOptionTypes as Record<number, number>);

		// if no shorts
		if (optionTypeMatch[3] === 0 && optionTypeMatch[4] === 0) {
			return [true, 0, 0];
		}

		// if size of longs puts < short puts
		// infinite loss
		let validCalls = true;
		if (
			optionTypeMatch[0] != undefined &&
			optionTypeMatch[3] != undefined &&
			optionTypeMatch[3] != 0 &&
			optionTypeMatch[0] < optionTypeMatch[3]
		) {
			validCalls = false; // max loss is collateral
		}

		// if size of long calls < short calls
		// infinite loss
		let validPuts = true;
		if (
			optionTypeMatch[1] != undefined &&
			optionTypeMatch[4] != undefined &&
			optionTypeMatch[4] != 0 &&
			optionTypeMatch[1] < optionTypeMatch[4]
		) {
			validPuts = false;
		}

		// max loss - calls
		const calls = strikes
			.filter((strike: LyraStrike) => {
				const {
					quote: { isCall },
				} = strike;
				return isCall;
			})
			.sort((a: LyraStrike, b: LyraStrike) => {
				return fromBigNumber(a.strikePrice) - fromBigNumber(b.strikePrice);
			});

		const shortCallCollateralMax = calls.reduce(
			(total: [number, number], strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				if (!isBuy) {
					total[0] += fromBigNumber(strikePrice) * fromBigNumber(size);
					total[1] += fromBigNumber(size);
				}
				return total;
			},
			[0, 0] as [number, number]
		);

		if (!validCalls) {
			return [validCalls, shortCallCollateralMax[0], 0];
		}

		let shortCallSize = shortCallCollateralMax[1];
		let maxCallLoss = 0;

		if (shortCallSize > 0) {
			calls.forEach((strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				let longSize = fromBigNumber(size);

				if (isBuy) {
					let cover = fromBigNumber(strikePrice) * fromBigNumber(size);
					maxCallLoss = cover - shortCallCollateralMax[0];
					shortCallSize = shortCallSize - longSize;
					if (shortCallSize <= 0) {
						return;
					}
				}
			});
		}

		// max loss - puts
		const puts = strikes
			.filter((strike: LyraStrike) => {
				const {
					quote: { isCall },
				} = strike;
				return !isCall;
			})
			.sort((a: LyraStrike, b: LyraStrike) => {
				return fromBigNumber(b.strikePrice) - fromBigNumber(a.strikePrice);
			});

		const shortPutCollateralMax = puts.reduce(
			(total: [number, number], strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				if (!isBuy) {
					total[0] += fromBigNumber(strikePrice) * fromBigNumber(size);
					total[1] += fromBigNumber(size);
				}
				return total;
			},
			[0, 0] as [number, number]
		);

		if (!validPuts) {
			return [validPuts, shortPutCollateralMax[0], 0];
		}

		let shortPutSize = shortPutCollateralMax[1];
		let maxPutLoss = 0;

		if (shortPutSize > 0) {
			puts.forEach((strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				let longSize = fromBigNumber(size);

				if (isBuy) {
					let cover = fromBigNumber(strikePrice) * fromBigNumber(size);
					maxPutLoss = cover - shortPutCollateralMax[0];
					shortPutSize = shortPutSize - longSize;
					if (shortPutSize <= 0) {
						return;
					}
				}
			});
		}

		return [
			true,
			Math.abs(maxPutLoss) > Math.abs(maxCallLoss) ? Math.abs(maxPutLoss) : Math.abs(maxCallLoss),
			shortPutCollateralMax[0] + shortCallCollateralMax[0],
		];
	}

	return [false, 0, 0];
};

const _calculateMaxPremiums = (strikes: LyraStrike[]) => {
	return strikes.reduce(
		(totalPremiums: [number, number], strike: LyraStrike) => {
			const {
				quote: { size, isBuy, pricePerOption },
			} = strike;

			const _totalPriceForOptions = fromBigNumber(pricePerOption) * fromBigNumber(size);

			if (isBuy) {
				totalPremiums[0] += _totalPriceForOptions;
			} else {
				totalPremiums[1] += _totalPriceForOptions;
			}

			return totalPremiums;
		},
		[0, 0] as [number, number]
	);
};

const _furthestOutExpiry = (strikes: LyraStrike[]) => {
	return (
		strikes.reduce((expiration: number, strike: LyraStrike) => {
			const {
				expiryTimestamp,
				quote: { isBuy },
			} = strike;
			if (!isBuy) {
				return expiration > expiryTimestamp ? expiration : expiryTimestamp;
			} else {
				return expiration;
			}
		}, 0 as number) * 1000
	);
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
