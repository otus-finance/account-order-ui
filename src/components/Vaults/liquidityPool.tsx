import { BigNumber } from "ethers";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { useSpreadLiquidityPoolContext } from "../../context/SpreadLiquidityPoolContext";
import { fromBigNumber } from "../../utils/formatters/numbers";

import { LiquidityPool } from "../../utils/types";
import SUSDIcon from "../UI/Icons/Color/SUSD";
import Modal from "../UI/Modal";

const LiquidityPool = ({ pool }: { pool: LiquidityPool }) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<div key={pool.id} className="border-b border-zinc-800">
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
								<strong>$10,000.00</strong>
							</div>
						</div>

						<div className="hidden sm:block">
							<div className="font-light text-xxs text-zinc-400">30D Fees</div>

							<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
								<strong>$10.20</strong>
							</div>
						</div>

						<div className="hidden sm:block">
							<div className="font-light text-xxs text-zinc-400">Open Interest</div>

							<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
								<strong>$4012.00</strong>
							</div>
						</div>

						<div className="hidden sm:block">
							<div className="font-light text-xxs text-zinc-400">APY</div>

							<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
								<strong>8%</strong>
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
								<strong>$10,000.00</strong>
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
					<div className="font-mono text-xxs font-normal text-white">$10,000.00</div>
				</div>
				<div className="rounded-xs h-3 w-full bg-zinc-800">
					<div className={`progress-bar h-3 bg-emerald-500`} style={{ width: "100%" }}></div>
				</div>
				<div className="flex flex-wrap justify-between py-2">
					<div className="text-xxs font-light text-white">Maximum Capacity</div>
					<div className="font-mono text-xxs font-normal text-white">$12000.00</div>
				</div>
			</div>

			<Modal
				setOpen={setOpen}
				open={open}
				title={<div className="font-semibold text-md">Spread Liquidity Pool</div>}
			>
				<LiquidityPoolActions />
			</Modal>
		</>
	);
};

const percentWidth = (totalDeposit: BigNumber, vaultCap: BigNumber): string => {
	const formatTotalDeposit = fromBigNumber(totalDeposit);
	const formatVaultCap = fromBigNumber(vaultCap);

	return `${(formatTotalDeposit / formatVaultCap) * 10}%`;
};

const getHedgeLabel = (hedgeType: number): string => {
	switch (hedgeType) {
		case 0:
			return "No Hedge";
		case 1:
			return "Manager";
		case 2:
			return "Dynamic";
		default:
			return "No Hedge";
	}
};

enum LPActionType {
	DEPOSIT,
	WITHDRAW,
}

const LiquidityPoolActions = () => {
	const {
		userBalance,
		isApproveQuoteLoading,
		isDepositLoading,
		isWithdrawLoading,
		depositAmount,
		withdrawAmount,
		allowanceAmount,
		setDepositAmount,
		setWithdrawAmount,
		deposit,
		withdraw,
	} = useSpreadLiquidityPoolContext();

	const [liquidityPoolActionType, setLiquidityPoolActionType] = useState(LPActionType.DEPOSIT);

	return (
		<>
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
								{/* {userBalance} */} $10 sUSD
							</p>
						</div>
					</div>

					<div className="flex items-center justify-between px-2 pt-3">
						<DebounceInput
							minLength={1}
							debounceTimeout={300}
							onChange={async (e) => {
								if (e.target.value == "") return;
								const value = parseFloat(e.target.value);
								// setDepositAmount(value);
							}}
							type="number"
							name="size"
							id="size"
							value={0}
							className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
						/>
					</div>
				</div>
			</div>

			<div className="pt-2">
				<div
					onClick={() => deposit?.()}
					className="cursor-pointer  bg-emerald-600  p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
				>
					Deposit
				</div>
			</div>
		</>
	);
};

export default LiquidityPool;
