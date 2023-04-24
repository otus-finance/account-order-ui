import { Provider } from "@wagmi/core";
import { Contract, ethers } from "ethers";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
	Address,
	erc20ABI,
	useBalance,
	useContractWrite,
	useNetwork,
	usePrepareContractWrite,
	useProvider,
	useSigner,
	useAccount,
	useWaitForTransaction,
	useContractRead,
} from "wagmi";
import { formatUSD, fromBigNumber, toBN } from "../utils/formatters/numbers";

import { quote } from "../constants/quote";

import { useOtusAccountContracts } from "./Contracts";
import { MarketOrderProviderState, marketOrderInitialState, marketOrderReducer } from "../reducers";
import { MAX_BN, ZERO_ADDRESS, ZERO_BN } from "../constants/bn";
import { createToast, updateToast } from "../components/UI/Toast";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { ActivityType, TradeInputParameters, Transaction } from "../utils/types";
import { reportError } from "../utils/errors";
import { useBuilder } from "./Builder";
import { LyraStrike, getStrikeQuote } from "../queries/lyra/useLyra";
import { useBuilderContext } from "../context/BuilderContext";
import { calculateOptionType, isLong } from "../utils/formatters/optiontypes";
import { YEAR_SEC } from "../constants/dates";
import * as _ from "lodash";
import getPositionCollateral from "@lyrafinance/lyra-js/dist/types/position/getPositionCollateral";
import { _calculateMaxLoss, _calculateMaxPremiums, _furthestOutExpiry } from "../utils/pnl";

const getMarket = () => {};

