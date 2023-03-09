import { useState, useEffect, useCallback } from 'react'
import { loadAppContracts } from './helpers/loadAppContracts'
import { Contract, ethers } from 'ethers'

type ContractConfig = {
  deployedContracts: {
    [key: string]: any
  }
}

export const useContractConfig = () => {
  const [contractsConfig, setContractsConfig] = useState<ContractConfig>()
  // const vaultProducts = useVaultProducts()
  // const data = vaultProducts?.data;

  useEffect(() => {

    const loadFunc = async () => {
      const result = await loadAppContracts();
      setContractsConfig(result)
    }
    void loadFunc();

  }, [])

  return contractsConfig
}

export const useAccountFactoryContract = () => {
  const contractsConfig = useContractConfig();

  const [contract, setContract] = useState<Contract>();

  const loadContracts = useCallback(async () => {
    const provider = new ethers.providers.JsonRpcProvider()
    const network = await provider.getNetwork();

    if (provider && network && contractsConfig) {
      const _contracts = contractsConfig.deployedContracts[network.chainId][0].contracts;
      const _contract = new ethers.Contract(_contracts['AccountFactory'].address, _contracts['AccountFactory'].abi)

      setContract(_contract);
    }

  }, [contractsConfig])

  useEffect(() => {
    if (contractsConfig && contract == null) {
      loadContracts();
    }
  }, [loadContracts, contract, contractsConfig])

  return contract;
}
