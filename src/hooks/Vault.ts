import { Provider } from "@wagmi/core";
import {
	useNetwork,
	useAccount,
	useContractWrite,
	usePrepareContractWrite,
	erc20ABI,
	Address,
	useProvider,
	useBalance,
	useContractRead,
} from "wagmi";
import { VaultProviderState } from "../reducers";
import { useVaultById } from "../queries/otus/vaults";
import { useCallback, useEffect, useState } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { ZERO_ADDRESS, ZERO_BN } from "../constants/bn";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { createToast } from "../components/UI/Toast";
import { reportError } from "../utils/errors";
import { Transaction } from "../utils/types";
import { useOtusAccountContracts } from "./Contracts";
import { fromBigNumber } from "../utils/formatters/numbers";
import { quote } from "../constants/quote";
import { useChainContext } from "../context/ChainContext";

export const useVault = (vaultId: Address) => {
	const { selectedChain: chain } = useChainContext();

	const { address: owner } = useAccount();

	const provider = useProvider();

	const [tokenAddr, setTokenAddr] = useState<Address>();

	// get vaults
	const { isLoading: isVaultLoading, data: vault } = useVaultById(chain, vaultId);

	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const { otusContracts, networkNotSupported } = useOtusAccountContracts();

	const otusVault = otusContracts && otusContracts["OtusVault"] && otusContracts["OtusVault"];

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
	const [lpSymbol, setLpSymbol] = useState<string>();

	const _lpBalance = useBalance({
		address: owner,
		token: vaultId,
		chainId: chain?.id,
		watch: true,
	});

	const { data: shareBalance, refetch: refetchShareBalances } = useContractRead({
		address: vaultId,
		abi: otusVault?.abi,
		functionName: "shareBalances",
		args: [owner],
		chainId: chain?.id,
		watch: true,
	});

	useEffect(() => {
		if (_lpBalance.data?.value) {
			setLpBalance(_lpBalance.data?.value);
		}
		if (_lpBalance.data?.symbol) {
			setLpSymbol(_lpBalance.data?.symbol);
		}
	}, [_lpBalance, shareBalance]);

	// Get Current Pool sUSD Allowance
	const { poolAllowance, refetchPoolAllowance } = usePoolAllowance(
		tokenAddr,
		erc20ABI,
		owner,
		vaultId,
		provider
	);
	// deposit
	const [depositAmount, setDepositAmount] = useState<BigNumber>(ZERO_BN);

	const { config: approveConfig } = usePrepareContractWrite({
		address: tokenAddr,
		abi: erc20ABI,
		functionName: "approve",
		args: vaultId && depositAmount ? [vaultId, depositAmount] : [ZERO_ADDRESS, ZERO_BN],
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
		address: vaultId,
		abi: otusVault?.abi,
		functionName: "deposit",
		args: [depositAmount],
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

	return {
		isVaultLoading,
		vault,
		lpSymbol,
		lpBalance,
		decimals,
		userBalance,
		poolAllowance,
		depositAmount,
		deposit,
		setDepositAmount,
		approveQuote,
	} as VaultProviderState;
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
