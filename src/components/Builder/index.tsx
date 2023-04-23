import React from "react";
import { Chart } from "./Chart";
import { Market } from "./Market";
import { Strategy } from "./Strategy";
import { Strikes } from "./Strikes";

import { LyraAccountContextProvider } from "../../context/LyraAccountContext";
import { useBuilderContext } from "../../context/BuilderContext";
import { StrikeTrade } from "./StrikeTrade";
import { ActivityType, BuilderType } from "../../utils/types";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import { AccountPosition } from "../Account";

import { Spinner } from "../UI/Components/Spinner";
import { Position, usePositions } from "../../queries/otus/positions";
import { useAccount, useNetwork } from "wagmi";
import { fromBigNumber } from "../../utils/formatters/numbers";
import getExplorerUrl from "../../utils/chains/getExplorerUrl";
import { MarketOrderContextProvider } from "../../context/MarketOrderContext";

export const OptionsBuilder = () => {
	const { lyra, strikes, builderType, activityType } = useBuilderContext();

	return (
		<div className="grid sm:grid-cols-3 grid-cols-3 gap-8">
			<div className="col-span-3 sm:col-span-2">
				<div className="border border-zinc-800 rounded-lg shadow-md shadow-black">
					<div className="p-6">
						<Market />
					</div>

					<div className="border-b border-zinc-800">
						<div className="px-6 pt-2 pb-4">
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

				<div className="hidden sm:block border border-zinc-800 rounded-lg shadow-md shadow-black p-4 mt-6">
					<MarketOrderContextProvider>
						<Chart />
					</MarketOrderContextProvider>
				</div>
			</div>

			<div className="col-span-3 sm:col-span-1">
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

const Positions = () => {
	const { chain } = useNetwork();
	const { data } = usePositions();

	return (
		<table className="min-w-full  rounded-sm">
			<thead className="divide-b divide-zinc-900 bg-zinc-800"></thead>
			<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
				Position Id
			</th>

			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Status
			</th>

			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Open Date
			</th>

			<th scope="col" className="sr-only">
				Action
			</th>
			<tbody className="divide-y divide-zinc-900 bg-inherit">
				{data?.positions.map((position: Position, index: number) => {
					const { id, owner, state, openTimestamp, txHash } = position;
					const txHref = chain && txHash && getExplorerUrl(chain, txHash);
					return (
						<tr key={index}>
							<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
								{fromBigNumber(id, 0)}
							</td>

							<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
								{state === 0 ? "Open" : "Closed"}
							</td>

							<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
								{new Date(openTimestamp * 1000).toDateString()}
							</td>

							<td className="whitespace-nowrap py-4 text-xs font-medium text-zinc-200">
								<a target="_blank" rel="noreferrer" href={txHref}>
									View
								</a>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
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
				className={`cursor-pointer p-4 w-full text-center text-sm font-mono border-r border-zinc-800 
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
