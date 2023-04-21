import { useConnectModal } from "@rainbow-me/rainbowkit";

export const WalletConnect = () => {
	const { openConnectModal } = useConnectModal();

	return (
		<div
			onClick={openConnectModal}
			className="cursor-pointer  hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full bg-black"
		>
			Connect Wallet
		</div>
	);
};
