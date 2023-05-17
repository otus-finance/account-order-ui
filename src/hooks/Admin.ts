import { useEffect, useReducer, useState } from "react";

import { AdminProviderState, AdminAction, adminInitialState, adminReducer } from "../reducers";

import {
	useAccount,
	useContractWrite,
	useNetwork,
	usePrepareContractWrite,
	useWaitForTransaction,
} from "wagmi";
import { useOtusAccountContracts } from "./Contracts";
import { toBN } from "../utils/formatters/numbers";
import getExplorerUrl from "../utils/chains/getExplorerUrl";
import { createToast, updateToast } from "../components/UI/Toast";
import { reportError } from "../utils/errors";
import { Transaction } from "../utils/types";
import { ethers } from "ethers";
import { useChainContext } from "../context/ChainContext";

export const useAdmin = () => {
	const [state, dispatch] = useReducer(adminReducer, adminInitialState);

	const { address: owner, isConnected } = useAccount();

	const { chain } = useNetwork();

	const { selectedChain } = useChainContext();

	const { isAdmin } = state;

	useEffect(() => {
		dispatch({
			type: "SET_IS_ADMIN",
			isAdmin: owner === "0xd8BfcBC64fE83635A8E01CA7650AD18bCaacF9aC",
		} as AdminAction);
	}, [owner, isConnected]);

	// transaction
	const [activeTransaction, setActiveTransaction] = useState<Transaction>();

	const { otusContracts, networkNotSupported } = useOtusAccountContracts();

	const otusFactory = otusContracts && otusContracts["OtusFactory"] && otusContracts["OtusFactory"];

	// otus factory new vault config
	const {
		config: newVaultConfig,
		isError,
		isLoading,
	} = usePrepareContractWrite({
		address: otusFactory?.address,
		abi: otusFactory?.abi,
		functionName: "newVault",
		args: [
			ethers.utils.formatBytes32String("Otus1xBTC"),
			"Otus 1x BTC Vault",
			"OTUSv1x1BTC",
			{
				decimals: 18,
				cap: toBN("25000"),
				asset: "0x041f37A8DcB578Cbe1dE7ed098fd0FE2B7A79056",
			},
		],
		chainId: chain?.id,
		enabled: !!otusFactory,
	});

	const {
		isSuccess: isNewVaultSuccess,
		isLoading: isNewVaultLoading,
		write: newVault,
	} = useContractWrite({
		...newVaultConfig,
		onSettled: (data, error) => {
			if (chain && data?.hash) {
				const txHref = getExplorerUrl(chain, data.hash);
				const toastId = createToast("info", `Create new vault`, txHref);
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
		isNewVaultSuccess,
		isNewVaultLoading,
		isTxLoading,
		isAdmin,
		newVault,
	} as AdminProviderState;
};
