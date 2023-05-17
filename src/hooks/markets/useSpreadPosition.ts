import { useState } from "react";
import { Chain, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { ContractInterface, SpreadPositionTransacation, Transaction } from "../../utils/types";
import getExplorerUrl from "../../utils/chains/getExplorerUrl";
import { createToast, updateToast } from "../../components/UI/Toast";
import { reportError } from "../../utils/errors";
import { BigNumberish } from "ethers";

// prepares and executes transaction for spread market
export const useSpreadPosition = (
	spreadOptionMarket: ContractInterface | undefined,
	chain: Chain | undefined,
	positionId: BigNumberish
) => {
	// transaction
	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const {
		config: settlePositionConfig,
		error: settlePositionConfigError,
		isSuccess: settlePositionConfigSuccess,
	} = usePrepareContractWrite({
		address: spreadOptionMarket?.address,
		abi: spreadOptionMarket?.abi,
		functionName: "settleOption",
		args: [positionId],
		chainId: chain?.id,
	});

	const {
		isSuccess: isSettlePositionSuccess,
		isLoading: isSettlePositionLoading,
		write: settle,
	} = useContractWrite({
		...settlePositionConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Closing spread option position`, txHref);
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
		settlePositionConfigSuccess,
		isSettlePositionSuccess,
		isSettlePositionLoading,
		settlePositionConfigError,
		isTxLoading,
		settle,
	} as SpreadPositionTransacation;
};
