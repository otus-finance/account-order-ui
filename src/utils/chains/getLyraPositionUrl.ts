import { Chain } from "wagmi";

const getNetworkNameForChainId = (chain: Chain): string => {
	switch (chain.id) {
		case 420:
		case 10:
			return "optimism";
		case 42161:
		case 421613:
			return "arbitrum";
		default:
			throw new Error("Chain ID is not supported by Lyra");
	}
};

const lyraUrl = `https://app.lyra.finance/#/position/`; // arbitrum/eth-usdc/187

export default function getLyraPositionUrl(chain: Chain, marketName: string, id: number): string {
	const networkName = getNetworkNameForChainId(chain);

	return `${lyraUrl}${networkName}/${marketName.toLowerCase()}/${id}`;
}
