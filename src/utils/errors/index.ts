import { Chain } from "wagmi";
import { TransactionReceipt } from "@ethersproject/providers";
import { closeToast, createToast, updateToast } from "../../components/UI/Toast";
import logError from "../log";
import getExplorerUrl from "../chains/getExplorerUrl";
import { Id } from "react-toastify";

export const reportError = (
	chain: Chain | undefined,
	error: any,
	toastId: Id | undefined,
	skipToast?: boolean,
	transactionReceipt?: TransactionReceipt | null
) => {
	if (error?.code === 4001) {
		// user rejected the transaction
		if (toastId) {
			closeToast(toastId);
		}
		return null;
	}

	// Remove parentheses from error message
	const rawMessage = error?.data?.message ?? error?.message;
	let message = rawMessage ? rawMessage.replace(/ *\([^)]*\) */g, "") : "Something went wrong";

	if (transactionReceipt?.transactionHash) {
		message += ". Click to view failed transaction.";
	}
	// Uppercase first letter
	message = message.charAt(0).toUpperCase() + message.slice(1);

	// Log error to Sentry
	logError(message, { error, transactionReceipt, chain });

	if (toastId) {
		updateToast("error", toastId, message);
	} else if (!skipToast) {
		// createToast({ ...args, autoClose: false });
		createToast(
			"error",
			message,
			transactionReceipt && chain
				? getExplorerUrl(chain, transactionReceipt.transactionHash)
				: undefined
		);
	}
};
