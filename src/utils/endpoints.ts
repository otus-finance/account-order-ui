import { Chain } from '@lyrafinance/lyra-js';
import { NETWORK_CONFIGS } from '../constants/networks';
import { OTUS_ACCOUNT_ENDPOINT_LOCALHOST, OTUS_ACCOUNT_ENDPOINT_OPTIMISM } from "../constants/endpoints";

export const getOtusEndpoint = (
  chainId: number | undefined
): string => {
  switch (chainId) {
    case NETWORK_CONFIGS[Chain.Optimism].chainId:
      return OTUS_ACCOUNT_ENDPOINT_OPTIMISM
    case NETWORK_CONFIGS[Chain.Arbitrum].chainId:
      return OTUS_ACCOUNT_ENDPOINT_LOCALHOST
    default:
      return OTUS_ACCOUNT_ENDPOINT_LOCALHOST;
  }
}
