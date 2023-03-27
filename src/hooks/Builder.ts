import Lyra, { OptionType } from "@lyrafinance/lyra-js";
import { ethers } from "ethers";
import { useCallback, useEffect, useReducer, useState } from "react";
import { BuilderType, Strategy, StrategyDirection } from "../utils/types";
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
import { extrensicValueFilter, calculateOptionType } from "../utils/formatters/optiontypes";
import { useNetwork } from "wagmi";
import { optimism, arbitrum, hardhat, Chain } from "wagmi/chains";
import { arbitrumUrl, optimismUrl } from "../constants/networks";
import { DirectionType } from "../utils/direction";

const getLyra = async (chain: Chain) => {
	const provider = new ethers.providers.JsonRpcProvider(
		chain.id === arbitrum.id ? arbitrumUrl : optimismUrl
	);
	await provider.getNetwork();
	{
		/* @ts-ignore  different types in JsonRpcProvider in lyra-js */
	}
	return new Lyra({ provider });
};

export const useBuilder = () => {
	const [state, dispatch] = useReducer(builderReducer, builderInitialState);

	const {
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
		positionPnl,
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
				positionPnl: { netCreditDebit: 0, maxLoss: 0, maxProfit: 0 },
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
			positionPnl: { netCreditDebit: 0, maxLoss: 0, maxProfit: 0 },
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
				positionPnl: { netCreditDebit: 0, maxLoss: 0, maxProfit: 0 },
			});
		}
	}, [selectedChain]);

	const { data, isLoading } = useLyraMarket(lyra);

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

	const calculateStrategyPNL = useCallback(() => {
		let strikesByOptionTypes: Record<number, number> = {
			0: 0,
			1: 0,
			2: 0,
			3: 0,
			4: 0,
		};

		const pnl = strikes.reduce(
			(accum: any, strike: any) => {
				const {
					quote,
					quote: { size, isBuy, isCall, pricePerOption, strikePrice },
				} = strike;

				let _optionType = calculateOptionType(isBuy, isCall);
				let _strikeOptions = strikesByOptionTypes[_optionType] || 0;

				strikesByOptionTypes[_optionType] = _strikeOptions + 1;

				// max cost
				const _totalPriceForOptions = fromBigNumber(pricePerOption) * fromBigNumber(size);
				// collateralrequired
				const _strikeCollateralRequired = fromBigNumber(strikePrice) * fromBigNumber(size);

				const { netCreditDebit, maxLoss, maxProfit, maxCost, collateralRequired } = accum;

				const _netCreditDebit = isBuy
					? netCreditDebit - _totalPriceForOptions
					: netCreditDebit + _totalPriceForOptions;
				const _maxLoss = isBuy ? maxLoss + _totalPriceForOptions : _strikeCollateralRequired;
				const _maxProfit = isBuy ? Infinity : maxProfit + _totalPriceForOptions;

				const _maxCost = isBuy ? _totalPriceForOptions + maxCost : maxCost;
				const _collateralRequired = isBuy
					? collateralRequired
					: _strikeCollateralRequired + collateralRequired;

				return {
					netCreditDebit: _netCreditDebit,
					maxLoss: _maxLoss,
					maxProfit: _maxProfit,
					collateralRequired: _collateralRequired, // min collateral required
					maxCost: _maxCost, // max cost buy put buy call
				};
			},
			{
				netCreditDebit: 0,
				maxLoss: 0,
				maxProfit: 0,
				collateralRequired: 0, // min collateral required
				maxCost: 0, // max cost buy put buy call
			}
		);

		dispatch({
			type: "SET_POSITION_PNL",
			positionPnl: checkCappedPNL(pnl, strikesByOptionTypes),
		} as BuilderAction);
	}, [strikes]);

	useEffect(() => {
		if (strikes.length > 0) {
			calculateStrategyPNL();
		}
	}, [strikes, selectedStrategy, calculateStrategyPNL]);

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
			positionPnl: { netCreditDebit: 0, maxLoss: 0, maxProfit: 0 },
		} as BuilderAction);
	};

	const handleSelectedDirectionTypes = (directionTypes: StrategyDirection[]) => {
		dispatch({
			type: "SET_DIRECTION_TYPES",
			selectedDirectionTypes: directionTypes,
		} as BuilderAction);
	};

	const handleSelectedExpirationDate = (expirationDate: LyraBoard) => {
		dispatch({
			type: "SET_EXPIRATION_DATE",
			selectedExpirationDate: expirationDate,
			positionPnl: { netCreditDebit: 0, maxLoss: 0, maxProfit: 0 },
		} as BuilderAction);
	};

	const handleSelectedStrategy = (strategy: any) => {
		dispatch({
			type: "SET_STRATEGY",
			selectedStrategy: strategy,
			strikes: [],
			isBuildingNewStrategy: false,
		});
	};

	const handleUpdateQuote = useCallback(
		async (strikeUpdate: { strike: LyraStrike; size: string }) => {
			console.log({ strikeUpdate });
			if (strikeUpdate && strikes.length > 0 && lyra) {
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
				});
			}
		},
		[lyra, strikes]
	);

	const filterStrikes = useCallback(() => {
		if (currentPrice > 0 && selectedStrategy != null && selectedExpirationDate != null) {
			const { strikesByOptionTypes } = selectedExpirationDate;
			// if a trade has 2 of same they need to be merged and include size update quote
			const _strikes = selectedStrategy.trade.map((trade: any) => {
				const { optionType, priceAt, order } = trade;
				if (strikesByOptionTypes) {
					const _optionTypeStrikes: LyraStrike[] | undefined = strikesByOptionTypes[optionType];
					let found = 0;

					/* @ts-ignore */
					return _optionTypeStrikes.find((strike) => {
						const { strikePrice, isCall } = strike;
						const _strikePrice = fromBigNumber(strikePrice);
						let foundMatch = extrensicValueFilter(priceAt, isCall, currentPrice || 0, _strikePrice);
						if (foundMatch && order == found) {
							return true;
						}
						if (foundMatch && order != found) {
							found++;
						} else {
							return false;
						}
					});
				}
			});
			// if any _strikes are undefined, most likely strategy not valid for asset
			if (_strikes.filter((_strike: any) => _strike == undefined).length > 0) {
				dispatch({
					type: "SET_STRIKES",
					strikes: [],
					isValid: false,
				});
			} else {
				dispatch({
					type: "SET_STRIKES",
					strikes: _strikes,
					isValid: true,
				});
			}
		} else {
			dispatch({
				type: "SET_STRIKES",
				strikes: [],
				isValid: true,
			});
		}
	}, [currentPrice, selectedStrategy, selectedExpirationDate]);

	useEffect(() => {
		if (selectedStrategy != null && selectedExpirationDate != null) {
			filterStrikes();
		}
	}, [filterStrikes, currentPrice, selectedStrategy, selectedExpirationDate]);

	const handleToggleSelectedStrike = (selectedStrike: LyraStrike, selected: boolean) => {
		if (selected) {
			dispatch({
				type: "SET_STRIKES",
				strikes: [...strikes, selectedStrike],
				isValid: true,
			});
		} else {
			dispatch({
				type: "SET_STRIKES",
				strikes: strikes.filter((_strike: LyraStrike) => {
					const {
						id,
						isCall,
						quote: { isBuy },
					} = _strike;
					if (selectedStrike.id !== id) {
						return true;
					} else if (selectedStrike.quote.isBuy !== isBuy) {
						return true;
					} else if (selectedStrike.isCall !== isCall) {
						return true;
					} else {
						return false;
					}
				}),
				isValid: true,
			});
		}
	};

	const [activeStrike, setActiveStrike] = useState({ strikeId: 0, isCall: false });

	return {
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
		positionPnl,
		isValid,
		isBuildingNewStrategy,
		activeStrike,
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

const checkCappedPNL = (
	pnl: {
		netCreditDebit: number;
		maxLoss: number;
		maxProfit: number;
	},
	strikesByOptionTypes: Record<number, number>
) => {
	const { netCreditDebit, maxLoss, maxProfit } = pnl;

	if (
		maxProfit === Infinity &&
		strikesByOptionTypes[3] &&
		strikesByOptionTypes[3] > 0 &&
		strikesByOptionTypes[0] == strikesByOptionTypes[3]
	) {
		return { ...pnl, maxProfit: netCreditDebit };
	}

	if (
		maxLoss === Infinity &&
		strikesByOptionTypes[4] &&
		strikesByOptionTypes[4] > 0 &&
		strikesByOptionTypes[1] == strikesByOptionTypes[4]
	) {
		return { ...pnl, maxProfit: netCreditDebit };
	}

	return pnl;
};
