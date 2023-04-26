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

// prepares and executes transaction for spread market
export const useSpreadMarket = (
	spreadOptionMarket: ContractInterface | undefined,
	tokenAddr: Address | undefined,
	owner: Address | undefined,
	chain: Chain | undefined,
	spreadSelected: boolean,
	tradeInfo: { market?: string; positionId?: number },
	trades: TradeInputParameters[],
	maxLossPost: BigNumber
) => {
	// spread market allowance
	const [allowance, setSpreadMarketCurrentAllowance] = useState(ZERO_BN);
	// allowance to approve
	const [allowanceAmount, setAllowanceAmount] = useState(MAX_BN);
	// transaction
	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const { data, refetch: refetchAllowance } = useContractRead({
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
		if (data) {
			setSpreadMarketCurrentAllowance(data);
		}
	}, [data]);

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
		},
	});

	const {
		config: openPositionConfig,
		error: openConfigError,
		isSuccess: isOpenConfigSuccess,
	} = usePrepareContractWrite({
		address: spreadOptionMarket?.address,
		abi: spreadOptionMarket?.abi,
		functionName: "openPosition",
		args: [tradeInfo, trades, maxLossPost],
		chainId: chain?.id,
		enabled: spreadSelected,
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
				const toastId = createToast("info", `Opening position spread option market`, txHref);
				setActiveTransaction({ hash: data.hash, toastId: toastId });
			} else {
				reportError(chain, error, undefined, false);
			}
		},
	});

	// const { config: closePositionConfig, error: closeError } = usePrepareContractWrite({
	//   address: spreadOptionMarket?.address,
	//   abi: spreadOptionMarket?.abi,
	//   functionName: "closePosition",
	//   args: [tradeInfo.market, tradeInfo.positionId, []],
	//   chainId: chain?.id,
	// });

	// const {
	//   isSuccess: isClosePositionSuccess,
	//   isLoading: isClosePositionLoading,
	//   write: closePosition,
	//   data: closePositionData,
	// } = useContractWrite({
	//   ...closePositionConfig,
	//   onSettled: (data, error) => {
	//     if (chain && data?.hash) {
	//       const txHref = getExplorerUrl(chain, data.hash);
	//       const toastId = createToast("info", `Closing spread option position`, txHref);
	//       setActiveTransaction({ hash: data.hash, toastId: toastId });
	//     } else {
	//       reportError(chain, error, undefined, false);
	//     }
	//   },
	//   onSuccess: async (data) => {
	//     await refetchAllowance();
	//   },
	// });

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
