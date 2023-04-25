import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { Address, useBalance, useNetwork, useAccount } from "wagmi";
import { fromBigNumber, toBN } from "../utils/formatters/numbers";

import { quote } from "../constants/quote";

import { useOtusAccountContracts } from "./Contracts";
import { MarketOrderProviderState } from "../reducers";
import { ZERO_BN } from "../constants/bn";
import { MarketOrderTransaction, TradeInputParameters, Transaction } from "../utils/types";
import { LyraStrike, getStrikeQuote } from "../queries/lyra/useLyra";
import { useBuilderContext } from "../context/BuilderContext";
import { YEAR_SEC } from "../constants/dates";
import * as _ from "lodash";
import { _calculateMaxLoss, _calculateMaxPremiums, _furthestOutExpiry } from "../utils/pnl";
import { useDebounce } from "./helpers/useDebounce";
import { convertTradeParams, isStrikeMatch } from "../utils/trade";
import { useOtusMarket } from "./markets/useOtusMarket";
import { useSpreadMarket } from "./markets/useSpreadMarket";

export const useMarketOrder = () => {
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

	const updateStrikes = useDebounce(selectedStrikes, 500);

	const updateCollateralPercent = useCallback(
		async (strike: LyraStrike, _collateralPercent: number) => {
			if (lyra) {
				const _updated = selectedStrikes.map((_strike: LyraStrike) => {
					if (isStrikeMatch(strike, _strike)) {
						return {
							...strike,
							collateralPercent: _collateralPercent,
						} as LyraStrike;
					}
					return _strike;
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

	const [totalCollateral, setTotalCollateral] = useState(0);

	const calculateCollateral = useCallback(() => {
		if (updateStrikes.length > 0) {
			let _totalCollateral = updateStrikes.reduce((acc: number, strike: LyraStrike) => {
				const { quote, collateralPercent } = strike;
				const { size, strikePrice, isBuy } = quote;
				if (isBuy) return acc;
				const _size = fromBigNumber(size);
				const _strikePrice = fromBigNumber(strikePrice);
				const _collateral = _size * _strikePrice * collateralPercent;
				return acc + _collateral;
			}, 0);
			setTotalCollateral(_totalCollateral);
		} else {
			setTotalCollateral(0);
		}
	}, [updateStrikes]);

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

	const [spreadSelected, setSpreadSelected] = useState(false);

	const [tradeInfo, setTradeInfo] = useState({
		market: selectedMarket?.bytes,
		positionId: 0,
	});

	const [slippage, setSlippage] = useState(0.02);

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
		setTrades(convertTradeParams(selectedStrikes, slippage));
	}, [selectedStrikes, slippage]);

	const _calculateMaxProfit = (strikes: LyraStrike[]): number => {
		// if more buys than sells, then max profit is infinite

		let buys = strikes.filter((strike: LyraStrike) => strike.quote.isBuy);
		let sells = strikes.filter((strike: LyraStrike) => !strike.quote.isBuy);

		if (buys.length > sells.length) {
			return Infinity;
		}

		return 0;
	};

	const calculateMaxPNL = useCallback(() => {
		if (updateStrikes.length > 0) {
			let [maxCost, maxPremium] = _calculateMaxPremiums(updateStrikes);

			let [validMaxLoss, maxLoss, maxProfit, collateralLoan] = _calculateMaxLoss(
				updateStrikes,
				maxCost
			);

			if (maxProfit != Infinity) {
				maxProfit = _calculateMaxProfit(updateStrikes);
			}

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
			calculateMaxPNL();
			setStrikeTrades();
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

	// option market transactions
	const otusMarket: MarketOrderTransaction = useOtusMarket(
		otusOptionMarket,
		tokenAddr,
		owner,
		chain,
		spreadSelected,
		trades,
		tradeInfo.market
	);
	// spread market transactions
	const spreadMarket: MarketOrderTransaction = useSpreadMarket(
		spreadOptionMarket,
		tokenAddr,
		owner,
		chain,
		spreadSelected,
		tradeInfo,
		trades,
		validMaxPNL.maxLossPost
	);

	return {
		otusMarket,
		spreadMarket,
		totalCollateral,
		spreadSelected,
		setSpreadSelected,
		networkNotSupported,
		loading,
		updateStrikes,
		updateSize,
		updateCollateralPercent,
		selectedStrikes,
		trades,
		validMaxPNL,
		userBalance,
	} as MarketOrderProviderState;
};
