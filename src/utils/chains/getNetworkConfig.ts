import { NETWORK_CONFIGS, NetworkConfig, Chain } from "../../constants/networks";

const getNetworkConfig = (chain: Chain): NetworkConfig => {
	const networkConfig = NETWORK_CONFIGS[chain];
	return networkConfig;
};

export default getNetworkConfig;
