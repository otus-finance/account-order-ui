import { Chain } from '@lyrafinance/lyra-js';
import { NETWORK_CONFIGS } from '../constants/networks';
import { OTUS_ACCOUNT_ENDPOINT_LOCALHOST, OTUS_ACCOUNT_ENDPOINT_TESTNET } from "../constants/endpoints";

export const getOtusEndpoint = (
  chainId: number | undefined
): string => {

  if (process.env.NODE_ENV === 'development') {
    return OTUS_ACCOUNT_ENDPOINT_LOCALHOST;
  }

  const _endpoint = chainId === NETWORK_CONFIGS[Chain.Optimism].chainId
    ? OTUS_ACCOUNT_ENDPOINT_TESTNET
    : chainId === NETWORK_CONFIGS[Chain.Arbitrum].chainId
      ? OTUS_ACCOUNT_ENDPOINT_TESTNET
      : OTUS_ACCOUNT_ENDPOINT_TESTNET

  return _endpoint;
}
