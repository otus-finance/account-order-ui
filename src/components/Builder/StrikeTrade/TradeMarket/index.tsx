import React from "react";
import { MarketOrderActions } from "./MarketOrderActions";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { formatUSD } from "../../../../utils/formatters/numbers";

export const TradeMarket = () => {
	const { maxLossPost, fee, maxCost, maxPremium, maxLoss, validMaxLoss } = useBuilderContext();

	return (
		<div className="border-t border-zinc-800 bg-zinc-900 p-4 py-2 pt-6">
			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-normal text-zinc-300">Max Loss</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex text-rose-400 font-sans text-sm font-semibold leading-5">
						{formatUSD(maxLoss, { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between py-2">
				<p className="truncate font-sans text-sm font-normal text-zinc-300">Max Cost</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
						{formatUSD(maxCost, { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between py-2">
				<p className="truncate font-sans text-sm font-normal text-zinc-300">Premium</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
						{formatUSD(maxPremium, { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between py-2 pb-4">
				<p className="truncate font-sans text-sm font-normal text-zinc-300">Spread Fee</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
						{formatUSD(fee, { dps: 2 })}
					</span>
				</div>
			</div>

			{validMaxLoss ? (
				<div className="border-t border-zinc-800 flex items-center justify-between py-4 ">
					<p className="truncate font-sans font-semibold text-zinc-100 text-sm bg-gradient-to-t from-emerald-700 to-emerald-500 p-1 px-2 rounded-full">
						Post Max Loss
					</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold leading-5 rounded-md  text-white">
							{formatUSD(maxLossPost, { dps: 2 })}
						</span>
					</div>
				</div>
			) : (
				<div className="flex items-center justify-between py-2">
					<p className="truncate font-sans text-sm font-normal text-zinc-300">
						Collateral Required
					</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
							{formatUSD(maxLoss, { dps: 2 })}
						</span>
					</div>
				</div>
			)}

			<MarketOrderActions />
		</div>
	);
};
