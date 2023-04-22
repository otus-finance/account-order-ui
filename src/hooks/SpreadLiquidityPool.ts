import { Provider } from "@wagmi/core";
import { BigNumber, Contract, ethers } from "ethers";
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
import { createToast, updateToast } from "../components/UI/Toast";
import { ZERO_ADDRESS, ZERO_BN } from "../constants/bn";
import { quote } from "../constants/quote";
import { useLiquidityPool } from "../queries/otus/liquidityPool";

import {
	SpreadLiquidityPoolProviderState,
	spreadLiquidityPoolInitialState,
	spreadLiquidityPoolReducer,
} from "../reducers";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { fromBigNumber } from "../utils/formatters/numbers";
import { useOtusAccountContracts } from "./Contracts";
import { Transaction } from "../utils/types";
import { reportError } from "../utils/errors";

export const useSpreadLiquidityPool = () => {
	const [state, dispatch] = useReducer(spreadLiquidityPoolReducer, spreadLiquidityPoolInitialState);

	const { liquidityPool, isLoading } = state;

	const { isLoading: isDataLoading, data: liquidityPoolData, refetch } = useLiquidityPool();

	const { otusContracts, networkNotSupported } = useOtusAccountContracts();

	const spreadLiquidityPool =
		otusContracts && otusContracts["SpreadLiquidityPool"] && otusContracts["SpreadLiquidityPool"];

	const { chain } = useNetwork();

	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	useEffect(() => {
		if (chain) {
			refetch();
		}
	}, [refetch, chain]);

	const { address: owner } = useAccount();

	const provider = useProvider();

	const [tokenAddr, setTokenAddr] = useState<Address>();

	useEffect(() => {
		if (liquidityPoolData) {
			if (!liquidityPoolData) {
				dispatch({
					type: "SET_SPREAD_LIQUIDITY_POOL",
					liquidityPool: null,
					isLoading: false,
				});
				return;
			}
			dispatch({
				type: "SET_SPREAD_LIQUIDITY_POOL",
				liquidityPool: liquidityPoolData,
				isLoading: false,
			});
		}
	}, [liquidityPoolData]);

	useEffect(() => {
		if (chain && chain.id) {
			const _quoteAddr = quote[chain.id];
			setTokenAddr(_quoteAddr);
		}
	}, [chain]);

	// Set Quote Decimals
	const [decimals, setDecimals] = useState(18);

	// Get User Balance
	const [userBalance, setUserBalance] = useState(0);

	const _userBalance = useBalance({
		address: owner,
		token: chain && quote[chain.id],
		chainId: chain?.id,
		watch: true,
	});

	useEffect(() => {
		if (_userBalance.data?.value) {
			setUserBalance(fromBigNumber(_userBalance.data.value, _userBalance.data.decimals));
			setDecimals(_userBalance.data.decimals);
		}
	}, [_userBalance]);

	// Get User LP Balance
	const [lpBalance, setLpBalance] = useState(ZERO_BN);

	const _lpBalance = useBalance({
		address: owner,
		token: spreadLiquidityPool?.address,
		chainId: chain?.id,
		watch: true,
	});

	useEffect(() => {
		if (_lpBalance.data?.value) {
			setLpBalance(_lpBalance.data?.value);
		}
	}, [_lpBalance]);

	// Get Current Pool sUSD Allowance
	const { poolAllowance, refetchPoolAllowance } = usePoolAllowance(
		tokenAddr,
		erc20ABI,
		owner,
		spreadLiquidityPool?.address,
		provider
	);

	// deposit
	const [depositAmount, setDepositAmount] = useState<BigNumber>(ZERO_BN);

	const { config: approveConfig } = usePrepareContractWrite({
		address: tokenAddr,
		abi: erc20ABI,
		functionName: "approve",
		args:
			spreadLiquidityPool?.address && depositAmount
				? [spreadLiquidityPool?.address, depositAmount]
				: [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
	});

	const { isLoading: isApproveQuoteLoading, write: approveQuote } = useContractWrite({
		...approveConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", "Approving liquidity pool", txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
		onSuccess: async (data) => {
			await refetchPoolAllowance();
		},
	});

	const { config: liquidityPoolDepositConfig } = usePrepareContractWrite({
		address: spreadLiquidityPool?.address,
		abi: spreadLiquidityPool?.abi,
		functionName: "initiateDeposit",
		args: [owner, depositAmount],
		chainId: chain?.id,
	});

	const { isLoading: isDepositLoading, write: deposit } = useContractWrite({
		...liquidityPoolDepositConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", "Confirm your deposit", txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
	});

	// withdraw
	const [withdrawAmount, setWithdrawAmount] = useState<BigNumber>(ZERO_BN);

	const { config: accountOrderWithdrawConfig } = usePrepareContractWrite({
		address: spreadLiquidityPool?.address,
		abi: spreadLiquidityPool?.abi,
		functionName: "initiateWithdraw",
		args: owner && withdrawAmount ? [owner, withdrawAmount] : [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
	});

	const { isLoading: isWithdrawLoading, write: withdraw } = useContractWrite(
		accountOrderWithdrawConfig
	);

	const { isLoading: isTxLoading } = useWaitForTransaction({
		hash: activeTransaction?.hash,
		onSuccess: (data) => {
			if (chain && data.transactionHash) {
				if (activeTransaction?.toastId) {
					const txHref = getExplorerUrl(chain, data.transactionHash);
					updateToast("success", activeTransaction?.toastId, "Success", txHref);
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
		decimals,
		liquidityPool,
		isLoading,
		isTxLoading,
		isApproveQuoteLoading,
		isDepositLoading,
		isWithdrawLoading,
		userBalance,
		poolAllowance,
		depositAmount,
		withdrawAmount,
		lpBalance,
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
	const [poolAllowance, setPoolAllowance] = useState<BigNumber>(ZERO_BN);

	const getAllowance = useCallback(async () => {
		if (tokenAddr && abi && owner && liquidityPool && provider) {
			const _contract: Contract = new ethers.Contract(tokenAddr, abi, provider);
			try {
				let _allowance = await _contract.allowance(owner, liquidityPool);
				setPoolAllowance(_allowance);
			} catch (error) {}
		}
	}, [tokenAddr, abi, owner, liquidityPool, provider]);

	useEffect(() => {
		if (tokenAddr && abi && owner && liquidityPool && provider) {
			getAllowance();
		}
	}, [getAllowance, tokenAddr, abi, owner, liquidityPool, provider]);

	return { poolAllowance, refetchPoolAllowance: getAllowance };
};
