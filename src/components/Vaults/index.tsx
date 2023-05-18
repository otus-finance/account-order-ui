import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { Address, useNetwork } from "wagmi";

import ETHIcon from "../UI/Icons/Color/ETH";
import BTCIcon from "../UI/Icons/Color/BTC";
import { Button } from "../UI/Components/Button";
import { OtusVault, useVaults } from "../../queries/otus/vaults";
import { useRouter } from "next/router";
import { useChainContext } from "../../context/ChainContext";
import { formatUSD, fromBigNumber, toBN } from "../../utils/formatters/numbers";
import { ZERO_BN } from "../../constants/bn";
import { Spinner } from "../UI/Components/Spinner";

const VaultsList = () => {
	const { selectedChain: chain } = useChainContext();
	const { isLoading, data } = useVaults(chain);

	const router = useRouter();
	const handleNavigate = (id: Address) => {
		router.push(`/vault/${id}`);
	};

	return (
		<div>
			<div className="pb-4  font-semibold text-xl text-zinc-900 dark:text-zinc-200">
				Featured Vaults
			</div>
			<div className="grid grid-cols-3 gap-4 auto-cols-max pb-8">
				{isLoading ? (
					<Spinner />
				) : (
					data?.vaults?.map((vault: OtusVault, index: number) => {
						return (
							<div key={index} className="col-span-3 lg:col-span-1">
								<Vault vault={vault} />
							</div>
						);
					})
				)}
			</div>
			<div className="py-4 font-semibold text-lg text-zinc-900 dark:text-zinc-200">1x Vaults</div>
			<div className="pb-8">
				<div className="rounded-lg">
					<table className="min-w-full dark:divide-zinc-800 divide divide-zinc-800 dark:shadow-black shadow-zinc-200 bg-white shadow-md rounded-xl dark:bg-zinc-900 border-separate">
						<thead className="divide-b divide-zinc-200">
							<tr>
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
								<th
									scope="col"
									className="sm:table-cell hidden py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
								>
									Previous Week APY
								</th>
								<th
									scope="col"
									className="py-2.5 pl-4 pr-3 text-left text-xs font-light text-zinc-900 dark:text-zinc-400"
								>
									All Time ROI
								</th>
								<th scope="col" className="relative py-2.5 pl-3 pr-4">
									<span className="sr-only">Start</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{data?.vaults?.map((vault: OtusVault, index: number) => {
								return (
									<tr key={vault.id}>
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
										<td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-normal text-zinc-900 dark:text-zinc-400">
											10%
										</td>
										<td className="sm:table-cell hidden whitespace-nowrap py-2 pl-4 pr-3 text-xs font-normal text-zinc-900 dark:text-zinc-400">
											2%
										</td>
										<td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-normal text-zinc-900 dark:text-zinc-400 text-right">
											<Button
												isDisabled={false}
												label={"View"}
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
			<div className="py-4  font-semibold text-lg text-zinc-900 dark:text-zinc-200">
				Basic Vaults
			</div>
			<div className="pb-8">
				<table></table>
			</div>
			<div className="py-4  font-semibold text-lg text-zinc-900 dark:text-zinc-200">
				Degen Vaults
			</div>
			<div className="pb-8">
				<table></table>
			</div>
		</div>
	);
};

const Vault = ({ vault }: { vault: OtusVault }) => {
	const router = useRouter();

	const handleSelectVault = () => {
		router.push(`/vault/${vault.id}`);
	};

	return (
		<div className="dark:shadow-black bg-white dark:bg-zinc-900 shadow-md shadow-zinc-200 rounded-xl">
			<div key={0} className="border-b dark:border-zinc-800 border-zinc-100">
				<div className="p-4">
					<div className="flex">
						<div>
							<div className="bg-emerald-500 inline-block rounded-full dark:shadow-black shadow-zinc-200 ">
								<ETHIcon />
							</div>

							<div className="bg-emerald-500 inline-block rounded-full dark:shadow-black shadow-zinc-200 ml-[-18px]">
								<BTCIcon />
							</div>
						</div>

						<div className="ml-4">
							<h2 className="text-sm font-semibold">
								{vault.name && ethers.utils.parseBytes32String(vault.name)}
							</h2>
							<div className="flex">
								<span className="text-xxs font-semibold text-white p-1 bg-emerald-500 rounded-lg">
									Put Selling
								</span>
								<span className="ml-1 text-xxs font-semibold text-white p-1 bg-black rounded-lg">
									Perp Hedge
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="border-b dark:border-zinc-800 border-zinc-100 ">
				<div className="p-4">
					<div className="flex flex-wrap justify-between py-2">
						<div className="text-xs font-semibold dark:text-white">Current Strikes</div>
						<div className="font-mono text-xs font-normal dark:text-white">1800</div>
						<div className="font-mono text-xs font-normal dark:text-white">1900</div>
						<div className="font-mono text-xs font-normal dark:text-white">2000</div>
					</div>
				</div>
			</div>

			<div className="border-b dark:border-zinc-800 border-zinc-100">
				<div className="p-4">
					<div className="flex flex-wrap justify-between py-2">
						<div className="text-xs font-semibold dark:text-white">Max Leverage</div>
						<div className="font-mono text-xs font-normal dark:text-white">1x</div>
					</div>
					<div className="flex flex-wrap justify-between py-2">
						<div className="text-xs font-semibold dark:text-white">All Time APY</div>
						<div className="font-mono text-xs font-normal dark:text-white">8.2%</div>
					</div>
				</div>
			</div>

			<div className="border-b dark:border-zinc-800 border-zinc-100 ">
				<div className="p-4">
					<div className="flex flex-wrap justify-between py-2">
						<div className="text-xxs font-light dark:text-white">Total Deposits</div>
						<div className="font-mono text-xxs font-normal dark:text-white">
							{formatUSD(fromBigNumber(ZERO_BN))}
						</div>
					</div>
					<div className="rounded-xs h-3 w-full dark:bg-zinc-800 bg-zinc-200">
						<div
							className={`progress-bar h-3 bg-emerald-500`}
							style={{
								width: percentWidth(ZERO_BN, toBN("100000")),
							}}
						></div>
					</div>
					<div className="flex flex-wrap justify-between py-2">
						<div className="text-xxs font-light dark:text-white">Maximum Capacity</div>
						<div className="font-mono text-xxs font-normal dark:text-white">
							{formatUSD(fromBigNumber(toBN("100000")))}
						</div>
					</div>
				</div>
			</div>

			<div className="pt-6 p-4">
				<Button
					isDisabled={false}
					label={"Start"}
					isLoading={false}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => handleSelectVault()}
				/>
			</div>
		</div>
	);
};

const percentWidth = (deposits: BigNumber, vaultCap: BigNumber): string => {
	const _deposits = fromBigNumber(deposits);
	const formatVaultCap = fromBigNumber(vaultCap);
	return `${(_deposits / formatVaultCap) * 100}%`;
};

export default VaultsList;
