import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { useAccount, useNetwork } from "wagmi";
import { ZERO_BN } from "../../constants/bn";
import { useSpreadLiquidityPoolContext } from "../../context/SpreadLiquidityPoolContext";
import { useLPUser } from "../../queries/otus/user";
import { formatUSD, fromBigNumber, toBN } from "../../utils/formatters/numbers";

import { LiquidityPool } from "../../utils/types";
import { WalletConnect } from "../Builder/StrikeTrade/Common/WalletConnect";
import { Spinner } from "../UI/Components/Spinner";
import SUSDIcon from "../UI/Icons/Color/SUSD";
import Modal from "../UI/Modal";

const SpreadLiquidityPool = () => {
	const [open, setOpen] = useState(false);

	const { address } = useAccount();
	const { liquidityPool, isLoading } = useSpreadLiquidityPoolContext();

	const { isLoading: isUserLPLoading, data: lpUserData } = useLPUser(liquidityPool?.id, address);

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
			<div className="cursor-pointer rounded-xl bg-gradient-to-l from-black to-zinc-900 shadow-lg">
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
							<div className="block">
								<div className="font-light text-xxs text-zinc-400">TVL</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>
										{liquidityPool.quoteBalance
											? formatUSD(fromBigNumber(liquidityPool.quoteBalance))
											: "$0"}
									</strong>
								</div>
							</div>

							<div className="block">
								<div className="font-light text-xxs text-zinc-400">30D Fees</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>
										{liquidityPool.feesCollected
											? formatUSD(fromBigNumber(liquidityPool.feesCollected))
											: "$0"}
									</strong>
								</div>
							</div>

							<div className="block">
								<div className="font-light text-xxs text-zinc-400">Open Interest</div>

								<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
									<strong>-</strong>
								</div>
							</div>

							<div className="block">
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

				{!open ? (
					<div className="border-b border-zinc-800">
						<div className="p-4 py-6">
							<div
								onClick={() => setOpen(true)}
								className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-2 text-center"
							>
								Deposit
							</div>
						</div>
					</div>
				) : (
					<LiquidityPoolActions />
				)}

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
		decimals,
		isTxLoading,
		isLoading,
		liquidityPool,
		userBalance,
		isApproveQuoteLoading,
		isDepositLoading,
		isWithdrawLoading,
		depositAmount,
		poolAllowance,
		lpBalance,
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
		<div className="p-4">
			<div className="">
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
						className={` text-white cursor-pointer p-3 font-normal text-center w-full rounded-l-full text-xs bg-zinc-900 ${
							LPActionType.DEPOSIT === liquidityPoolActionType
								? "bg-emerald-500 hover:bg-emerald-600"
								: "bg-zinc-800 hover:bg-zinc-900"
						}`}
					>
						Deposit
					</div>
					<div
						onClick={() => setLiquidityPoolActionType(LPActionType.WITHDRAW)}
						className={`  text-white cursor-pointer p-3 font-normal text-center w-full rounded-r-full text-xs bg-zinc-900  ${
							LPActionType.WITHDRAW === liquidityPoolActionType
								? "bg-emerald-500 hover:bg-emerald-600"
								: "bg-zinc-800 hover:bg-zinc-900"
						}`}
					>
						Withdraw
					</div>
				</div>
			</div>

			<div className="py-4">
				<div className="bg-black border border-zinc-900 rounded-lg py-4 p-2">
					{LPActionType.DEPOSIT === liquidityPoolActionType ? (
						<div className="flex items-center justify-between px-2">
							<p className="truncate font-mono text-xs font-normal text-zinc-300">Wallet Balance</p>
							<div className="ml-2 flex flex-shrink-0">
								<p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-300">
									{formatUSD(userBalance, { dps: 2 })}
								</p>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between px-2">
							<p className="truncate font-mono text-xs font-normal text-zinc-300">
								Liquidity Balance
							</p>
							<div className="ml-2 flex flex-shrink-0">
								<p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-300">
									{fromBigNumber(lpBalance)}
								</p>
							</div>
						</div>
					)}

					<div className="flex items-center justify-between px-2 pt-3">
						{LPActionType.DEPOSIT === liquidityPoolActionType ? (
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
								className="block ring-transparent outline-none w-64 bg-transparent pr-2 text-left text-white font-normal text-2xl"
							/>
						) : null}

						{LPActionType.WITHDRAW === liquidityPoolActionType ? (
							<DebounceInput
								minLength={1}
								debounceTimeout={300}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value);
									setWithdrawAmount(toBN(e.target.value));
								}}
								type="number"
								name="size"
								id="size"
								value={fromBigNumber(depositAmount)}
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
						{userBalance &&
							toBN(userBalance.toString()).lt(depositAmount) &&
							LPActionType.DEPOSIT === liquidityPoolActionType && (
								<div
									onClick={() => console.warn("Add funds")}
									className="mb-4 cursor-disabled border-2 border-zinc-800 bg-zinc-800 p-2 py-3 col-span-3  font-semibold text-sm text-white text-center rounded-full"
								>
									Insufficient Balance
								</div>
							)}

						{poolAllowance?.lt(depositAmount) &&
						LPActionType.DEPOSIT === liquidityPoolActionType ? (
							<div
								onClick={() => approveQuote?.()}
								className="text-sm cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-2 text-center text-white"
							>
								{isApproveQuoteLoading || isTxLoading ? (
									<Spinner size={"medium"} color={"secondary"} />
								) : (
									"Approve Quote"
								)}
							</div>
						) : null}

						{poolAllowance?.gte(depositAmount) &&
						LPActionType.DEPOSIT === liquidityPoolActionType ? (
							<div
								onClick={() => deposit?.()}
								className="text-sm cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-2 text-center  text-white"
							>
								{isDepositLoading && isTxLoading ? (
									<Spinner size={"medium"} color={"secondary"} />
								) : (
									"Deposit"
								)}
							</div>
						) : null}

						{LPActionType.WITHDRAW === liquidityPoolActionType ? (
							<div
								onClick={() => withdraw?.()}
								className="text-sm cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-2 text-center  text-white"
							>
								{isWithdrawLoading && isTxLoading ? (
									<Spinner size={"medium"} color={"secondary"} />
								) : (
									"Withdraw"
								)}
							</div>
						) : null}
					</div>
				)
			) : (
				!isLoading && !isConnected && openConnectModal && <WalletConnect />
			)}
		</div>
	);
};

export default SpreadLiquidityPool;
