import React from "react";
import { Chart } from "./Chart";
import { Market } from "./Market";
import { Strategy } from "./Strategy";
import { Strikes } from "./Strikes";

import { LyraAccountContextProvider } from "../../context/LyraAccountContext";
import { useBuilderContext } from "../../context/BuilderContext";
import { StrikeTrade } from "./StrikeTrade";
import { BuilderType } from "../../utils/types";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import { AccountPosition } from "../Account";
import { useAccount } from "wagmi";
import { AccountOrderActions } from "../Account/AccountOrderActions";
import { Spinner } from "../UI/Components/Spinner";

export const OptionsBuilder = () => {
	const { lyra, strikes, builderType, isMarketLoading, isValid } = useBuilderContext();

	return isMarketLoading ? (
		<Spinner />
	) : (
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

				<div className="hidden sm:block">
					<AccountPosition />
				</div>
			</div>

			<div className="col-span-3 sm:col-span-1">
				<div className="border border-zinc-800 rounded-lg shadow-md shadow-black">
					{lyra && strikes[0] ? (
						<>
							<LyraAccountContextProvider lyra={lyra} strike={strikes[0]}>
								<StrikeTrade />
							</LyraAccountContextProvider>

							<div className="p-4 border-t border-zinc-800">
								<Chart />
							</div>
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

							<div className="flex items-center p-2">
								{!isValid && (
									<p className="font-mono text-sm font-normal leading-5 text-white">
										Strikes for strategy not available for selected assets or expiry.
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="col-span-3 sm:hidden">
				<AccountPosition />
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
				className={`cursor-pointer hover:text-white ${
					builderType === BuilderType.Builder ? "text-white underline" : "text-zinc-300"
				}`}
			>
				Builder
			</div>
			<div
				onClick={() => handleSelectBuilderType(BuilderType.Custom)}
				className={`cursor-pointer hover:text-white ${
					builderType === BuilderType.Custom ? "text-white underline" : "text-zinc-300"
				}`}
			>
				Custom
			</div>
		</div>
	);
};
