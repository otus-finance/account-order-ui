import React, { useEffect, useState } from "react";
import { formatUSD, formatPercentage, fromBigNumber } from "../../../utils/formatters/numbers";
import { LyraStrike } from "../../../queries/lyra/useLyra";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useBuilderContext } from "../../../context/BuilderContext";
import { Spinner } from "../../UI/Components/Spinner";

export const StrikesTable = () => {
	const { activeStrike, selectedChain, strikes, handleToggleSelectedStrike } = useBuilderContext();

	return (
		<table className="min-w-full divide-y divide-zinc-700 rounded-sm">
			<thead className="bg-zinc-800">
				<tr>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
						<span className="sr-only">Remove</span>
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
						<span className="sr-only">Option Type</span>
					</th>
					<th
						scope="col"
						className="py-3.5 pl-4 pr-3 text-left text-xs font-light uppercase text-white sm:pl-6"
					>
						Strike
					</th>
					<th
						scope="col"
						className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
					>
						IV
					</th>
					<th scope="col" className="px-3 py-3.5 text-left text-xs font-light uppercase text-white">
						Price
					</th>
				</tr>
			</thead>
			<tbody className="divide-y divide-zinc-700 bg-zinc-800">
				<AnimatePresence>
					{strikes.map((strike: LyraStrike, index: number) => {
						{
							/* @ts-ignore */
						}
						return (
							<StrikeRow
								activeStrike={activeStrike}
								key={index}
								strike={strike}
								index={index}
								selectedChain={selectedChain}
								handleToggleSelectedStrike={handleToggleSelectedStrike}
							/>
						);
					})}
				</AnimatePresence>
			</tbody>
		</table>
	);
};

const StrikeRow = ({
	activeStrike,
	strike,
	index,
	selectedChain,
	handleToggleSelectedStrike,
}: {
	activeStrike: { strikeId: number; isCall: boolean };
	strike: LyraStrike;
	index: number;
	selectedChain: any;
	handleToggleSelectedStrike: any;
}) => {
	const { strikePrice, iv, quote, id, isCall, market, expiryTimestamp } = strike;
	const { size, premium, pricePerOption, isBuy } = quote;

	const [optionPriceLoading, setOptionPriceLoading] = useState(true);

	useEffect(() => {
		if (pricePerOption || premium) {
			setOptionPriceLoading(false);
		}
	}, [pricePerOption, premium]);

	return (
		<motion.tr
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			key={`ss${id}-${index}`}
			className={`${activeStrike.strikeId == id && activeStrike.isCall == isCall && "bg-zinc-900"}`}
		>
			<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
				<XMarkIcon
					onClick={() => handleToggleSelectedStrike(strike, false)}
					className="cursor-pointer block h-4 w-4 font-bold text-pink-700 rounded-2xl"
					aria-hidden="true"
				/>
			</td>
			<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
				{isBuy ? (
					<span className="text-zinc-100 font-light p-1">Buy</span>
				) : (
					<span className="text-zinc-100 font-light p-1">Sell</span>
				)}
				{isCall ? (
					<span className="text-emerald-600 font-light p-1 block">Call</span>
				) : (
					<span className="text-pink-700 font-light p-1 block">Put</span>
				)}
			</td>
			<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
				{formatUSD(fromBigNumber(strikePrice))}
			</td>
			<td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
				{formatPercentage(fromBigNumber(iv))}
			</td>
			<td className="whitespace-nowrap py-4 pl-3 pr-4 text-center text-xs font-medium sm:pr-6 flex">
				<a
					target="_blank"
					rel="noreferrer"
					href={`https://app.lyra.finance/#/trade/${
						selectedChain?.name
					}/${market.toLowerCase()}?expiry=${expiryTimestamp}`}
					className="text-white font-medium w-full rounded-full p-2 inline border-2 border-emerald-600 hover:border-emerald-600 hover:bg-zinc-800 bg-zinc-800"
				>
					<span className="content-center">
						{optionPriceLoading ? (
							<Spinner size={"small"} />
						) : (
							formatUSD(fromBigNumber(pricePerOption), { dps: 2 })
						)}
					</span>
				</a>
			</td>
		</motion.tr>
	);
};
