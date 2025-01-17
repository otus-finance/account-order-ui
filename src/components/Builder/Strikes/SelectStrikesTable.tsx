import React, { useEffect, useState } from "react";
import {
	formatUSD,
	formatNumber,
	formatPercentage,
	fromBigNumber,
	toBN,
} from "../../../utils/formatters/numbers";
import { LyraStrike } from "../../../queries/lyra/useLyra";
import { OptionType } from "../../../utils/types";
import { calculateOptionType } from "../../../utils/formatters/optiontypes";
import { useBuilderContext } from "../../../context/BuilderContext";
import { SelectBuilderExpiration } from "../Strategy/SelectExpiration";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/solid";
import LyraIcon from "../../UI/Icons/Color/LYRA";

const style =
	"cursor-pointer dark:text-zinc-200 rounded-full dark:inherit text-center sm:w-24 sm:px-6 w-16 p-2 mr-1 text-xs font-semibold";

export const SelectStrikesTable = () => {
	const { strikes, handleToggleSelectedStrike } = useBuilderContext();

	const [availableStrikes, setAvailableStrikes] = useState<LyraStrike[] | undefined>([]);

	const [isBuy, setIsBuy] = useState(false);
	const [isCall, setIsCall] = useState(false);
	const [optionType, setOptionType] = useState<OptionType>(0);

	useEffect(() => {
		setOptionType(calculateOptionType(isBuy, isCall));
	}, [isBuy, isCall, optionType]);

	useEffect(() => {
		setAvailableStrikes(
			strikes.filter((strike: LyraStrike) => {
				const {
					quote: { isBuy, isCall, fee },
				} = strike;
				const _optionType = calculateOptionType(isBuy, isCall);
				if (optionType == _optionType) {
					return true;
				} else {
					return false;
				}
			})
		);
	}, [strikes, optionType]);

	return (
		<div className="flex flex-col">
			<div className="flex flex-col lg:flex-row sm:justify-between p-4 my-auto">
				<div className="flex items-center sm:basis-1/2">
					<div
						onClick={() => setIsBuy(true)}
						className={`${
							isBuy
								? "bg-zinc-100 dark:bg-zinc-800"
								: "bg-inherit dark:bg-inherit hover:bg-zinc-100 dark:hover:bg-zinc-800"
						} ${style}`}
					>
						Buy
					</div>
					<div
						onClick={() => setIsBuy(false)}
						className={`${
							!isBuy
								? "bg-zinc-100 dark:bg-zinc-800"
								: "bg-inherit dark:bg-inherit hover:bg-zinc-100 dark:hover:bg-zinc-800"
						} ${style}`}
					>
						Sell
					</div>
					<div
						onClick={() => setIsCall(true)}
						className={`${
							isCall
								? "bg-zinc-100 dark:bg-zinc-800"
								: "bg-inherit dark:bg-inherit hover:bg-zinc-100 dark:hover:bg-zinc-800"
						} ${style} ml-2`}
					>
						Call
					</div>
					<div
						onClick={() => setIsCall(false)}
						className={`${
							!isCall
								? "bg-zinc-100 dark:bg-zinc-800"
								: "bg-inherit dark:bg-inherit hover:bg-zinc-100 dark:hover:bg-zinc-800"
						} ${style}`}
					>
						Put
					</div>
				</div>

				<div className="hidden lg:flex py-2 items-center sm:basis-1/2">
					<SelectBuilderExpiration />
				</div>
			</div>

			<div className="overflow-x-scroll pb-3 sm:pb-0 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto">
				<table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
					<thead className="dark:bg-inherit  ">
						<tr>
							<th
								scope="col"
								className="py-3.5 pl-4 pr-3 text-left text-xs font-light uppercase dark:text-white sm:pl-6"
							>
								Strike
							</th>
							<th
								scope="col"
								className="px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white"
							>
								IV
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white sm:table-cell"
							>
								Vega
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white sm:table-cell"
							>
								Theta
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white sm:table-cell"
							>
								Delta
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white sm:table-cell"
							>
								Gamma
							</th>
							{/* <th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white sm:table-cell"
							>
								Size
							</th> */}
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white sm:table-cell "
							>
								Fee
							</th>
							<th
								scope="col"
								className="px-3 py-3.5 text-left text-xs font-light uppercase dark:text-white flex "
							>
								Price <LyraIcon className="h-4 w-4 ml-2" />
							</th>

							{/* <th scope="col" className="relative py-3.5">
								<span className="sr-only">Price</span>
							</th> */}
						</tr>
					</thead>
					<tbody className="divide-y dark:divide-zinc-800 divide-zinc-100 dark:bg-inherit">
						{availableStrikes &&
							availableStrikes.map((strike: LyraStrike) => {
								{
									/* @ts-ignore */
								}
								const { strikePrice, iv, vega, gamma, quote, selected } = strike;
								const { greeks, fee, pricePerOption } = quote;

								const { delta, theta } = greeks;
								return (
									<tr key={strike.id}>
										<td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-medium dark:text-zinc-200 sm:pl-6">
											{formatUSD(fromBigNumber(strikePrice))}
										</td>
										<td className="whitespace-nowrap px-3 py-2 text-xs dark:text-zinc-200">
											{formatPercentage(fromBigNumber(iv))}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs dark:text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(vega), { maxDps: 2 })}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs dark:text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(theta), { maxDps: 2 })}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs dark:text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(delta), { maxDps: 2 })}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs dark:text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(gamma), { maxDps: 4 })}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs dark:text-zinc-200 sm:table-cell">
											{formatUSD(fromBigNumber(fee), { maxDps: 2 })}
										</td>
										<td className="whitespace-nowrap py-2 text-xs font-medium flex px-3">
											{selected ? (
												<a
													onClick={() => handleToggleSelectedStrike(strike, false)}
													className="cursor-pointer font-medium w-full rounded-full hover:opacity-80 bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-400 to-emerald-300"
												>
													<div className="flex justify-between ">
														<div className="border-r dark:border-zinc-800 border-zinc-100 p-2">
															<CheckIcon className="h-5 w-5 ml-1 dark:text-white " />
														</div>
														<div className="p-2 text-sm font-normal ">
															<div className="text-center">
																{formatUSD(fromBigNumber(pricePerOption), { dps: 2 })}
															</div>
														</div>
													</div>
												</a>
											) : (
												<a
													onClick={() => handleToggleSelectedStrike(strike, true)}
													className="cursor-pointer text-zinc-900 dark:text-white font-medium w-full rounded-full bg-gradient-to-t dark:from-black dark:to-zinc-900 from-zinc-200 to-zinc-100 hover:opacity-80"
												>
													<div className="flex justify-between ">
														<div className="border-r dark:border-zinc-800 border-zinc-100 p-2">
															<PlusIcon className="h-5 w-5 ml-1 dark:text-white" />
														</div>
														<div className="p-2 text-sm font-normal ">
															<div className="text-center">
																{formatUSD(fromBigNumber(pricePerOption), { dps: 2 })}
															</div>
														</div>
													</div>
												</a>
											)}
										</td>
									</tr>
								);
							})}
					</tbody>
				</table>
			</div>
		</div>
	);
};
