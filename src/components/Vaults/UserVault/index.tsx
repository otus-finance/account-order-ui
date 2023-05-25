import { useRouter } from "next/router";
import { UserVaultActivityType } from "../../../utils/types";
import { useState } from "react";
import { VaultContextProvider, useVaultContext } from "../../../context/VaultContext";
import { Button } from "../../UI/Components/Button";
import { DebounceInput } from "react-debounce-input";
import { fromBigNumber, toBN } from "../../../utils/formatters/numbers";
import { BigNumber, ethers } from "ethers";
import { Address } from "wagmi";
import getExplorerUrl from "../../../utils/chains/getExplorerUrl";
import { chain } from "lodash";
import { useChainContext } from "../../../context/ChainContext";
import { OtusVault } from "../../../queries/otus/vaults";
import { useLyraContext } from "../../../context/LyraContext";
import { useLyraPositionIds, useLyraPositions } from "../../../queries/lyra/useLyra";
import { Spinner } from "../../UI/Components/Spinner";
import { LyraPositions } from "../../Builder/StrikeTrade/Postions/LyraPositions";

export const UserVault = () => {
	const router = useRouter();

	const vaultId = router.query.vault as Address;

	return (
		<VaultContextProvider vaultId={vaultId}>
			<UserVaultDetail />
		</VaultContextProvider>
	);
};

type TransactionPercentage = {
	percent: number;
	label: string;
};

const transactionPercentages: TransactionPercentage[] = [
	{ percent: 0.25, label: "25%" },
	{ percent: 0.5, label: "50%" },
	{ percent: 0.75, label: "75%" },
	{ percent: 1, label: "Max" },
];

type DepositWithdrawalProps = {
	userBalance: number;
	setDepositAmount: (depositAmount: BigNumber) => void;
	depositWithdrawPercent?: TransactionPercentage;
	setDepositWithdrawPercent: (depositWithdrawPercent: TransactionPercentage) => void;
};

const DepositWithdrawalPercentageHelper = ({
	userBalance,
	setDepositAmount,
	depositWithdrawPercent,
	setDepositWithdrawPercent,
}: DepositWithdrawalProps) => {
	return (
		<div className="flex items-center justify-between py-2 px-4 dark:bg-zinc-800  bg-zinc-100">
			{transactionPercentages.map((percentage: TransactionPercentage, index: number) => {
				const isActiveStyle =
					percentage.percent == depositWithdrawPercent?.percent
						? "dark:border-emerald-400 border-emerald-400"
						: "";
				return (
					<div
						onClick={() => {
							setDepositWithdrawPercent(percentage);
							setDepositAmount(toBN((percentage.percent * userBalance).toString(), 6));
						}}
						key={index}
						className={`${isActiveStyle} border dark:border-zinc-700 hover:dark:border-emerald-400  cursor-pointer w-full text-xs font-semibold dark:text-zinc-200 text-center py-1 first:mx-0 last:mx-0 mx-1 rounded-lg`}
					>
						{percentage.label}
					</div>
				);
			})}
		</div>
	);
};

const UserBalanceDeposit = ({ userBalance }: { userBalance: number }) => {
	return (
		<div className="flex items-center justify-between py-2 px-4 dark:bg-zinc-800  bg-zinc-100">
			<p className="truncate font-sans text-xs font-normal dark:text-zinc-400">Balance</p>
			<div className="ml-2 flex flex-shrink-0">
				<p className="inline-flex font-sans text-xs font-normal leading-5 dark:text-zinc-400">
					{userBalance}
				</p>
			</div>
		</div>
	);
};

const UserBalanceWithdraw = ({ lpBalance }: { lpBalance: BigNumber }) => {
	return (
		<div className="flex items-center justify-between py-2 px-4 dark:bg-zinc-800  bg-zinc-100">
			<p className="truncate font-sans text-xs font-normal dark:text-zinc-400">Vault Tokens</p>
			<div className="ml-2 flex flex-shrink-0">
				<p className="inline-flex font-sans text-xs font-normal leading-5 dark:text-zinc-400">
					{fromBigNumber(lpBalance)}
				</p>
			</div>
		</div>
	);
};

