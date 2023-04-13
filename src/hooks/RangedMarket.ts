import { TradeDirection } from "@lyrafinance/lyra-js";
import { BigNumber, Contract, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import {
	erc20ABI,
	Address,
	useAccount,
	useBalance,
	useContractRead,
	useContractWrite,
	useNetwork,
	usePrepareContractWrite,
	useProvider,
	useWaitForTransaction,
} from "wagmi";
import { Provider } from "@wagmi/core";
import { ONE_BN, ZERO_ADDRESS, ZERO_BN } from "../constants/bn";
import { useOtusAccountContracts } from "./Contracts";
import { fromBigNumber, toBN } from "../utils/formatters/numbers";
import { RangedMarket } from "../queries/otus/rangedMarkets";
import { quote } from "../constants/quote";
import { useGlobal } from "../queries/otus/global";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { Transaction } from "../utils/types";
import { createToast, updateToast } from "../components/UI/Toast";
import { reportError } from "../utils/errors";

export enum RangedMarketPosition {
	IN = "IN",
	OUT = "OUT",
}

export const useRangedMarket = (market: RangedMarket) => {
	const {
		id: rangedMarketId,
		rangedMarketTokenIn,
		rangedMarketTokenOut,
		positionMarketIn,
		positionMarketOut,
		expiry,
		market: marketBytes,
	} = market;

	const { address: owner } = useAccount();

	const otusContracts = useOtusAccountContracts();

	const { data: global, isLoading: isGlobalLoading } = useGlobal();

	const provider = useProvider();

	const otusAMM = otusContracts && otusContracts["OtusAMM"] && otusContracts["OtusAMM"];

	const rangedMarket =
		otusContracts && otusContracts["RangedMarket"] && otusContracts["RangedMarket"];

	const positionMarket =
		otusContracts && otusContracts["PositionMarket"] && otusContracts["PositionMarket"];

	const [size, setSize] = useState(ONE_BN);

	const [rangedMarketPosition, setRangedMarketPosition] = useState(RangedMarketPosition.OUT);
	const [direction, setDirection] = useState(TradeDirection.Open);
	const [positionMarketContract, setPositionMarketContract] = useState(positionMarketOut);
	const [swapFunction, setSwapFunction] = useState(
		direction == TradeDirection.Open ? "buy" : "sell"
	);

	const [tokenAddr, setTokenAddr] = useState<Address>();

	const { chain } = useNetwork();

	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	useEffect(() => {
		if (chain && chain.id) {
			const _quoteAddr = quote[chain.id];
			setTokenAddr(_quoteAddr);
		}
	}, [chain]);

	useEffect(() => {
		if (rangedMarketPosition == RangedMarketPosition.OUT) {
			// update approve contract
			setPositionMarketContract(positionMarketOut);
		} else {
			setPositionMarketContract(positionMarketIn);
		}
	}, [rangedMarketPosition, positionMarketIn, positionMarketOut]);

	const toggleDirection = () => {
		if (direction == TradeDirection.Open) {
			setDirection(TradeDirection.Close);
			setSwapFunction("sell");
		} else {
			setDirection(TradeDirection.Open);
			setSwapFunction("buy");
		}
	};

	const handleSizeUpdate = (_size: number) => {
		setSize(toBN(_size.toString()));
	};

	const { price, trades, isPriceLoading } = useGetPricing(
		rangedMarketId,
		rangedMarket?.abi,
		size,
		rangedMarketPosition,
		direction,
		provider
	);

	// ranged market token in balance
	const [tokenInBalance, setTokenInBalance] = useState(ZERO_BN);

	const _tokenInBalance = useBalance({
		address: owner,
		token: rangedMarketTokenIn,
		chainId: chain?.id,
		watch: true,
	});

	useEffect(() => {
		if (_tokenInBalance.data?.value) {
			setTokenInBalance(_tokenInBalance.data?.value);
		}
	}, [_tokenInBalance]);

	// ranged market token out balance
	const [tokenOutBalance, setTokenOutBalance] = useState(ZERO_BN);

	const _tokenOutBalance = useBalance({
		address: owner,
		token: rangedMarketTokenOut,
		chainId: chain?.id,
		watch: true,
	});

	useEffect(() => {
		if (_tokenOutBalance.data?.value) {
			setTokenOutBalance(_tokenOutBalance.data?.value);
		}
	}, [_tokenOutBalance]);

	// usd balance
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

	// currently allowed susd
	const [currentAllowance, setCurrentAllowance] = useState(ZERO_BN);

	const { data: _usdAllowance, refetch: refetchAllowance } = useContractRead({
		address: tokenAddr,
		abi: erc20ABI,
		functionName: "allowance",
		args:
			owner && positionMarketContract
				? [owner, positionMarketContract]
				: [ZERO_ADDRESS, ZERO_ADDRESS],
		chainId: chain?.id,
	});

	useEffect(() => {
		if (_usdAllowance) {
			setCurrentAllowance(_usdAllowance);
		}
	}, [_usdAllowance]);

	// Approve Position Market contract to approve USD
	const { config: allowanceConfig } = usePrepareContractWrite({
		address: tokenAddr,
		abi: erc20ABI,
		functionName: "approve",
		args:
			positionMarketContract && price ? [positionMarketContract, price] : [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
	});

	const { isLoading: isApproveQuoteLoading, write: approveQuote } = useContractWrite({
		...allowanceConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast(
					"info",
					`Approving ranged market ${rangedMarketPosition}`,
					txHref
				);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
		onSuccess: async (data) => {
			await refetchAllowance();
		},
	});

	// Swap Ranged Market Token
	const { config: swapConfig } = usePrepareContractWrite({
		address: otusAMM?.address,
		abi: otusAMM?.abi,
		functionName: swapFunction,
		args:
			otusAMM?.address && price
				? [
						Object.values(RangedMarketPosition).indexOf(rangedMarketPosition),
						rangedMarketId,
						size,
						price,
						trades,
				  ]
				: [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
		onError: (err) => {
			console.log("test prep", err);
		},
	});

	const {
		isSuccess: swapSuccess,
		isLoading: isSwapLoading,
		write: swap,
	} = useContractWrite({
		...swapConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast(
					"info",
					`Confirm  ranged market ${rangedMarketPosition} swap`,
					txHref
				);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
		onError: (err) => {
			console.log("test", err);
		},
	});

	const { isLoading: isTxLoading } = useWaitForTransaction({
		hash: activeTransaction?.hash,
		onSuccess: (data) => {
			if (chain && data.blockHash) {
				if (activeTransaction?.toastId) {
					updateToast("success", activeTransaction?.toastId, "Success");
				}

				setActiveTransaction(undefined);
			}
		},
		onError(err) {
			reportError(chain, err, activeTransaction?.toastId, false, activeTransaction?.receipt);
			setActiveTransaction(undefined);
		},
	});

	return {
		isPriceLoading,
		isApproveQuoteLoading,
		isSwapLoading,
		swap,
		currentAllowance,
		approveQuote,
		tokenInBalance,
		tokenOutBalance,
		userBalance,
		price,
		size,
		handleSizeUpdate,
		toggleDirection,
		direction,
		rangedMarketPosition,
		setRangedMarketPosition,
	};
};

const useGetPricing = (
	rangedMarket: Address | undefined,
	abi: any,
	size: BigNumber,
	position: RangedMarketPosition,
	direction: TradeDirection,
	provider: Provider
) => {
	const [isPriceLoading, setPriceLoading] = useState(true);
	const [price, setPrice] = useState<BigNumber>(ZERO_BN);
	const [trades, setTrades] = useState<any>([]);
	const [slippage, setSlippage] = useState<BigNumber>(toBN(".05"));

	const getPricing = useCallback(async () => {
		setPriceLoading(true);

		if (rangedMarket && abi && position && provider) {
			const _contract: Contract = new ethers.Contract(rangedMarket, abi, provider);
			try {
				let _pricing: [BigNumber, Array<any>] = [ZERO_BN, []];
				if (position == RangedMarketPosition.IN) {
					_pricing = await _contract.getInPricing({
						amount: size,
						slippage: slippage,
						tradeDirection: direction,
						forceClose: false,
					});
				} else {
					_pricing = await _contract.getOutPricing({
						amount: size,
						slippage: slippage,
						tradeDirection: direction,
						forceClose: false,
					});
				}
				setPrice(_pricing[0]);

				setTrades(_pricing[1]);
				setPriceLoading(false);
			} catch (error) {
				// log error
				console.log({ error });
			}
		}
	}, [rangedMarket, abi, size, slippage, position, direction, provider]);

	useEffect(() => {
		if (rangedMarket && abi && position && provider) {
			getPricing();
		}
	}, [getPricing, rangedMarket, abi, size, position, direction, provider]);

	// @bug
	// no validation on the ranged market to make sure trades match set trades
	return { price, trades, isPriceLoading };
};
