import React from "react";
import { Chart } from "./Chart";
import { Market } from "./Market";
import { Strategy } from "./Strategy";
import { Strikes } from "./Strikes";

import { LyraAccountContextProvider } from "../../context/LyraAccountContext";
import { useBuilderContext } from "../../context/BuilderContext";
import { StrikeTrade } from "./StrikeTrade/index";
import { ActivityType, BuilderType } from "../../utils/types";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import {
	MarketOrderContextProvider,
	useMarketOrderContext,
} from "../../context/MarketOrderContext";
import { Positions } from "./StrikeTrade/Postions";
import { WalletBalance } from "./StrikeTrade/Balance";
import { useAccount } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "../UI/Components/Spinner";

export const OptionsBuilder = () => {
	const { isMarketLoading, activityType } = useBuilderContext();

	const { address } = useAccount();

	return (
		<AnimatePresence>
			{isMarketLoading ? (
				<div className="p-4 items-center">
					<Spinner />
				</div>
			) : (
				<motion.div
					key="markets"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="grid lg:grid-cols-5 grid-cols-2 gap-8"
				>
					<div className="col-span-5 lg:col-span-3">
						<div className="px-4 sm:px-0 rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200 ">
							<div>
								<div className="p-4">
									<Market />
								</div>

								<Strategy />

								<div>
									<Strikes />
								</div>
							</div>
						</div>
					</div>

					<div className="col-span-5 lg:col-span-2">
						<div className="px-4 sm:px-0 rounded-xl dark:bg-zinc-900 bg-white">
							<ActivitySelect />
							{address && (
								<LyraAccountContextProvider address={address}>
									<WalletBalance />
								</LyraAccountContextProvider>
							)}
							{activityType === ActivityType.Trade ? (
								<MarketOrderContextProvider>
									<div>
										<MarketOrderTradePanel />
									</div>
								</MarketOrderContextProvider>
							) : (
								<Positions />
							)}
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

const MarketOrderTradePanel = () => {
	const { isValid } = useBuilderContext();

	const { trades } = useMarketOrderContext();

	return trades.length ? (
		<>
			<StrikeTrade />
			<motion.div
				initial={{ opacity: 1 }}
				className="hidden sm:block p-4 border-t border-zinc-100 dark:border-zinc-800"
			>
				<Chart />
			</motion.div>
			<motion.div className="sm:hidden p-4 border-t border-zinc-100 dark:border-zinc-800">
				<Chart height={200} />
			</motion.div>
		</>
	) : (
		<motion.div
			initial={{ opacity: 1 }}
			className="border-t dark:border-zinc-800 border-zinc-100 p-4"
		>
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
			{!isValid && (
				<div className="flex items-center p-2">
					<p className="font-mono text-sm font-normal leading-5 dark:text-white">
						Strikes for strategy not available for selected assets or expiry.
					</p>
				</div>
			)}
		</motion.div>
	);
};

export const ActivitySelect = () => {
	const { activityType, handleSelectActivityType } = useBuilderContext();

	return (
		<div className="flex justify-between">
			<div
				onClick={() => handleSelectActivityType(ActivityType.Trade)}
				className={`hover:underline hover:font-semibold cursor-pointer p-4 w-full text-center text-sm font-mono border-r border-zinc-100 dark:border-zinc-800 
		${
			activityType === ActivityType.Trade
				? "dark:text-white underline font-semibold"
				: "dark:text-zinc-300"
		}`}
			>
				Trade
			</div>
			<div
				onClick={() => handleSelectActivityType(ActivityType.Position)}
				className={`hover:underline hover:font-semibold cursor-pointer p-4 w-full text-center text-sm font-mono 
		${
			activityType === ActivityType.Position
				? "dark:text-white underline font-semibold"
				: "dark:text-zinc-300"
		}`}
			>
				Positions
			</div>
		</div>
	);
};

export const VaultActivitySelect = () => {
	const { activityType, handleSelectActivityType } = useBuilderContext();

	return (
		<div className="flex justify-between">
			<div
				onClick={() => handleSelectActivityType(ActivityType.Trade)}
				className={`hover:underline hover:font-semibold cursor-pointer p-4 w-full text-center text-sm font-mono border-r border-zinc-100 dark:border-zinc-800 
		${
			activityType === ActivityType.Trade
				? "dark:text-white underline font-semibold"
				: "dark:text-zinc-300"
		}`}
			>
				Trade
			</div>
			<div
				onClick={() => handleSelectActivityType(ActivityType.Position)}
				className={`hover:underline hover:font-semibold cursor-pointer p-4 w-full text-center text-sm font-mono  border-r border-zinc-100 dark:border-zinc-800
		${
			activityType === ActivityType.Position
				? "dark:text-white underline font-semibold"
				: "dark:text-zinc-300"
		}`}
			>
				Positions
			</div>
			<div
				onClick={() => handleSelectActivityType(ActivityType.Manage)}
				className={`hover:underline hover:font-semibold cursor-pointer p-4 w-full text-center text-sm font-mono 
		${
			activityType === ActivityType.Manage
				? "dark:text-white underline font-semibold"
				: "dark:text-zinc-300"
		}`}
			>
				Manage Vault
			</div>
		</div>
	);
};
