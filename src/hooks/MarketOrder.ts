import { Provider } from "@wagmi/core";
import { Contract, ethers } from "ethers";
import { useCallback, useEffect, useReducer, useState } from "react";

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
} from "wagmi";
import { formatUSD, fromBigNumber, toBN } from "../utils/formatters/numbers";

import { quote } from "../constants/quote";

import { useOtusAccountContracts } from "./Contracts";
import { MarketOrderProviderState, marketOrderInitialState, marketOrderReducer } from "../reducers";
import { MAX_BN, ZERO_ADDRESS, ZERO_BN } from "../constants/bn";
import { createToast } from "../components/UI/Toast";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { Transaction } from "../utils/types";
export const useMarketOrder = () => {
	const [state, dispatch] = useReducer(marketOrderReducer, marketOrderInitialState);

	const { chain } = useNetwork();

	const { address: owner } = useAccount();

	const provider = useProvider();

	const [tokenAddr, setTokenAddr] = useState<Address>();

	useEffect(() => {
		if (chain && chain.id) {
			const _quoteAddr = quote[chain.id];
			setTokenAddr(_quoteAddr);
		}
	}, [chain]);

	const otusContracts = useOtusAccountContracts();
	const spreadOptionMarket =
		otusContracts && otusContracts["SpreadOptionMarket"] && otusContracts["SpreadOptionMarket"];

	const [userBalance, setUserBalance] = useState(ZERO_BN);

	const _userBalance = useBalance({
		address: owner,
		token: chain && quote[chain.id],
		chainId: chain?.id,
		watch: true,
	});

	const spreadMarketAllowance = useSpreadOptionMarketAllowance(
		tokenAddr,
		erc20ABI,
		owner,
		spreadOptionMarket?.address,
		provider
	);

	useEffect(() => {
		if (_userBalance.data?.value) {
			setUserBalance(_userBalance.data?.value);
		}
	}, [_userBalance]);

	// allowance
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
			if (data?.hash) {
				setActiveTransaction({ hash: data.hash });
			} else {
				// createToast();
			}
		},
		onSuccess: (data) => {},
		onError: (error) => {
			console.log(error);
		},
		onMutate: () => {},
	});
	// open position
	const [tradeInfo, setTradeInfo] = useState(0);
	const [trades, setTrades] = useState(0);
	const [maxLossPosted, setMaxLossPosted] = useState(0);

	let openPositionToastId = "";

	const { config: openPositionConfig } = usePrepareContractWrite({
		address: spreadOptionMarket?.address,
		abi: spreadOptionMarket?.abi,
		functionName: "openPosition",
		args: [tradeInfo, trades, maxLossPosted],
		chainId: chain?.id,
	});

	const {
		isSuccess: isOpenPositionSuccess,
		isLoading: isOpenPositionLoading,
		write: openPosition,
		data: openPositionData,
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
			// openPositionToastId = createPendingToast({
			// 	description: `Confirm your deposit`,
			// 	autoClose: false,
			// 	icon: ToastIcon.Error,
			// });
		},
	});

	// close position

	const [market, setMarket] = useState(0);
	const [spreadPositionId, setSpreadPositionId] = useState(0);
	const [isPartialClose, setPartialClose] = useState(false);

	let closePositionToastId = "";

	const { config: closePositionConfig } = usePrepareContractWrite({
		address: spreadOptionMarket?.address,
		abi: spreadOptionMarket?.abi,
		functionName: "openPosition",
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

	const currentTransaction = useWaitForTransaction({
		hash: activeTransaction?.hash,
		onSuccess: (data) => {
			if (chain && data.blockHash) {
				console.log({ chain, data });
				const txHref = getExplorerUrl(chain, data.blockHash);

				console.log({ txHref });

				// createToast();
				// const args: CreateToastOptions = {
				//   variant: 'success',
				//   description: `Your tx was successful`,
				//   href: txHref,
				//   autoClose: DEFAULT_TOAST_TIMEOUT,
				//   // icon: HeroIcon(IconType.CheckIcon),
				// }
				// updatePendingToast(depositToastId, {
				//   description: `Your deposit is pending, click to view on etherscan`,
				//   href: txHref,
				//   autoClose: false,
				// })
				// updateToast(depositToastId, args)
				setActiveTransaction(undefined);
			}
		},
		onError(err) {
			setActiveTransaction(undefined);
		},
	});

	return {
		userBalance,
		isApproveQuoteLoading,
		isOpenPositionLoading,
		isClosePositionLoading,
		spreadMarketAllowance,
		allowanceAmount,
		setAllowanceAmount,
		approveQuote,
		openPosition,
		closePosition,
	} as MarketOrderProviderState;
};

const useSpreadOptionMarketAllowance = (
	tokenAddr: Address | undefined,
	abi: any,
	owner: Address | undefined,
	liquidityPool: Address | undefined,
	provider: Provider
) => {
	const [accountAllowance, setAccountAllowance] = useState<number>(0);

	const getAllowance = useCallback(async () => {
		if (tokenAddr && abi && owner && liquidityPool && provider) {
			const _contract: Contract = new ethers.Contract(tokenAddr, abi, provider);
			try {
				let _allowance = await _contract.allowance(owner, liquidityPool);
				setAccountAllowance(fromBigNumber(_allowance));
			} catch (error) {
				// log error
			}
		}
	}, [tokenAddr, abi, owner, liquidityPool, provider]);

	useEffect(() => {
		if (tokenAddr && abi && owner && liquidityPool && provider) {
			getAllowance();
		}
	}, [getAllowance, tokenAddr, abi, owner, liquidityPool, provider]);

	return accountAllowance;
};