export const useMarketOrder = () => {
	// const [state, dispatch] = useReducer(marketOrderReducer, marketOrderInitialState);

	const { chain } = useNetwork();

	const { address: owner } = useAccount();

	const [tokenAddr, setTokenAddr] = useState<Address>();

	// build trades
	const { lyra, strikes, selectedMarket, handleSelectActivityType } = useBuilderContext();

	const [loading, setLoading] = useState(true);

	const [selectedStrikes, setSelectedStrikes] = useState<LyraStrike[]>([]);

	useEffect(() => {
		let selected: LyraStrike[] = strikes.filter((strike: LyraStrike) => strike.selected);
		setSelectedStrikes(selected);
		setLoading(false);
	}, [strikes]);

	const updateStrikes = useDebounce(selectedStrikes, 2000);

	const updateSize = useCallback(
		async (strike: LyraStrike, size: number) => {
			if (lyra) {
				const _updated = selectedStrikes.map((_strike: LyraStrike) => {
					if (isStrikeMatch(strike, _strike)) {
						const { quote } = strike;
						return {
							...strike,
							isUpdating: true,
							quote: { ...quote, size: toBN(size.toString()) },
						} as LyraStrike;
					}
					return _strike;
				});
				setSelectedStrikes(_updated);
			}
		},
		[lyra, selectedStrikes]
	);

	const updateStrikeQuotes = useCallback(async () => {
		if (lyra) {
			const _strikes = await Promise.all(
				updateStrikes.map(async (strike: LyraStrike) => {
					const { quote, isUpdating } = strike;
					if (isUpdating) {
						const { size, isCall, isBuy } = quote;
						const _quote = await getStrikeQuote(lyra, isCall, isBuy, size, strike);
						return { ...strike, isUpdating: false, quote: _quote } as LyraStrike;
					} else {
						return strike;
					}
				})
			);

			setSelectedStrikes(_strikes);
		}
	}, [lyra, updateStrikes]);

	useEffect(() => {
		if (updateStrikes.length > 0) {
			updateStrikeQuotes();
		}
	}, [lyra, updateStrikes, updateStrikeQuotes]);

	const [spreadSelected, setSpreadSelected] = useState(false);
	const [tradeInfo, setTradeInfo] = useState({
		market: selectedMarket?.bytes,
		positionId: 0,
	});

	const [trades, setTrades] = useState<TradeInputParameters[]>([]);

	const [validMaxPNL, setValidMaxPNL] = useState({
		validMaxLoss: false,
		maxProfit: 0,
		maxLoss: ZERO_BN,
		maxCost: ZERO_BN,
		maxPremium: ZERO_BN,
		fee: ZERO_BN,
		maxLossPost: ZERO_BN,
		collateralRequired: ZERO_BN,
	});

	const setStrikeTrades = useCallback(() => {
		let selected: LyraStrike[] = strikes.filter((strike: LyraStrike) => strike.selected);
		setTrades(convertTradeParams(selected));
	}, [strikes]);

	const calculateMaxPNL = useCallback(() => {
		if (updateStrikes.length > 0) {
			let [maxCost, maxPremium] = _calculateMaxPremiums(updateStrikes);

			let [validMaxLoss, maxLoss, maxProfit, collateralLoan] = _calculateMaxLoss(
				updateStrikes,
				maxCost
			);

			const spreadCollateralLoanDuration = _furthestOutExpiry(updateStrikes) - Date.now();

			let fee = 0;

			if (validMaxLoss && spreadCollateralLoanDuration > 0) {
				// get fee
				fee = (spreadCollateralLoanDuration / (YEAR_SEC * 1000)) * collateralLoan * 0.2;
			}

			setValidMaxPNL({
				validMaxLoss,
				maxProfit: maxProfit,
				maxLoss: toBN(maxLoss.toString()),
				maxCost: toBN(maxCost.toString()),
				maxPremium: toBN(maxPremium.toString()),
				fee: toBN(fee.toString()),
				maxLossPost: toBN((maxLoss + maxCost - maxPremium + fee).toString()),
				collateralRequired: ZERO_BN,
			});
		} else {
			setValidMaxPNL({
				validMaxLoss: false,
				maxProfit: 0,
				maxLoss: ZERO_BN,
				maxCost: ZERO_BN,
				maxPremium: ZERO_BN,
				fee: ZERO_BN,
				maxLossPost: ZERO_BN,
				collateralRequired: ZERO_BN,
			});
		}
	}, [updateStrikes]);

	useEffect(() => {
		if (updateStrikes.length > 0) {
			if (updateStrikes.length > 0) {
				calculateMaxPNL();
				setStrikeTrades();
			}
		}
	}, [updateStrikes, calculateMaxPNL, setStrikeTrades]);

	useEffect(() => {
		if (chain && chain.id) {
			const _quoteAddr = quote[chain.id];
			setTokenAddr(_quoteAddr);
		}
	}, [chain]);

	const { otusContracts, networkNotSupported } = useOtusAccountContracts();

	const otusOptionMarket =
		otusContracts && otusContracts["OtusOptionMarket"] && otusContracts["OtusOptionMarket"];

	console.log({ otusOptionMarket: otusOptionMarket?.address });

	const spreadOptionMarket =
		otusContracts && otusContracts["SpreadOptionMarket"] && otusContracts["SpreadOptionMarket"];

	const [userBalance, setUserBalance] = useState(ZERO_BN);

	const _userBalance = useBalance({
		address: owner,
		token: chain && quote[chain.id],
		chainId: chain?.id,
		watch: true,
	});

	useEffect(() => {
		if (_userBalance.data?.value) {
			setUserBalance(_userBalance.data?.value);
		}
	}, [_userBalance]);

	// option market allowance
	const [otusOptionMarketAllowance, setOtusOptionMarketAllowance] = useState(ZERO_BN);
	console.log({ otusOptionMarketAllowance });
	const { data: _usdOptionMarketAllowance, refetch: refetchOptionMarketAllowance } =
		useContractRead({
			address: tokenAddr,
			abi: erc20ABI,
			functionName: "allowance",
			args:
				owner && otusOptionMarket?.address
					? [owner, otusOptionMarket.address]
					: [ZERO_ADDRESS, ZERO_ADDRESS],
			chainId: chain?.id,
		});

	useEffect(() => {
		if (_usdOptionMarketAllowance) {
			setOtusOptionMarketAllowance(_usdOptionMarketAllowance);
		}
	}, [_usdOptionMarketAllowance]);

	// allowance
	const [spreadMarketAllowance, setSpreadMarketAllowance] = useState(ZERO_BN);

	const { data: _usdAllowance, refetch: refetchAllowance } = useContractRead({
		address: tokenAddr,
		abi: erc20ABI,
		functionName: "allowance",
		args:
			owner && spreadOptionMarket?.address
				? [owner, spreadOptionMarket.address]
				: [ZERO_ADDRESS, ZERO_ADDRESS],
		chainId: chain?.id,
	});

	useEffect(() => {
		if (_usdAllowance) {
			setSpreadMarketAllowance(_usdAllowance);
		}
	}, [_usdAllowance]);

	const [allowanceAmount, setAllowanceAmount] = useState(MAX_BN);

	const { config: allowanceConfig } = usePrepareContractWrite({
		address: spreadOptionMarket?.address && allowanceAmount ? tokenAddr : undefined,
		abi: erc20ABI,
		functionName: "approve",
		args:
			spreadOptionMarket?.address && allowanceAmount
				? [spreadOptionMarket?.address, allowanceAmount]
				: [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
	});

	const {
		isSuccess,
		isLoading: isApproveQuoteLoading,
		write: approveQuote,
	} = useContractWrite({
		...allowanceConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Approving spread option market`, txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
		onSuccess: async (data) => {
			await refetchAllowance();
		},
	});

	// approve otus contract
	const { config: allowanceOtusMarketConfig } = usePrepareContractWrite({
		address: otusOptionMarket?.address && allowanceAmount ? tokenAddr : undefined,
		abi: erc20ABI,
		functionName: "approve",
		args:
			otusOptionMarket?.address && allowanceAmount
				? [otusOptionMarket?.address, allowanceAmount]
				: [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
	});

	const {
		isSuccess: isApproveOtusMarketSuccess,
		isLoading: isApproveOtusMarketLoading,
		write: approveOtusQuote,
	} = useContractWrite({
		...allowanceOtusMarketConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Approving spread option market`, txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
		onSuccess: async (data) => {
			await refetchAllowance();
		},
	});

	const { config: openPositionConfig } = usePrepareContractWrite({
		address: spreadOptionMarket?.address,
		abi: spreadOptionMarket?.abi,
		functionName: "openPosition",
		args: [tradeInfo, trades, validMaxPNL.maxLossPost],
		chainId: chain?.id,
		onError: (error) => {
			console.log({ error });
		},
		enabled: !!(trades.length > 0),
	});

	const {
		isSuccess: isOpenPositionSuccess,
		isLoading: isOpenPositionLoading,
		write: openPosition,
		data: openPositionData,
	} = useContractWrite({
		//...openPositionConfig,
		mode: "recklesslyUnprepared",
		address: spreadOptionMarket?.address,
		abi: spreadOptionMarket?.abi,
		functionName: "openPosition",
		args: [tradeInfo, trades, validMaxPNL.maxLossPost],
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Opening position spread option market`, txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
		onMutate: (ee) => {
			console.log({ ee });
		},
		onError: (error) => {
			console.log({ error });
		},
	});

	// open lyra position
	const { config: openLyraPositionConfig } = usePrepareContractWrite({
		address: otusOptionMarket?.address,
		abi: otusOptionMarket?.abi,
		functionName: "openLyraPosition",
		args: [
			tradeInfo.market,
			trades.filter((t: TradeInputParameters) => (!isLong(t.optionType as number) ? true : false)),
			trades.filter((t: TradeInputParameters) => (isLong(t.optionType as number) ? true : false)),
		],
		chainId: chain?.id,
		onError: (error) => {
			console.log({ error });
		},
		enabled: !!(trades.length > 0),
	});

	const {
		isSuccess: isOpenLyraPositionSuccess,
		isLoading: isOpenLyrPositionLoading,
		write: openLyraPosition,
		data: openLyraPositionData,
	} = useContractWrite({
		// ...openPositionConfig,
		mode: "recklesslyUnprepared",
		address: otusOptionMarket?.address,
		abi: otusOptionMarket?.abi,
		functionName: "openLyraPosition",
		args: [
			tradeInfo.market,
			trades.filter((t: TradeInputParameters) => (!isLong(t.optionType as number) ? true : false)),
			trades.filter((t: TradeInputParameters) => (isLong(t.optionType as number) ? true : false)),
		],
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Opening position lyra option market`, txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
		onMutate: (ee) => {
			console.log({ ee });
		},
		onError: (error) => {
			console.log({ error });
		},
	});

	const [market, setMarket] = useState(0);
	const [spreadPositionId, setSpreadPositionId] = useState(0);
	const [isPartialClose, setPartialClose] = useState(false);

	let closePositionToastId = "";

	const { config: closePositionConfig } = usePrepareContractWrite({
		address: spreadOptionMarket?.address,
		abi: spreadOptionMarket?.abi,
		functionName: "closePosition",
		args: [market, spreadPositionId, isPartialClose],
		chainId: chain?.id,
	});

	const {
		isSuccess: isClosePositionSuccess,
		isLoading: isClosePositionLoading,
		write: closePosition,
		data: closePositionData,
	} = useContractWrite({
		...openPositionConfig,
		onSuccess: (data, variables, context) => {
			// if (depositToastId && chain) {
			//   const txHref = getExplorerUrl(chain?.id, data.hash)
			//   updatePendingToast(depositToastId, {
			//     description: `Your deposit is pending, click to view on etherscan`,
			//     href: txHref,
			//     autoClose: DEFAULT_TOAST_TIMEOUT,
			//   })
			// }
		},
		onError: (error: Error, variables, context) => {
			const rawMessage = error?.message;
			let message = rawMessage ? rawMessage.replace(/ *\([^)]*\) */g, "") : "Something went wrong";
		},
		onMutate: () => {
			// closePositionToastId = createPendingToast({
			// 	description: `Confirm your deposit`,
			// 	autoClose: false,
			// 	icon: ToastIcon.Error,
			// });
		},
	});

	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const { isLoading: isTxLoading } = useWaitForTransaction({
		hash: activeTransaction?.hash,
		onSuccess: (data) => {
			if (chain && data.transactionHash) {
				if (activeTransaction?.toastId) {
					const txHref = getExplorerUrl(chain, data.transactionHash);
					updateToast("success", activeTransaction?.toastId, "Success", txHref);
					// handleSelectActivityType(ActivityType.Position);
				}

				setActiveTransaction(undefined);
			}
		},
		onError(err) {
			console.log({ err });
			reportError(chain, err, activeTransaction?.toastId, false, activeTransaction?.receipt);
			setActiveTransaction(undefined);
		},
	});

	return {
		spreadSelected,
		setSpreadSelected,
		networkNotSupported,
		loading,
		updateStrikes,
		updateSize,
		selectedStrikes,
		trades,
		validMaxPNL,
		userBalance,
		isTxLoading,
		isApproveQuoteLoading,
		isOpenPositionLoading,
		isClosePositionLoading,
		otusOptionMarketAllowance,
		spreadMarketAllowance,
		allowanceAmount,
		setAllowanceAmount,
		approveOtusQuote,
		approveQuote,
		openPosition,
		openLyraPosition,
		closePosition,
	} as MarketOrderProviderState;
};

