import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
	Address,
	useBalance,
	useNetwork,
	useAccount,
	usePrepareContractWrite,
	useContractWrite,
} from "wagmi";
import { fromBigNumber, toBN } from "../utils/formatters/numbers";

import { quote } from "../constants/quote";

import { useOtusAccountContracts } from "./Contracts";
import { AdminVaultOrderAction, AdminVaultOrderProviderState } from "../reducers";
import { ZERO_BN } from "../constants/bn";
import { TradeInputParameters, Transaction } from "../utils/types";
import { LyraStrike, getStrikeQuote } from "../queries/lyra/useLyra";
import { useBuilderContext } from "../context/BuilderContext";
import { YEAR_SEC } from "../constants/dates";
import * as _ from "lodash";
import {
	_calculateMaxLoss,
	_calculateMaxPremiums,
	_furthestOutExpiry,
	calculateTotalCost,
	checkValidSpread,
} from "../utils/pnl";
import { useDebounce } from "./helpers/useDebounce";
import { convertTradeParams, isStrikeMatch } from "../utils/trade";
import { formatProfitAndLostAtTicks } from "../utils/charting";
import { MAX_NUMBER, MIN_NUMBER, OTUS_FEE } from "../constants/markets";
import { useVaultById, useVaults } from "../queries/otus/vaults";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { createToast } from "../components/UI/Toast";
import { reportError } from "../utils/errors";
import { useLyraContext } from "../context/LyraContext";

