import { Network } from "@lyrafinance/lyra-js";
import getNetworkConfig from "./getNetworkConfig";
import { Chain } from "../../constants/networks";

export const getChainIdForNetwork = (network: Network | "ethereum") => {
	if (network === "ethereum") {
		return 1;
	} else {
		switch (network) {
			case Network.Arbitrum:
				return getNetworkConfig(Chain.Arbitrum).chainId;
			case Network.Optimism:
				return getNetworkConfig(Chain.Optimism).chainId;
		}
	}
};
