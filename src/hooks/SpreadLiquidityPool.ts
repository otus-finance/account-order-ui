import { Provider } from "@wagmi/core";
import { Contract, ethers } from "ethers";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
	Address,
	erc20ABI,
	useAccount,
	useBalance,
	useContractWrite,
	useNetwork,
	usePrepareContractWrite,
	useProvider,
	useWaitForTransaction,
} from "wagmi";
import { HeroIcon, IconType } from "../components/UI/Icons/IconSVG";
import {
	createPendingToast,
	CreateToastOptions,
	ToastIcon,
	updatePendingToast,
	updateToast,
} from "../components/UI/Toast";
import { ZERO_ADDRESS, ZERO_BN } from "../constants/bn";
import { quote } from "../constants/quote";
import { useAccountWithOrders } from "../queries/otus/account";
import { useLiquidityPool } from "../queries/otus/liquidityPool";

import {
	SpreadLiquidityPoolProviderState,
	SpreadLiquidityPoolAction,
	spreadLiquidityPoolInitialState,
	spreadLiquidityPoolReducer,
} from "../reducers";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { formatUSD, fromBigNumber, toBN } from "../utils/formatters/numbers";
import { useOtusAccountContracts } from "./Contracts";

const DEFAULT_TOAST_TIMEOUT = 1000 * 5; // 5 seconds

export const useSpreadLiquidityPool = () => {
	const [state, dispatch] = useReducer(spreadLiquidityPoolReducer, spreadLiquidityPoolInitialState);

	const { liquidityPool, isLoading } = state;

	const { isLoading: isDataLoading, data, refetch } = useLiquidityPool();
	console.log({ data });
	const { chain } = useNetwork();

	useEffect(() => {
		if (chain) {
			refetch();
		}
	}, [refetch, chain]);

	const { address: owner } = useAccount();

	const provider = useProvider();

	const [tokenAddr, setTokenAddr] = useState<Address>();

	useEffect(() => {
		if (data) {
			const { liquidityPools } = data;

			if (!liquidityPools[0]) {
				dispatch({
					type: "SET_SPREAD_LIQUIDITY_POOL",
					liquidityPool: null,
					isLoading: false,
				});
				return;
			}
			dispatch({
				type: "SET_SPREAD_LIQUIDITY_POOL",
				liquidityPool: liquidityPools[0],
				isLoading: false,
			});
		}
	}, [data]);

	useEffect(() => {
		if (chain && chain.id) {
			const _quoteAddr = quote[chain.id];
			setTokenAddr(_quoteAddr);
		}
	}, [chain]);

	const otusContracts = useOtusAccountContracts();
	const spreadLiquidityPool =
		otusContracts && otusContracts["SpreadLiquidityPool"] && otusContracts["SpreadLiquidityPool"];

	const [userBalance, setUserBalance] = useState("");

	const _userBalance = useBalance({
		address: owner,
		token: chain && quote[chain.id],
		chainId: chain?.id,
		watch: true,
	});

	const poolAllowance = usePoolAllowance(
		tokenAddr,
		erc20ABI,
		owner,
		spreadLiquidityPool?.address,
		provider
	);

	useEffect(() => {
		if (_userBalance.data?.value) {
			setUserBalance(formatUSD(fromBigNumber(_userBalance.data?.value), { dps: 2 }));
		}
	}, [_userBalance]);

	// allowance
	const [allowanceAmount, setAllowanceAmount] = useState(0);

	const { config: allowanceConfig } = usePrepareContractWrite({
		address: spreadLiquidityPool?.address && allowanceAmount ? tokenAddr : undefined,
		abi: erc20ABI,
		functionName: "approve",
		args:
			spreadLiquidityPool?.address && allowanceAmount
				? [spreadLiquidityPool?.address, toBN(allowanceAmount.toString())]
				: [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
	});

	const {
		isSuccess,
		isLoading: isApproveQuoteLoading,
		write: approveQuote,
	} = useContractWrite({
		...allowanceConfig,
		onSettled: (data, error) => {},
		onSuccess: (data) => {},
	});

	// deposit
	const [depositAmount, setDepositAmount] = useState(0);

	let depositToastId = "";

	const { config: accountOrderDepositConfig } = usePrepareContractWrite({
		address: spreadLiquidityPool?.address,
		abi: spreadLiquidityPool?.abi,
		functionName: "initiateDeposit",
		args: [owner, toBN(depositAmount.toString())],
		chainId: chain?.id,
	});

	const {
		isSuccess: isDepositSuccess,
		isLoading: isDepositLoading,
		write: deposit,
		data: depositData,
	} = useContractWrite({
		...accountOrderDepositConfig,
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
			depositToastId = createPendingToast({
				description: `Confirm your deposit`,
				autoClose: false,
				icon: ToastIcon.Error,
			});
		},
	});

	const waitForDeposit = useWaitForTransaction({
		hash: depositData?.hash,
		onSuccess: (data) => {
			if (chain && data.blockHash) {
				const txHref = getExplorerUrl(chain?.id, data.blockHash);

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
			}
		},
		onError(err) {},
	});

	// withdraw
	const [withdrawAmount, setWithdrawAmount] = useState(0);

	const { config: accountOrderWithdrawConfig } = usePrepareContractWrite({
		address: spreadLiquidityPool?.address,
		abi: spreadLiquidityPool?.abi,
		functionName: "initiateWithdraw",
		args: [toBN(withdrawAmount.toString())],
		chainId: chain?.id,
	});

	const {
		isSuccess: isWithdrawSuccess,
		isLoading: isWithdrawLoading,
		write: withdraw,
	} = useContractWrite(accountOrderWithdrawConfig);

	return {
		liquidityPool,
		isLoading,
		isApproveQuoteLoading,
		isDepositLoading,
		isWithdrawLoading,
		userBalance,
		poolAllowance,
		depositAmount,
		withdrawAmount,
		allowanceAmount,
		setAllowanceAmount,
		setDepositAmount,
		setWithdrawAmount,
		approveQuote,
		deposit,
		withdraw,
	} as SpreadLiquidityPoolProviderState;
};

const usePoolAllowance = (
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
