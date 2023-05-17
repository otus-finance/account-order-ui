import { Strikes } from "../../../Builder/Strikes";
import { Market } from "../../../Builder/Market";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { SelectBuilderExpiration } from "../../../Builder/Strategy/SelectExpiration";
import { VaultActivitySelect } from "../../../Builder";
import { LyraAccountContextProvider } from "../../../../context/LyraAccountContext";
import { ActivityType } from "../../../../utils/types";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import { VaultBalance } from "../Balance";
import { useRouter } from "next/router";
import { Address } from "wagmi";
import { AdminVaultOrderContextProvider } from "../../../../context/Admin/AdminVaultOrderContext";
import { VaultInfo } from "../Info";
import { VaultManage } from "../Manage";
import { VaultStrikeTrade } from "../Trade";
import { LyraPositions } from "../../../Builder/StrikeTrade/Postions/LyraPositions";
import { useLyraContext } from "../../../../context/LyraContext";

export const AdminBuilder = () => {
	const { lyra } = useLyraContext();

	const { strikes, activityType } = useBuilderContext();

	const router = useRouter();

	const vaultId = router.query.vault as Address;

	return (
		<div className="grid sm:grid-cols-2 grid-cols-2 gap-8">
			<div className="col-span-2 lg:col-span-1">
				<div className="px-4 sm:px-0 rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200">
					<div className="p-4 pb-0">
						<AdminVaultOrderContextProvider vaultId={vaultId}>
							<VaultInfo />
						</AdminVaultOrderContextProvider>
					</div>

					<div className="p-4">
						<Market />
					</div>

					<div className="p-4 border-y border-zinc-100 dark:border-zinc-800">
						<SelectBuilderExpiration />
					</div>

					<div>
						<Strikes />
					</div>
				</div>
			</div>

			<div className="col-span-2 lg:col-span-1">
				<div className="px-4 sm:px-0 rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200">
					<VaultActivitySelect />
					{lyra && vaultId && (
						<LyraAccountContextProvider address={vaultId as Address}>
							<VaultBalance />
						</LyraAccountContextProvider>
					)}

					{activityType === ActivityType.Trade && (
						<div>
							{strikes[0] ? (
								<>
									<AdminVaultOrderContextProvider vaultId={vaultId}>
										<>
											<VaultStrikeTrade />
										</>
									</AdminVaultOrderContextProvider>
								</>
							) : (
								<div className="p-4">
									<div className="flex items-center p-2">
										<p className="truncate font-sans text-xs font-normal dark:text-white">
											<ArrowLeftCircleIcon className="h-5 w-5 dark:text-white" aria-hidden="true" />
										</p>
										<div className="ml-2 flex flex-shrink-0">
											<p className="inline-flex font-mono text-sm font-normal leading-5 dark:text-white">
												Select Strikes
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{activityType === ActivityType.Position && (
						<LyraPositions lyra={lyra} address={vaultId as Address} />
					)}

					{activityType === ActivityType.Manage && <VaultManage />}
				</div>
			</div>
		</div>
	);
};
