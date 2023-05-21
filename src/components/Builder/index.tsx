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
import { MarketOrderContextProvider } from "../../context/MarketOrderContext";
import { Positions } from "./StrikeTrade/Postions";
import { WalletBalance } from "./StrikeTrade/Balance";
import { useAccount } from "wagmi";
import { CUSTOM } from "./Strategy/SelectStrategy";

export const OptionsBuilder = () => {
	const { strikes, activityType, selectedStrategy } = useBuilderContext();

	const { address } = useAccount();

	return (
		<div className="grid sm:grid-cols-2 grid-cols-2 gap-8">
			<div className="col-span-2 xl:col-span-1">
				<div className="px-4 sm:px-0 rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200">
					<div className="p-4">
						<Market />
					</div>

					<Strategy />

					{(selectedStrategy == null || selectedStrategy?.id == CUSTOM.id) && (
						<div>
							<Strikes />
						</div>
					)}
				</div>
			</div>

			<div className="col-span-2 xl:col-span-1">
				<div className="px-4 sm:px-0 rounded-xl dark:bg-zinc-900 bg-white shadow-md dark:shadow-black shadow-zinc-200">
					<ActivitySelect />
					{address && (
						<LyraAccountContextProvider address={address}>
							<WalletBalance />
						</LyraAccountContextProvider>
					)}

					{activityType === ActivityType.Trade ? (
						<div>
							{strikes[0] ? (
								<>
									<MarketOrderContextProvider>
										<>
											<StrikeTrade />
											<div className="hidden sm:block p-4 border-t border-zinc-100 dark:border-zinc-800">
												<Chart />
											</div>
											<div className="sm:hidden p-4 border-t border-zinc-100 dark:border-zinc-800">
												<Chart height={200} />
											</div>
										</>
									</MarketOrderContextProvider>
								</>
							) : (
								<div className=" p-4">
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
					) : (
						<Positions />
					)}
				</div>
			</div>
		</div>
	);
};

export const ActivitySelect = () => {
	const { activityType, handleSelectActivityType } = useBuilderContext();

	return (
		<div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800">
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
		<div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800">
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

const BuilderSelect = () => {
	const { builderType, handleSelectBuilderType } = useBuilderContext();

	return (
		<div className="flex items-center gap-4 text-sm">
			<div
				onClick={() => handleSelectBuilderType(BuilderType.Builder)}
				className={`cursor-pointer font-mono hover:dark:text-white ${
					builderType === BuilderType.Builder
						? "dark:text-white font-semibold underline"
						: "dark:text-zinc-300"
				}`}
			>
				Builder
			</div>
			<div
				onClick={() => handleSelectBuilderType(BuilderType.Custom)}
				className={`cursor-pointer font-mono hover:dark:text-white ${
					builderType === BuilderType.Custom
						? "dark:text-white font-semibold underline"
						: "dark:text-zinc-300"
				}`}
			>
				Custom
			</div>
		</div>
	);
};