export const useAdminVaultOrder = (vaultId: Address) => {
	const { chain } = useNetwork();

	const { lyra } = useLyraContext();

	const { address: owner } = useAccount();

	const [tokenAddr, setTokenAddr] = useState<Address>();

	// get vaults
	const { isLoading: isVaultLoading, data: vault } = useVaultById(chain, vaultId);
	// build tradesu
	const { strikes, selectedMarket } = useBuilderContext();

	const [loading, setLoading] = useState(true);

	const [selectedStrikes, setSelectedStrikes] = useState<LyraStrike[]>([]);

	const [spreadSelected, setSpreadSelected] = useState(false);

	const [totalCollateral, setTotalCollateral] = useState(0);
	const [spreadCollateralLoanDuration, setSpreadCollateralLoanDuration] = useState(0);

	const [otusFee, setOtusFee] = useState(0);

	const [tradeInfo, setTradeInfo] = useState({
		market: selectedMarket?.bytes,
		positionId: 0,
	});

	const [slippage, setSlippage] = useState(0.02);

	const [trades, setTrades] = useState<TradeInputParameters[]>([]);

	const [validMaxPNL, setValidMaxPNL] = useState({
		validMaxLoss: false,
		maxProfit: 0,
		maxLoss: 0,
		maxCost: ZERO_BN,
		maxPremium: ZERO_BN,
		maxLossPost: 0,
	});

	useEffect(() => {
		let selected: LyraStrike[] = strikes.filter((strike: LyraStrike) => strike.selected);
		setSelectedStrikes(selected);
		setLoading(false);
	}, [strikes]);

	const updateStrikes = useDebounce(selectedStrikes, 500);

	const updateMultiSize = useCallback(
		async (size: number) => {
			if (lyra) {
				const _updated = selectedStrikes.map((_strike: LyraStrike) => {
					const { quote } = _strike;
					return {
						..._strike,
						isUpdating: true,
						quote: { ...quote, size: toBN(size.toString()) },
					} as LyraStrike;
				});
				setSelectedStrikes(_updated);
			}
		},
		[lyra, selectedStrikes]
	);

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

	const calculateCollateral = useCallback(() => {
		if (updateStrikes.length > 0) {
			let _totalCollateral = updateStrikes.reduce((acc: number, strike: LyraStrike) => {
				const { quote, setCollateralTo } = strike;
				const { size, isBuy } = quote;
				if (isBuy) return acc;
				const _size = fromBigNumber(size);
				const _setCollateralTo = fromBigNumber(setCollateralTo);
				const _collateral = _size * _setCollateralTo;
				return acc + _collateral;
			}, 0);
			setTotalCollateral(_totalCollateral);

			const _spreadCollateralLoanDuration = _furthestOutExpiry(updateStrikes) - Date.now();
			setSpreadCollateralLoanDuration(_spreadCollateralLoanDuration);
		} else {
			setTotalCollateral(0);
		}
	}, [updateStrikes]);

	const calculateOtusFee = useCallback(() => {
		if (
			spreadSelected &&
			spreadCollateralLoanDuration > 0 &&
			validMaxPNL.validMaxLoss &&
			totalCollateral > 0
		) {
			// get fee
			const _fee = (spreadCollateralLoanDuration / (YEAR_SEC * 1000)) * totalCollateral * OTUS_FEE;

			setOtusFee(_fee);
		}
	}, [validMaxPNL, spreadCollateralLoanDuration, totalCollateral, spreadSelected]);

	useEffect(() => {
		calculateOtusFee();
	}, [
		spreadSelected,
		totalCollateral,
		spreadCollateralLoanDuration,
		validMaxPNL,
		calculateOtusFee,
	]);

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
			calculateCollateral();
		}
	}, [lyra, updateStrikes, updateStrikeQuotes, calculateCollateral]);

	const setStrikeTrades = useCallback(() => {
		setTrades(convertTradeParams(selectedStrikes, slippage));
	}, [selectedStrikes, slippage]);

	const buildTicks = (strikes: LyraStrike[]): number[] => {
		return strikes.map((strike: LyraStrike) => {
			const { quote } = strike;
			const { strikePrice } = quote;
			return fromBigNumber(strikePrice);
		});
	};

	const calculateMaxPNL = useCallback(() => {
		if (updateStrikes.length > 0) {
			const _pnl = [MIN_NUMBER, MAX_NUMBER]
				.concat(buildTicks(updateStrikes))
				.map((tick) => formatProfitAndLostAtTicks(tick, updateStrikes));
			const _maxProfit = Math.max(..._pnl);
			const _maxLoss = Math.min(..._pnl);
			let [maxCost, maxPremium] = _calculateMaxPremiums(updateStrikes);

			const isValidSpread = checkValidSpread(updateStrikes);

			const totalCost = calculateTotalCost(spreadSelected, _maxLoss, maxCost, maxPremium);

			setValidMaxPNL({
				validMaxLoss: isValidSpread,
				maxProfit: spreadSelected ? _maxProfit - otusFee : _maxProfit,
				maxLoss: spreadSelected ? _maxLoss - otusFee : _maxLoss,
				maxCost: toBN(maxCost.toString()),
				maxPremium: toBN(maxPremium.toString()),
				maxLossPost: spreadSelected ? totalCost + otusFee : totalCost,
			});
		} else {
			setValidMaxPNL({
				validMaxLoss: false,
				maxProfit: 0,
				maxLoss: 0,
				maxCost: ZERO_BN,
				maxPremium: ZERO_BN,
				maxLossPost: 0,
			});
		}
	}, [updateStrikes, spreadSelected, otusFee]);

	useEffect(() => {
		if (updateStrikes.length > 0) {
			calculateMaxPNL();
			setStrikeTrades();
		}
	}, [updateStrikes, otusFee, spreadSelected, calculateMaxPNL, setStrikeTrades]);

	useEffect(() => {
		if (chain && chain.id) {
			const _quoteAddr = quote[chain.id];
			setTokenAddr(_quoteAddr);
		}
	}, [chain]);

	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const { otusContracts, networkNotSupported } = useOtusAccountContracts();

	const otusVault = otusContracts && otusContracts["OtusVault"] && otusContracts["OtusVault"];

	const { config: startNextRoundConfig } = usePrepareContractWrite({
		address: vaultId,
		abi: otusVault?.abi,
		functionName: "startNextRound",
		chainId: chain?.id,
	});

	const { isLoading: isStartNextRoundLoading, write: startNextRound } = useContractWrite({
		...startNextRoundConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", "Start next round", txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
	});

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

	// otus vault
	return {
		startNextRound,
		isVaultLoading,
		vault,
		otusFee,
		totalCollateral,
		spreadSelected,
		setSpreadSelected,
		networkNotSupported,
		loading,
		updateStrikes,
		updateSize,
		updateMultiSize,
		selectedStrikes,
		trades,
		validMaxPNL,
		userBalance,
	} as AdminVaultOrderProviderState;
};
