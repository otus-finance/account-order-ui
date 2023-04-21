import { Chain } from "wagmi";

export default function getExplorerUrl(chain: Chain, transactionHashOrAddress: string): string {
	const type = transactionHashOrAddress.length > 42 ? "tx" : "address";
	return `${
		chain.blockExplorers?.default.url || "https://optimistic.etherscan.io/"
	}${type}/${transactionHashOrAddress}`;
}
