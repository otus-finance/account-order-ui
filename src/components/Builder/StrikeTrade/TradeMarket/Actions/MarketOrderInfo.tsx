import { useAccount, useNetwork } from "wagmi";
import { useBuilderContext } from "../../../../../context/BuilderContext";
import { WalletConnect } from "../../Common/WalletConnect";
import { MarketTransaction } from "./MarketTransaction";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";

export const MarketOrderInfo = () => {
	const { selectedChain } = useBuilderContext();

	const { isConnected } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { openChainModal } = useChainModal();
	const { chain } = useNetwork();

	return (
		<div className="py-4 cursor-pointer">
			{isConnected && chain?.id != selectedChain?.id ? (
				<div
					onClick={openChainModal}
					className="cursor-pointer  hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full bg-black hover:bg-zinc-800 mb-2"
				>
					Wrong network
				</div>
			) : (
				isConnected && <MarketTransaction />
			)}

			{!isConnected && openConnectModal && <WalletConnect />}
		</div>
	);
};
