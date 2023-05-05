import { useEffect, useState } from "react";
import {
	Address,
	Chain,
	erc20ABI,
	useContractRead,
	useContractWrite,
	usePrepareContractWrite,
	useWaitForTransaction,
} from "wagmi";
import {
	ContractInterface,
	MarketOrderTransaction,
	TradeInputParameters,
	Transaction,
} from "../../utils/types";
import { MAX_BN, ZERO_ADDRESS, ZERO_BN } from "../../constants/bn";
import getExplorerUrl from "../../utils/chains/getExplorerUrl";
import { createToast, updateToast } from "../../components/UI/Toast";
import { reportError } from "../../utils/errors";
import { BigNumber } from "ethers";
import { isLong } from "../../utils/formatters/optiontypes";

// prepares and executes transaction for otus market
export const useOtusMarket = (
	otusOptionMarket: ContractInterface | undefined,
	tokenAddr: Address | undefined,
	owner: Address | undefined,
	chain: Chain | undefined,
	spreadSelected: boolean,
	tradeInfo: { market?: string; positionId?: number },
	trades: TradeInputParameters[]
) => {
	// option market allowance
	const [allowance, setOtusOptionMarketCurrentAllowance] = useState(ZERO_BN);
	// allowance to approve
	const [allowanceAmount, setAllowanceAmount] = useState(MAX_BN);
	// transaction
	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const { data, refetch: refetchAllowance } = useContractRead({
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
		if (data) {
			setOtusOptionMarketCurrentAllowance(data);
		}
	}, [data]);

	const { config: allowanceConfig } = usePrepareContractWrite({
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
		isSuccess: isApproveSuccess,
		isLoading: isApproveLoading,
		write: approve,
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
			await refetchOpenConfig();
		},
	});

	// open lyra position
	const {
		config: openPositionConfig,
		isSuccess: isOpenConfigSuccess,
		error: openConfigError,
		refetch: refetchOpenConfig,
	} = usePrepareContractWrite({
		address: otusOptionMarket?.address,
		abi: otusOptionMarket?.abi,
		functionName: "openPosition",
		args: [
			tradeInfo,
			trades.filter((t: TradeInputParameters) => (!isLong(t.optionType as number) ? true : false)),
			trades.filter((t: TradeInputParameters) => (isLong(t.optionType as number) ? true : false)),
		],
		chainId: chain?.id,
		enabled: !spreadSelected && trades.length > 0,
	});

	const {
		isSuccess: isOpenPositionSuccess,
		isLoading: isOpenPositionLoading,
		write: open,
	} = useContractWrite({
		...openPositionConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Opening position lyra option market`, txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
	});

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
			reportError(chain, err, activeTransaction?.toastId, false, activeTransaction?.receipt);
			setActiveTransaction(undefined);
		},
	});

	return {
		allowance,
		isApproveSuccess,
		isApproveLoading,
		isOpenConfigSuccess,
		openConfigError,
		isOpenPositionSuccess,
		isOpenPositionLoading,
		isTxLoading,
		approve,
		open,
	} as MarketOrderTransaction;
};