const UserVaultDetail = () => {
	const { selectedChain } = useChainContext();

	const {
		lpSymbol,
		isVaultLoading,
		vault,
		decimals,
		poolAllowance,
		userBalance,
		lpBalance,
		approveQuote,
		deposit,
		depositAmount,
		setDepositAmount,
	} = useVaultContext();

	const [activityType, setActivityType] = useState<UserVaultActivityType>(
		UserVaultActivityType.Deposit
	);

	const [depositWithdrawPercent, setDepositWithdrawPercent] = useState<TransactionPercentage>();

	return (
		<div className="grid lg:grid-cols-5 grid-cols-2 gap-8">
			<div className="col-span-2 lg:col-span-3">
				{isVaultLoading ? (
					<Spinner />
				) : (
					<div className="px-0 rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200">
						<div className="p-4 font-sans bg-zinc-900 rounded-t-xl border-b border-zinc-100 dark:border-zinc-800 text-white text-sm font-semibold">
							{vault && vault.name && ethers.utils.parseBytes32String(vault?.name)}
						</div>
						<div className="border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold">
							{vault && <UserVaultPositions vault={vault} />}
						</div>
						<div className="p-4 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold">
							<h2 className="font-sans">Strategy</h2>
						</div>
					</div>
				)}
			</div>

			<div className="col-span-2 lg:col-span-2">
				<div className="px-4 sm:px-0 rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200">
					<UserVaultActivitySelect activityType={activityType} setActivityType={setActivityType} />
					<div className="px-4 pt-4">
						{activityType === UserVaultActivityType.Deposit ? (
							<UserBalanceDeposit userBalance={userBalance} />
						) : (
							<UserBalanceWithdraw lpBalance={lpBalance} />
						)}

						{activityType === UserVaultActivityType.Deposit ? (
							<div className="flex justify-between py-4 p-4 dark:bg-zinc-800  bg-zinc-100">
								<DebounceInput
									minLength={1}
									debounceTimeout={300}
									onChange={async (e) => {
										if (e.target.value == "") return;
										setDepositAmount(toBN(e.target.value, decimals));
									}}
									type="number"
									name="size"
									id="size"
									value={fromBigNumber(depositAmount, decimals)}
									className="block bg-zinc-100 ring-transparent outline-none w-full dark:bg-transparent pr-2 text-left dark:text-white font-normal text-2xl"
								/>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-normal text-2xl dark:text-white">USD</p>
								</div>
							</div>
						) : (
							<div className="flex justify-between py-4 p-4 dark:bg-zinc-800  bg-zinc-100">
								<DebounceInput
									minLength={1}
									debounceTimeout={300}
									onChange={async (e) => {
										if (e.target.value == "") return;
									}}
									type="number"
									name="size"
									id="size"
									// value={ }
									className="block bg-zinc-100 ring-transparent outline-none w-full dark:bg-transparent pr-2 text-left dark:text-white font-normal text-2xl"
								/>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-normal text-2xl dark:text-white">{lpSymbol}</p>
								</div>
							</div>
						)}

						<DepositWithdrawalPercentageHelper
							userBalance={userBalance}
							setDepositAmount={setDepositAmount}
							depositWithdrawPercent={depositWithdrawPercent}
							setDepositWithdrawPercent={setDepositWithdrawPercent}
						/>
					</div>

					<div className="flex justify-between py-4 p-4">
						{poolAllowance?.isZero() ? (
							<Button
								isDisabled={false}
								label={"Approve Quote"}
								isLoading={false}
								variant={"action"}
								radius={"full"}
								size={"full"}
								onClick={() => approveQuote?.()}
							/>
						) : (
							<Button
								isDisabled={false}
								label={"Deposit"}
								isLoading={false}
								variant={"action"}
								radius={"full"}
								size={"full"}
								onClick={() => deposit?.()}
							/>
						)}
					</div>
				</div>

				<div className="mt-4 p-4 sm:flex sm:justify-between text-sm rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200 text-zinc-800 dark:text-zinc-400">
					<div className="font-normal">Contract Address: </div>
					{selectedChain && vault && vault.id && (
						<a
							className="underline"
							target="_blank"
							rel="noreferrer"
							href={getExplorerUrl(selectedChain, vault.id)}
						>
							{vault.id}
						</a>
					)}
				</div>
			</div>
		</div>
	);
};

type Props = {
	activityType: UserVaultActivityType;
	setActivityType: (activityType: UserVaultActivityType) => void;
};

export const UserVaultActivitySelect = ({ activityType, setActivityType }: Props) => {
	return (
		<div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800">
			<div
				onClick={() => setActivityType(UserVaultActivityType.Deposit)}
				className={`hover:underline hover:font-semibold cursor-pointer p-4 w-full text-center text-sm font-sans border-r border-zinc-100 dark:border-zinc-800 
		${
			activityType === UserVaultActivityType.Deposit
				? "dark:text-white underline font-semibold"
				: "dark:text-zinc-300"
		}`}
			>
				Deposit
			</div>
			<div
				onClick={() => setActivityType(UserVaultActivityType.Withdraw)}
				className={`hover:underline hover:font-semibold cursor-pointer p-4 w-full text-center text-sm font-sans 
		${
			activityType === UserVaultActivityType.Withdraw
				? "dark:text-white underline font-semibold"
				: "dark:text-zinc-300"
		}`}
			>
				Withdraw
			</div>
		</div>
	);
};

const UserVaultPositions = ({ vault }: { vault: OtusVault }) => {
	const { lyra } = useLyraContext();

	return <LyraPositions lyra={lyra} address={vault.id} />;
};
