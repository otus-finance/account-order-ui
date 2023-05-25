import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "../../../UI/Components/Button";

export const WalletConnect = () => {
	const { openConnectModal } = useConnectModal();

	return (
		<Button
			isDisabled={false}
			label={"Connect Wallet"}
			isLoading={false}
			variant={"primary"}
			radius={"full"}
			size={"full"}
			onClick={openConnectModal}
		/>
	);
};
