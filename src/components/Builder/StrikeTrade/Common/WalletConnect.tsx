import { useConnectModal } from "@rainbow-me/rainbowkit";

export const WalletConnect = () => {
	const { openConnectModal } = useConnectModal();

	return (
		<div
			onClick={openConnectModal}
			className="cursor-pointer dark:bg-gradient-to-b from-black to-zinc-900 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm dark:text-white text-center rounded-full dark:bg-black"
		>
			Connect Wallet
		</div>
	);
};
