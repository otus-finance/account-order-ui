import React, { useEffect, useState } from "react";
import {
	formatUSD,
	formatNumber,
	formatPercentage,
	fromBigNumber,
	toBN,
} from "../../../utils/formatters/numbers";
import { LyraStrike } from "../../../queries/lyra/useLyra";
import { BuilderType, OptionType } from "../../../utils/types";
import { motion, AnimatePresence } from "framer-motion";
import { calculateOptionType } from "../../../utils/formatters/optiontypes";
import { useBuilderContext } from "../../../context/BuilderContext";
import { SelectBuilderExpiration } from "../Strategy/SelectExpiration";
import { Spinner } from "../../UI/Components/Spinner";
import { CheckCircleIcon, CheckIcon, PlusCircleIcon, PlusIcon } from "@heroicons/react/24/solid";
import LyraIcon from "../../UI/Icons/Color/LYRA";

const style =
	"border-2 cursor-pointer text-white-700 rounded-full bg-zinc-900 text-center w-24 px-6 p-2 mr-1 text-sm font-light";

export const SelectStrikesTable = () => {
	const { builderType, strikes, handleToggleSelectedStrike } = useBuilderContext();

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
					quote: { isBuy, isCall },
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
			<div className="flex justify-between py-6 sm:w-40">
				<div className="flex justify-between">
					<div
						onClick={() => setIsBuy(true)}
						className={`${
							isBuy ? "border-emerald-600 bg-zinc-900" : "border-zinc-700 hover:border-zinc-700"
						} ${style}`}
					>
						Buy
					</div>
					<div
						onClick={() => setIsBuy(false)}
						className={`${
							!isBuy ? "border-emerald-600 bg-zinc-900" : "border-zinc-700 hover:border-zinc-700"
						} ${style}`}
					>
						Sell
					</div>
					<div
						onClick={() => setIsCall(true)}
						className={`${
							isCall ? "border-emerald-600 bg-zinc-900" : "border-zinc-700 hover:border-zinc-700"
						} ${style} ml-2`}
					>
						Call
					</div>
					<div
						onClick={() => setIsCall(false)}
						className={`${
							!isCall ? "border-emerald-600 bg-zinc-900" : "border-zinc-700 hover:border-zinc-700"
						} ${style}`}
					>
						Put
					</div>
				</div>

				<div className="flex">
					{builderType === BuilderType.Custom && <SelectBuilderExpiration />}
				</div>
			</div>

			<div className="mt-4">
				<table className="min-w-full divide-y divide-zinc-800">
					<thead className="bg-inherit  ">
						<tr>
							<th
								scope="col"
								className="py-3.5 pl-4 pr-3 text-left text-xs font-light uppercase text-white sm:pl-6"
							>
								Strike
							</th>
							<th
								scope="col"
								className="px-3 py-3.5 text-left text-xs font-light uppercase text-white"
							>
								IV
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
							>
								Vega
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
							>
								Theta
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
							>
								Delta
							</th>
							<th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
							>
								Gamma
							</th>
							{/* <th
								scope="col"
								className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
							>
								Size
							</th> */}
							<th
								scope="col"
								className="px-3 py-3.5 text-left text-xs font-light uppercase text-white flex "
							>
								Price <LyraIcon className="h-4 w-4 ml-2" />
							</th>
							{/* <th scope="col" className="relative py-3.5">
								<span className="sr-only">Price</span>
							</th> */}
						</tr>
					</thead>
					<tbody className="divide-y divide-zinc-800 bg-inherit">
						{availableStrikes &&
							availableStrikes.map((strike: LyraStrike) => {
								{
									/* @ts-ignore */
								}
								const { strikePrice, iv, vega, gamma, quote, id, isCall, selected } = strike;
								const { size, premium, isBuy, greeks, pricePerOption } = quote;

								const { delta, theta } = greeks;
								return (
									<tr key={strike.id}>
										<td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
											{formatUSD(fromBigNumber(strikePrice))}
										</td>
										<td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-200">
											{formatPercentage(fromBigNumber(iv))}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(vega), { maxDps: 2 })}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(theta), { maxDps: 2 })}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(delta), { maxDps: 2 })}
										</td>
										<td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
											{formatNumber(fromBigNumber(gamma), { maxDps: 4 })}
										</td>
										{/* <td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
											{fromBigNumber(size)}
										</td> */}
										{/* <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-200">
											{isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium)))}
										</td> */}
										<td className="whitespace-nowrap py-2   text-xs font-medium  flex px-3">
											{/* {
												!isToggleStrikeLoading ?
													selectedStrikeIds.filter((selected: SelectedStrike) => {
														if (selected.id == id) {
															return selected.isBuy == isBuy && selected.isCall == isCall;
														}
														return false;
													}).length > 0 ?  :
													<Spinner />
											} */}

											{selected ? (
												<a
													onClick={() => handleToggleSelectedStrike(strike, false)}
													className="cursor-pointer font-medium w-full rounded-full hover:opacity-80 bg-gradient-to-t from-emerald-700 to-emerald-500 "
												>
													<div className="flex justify-between ">
														<div className="border-r border-zinc-800 p-2">
															<CheckIcon className="h-5 w-5 ml-1 text-white " />
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
													className="cursor-pointer text-white font-medium w-full rounded-full bg-gradient-to-t from-black to-zinc-900 hover:opacity-80"
												>
													<div className="flex justify-between ">
														<div className="border-r border-zinc-800 p-2">
															<PlusIcon className="h-5 w-5 ml-1 text-white" />
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

const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
	return isBuy ? `(${usd})` : usd;
};
