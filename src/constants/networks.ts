export enum WalletType {
	MetaMask = "MetaMask",
	WalletConnect = "WalletConnect",
	CoinbaseWallet = "CoinbaseWallet",
	GnosisSafe = "GnosisSafe",
}

export type NetworkConfig = {
	name: string;
	shortName: string;
	chainId: number;
	walletRpcUrl: string;
	readRpcUrls: string[];
	blockExplorerUrl: string;
	iconUrls: string[];
};

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_ID;

export const arbitrumUrl = `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
export const optimismUrl = `https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
export const arbitrumGoerliUrl = `https://arbitrum-goerli.infura.io/v3/${INFURA_PROJECT_ID}`;
export const optimismGoerliUrl = `https://optimism-goerli.infura.io/v3/${INFURA_PROJECT_ID}`;

export enum Chain {
	Optimism,
	OptimismTest,
	Arbitrum,
	ArbitrumTest,
	Hardhat,
}

export const NETWORK_CONFIGS: Record<Chain, NetworkConfig> = {
	[Chain.Optimism]: {
		name: "Optimistic Ethereum",
		shortName: "Optimism",
		chainId: 10,
		walletRpcUrl: "https://mainnet.optimism.io",
		readRpcUrls: [`https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`],
		blockExplorerUrl: "https://optimistic.etherscan.io",
		iconUrls: [
			"https://optimism.io/images/metamask_icon.svg",
			"https://optimism.io/images/metamask_icon.png",
		],
	},
	[Chain.OptimismTest]: {
		name: "Optimistic Ethereum (Goerli)",
		shortName: "Optimistic Goerli",
		chainId: 420,
		walletRpcUrl: "https://goerli.optimism.io",
		readRpcUrls: [`https://optimism-goerli.infura.io/v3/${INFURA_PROJECT_ID}`],
		blockExplorerUrl: "https://goerli-optimism.etherscan.io/",
		iconUrls: [
			"https://optimism.io/images/metamask_icon.svg",
			"https://optimism.io/images/metamask_icon.png",
		],
	},
	[Chain.Arbitrum]: {
		name: "Arbitrum One",
		shortName: "Arbitrum",
		chainId: 42161,
		walletRpcUrl: "https://arb1.arbitrum.io/rpc",
		readRpcUrls: [`https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`],
		blockExplorerUrl: "https://arbiscan.io/",
		iconUrls: [
			"https://optimism.io/images/metamask_icon.svg",
			"https://optimism.io/images/metamask_icon.png",
		],
	},
	[Chain.ArbitrumTest]: {
		name: "Arbitrum Nitro Goerli Rollup Testnet",
		shortName: "Arbitrum Goerli",
		chainId: 421613,
		walletRpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
		readRpcUrls: [`https://arbitrum-goerli.infura.io/v3/${INFURA_PROJECT_ID}`],
		blockExplorerUrl: "https://goerli.arbiscan.io/",
		iconUrls: [
			"https://optimism.io/images/metamask_icon.svg",
			"https://optimism.io/images/metamask_icon.png",
		],
	},
	[Chain.Hardhat]: {
		name: "Hardhat",
		shortName: "Hardhat",
		chainId: 31337,
		walletRpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
		readRpcUrls: [`https://arbitrum-goerli.infura.io/v3/${INFURA_PROJECT_ID}`],
		blockExplorerUrl: "https://goerli.arbiscan.io/",
		iconUrls: [
			"https://optimism.io/images/metamask_icon.svg",
			"https://optimism.io/images/metamask_icon.png",
		],
	},
};
