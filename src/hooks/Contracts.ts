import { useState, useEffect, useCallback } from "react";
import { loadAppContracts } from "./helpers/loadAppContracts";
import { Contract, ethers } from "ethers";
import { Address, useNetwork } from "wagmi";
import { ContractInterface } from "../utils/types";

type ContractConfig = {
	deployedContracts: {
		[key: string]: any;
	};
};

export const useContractConfig = () => {
	const [contractsConfig, setContractsConfig] = useState<ContractConfig>();

	useEffect(() => {
		const loadFunc = async () => {
			const result = await loadAppContracts();
			setContractsConfig(result);
		};
		void loadFunc();
	}, []);

	return contractsConfig;
};

const LOCAL_CHAIN_ID = 31337;

export const useOtusAccountContracts = () => {
	const contractsConfig = useContractConfig();
	const { chain } = useNetwork();
	const [otusContracts, setOtusContracts] = useState<Record<string, ContractInterface>>();
	const [networkNotSupported, setNetworkNotSupported] = useState(false);

	useEffect(() => {
		if (contractsConfig) {
			chain && contractsConfig.deployedContracts[chain.id];
			const chainId = chain ? chain.id : LOCAL_CHAIN_ID;
			console.log({ chainId });
			const contracts = contractsConfig.deployedContracts[chainId];
			console.log({ contracts });
			if (contracts) {
				const _contracts = contracts[0].contracts;
				setOtusContracts(_contracts);
				setNetworkNotSupported(false);
			} else {
				console.log("what the why");
				setNetworkNotSupported(true);
			}
		}
	}, [contractsConfig, chain]);

	return { otusContracts, networkNotSupported };
};
