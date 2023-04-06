import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { useAccount, useNetwork } from "wagmi";
import { ZERO_BN } from "../../constants/bn";
import { useSpreadLiquidityPoolContext } from "../../context/SpreadLiquidityPoolContext";
import { useLPUser } from "../../queries/otus/user";
import { formatUSD, fromBigNumber } from "../../utils/formatters/numbers";

import { LiquidityPool } from "../../utils/types";
import { WalletConnect } from "../Builder/StrikeTrade/Common/WalletConnect";
import { Spinner } from "../UI/Components/Spinner";
import SUSDIcon from "../UI/Icons/Color/SUSD";
import Modal from "../UI/Modal";

const SpreadLiquidityPool = () => {
	const [open, setOpen] = useState(false);

	const { address } = useAccount();
	const { liquidityPool, isLoading } = useSpreadLiquidityPoolContext();

	const { isLoading: isDataLoading, data: lpUserData } = useLPUser(liquidityPool?.id, address);

	const userDeposit =
		lpUserData &&
		lpUserData.lpusers.length > 0 &&
		lpUserData.lpusers[0] &&
		lpUserData.lpusers[0].lpTokenBalance;

	if (isLoading) {
		return <Spinner />;
	}

	return liquidityPool ? (
		<>
			<div className="cursor-pointer rounded-xl bg-gradient-to-t from-black to-zinc-800 border-4  border-zinc-800 shadow-lg">
				<div key={liquidityPool.id} className="border-b border-zinc-800">
					<div className="p-4">
						<div className="flex">
							<div>
								<div className="bg-emerald-500 inline-block rounded-full shadow-black">
									<SUSDIcon />
								</div>
							</div>

							<div className="ml-4">
								<h2 className="text-sm font-semibold">Spread Liquidity Pool</h2>
								<h3 className="text-xxs text-zinc-300 pt-1">
									Provide liquidity and earn fees from traders.
								</h3>
							</div>
						</div>
					</div>
				</div>

				<div className="overflow-hidden border-b border-zinc-800">
					<div className="p-4">
						<div className="flex gap-14">
							<div className="hidden sm:block">
								<div className="font-light text-xxs text-zinc-400">TVL</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>
										{liquidityPool.freeCollateral && liquidityPool.lockedCollateral
											? formatUSD(
													fromBigNumber(liquidityPool.freeCollateral) +
														fromBigNumber(liquidityPool.lockedCollateral)
											  )
											: "$0"}
									</strong>
								</div>
							</div>

							<div className="hidden sm:block">
								<div className="font-light text-xxs text-zinc-400">30D Fees</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>
										{liquidityPool.feesCollected
											? formatUSD(fromBigNumber(liquidityPool.feesCollected))
											: "$0"}
									</strong>
								</div>
							</div>

							<div className="hidden sm:block">
								<div className="font-light text-xxs text-zinc-400">Open Interest</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>-</strong>
								</div>
							</div>

							<div className="hidden sm:block">
								<div className="font-light text-xxs text-zinc-400">APY</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>-</strong>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="border-b border-zinc-800">
					<div className="p-4 py-8">
						<div className="flex justify-between items-center">
							<div>
								<div className="font-light text-xxs text-zinc-400">Your Liquidity</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>{userDeposit && formatUSD(fromBigNumber(userDeposit))}</strong>
								</div>
							</div>

							<div className="bg-zinc-800 rounded-full px-12 py-2 hover:bg-zinc-700">
								<div className="text-xs items-center">History</div>
							</div>
						</div>
					</div>
				</div>

				<div className="border-b border-zinc-800">
					<div className="p-4 py-6">
						<div
							onClick={() => setOpen(true)}
							className="cursor-pointer bg-emerald-500 rounded-full p-4 w-full font-semibold hover:bg-emerald-600 py-2 text-center"
						>
							Deposit
						</div>
					</div>
				</div>

				<div className="p-4">
					<div className="flex flex-wrap justify-between py-2">
						<div className="text-xxs font-light text-white">Total Deposits</div>
						<div className="font-mono text-xxs font-normal text-white">
							{liquidityPool.freeCollateral && liquidityPool.lockedCollateral
								? formatUSD(
										fromBigNumber(liquidityPool.freeCollateral) +
											fromBigNumber(liquidityPool.lockedCollateral)
								  )
								: "$0"}
						</div>
					</div>
					<div className="rounded-xs h-3 w-full bg-zinc-800">
						<div
							className={`progress-bar h-3 bg-emerald-500`}
							style={{ width: percentWidth(userDeposit || ZERO_BN, liquidityPool.cap) }}
						></div>
					</div>
					<div className="flex flex-wrap justify-between py-2">
						<div className="text-xxs font-light text-white">Maximum Capacity</div>
						<div className="font-mono text-xxs font-normal text-white">
							{formatUSD(fromBigNumber(liquidityPool.cap))}
						</div>
					</div>
				</div>

				<Modal
					setOpen={setOpen}
					open={open}
					title={<div className="font-semibold text-md">Spread Liquidity Pool</div>}
				>
					<LiquidityPoolActions />
				</Modal>
			</div>
		</>
	) : (
		<div className="cursor-pointer rounded-sm border border-zinc-800 shadow-lg shadow-emerald-900">
			<div className="border-b border-zinc-800">
				<div className="p-4">
					<div className="flex">
						<div>
							<div className="bg-emerald-500 inline-block rounded-full shadow-black">
								<SUSDIcon />
							</div>
						</div>

						<div className="ml-4">
							<h2 className="text-sm font-semibold">Spread Liquidity Pool</h2>
							<h3 className="text-xxs text-zinc-300 pt-1">
								Currently not available on this network.
							</h3>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const percentWidth = (totalDeposit: BigNumber, vaultCap: BigNumber): string => {
	const formatTotalDeposit = fromBigNumber(totalDeposit);
	const formatVaultCap = fromBigNumber(vaultCap);

	return `${(formatTotalDeposit / formatVaultCap) * 10}%`;
};

enum LPActionType {
	DEPOSIT,
	WITHDRAW,
}

const LiquidityPoolActions = () => {
	const {
		isLoading,
		liquidityPool,
		userBalance,
		isApproveQuoteLoading,
		isDepositLoading,
		isWithdrawLoading,
		depositAmount,
		withdrawAmount,
		allowanceAmount,
		poolAllowance,
		setAllowanceAmount,
		setDepositAmount,
		setWithdrawAmount,
		deposit,
		withdraw,
		approveQuote,
	} = useSpreadLiquidityPoolContext();

	const { isConnected } = useAccount();
	const { chain } = useNetwork();
	const { openConnectModal } = useConnectModal();

	const [liquidityPoolActionType, setLiquidityPoolActionType] = useState(LPActionType.DEPOSIT);

	return (
		<>
			<div className="py-4 ">
				<div className="flex justify-between">
					<div className="font-light py-2 text-sm text-zinc-200 text-center">Withdrawl Fee</div>
					<div className="font-normal py-2 text-sm text-zinc-200 text-center">0%</div>
				</div>
				<div className="flex justify-between">
					<div className="font-light py-2 text-sm text-zinc-200 text-center">Withdrawal Delay</div>
					<div className="font-normal py-2 text-sm text-zinc-200 text-center">0 Days</div>
				</div>
				<div className="flex justify-between">
					<div className="font-light py-2 text-sm text-zinc-200 text-center">Deposit Delay</div>
					<div className="font-normal py-2 text-sm text-zinc-200 text-center">0 Days</div>
				</div>
				<div className="flex justify-between">
					<div className="font-light py-2 text-sm text-zinc-200 text-center">
						Minimum Deposit/Withdrawal
					</div>
					<div className="font-normal py-2 text-sm text-zinc-200 text-center">
						{liquidityPool?.minDepositWithdraw &&
							formatUSD(fromBigNumber(liquidityPool.minDepositWithdraw))}
					</div>
				</div>
			</div>

			<div className="pt-4 ">
				<div className="flex justify-between">
					<div
						onClick={() => setLiquidityPoolActionType(LPActionType.DEPOSIT)}
						className={`hover:border-emerald-600 text-white cursor-pointer p-2 font-normal text-center w-full rounded-l-full text-xs bg-zinc-900 border-2 ${
							LPActionType.DEPOSIT === liquidityPoolActionType
								? "border-emerald-600"
								: "border-zinc-800 border-r-transparent"
						}`}
					>
						Deposit
					</div>
					<div
						onClick={() => setLiquidityPoolActionType(LPActionType.WITHDRAW)}
						className={`hover:border-emerald-600 text-white cursor-pointer p-2 font-normal text-center w-full rounded-r-full text-xs bg-zinc-900 border-2  ${
							LPActionType.WITHDRAW === liquidityPoolActionType
								? "border-emerald-600"
								: "border-zinc-800 border-l-transparent"
						}`}
					>
						Withdraw
					</div>
				</div>
			</div>

			<div className="py-4">
				<div className="bg-black border border-zinc-900 py-4 p-2">
					<div className="flex items-center justify-between px-2">
						<p className="truncate font-mono text-sm font-normal text-zinc-300">Wallet Balance</p>
						<div className="ml-2 flex flex-shrink-0">
							<p className="inline-flex font-mono text-sm font-normal leading-5 text-zinc-300">
								{userBalance}
							</p>
						</div>
					</div>

					<div className="flex items-center justify-between px-2 pt-3">
						{LPActionType.DEPOSIT === liquidityPoolActionType &&
						poolAllowance &&
						poolAllowance > 0 ? (
							<DebounceInput
								minLength={1}
								debounceTimeout={300}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value);
									setDepositAmount(value);
								}}
								type="number"
								name="size"
								id="size"
								value={depositAmount || 0}
								className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
							/>
						) : null}

						{LPActionType.DEPOSIT === liquidityPoolActionType && poolAllowance === 0 ? (
							<DebounceInput
								minLength={1}
								debounceTimeout={300}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value);
									setAllowanceAmount(value);
								}}
								type="number"
								name="size"
								id="size"
								value={allowanceAmount || 0}
								className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
							/>
						) : null}

						{LPActionType.WITHDRAW === liquidityPoolActionType ? (
							<DebounceInput
								minLength={1}
								debounceTimeout={300}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value);
									setWithdrawAmount(value);
								}}
								type="number"
								name="size"
								id="size"
								value={withdrawAmount || 0}
								className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
							/>
						) : null}
					</div>
				</div>
			</div>

			{isConnected ? (
				chain?.unsupported ? (
					<div>
						<div className="cursor-pointer border-2 border-orange-500 hover:border-orange-600 p-2 py-3 col-span-3 font-normal text-md text-white text-center rounded-full">
							Unsupported Chain
						</div>
					</div>
				) : (
					<div>
						{poolAllowance === 0 && LPActionType.DEPOSIT === liquidityPoolActionType ? (
							<div
								onClick={() => approveQuote?.()}
								className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
							>
								{isApproveQuoteLoading ? <Spinner /> : "Approve Quote"}
							</div>
						) : null}

						{poolAllowance &&
						poolAllowance > 0 &&
						LPActionType.DEPOSIT === liquidityPoolActionType ? (
							<div
								onClick={() => deposit?.()}
								className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
							>
								{isDepositLoading ? <Spinner /> : "Deposit"}
							</div>
						) : null}

						{LPActionType.WITHDRAW === liquidityPoolActionType ? (
							<div
								onClick={() => withdraw?.()}
								className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
							>
								{isWithdrawLoading ? <Spinner /> : "Withdraw"}
							</div>
						) : null}
					</div>
				)
			) : (
				!isLoading && !isConnected && openConnectModal && <WalletConnect />
			)}
		</>
	);
};

export default SpreadLiquidityPool;
