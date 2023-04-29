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

export const OptionsBuilder = () => {
	const { lyra, strikes, builderType, activityType } = useBuilderContext();

	return (
		<div className="grid sm:grid-cols-2 grid-cols-2 gap-8">
			<div className="col-span-2 lg:col-span-1">
				<div className="sm:border border-zinc-800 sm:rounded-lg shadow-md shadow-black">
					<div className="p-4">
						<Market />
					</div>

					<div className="border-b border-zinc-800">
						<div className="px-4 pt-2 pb-4">
							<BuilderSelect />
						</div>
					</div>

					{builderType === BuilderType.Builder && (
						<div className="border-b border-zinc-800">
							<Strategy />
						</div>
					)}

					<div>
						<Strikes />
					</div>
				</div>
			</div>

			<div className="col-span-2 lg:col-span-1">
				<div className="border border-zinc-800 rounded-lg shadow-md shadow-black">
					<ActivitySelect />
					{activityType === ActivityType.Trade ? (
						<div>
							{lyra && strikes[0] ? (
								<>
									<LyraAccountContextProvider lyra={lyra}>
										<MarketOrderContextProvider>
											<>
												<StrikeTrade />
												<div className="hidden sm:block p-4 border-t border-zinc-900">
													<Chart />
												</div>
												<div className="sm:hidden p-4 border-t border-zinc-900">
													<Chart height={200} />
												</div>
											</>
										</MarketOrderContextProvider>
									</LyraAccountContextProvider>
								</>
							) : (
								<div className=" p-4">
									<div className="flex items-center p-2">
										<p className="truncate font-sans text-xs font-normal text-white">
											<ArrowLeftCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
										</p>
										<div className="ml-2 flex flex-shrink-0">
											<p className="inline-flex font-mono text-sm font-normal leading-5 text-white">
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

const ActivitySelect = () => {
	const { activityType, handleSelectActivityType } = useBuilderContext();

	return (
		<div className="flex justify-between border-b border-zinc-800">
			<div
				onClick={() => handleSelectActivityType(ActivityType.Trade)}
				className={`cursor-pointer p-4 w-full text-center text-sm font-mono border-r border-zinc-800 
		${activityType === ActivityType.Trade ? "text-white underline font-semibold" : "text-zinc-300"}`}
			>
				Trade
			</div>
			<div
				onClick={() => handleSelectActivityType(ActivityType.Position)}
				className={`cursor-pointer p-4 w-full text-center text-sm font-mono 
		${activityType === ActivityType.Position ? "text-white underline font-semibold" : "text-zinc-300"}`}
			>
				Positions
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
				className={`cursor-pointer font-mono hover:text-white ${
					builderType === BuilderType.Builder
						? "text-white font-semibold underline"
						: "text-zinc-300"
				}`}
			>
				Builder
			</div>
			<div
				onClick={() => handleSelectBuilderType(BuilderType.Custom)}
				className={`cursor-pointer font-mono hover:text-white ${
					builderType === BuilderType.Custom
						? "text-white font-semibold underline"
						: "text-zinc-300"
				}`}
			>
				Custom
			</div>
		</div>
	);
};
