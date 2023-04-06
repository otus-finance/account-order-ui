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
import ETHIcon from "../UI/Icons/Color/ETH";
import { ArrowDownCircleIcon } from "@heroicons/react/20/solid";
import { ArrowDownIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const Vault = ({ title }: { title: string }) => {
	const [open, setOpen] = useState(false);

	const { address } = useAccount();
	// const { liquidityPool } = useSpreadLiquidityPoolContext();

	// const { isLoading: isDataLoading, data: lpUserData } = useLPUser(liquidityPool?.id, address);

	// const userDeposit = lpUserData && lpUserData.lpusers.length > 0 && lpUserData.lpusers[0] && lpUserData.lpusers[0].lpTokenBalance;

	return (
		<>
			<div key={title} className="border-b border-zinc-800">
				<div className="p-4">
					<div className="flex">
						<div>
							<div className="rounded-full bg-zinc-800">
								<SUSDIcon />
							</div>
						</div>
						<div>
							<div className="ml-[-20px] rounded-full bg-zinc-800">
								<ETHIcon />
							</div>
						</div>
						<div className="ml-4">
							<h2 className="text-sm font-semibold">{title}</h2>
							<h3 className="text-xs text-white pt-1">Strike Range $1500 - $2000</h3>
							<h3 className="text-xs font-semibold text-white pt-1">Expires April 14, 2023</h3>
						</div>
					</div>
				</div>
			</div>

			<div className="border-b border-zinc-800">
				<div className="p-4 py-6">
					<div className="flex justify-between">
						<div
							onClick={() => console.log(LPActionType.DEPOSIT)}
							className={`text-white uppercase cursor-pointer  p-3 font-semibold text-center w-full rounded-l-full text-xs border border-r-0 border-zinc-800 hover:bg-zinc-900`}
						>
							In
						</div>
						<div
							onClick={() => console.log(LPActionType.WITHDRAW)}
							className={`text-white uppercase cursor-pointer p-3 border-l-zinc-900  font-semibold text-center w-full rounded-r-full text-xs border border-zinc-800  hover:bg-zinc-900`}
						>
							Out
						</div>
					</div>
				</div>
			</div>

			<div className="overflow-hidden border-b border-zinc-800">
				<div className="p-4">
					<div className="flex gap-14">
						<div className="hidden sm:block">
							<div className="font-light text-xxs text-white">Potential Profit</div>

							<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
								<strong>58%</strong>
							</div>
						</div>

						<div className="hidden sm:block">
							<div className="font-light text-xxs text-white">Price</div>

							<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
								<strong>$1</strong>
							</div>
						</div>

						<div className="hidden sm:block">
							<div className="font-light text-xxs text-white">Expires</div>

							<div className="font-normal text-sm text-zinc-200 mt-2">
								<strong>April 14, 2023</strong>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="border-b border-zinc-800 py-4">
				<div className="p-4 py-1">
					<div className="bg-inherit border rounded-lg border-zinc-900 bg-zinc-900 py-4 p-2">
						<div className="flex items-center justify-between px-2">
							<p className="truncate font-mono text-xs font-normal text-white">You Sell</p>
							<div className="ml-2 flex flex-shrink-0">
								<p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
									Balance: $10
								</p>
							</div>
						</div>

						<div className="flex items-center justify-between px-2 pt-2">
							<DebounceInput
								minLength={1}
								debounceTimeout={300}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value) / 100;
								}}
								type="number"
								name="size"
								id="size"
								value={0}
								className="block ring-transparent outline-none w-24 bg-transparent pr-2 text-left text-white font-normal text-2xl"
							/>
							<div className="ml-2 flex flex-shrink-0">
								<p className="inline-flex font-normal text-2xl text-white">
									<SUSDIcon /> sUSD
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-center mt-[-20px] ">
					<div className="bg-zinc-900 rounded-md p-2 shadow-xl cursor-pointer border-2 border-zinc-800">
						<ArrowDownIcon className="h-4 w-4 text-white" />
					</div>
				</div>

				<div className="p-4 py-1 mt-[-20px]">
					<div className="bg-inherit border  rounded-lg border-zinc-800 py-4 p-2">
						<div className="flex items-center justify-between px-2">
							<p className="truncate font-mono text-xs font-normal text-white">You Buy</p>
							<div className="ml-2 flex flex-shrink-0">
								<p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
									Balance: 0
								</p>
							</div>
						</div>

						<div className="flex items-center justify-between px-2 pt-2">
							<DebounceInput
								minLength={1}
								debounceTimeout={300}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value) / 100;
								}}
								type="number"
								name="size"
								id="size"
								value={0}
								className="block ring-transparent outline-none w-24 bg-transparent pr-2 text-left text-white font-normal text-2xl"
							/>
							<div className="ml-2 flex flex-shrink-0">
								<p className="inline-flex font-normal text-2xl text-white">OTRM1</p>
							</div>
						</div>
					</div>
				</div>

				<div className="p-4 py-1">
					<div className="cursor-pointer bg-gradient-to-b from-black to-zinc-900 rounded-lg py-4 p-2 font-semibold text-center">
						Swap
					</div>
				</div>
			</div>
		</>
	);
};

enum LPActionType {
	DEPOSIT,
	WITHDRAW,
}

export default Vault;
