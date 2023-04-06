import React from "react";
import { MarketOrderActions } from "./MarketOrderActions";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { formatUSD } from "../../../../utils/formatters/numbers";

export const TradeMarket = () => {
	const { maxLossPost, fee, maxCost, maxPremium, maxLoss, validMaxLoss } = useBuilderContext();

	return (
		<div className="border-t border-zinc-800 bg-zinc-900 p-4 py-4">
			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-light text-white">Max Loss</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex text-rose-400 font-sans text-sm font-semibold leading-5">
						{formatUSD(maxLoss, { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-light text-white">Max Cost</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
						{formatUSD(maxCost, { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-light text-white">Premium</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
						{formatUSD(maxPremium, { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-light text-white">Spread Fee</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
						{formatUSD(fee, { dps: 2 })}
					</span>
				</div>
			</div>

			{validMaxLoss ? (
				<div className="border-t border-zinc-800 flex items-center justify-between py-4 ">
					<p className="truncate font-sans text-sm font-semibold bg-emerald-400 p-1 rounded-md">
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
					<p className="truncate font-sans text-sm font-light text-white">Collateral Required</p>
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
