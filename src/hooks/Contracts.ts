import { useState, useEffect, useCallback } from "react";
import { loadAppContracts } from "./helpers/loadAppContracts";
import { Contract, ethers } from "ethers";
import { Address, useNetwork } from "wagmi";

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

type ContractInterface = {
	address: `0x${string}` | undefined;
	abi: any;
};

const LOCAL_CHAIN_ID = 31337;

export const useOtusAccountContracts = () => {
	const contractsConfig = useContractConfig();
	const { chain } = useNetwork();
	const [otusContracts, setOtusContracts] = useState<Record<string, ContractInterface>>();

	useEffect(() => {
		if (contractsConfig) {
			chain && contractsConfig.deployedContracts[chain.id];
			const chainId = chain ? chain.id : LOCAL_CHAIN_ID;
			const contracts = contractsConfig.deployedContracts[chainId];
			console.log({ contracts, chain });
			if (contracts) {
				const _contracts = contracts[0].contracts;
				setOtusContracts(_contracts);
			}
		}
	}, [contractsConfig, chain]);

	return otusContracts;
};