const slippage = 0.02;

const convertTradeParams = (strikes: LyraStrike[]): TradeInputParameters[] => {
	return strikes.map((strike: LyraStrike) => {
		const {
			quote: { isBuy, isCall, premium, size },
		} = strike;
		const optionType = calculateOptionType(isBuy, isCall);
		const _isLong = isLong(optionType);
		const _premium = _isLong
			? fromBigNumber(premium) + fromBigNumber(premium) * slippage
			: fromBigNumber(premium) - fromBigNumber(premium) * slippage;

		return {
			strikeId: strike.id,
			positionId: 0,
			iterations: 1,
			optionType: optionType,
			amount: size,
			setCollateralTo: _isLong ? toBN("0") : toBN("2000"),
			minTotalCost: _isLong ? ZERO_BN : toBN(_premium.toString()),
			maxTotalCost: _isLong ? toBN(_premium.toString()) : MAX_BN,
			rewardRecipient: ZERO_ADDRESS,
		} as TradeInputParameters;
	});
};

const isStrikeMatch = (newStrike: LyraStrike, existingStrike: LyraStrike) => {
	if (
		newStrike.id == existingStrike.id &&
		calculateOptionType(newStrike.quote.isBuy, newStrike.isCall) ==
			calculateOptionType(existingStrike.quote.isBuy, existingStrike.quote.isCall)
	) {
		return true;
	}
	return false;
};

function useDebounce(value: LyraStrike[], delay: number) {
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				// check debouncedValue different than value
				if (!_.isEqual(debouncedValue, value)) {
					setDebouncedValue(value);
				}
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay] // Only re-call effect if value or delay changes
	);
	return debouncedValue;
}
