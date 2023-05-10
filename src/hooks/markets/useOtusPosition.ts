import { useState } from "react";
import { Chain, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { ContractInterface, PositionTransaction, Transaction } from "../../utils/types";
import getExplorerUrl from "../../utils/chains/getExplorerUrl";
import { createToast, updateToast } from "../../components/UI/Toast";
import { reportError } from "../../utils/errors";
import { BigNumberish } from "ethers";

// prepares and executes transaction for otus market
export const useOtusPosition = (
	otusOptionMarket: ContractInterface | undefined,
	chain: Chain | undefined,
	positionId: BigNumberish
) => {
	// transaction
	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const {
		config: burnPositionConfig,
		error: burnPositionConfigError,
		isSuccess: burnPositionConfigSuccess,
	} = usePrepareContractWrite({
		address: otusOptionMarket?.address,
		abi: otusOptionMarket?.abi,
		functionName: "burnAndTransfer",
		args: [positionId],
		chainId: chain?.id,
		onError: (err: any) => {
			// ethers.utils.decode
			console.log("prepare error", err);
		},
	});

	const {
		isSuccess: isBurnPositionSuccess,
		isLoading: isBurnPositionLoading,
		write: burn,
	} = useContractWrite({
		...burnPositionConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Burn Otus Position`, txHref);
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
		burnPositionConfigSuccess,
		burnPositionConfigError,
		isBurnPositionSuccess,
		isBurnPositionLoading,
		isTxLoading,
		burn,
	} as PositionTransaction;
};
