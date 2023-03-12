import { Network } from '@lyrafinance/lyra-js'

import getChainForChainId from './getChainForChainId'
import { getChainIdForNetwork } from './getChainIdForNetwork'
import getNetworkConfig from './getNetworkConfig'

export default function getExplorerUrl(chainId: number, transactionHashOrAddress: string): string {
  const networkConfig = getNetworkConfig(getChainForChainId(chainId));
  const explorerUrl = networkConfig.blockExplorerUrl
  const type = transactionHashOrAddress.length > 42 ? 'tx' : 'address'
  return `${explorerUrl}/${type}/${transactionHashOrAddress}`
}