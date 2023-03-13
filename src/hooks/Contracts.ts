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
  // const vaultProducts = useVaultProducts()
  // const data = vaultProducts?.data;

  useEffect(() => {
    const loadFunc = async () => {
      const result = await loadAppContracts();
      setContractsConfig(result);
    };
    void loadFunc();
  }, []);

  return contractsConfig;
};

export const useOtusAccountContracts = () => {
  const contractsConfig = useContractConfig();

  const { chain } = useNetwork();

  const [otusContracts, setOtusContracts] =
    useState<Record<string, Contract>>();

  useEffect(() => {
    if (contractsConfig && chain) {
      const _contracts =
        contractsConfig.deployedContracts[chain.id][0].contracts;
      setOtusContracts(_contracts);
    }
  }, [contractsConfig, chain]);

  return otusContracts;
};

export const useAccountFactoryContract = () => {
  const contractsConfig = useContractConfig();
  const [accountFactoryContract, setAccountFactoryContract] = useState<
    [Address | undefined, any]
  >([undefined, undefined]);

  const { chain } = useNetwork();

  const loadContracts = useCallback(async () => {
    if (contractsConfig && chain) {
      const _contracts =
        contractsConfig.deployedContracts[chain.id][0].contracts;
      setAccountFactoryContract([
        _contracts["AccountFactory"].address,
        _contracts["AccountFactory"].abi,
      ]);
    }
  }, [contractsConfig, chain]);

  useEffect(() => {
    if (contractsConfig && chain) {
      loadContracts();
    }
  }, [loadContracts, contractsConfig, chain]);

  return accountFactoryContract;
};
