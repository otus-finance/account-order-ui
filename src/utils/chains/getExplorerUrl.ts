import { Network } from "@lyrafinance/lyra-js";
import { Chain } from "../../constants/networks";

import getChainForChainId from "./getChainForChainId";
import getNetworkConfig from "./getNetworkConfig";

export default function getExplorerUrl(chain: Chain, transactionHashOrAddress: string): string {
	const networkConfig = getNetworkConfig(getChainForChainId(chain));
	const explorerUrl = networkConfig.blockExplorerUrl;
	const type = transactionHashOrAddress.length > 42 ? "tx" : "address";
	return `${explorerUrl}/${type}/${transactionHashOrAddress}`;
}
