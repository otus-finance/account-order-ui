import React from "react";
import { motion } from "framer-motion";

import { useMarketOrderContext } from "../../../../context/MarketOrderContext";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { formatPercentage, formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import { Switch } from "@headlessui/react";
import { MarketOrderInfo } from "./Actions/MarketOrderInfo";
import { OTUS_FEE } from "../../../../constants/markets";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export const MarketOrderActions = () => {
	const { isValid } = useBuilderContext();

	const { otusFee, totalCollateral, trades, validMaxPNL, spreadSelected, setSpreadSelected } =
		useMarketOrderContext();
	const { maxLossPost, maxCost, maxPremium, maxLoss, maxProfit, validMaxLoss } = validMaxPNL;

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
				<div className="flex items-center justify-between py-2">
					<p className="truncate font-sans text-sm font-normal text-zinc-800 dark:text-zinc-200">
						Max Cost
					</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
							{formatUSD(fromBigNumber(maxCost), { dps: 2 })}
						</span>
					</div>
				</div>

				<div className="flex items-center justify-between py-2">
					<p className="truncate font-sans text-sm font-normal text-zinc-800 dark:text-zinc-200">
						Min Received
					</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold leading-5 dark:text-white">
							{formatUSD(fromBigNumber(maxPremium), { dps: 2 })}
						</span>
					</div>
				</div>

				<>
					{/* <div className="flex items-center justify-between py-2 pb-4">
					<p className="truncate font-sans  text-sm font-normal dark:text-zinc-300">
						Otus Fee ({formatPercentage(OTUS_FEE, true)} x Collateral x (Duration / 365 Days))
					</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
							{validMaxLoss && spreadSelected
								? formatUSD(otusFee, { dps: 2 })
								: formatUSD(0, { dps: 2 })}
						</span>
					</div>
				</div> */}
					<div className="flex items-center justify-between py-2">
						<p className="truncate font-sans font-normal text-zinc-800 dark:text-zinc-200 text-sm">
							Total Collateral Required
						</p>
						<div className="ml-2 flex flex-shrink-0">
							<span className="inline-flex font-sans text-sm font-semibold leading-5 dark:text-white">
								{validMaxLoss && spreadSelected
									? formatUSD(0, { dps: 2 })
									: formatUSD(totalCollateral, { dps: 2 })}
							</span>
						</div>
					</div>

					{maxLossPost < 0 ? (
						<div className="flex items-center justify-between py-2">
							<p className="truncate font-sans font-normal bg-zinc-900 text-white dark:bg-zinc-800 text-sm p-1 px-2 rounded-full">
								Total Received
							</p>
							<div className="ml-2 flex flex-shrink-0">
								<span className="inline-flex font-sans text-sm font-semibold leading-5 rounded-md  dark:text-white">
									{maxLossPost != Infinity
										? formatUSD(Math.abs(maxLossPost), { dps: 2 })
										: maxLossPost}
								</span>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between py-2">
							<p className="truncate font-sans font-normal bg-zinc-900 text-white dark:bg-zinc-800 text-sm p-1 px-2 rounded-full">
								Total Cost
							</p>
							<div className="ml-2 flex flex-shrink-0">
								<span className="inline-flex font-sans text-sm font-semibold leading-5 rounded-md  dark:text-white">
									{maxLossPost != Infinity ? formatUSD(maxLossPost, { dps: 2 }) : maxLossPost}
								</span>
							</div>
						</div>
					)}
				</>

				<MarketOrderInfo />
			</motion.div>
		</>
	);
};

export const MaxPnl = () => {
	const { validMaxPNL, setSpreadSelected } = useMarketOrderContext();
	const { maxLoss, maxProfit } = validMaxPNL;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="border-t dark:border-zinc-800 border-zinc-100 p-4"
		>
			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-normal dark:text-zinc-200">Max Loss</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex dark:text-rose-400 font-sans text-sm font-semibold leading-5">
						{maxLoss != Infinity && maxLoss != -Infinity
							? formatUSD(Math.abs(maxLoss), { dps: 2 })
							: Infinity}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-normal dark:text-zinc-200">Max Profit</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex dark:text-emerald-400 font-sans text-sm font-semibold leading-5">
						{maxProfit < 500000 ? formatUSD(maxProfit, { dps: 2 }) : Infinity}
					</span>
				</div>
			</div>
		</motion.div>
	);
};

export const MarketSpreadOrder = () => {
	const { validMaxPNL, spreadSelected, setSpreadSelected } = useMarketOrderContext();
	const { validMaxLoss } = validMaxPNL;

	return (
		validMaxLoss && (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 p-4">
				<Switch.Group as="div" className="flex items-center justify-between">
					<span className="flex flex-grow flex-col">
						<Switch.Label
							as="span"
							className="text-sm font-medium leading-6 dark:text-zinc-200"
							passive
						>
							Post Max Loss Only
						</Switch.Label>
						<Switch.Description as="span" className="text-xs dark:text-zinc-400">
							|Trade valid spreads through Otus to post max loss only.
						</Switch.Description>
					</span>
					<Switch
						disabled={!validMaxLoss}
						checked={spreadSelected}
						onChange={setSpreadSelected}
						className={classNames(
							spreadSelected ? "bg-emerald-500" : "bg-zinc-800",
							`${
								validMaxLoss ? "cursor-pointer" : "cursor-not-allowed"
							} relative inline-flex h-6 w-11 flex-shrink-0  rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2`
						)}
					>
						<span
							aria-hidden="true"
							className={classNames(
								spreadSelected ? "translate-x-5" : "translate-x-0",
								"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-200 shadow ring-0 transition duration-200 ease-in-out"
							)}
						/>
					</Switch>
				</Switch.Group>
			</motion.div>
		)
	);
};
