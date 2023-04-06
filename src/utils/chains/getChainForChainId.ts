import { Chain } from "../../constants/networks";

const getChainForChainId = (chain: number): Chain => {
	switch (chain) {
		case 420:
			return Chain.OptimismTest;
		case 42161:
			return Chain.Arbitrum;
		case 421613:
			return Chain.ArbitrumTest;
		case 10:
			return Chain.Optimism;
		case 31337:
			return Chain.Hardhat;
		default:
			throw new Error("Chain ID is not supported by Lyra");
	}
};

export default getChainForChainId;
