import { useRouter } from "next/router";
import { useAdminVaultOrderContext } from "../../../../context/Admin/AdminVaultOrderContext";
import { fromBigNumber } from "../../../../utils/formatters/numbers";
import { OtusVault } from "../../../../queries/otus/vaults";
import { ethers } from "ethers";
import { Button } from "../../../UI/Components/Button";

export const VaultInfo = () => {
	const { vault, isVaultLoading, startNextRound } = useAdminVaultOrderContext();

	const router = useRouter();

	return (
		<>
			<div className="flex bg-zinc-900 dark:bg-black sm:justify-between shadow-zinc-200 rounded-lg p-1">
				{vault && (
					<>
						<div className="text-md font-sans p-2 font-normal text-white">
							{vault.name && ethers.utils.parseBytes32String(vault.name)}
						</div>
						<div className="text-md font-sans p-2 font-normal text-white">
							{vault.round ? `Round ${vault.round}` : "Round 0"}
						</div>
						<div className="text-md font-sans p-2 font-normal text-white">
							{vault.lockedBalance
								? `Locked Amount ${fromBigNumber(vault.lockedBalance)}`
								: "Locked Amount 0"}
						</div>
					</>
				)}
			</div>
			<div className="mt-4 flex sm:justify-between rounded-lg p-1">
				<Button
					isDisabled={false}
					label={"Start Next Round"}
					isLoading={false}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => startNextRound?.()}
				/>
			</div>
		</>
	);
};
