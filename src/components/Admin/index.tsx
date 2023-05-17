import { useTheme } from "next-themes";
import { useAdminContext } from "../../context/Admin/AdminContext";
import LogoIcon from "../UI/Icons/Logo/OTUS";
import Modal from "../UI/Modal";
import { useState } from "react";
import { Spinner } from "../UI/Components/Spinner";
import { Address, useNetwork } from "wagmi";
import { useRouter } from "next/router";
import { NotAdmin } from "./NotAdmin";
import { OtusVault, useVaults } from "../../queries/otus/vaults";
import { Button } from "../UI/Components/Button";
import { useChainContext } from "../../context/ChainContext";
import ETHIcon from "../UI/Icons/Color/ETH";
import { ethers } from "ethers";

export const Admin = () => {
	const { isAdmin } = useAdminContext();

	return <div className="">{isAdmin ? <AdminView /> : <NotAdmin />}</div>;
};

const AdminView = () => {
	const router = useRouter();

	const handleNavigate = (id: Address) => {
		router.push(`/admin/${id}`);
	};

	const { selectedChain: chain } = useChainContext();

	const { theme } = useTheme();
	const [open, setOpen] = useState(false);
	const { data: otusVaultData } = useVaults(chain);

	return (
		<div className="rounded-lg bg-white dark:bg-zinc-900 shadow-md dark:shadow-black shadow-zinc-200">
			<div className="flex items-center p-4 border-b border-zinc-100 dark:border-zinc-800">
				<div className="inline-block rounded-full dark:shadow-black shadow-zinc-200 mr-4">
					<LogoIcon />
				</div>

				<div className="flex-auto">
					<h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-white">
						Option Vaults
					</h1>
					<p className="text-xs text-zinc-700 dark:text-zinc-300">Manage a new Options Vault</p>
				</div>

				<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
					<Button
						isDisabled={false}
						label={"New Vault"}
						isLoading={false}
						variant={"action"}
						radius={"full"}
						size={"md"}
						onClick={() => setOpen(true)}
					/>
				</div>
			</div>
			<div className="flow-root">
				<div className="overflow-x-auto">
					<div className="inline-block min-w-full align-middle">
						<table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
							<thead>
								<tr>
									<th
										scope="col"
										className="py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
									>
										Vault Id
									</th>
									<th
										scope="col"
										className="py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
									>
										Name
									</th>
									<th
										scope="col"
										className="py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
									>
										Market
									</th>
									<th
										scope="col"
										className="sm:table-cell hidden py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
									>
										Strategy
									</th>
									<th
										scope="col"
										className="sm:table-cell hidden py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
									>
										Locked Amount
									</th>
									<th
										scope="col"
										className="sm:table-cell hidden py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
									>
										Capacity
									</th>
									<th scope="col" className="relative py-2.5 pl-3 pr-4">
										<span className="sr-only">Manage</span>
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
								{otusVaultData?.vaults?.map((vault: OtusVault) => {
									return (
										<tr key={vault.id}>
											<td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-semibold text-zinc-900 dark:text-zinc-400">
												{vault.id}
											</td>
											<td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-semibold text-zinc-900 dark:text-zinc-400">
												{ethers.utils.parseBytes32String(vault.name)}
											</td>
											<td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-normal text-zinc-900 dark:text-zinc-400">
												<ETHIcon className="h-6 w-6 bg-zinc-900 rounded-full" />
											</td>
											<td className="sm:table-cell hidden whitespace-nowrap py-2 pl-4 pr-3 text-xs font-normal text-zinc-900 dark:text-zinc-400">
												Put Selling
											</td>
											<td className="sm:table-cell hidden whitespace-nowrap py-2 pl-4 pr-3 text-xs font-normal text-zinc-900 dark:text-zinc-400">
												0
											</td>
											<td className="sm:table-cell hidden whitespace-nowrap py-2 pl-4 pr-3 text-xs font-normal text-zinc-900 dark:text-zinc-400">
												10000
											</td>
											<td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-normal">
												<Button
													isDisabled={false}
													label={"Manage"}
													isLoading={false}
													variant={"default"}
													radius={"full"}
													size={"xs"}
													onClick={() => handleNavigate(vault.id)}
												/>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<Modal
				setOpen={setOpen}
				open={open}
				title={
					<div className="px-4 pb-3 pt-5">
						<div className="flex">
							<div>
								<div className=" inline-block rounded-full dark:shadow-black shadow-zinc-200">
									{theme == "dark" ? (
										<LogoIcon />
									) : (
										<img src="./OTUSICONLOGO.png" className="rounded-md h-8" />
									)}
								</div>
							</div>

							<div className="ml-4">
								<h2 className="text-sm font-semibold">Create Vault</h2>
								<h3 className="text-xxs dark:text-zinc-200 pt-1">New Options Vault</h3>
							</div>
						</div>
					</div>
				}
			>
				<NewVaultModal />
			</Modal>
		</div>
	);
};

const NewVaultModal = () => {
	const { isNewVaultSuccess, isTxLoading, isNewVaultLoading, newVault } = useAdminContext();

	return (
		<div>
			<div className="p-4">
				<div>
					<label htmlFor="vaultName" className="block text-sm font-normal leading-6 text-zinc-900">
						Vault Name
					</label>
					<div className="mt-2">
						<input
							type="text"
							name="vaultName"
							id="vaultName"
							className="block w-full rounded-md border-0 pl-2 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300  placeholder:text-zinc-400 focus:ring-1 focus:ring-inset focus:ring-zinc-100 sm:text-sm sm:leading-6"
							placeholder="Vault name"
						/>
					</div>
				</div>
			</div>
			<div className="p-4 pb-8 flex justify-around gap-4">
				<div>
					<label htmlFor="email" className="block text-sm font-normal leading-6 text-zinc-900">
						Token Name
					</label>
					<div className="mt-2">
						<input
							type="text"
							name="tokenName"
							id="tokenName"
							className="block w-full rounded-md border-0 pl-2 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300  placeholder:text-zinc-400 focus:ring-1 focus:ring-inset focus:ring-zinc-100 sm:text-sm sm:leading-6"
							placeholder="you@example.com"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="email" className="block text-sm font-normal leading-6 text-zinc-900">
						Token Symbol
					</label>
					<div className="mt-2">
						<input
							type="text"
							name="tokenSymbol"
							id="tokenSymbol"
							className="block w-full rounded-md border-0 pl-2 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300  placeholder:text-zinc-400 focus:ring-1 focus:ring-inset focus:ring-zinc-100 sm:text-sm sm:leading-6"
							placeholder="you@example.com"
						/>
					</div>
				</div>
			</div>

			<div className="p-4 flex border-t border-zinc-100 dark:border-zinc-800">
				<Button
					isDisabled={isNewVaultSuccess}
					label={"Create New Vault"}
					isLoading={isTxLoading || isNewVaultLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => newVault?.()}
				/>
			</div>
		</div>
	);
};
