import React, { useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { formatPercentage, formatUSD, fromBigNumber } from "../../../utils/formatters/numbers";
import { DebounceInput } from "react-debounce-input";
import { LyraStrike } from "../../../queries/lyra/useLyra";
import { useMarketOrderContext } from "../../../context/MarketOrderContext";
import { Spinner } from "../../UI/Components/Spinner";
import { CheckIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { formatExpirationDate } from "../../../utils/formatters/expiry";
import { MarketOrderActions, MarketSpreadOrder } from "./TradeMarket/MarketOrderActions";
import { isCreditOrDebit } from "../../../utils/formatters/message";
import { motion } from "framer-motion";
import { EditCollateral } from "./Edit/Collateral";
import { useLyraContext } from "../../../context/LyraContext";

export const StrikeTrade = () => {
	const { selectedStrategy } = useBuilderContext();
	const { validMaxPNL, loading, selectedStrikes, spreadSelected, updateMultiSize } =
		useMarketOrderContext();
	// const { validMaxLoss } = validMaxPNL;

	return (
		<div>
			<MarketSpreadOrder />

			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=" py-4 p-4">
				<div className="flex justify-between items-center">
					<div className="text-sm font-semibold dark:text-zinc-200 text-zinc-800">
						{selectedStrategy && selectedStrategy.name}
					</div>
					<div className="flex justify-between items-center">
						<div className="text-sm dark:text-zinc-200 text-zinc-800 pr-4 font-light">Size</div>
						<div>
							<DebounceInput
								debounceTimeout={300}
								minLength={1}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value);
									updateMultiSize?.(value);
								}}
								min={0.1}
								type="number"
								name="multiSize"
								id="multiSize"
								value={1}
								className={`w-24 border-2 text-right rounded-full dark:border-zinc-800 border-zinc-100 dark:bg-transparent p-2 dark:text-zinc-200 text-sm  pr-4 font-semibold text-zinc-800 focus:ring-emerald-400`}
							/>
						</div>
					</div>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="bg-zinc-100 dark:bg-zinc-800   overflow-x-scroll p-4 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto"
			>
				<table className="font-normal min-w-full divide-t dark:divide-zinc-800 divide-zinc-100 table-fixed">
					<thead className="dark:bg-inherit">
						<tr className=" ">
							<th
								scope="col"
								className="py-4 text-xs dark:text-zinc-400 text-left font-light px-4"
							></th>

							<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
								Strike
							</th>

							<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light  px-4">
								Price
							</th>
							<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
								Credit/(Debit)
							</th>
							{!spreadSelected && (
								<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
									Size
								</th>
							)}
							{!spreadSelected && (
								<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
									Collateral
								</th>
							)}
						</tr>
					</thead>
					<motion.tbody className=" divide-y dark:divide-zinc-800 divide-zinc-100 dark:bg-inherit">
						{loading && <Spinner />}
						{selectedStrikes.map((strike, index) => {
							return <StrikeTradeDetail strike={strike} key={index} index={index} />;
						})}
					</motion.tbody>
				</table>
			</motion.div>
			<MarketOrderActions />
		</div>
	);
};

const StrikeTradeDetail = ({ strike, index }: { strike: LyraStrike; index: number }) => {
	const { lyra } = useLyraContext();
	const { setActiveStrike } = useBuilderContext();
	const { updateSize, spreadSelected, validMaxPNL } = useMarketOrderContext();
	const { validMaxLoss } = validMaxPNL;

	const {
		quote,
		quote: { size, pricePerOption, isCall, isBuy, premium },
		strikePrice,
		isUpdating,
		expiryTimestamp,
		setCollateralTo,
	} = strike;

	const [optionPriceLoading, setOptionPriceLoading] = useState(false);

	useEffect(() => {
		setOptionPriceLoading(false);
	}, [size]);

	const [editCollateral, setEditCollateral] = useState(false);

	const handleConfirmCollateral = () => {
		setEditCollateral(false);
	};

	const [editPricing, setEditPricing] = useState(false);

	useEffect(() => {
		return () => {
			setEditPricing(false);
		};
	}, []);

	const [newSize, setNewSize] = useState(fromBigNumber(size));

	const handleNewSize = (_newSize: number) => {
		setNewSize(_newSize);
	};

	const handleConfirmSizeUpdate = () => {
		updateSize?.(strike, newSize);
		setEditPricing(false);
	};

	return (
		<>
			<motion.tr
				initial={{ opacity: 0 }}
				transition={{ type: "spring", stiffness: 300, damping: 24, duration: index * 250 }}
				animate={{ opacity: 1 }}
				className=" cursor-pointer "
				onMouseEnter={() => setActiveStrike({ strikeId: strike.id, isCall })}
				onMouseLeave={() => setActiveStrike({ strikeId: 0, isCall: false })}
			>
				<td className="text-xs font-normal  dark:text-zinc-300 text-zinc-700 px-4 py-2">
					<div className="text-left text-xs py-1">
						{expiryTimestamp && formatExpirationDate(expiryTimestamp)}
					</div>
					<div className="text-left text-xs py-1 flex">
						<div>
							{isBuy ? (
								<span className="text-emerald-500 font-normal rounded-lg">Buy</span>
							) : (
								<span className="text-pink-700 font-normal  rounded-lg">Sell</span>
							)}
						</div>
						<div>
							{isCall ? (
								<span className="border border-emerald-500 text-emerald-500 font-normal ml-1 p-1 rounded-lg">
									Call
								</span>
							) : (
								<span className="border border-pink-700 text-pink-700  font-normal  ml-1 p-1 rounded-lg">
									Put
								</span>
							)}
						</div>
					</div>
				</td>
				<td className="text-xs font-normal  dark:text-zinc-300 text-zinc-700  px-4">
					{formatUSD(strikePrice, { dps: 0 })}
				</td>

				<td className="text-xs font-normal  dark:text-zinc-300 text-zinc-700  px-4">
					{isUpdating ? (
						<Spinner size="small" />
					) : (
						formatUSD(fromBigNumber(pricePerOption), { dps: 2 })
					)}
				</td>

				<td className="text-xs font-normal  dark:text-zinc-300 text-zinc-700 px-4 ">
					{isUpdating ? (
						<Spinner size="small" />
					) : (
						isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium), { dps: 2 }))
					)}
				</td>

				{!spreadSelected && (
					<td className="text-xs font-normal  dark:text-zinc-300 text-zinc-700 px-4 ">
						{editPricing ? (
							<div className="flex gap-3 items-center">
								<DebounceInput
									minLength={1}
									onChange={async (e) => {
										if (e.target.value == "") return;
										const value = parseFloat(e.target.value);

										handleNewSize(value);
									}}
									min={0}
									type="number"
									name="size"
									id="size"
									value={newSize}
									className={`w-16 rounded-full py-1 border-2 border-zinc-200 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 text-right pr-2  ${
										isUpdating && "cursor-disabled"
									}`}
								/>

								<div>
									<XMarkIcon
										className=" h-4 w-4 text-rose-500"
										onClick={() => setEditPricing(false)}
									/>
								</div>

								<div>
									<CheckIcon
										className="h-4 w-4 text-emerald-500"
										onClick={() => handleConfirmSizeUpdate()}
									/>
								</div>
							</div>
						) : (
							<div className="flex gap-3 items-center">
								{fromBigNumber(size)}

								<PencilSquareIcon
									className="h-4 w-4 dark:text-zinc-500 text-zinc-400"
									onClick={() => {
										setEditPricing(true);
										setEditCollateral(false);
									}}
								/>
							</div>
						)}
					</td>
				)}

				{!spreadSelected && (
					<td className="text-xs font-normal  dark:text-zinc-300 text-zinc-700  px-4">
						{isBuy ? (
							"-"
						) : editCollateral ? (
							<div className="flex gap-3 items-center">
								<DebounceInput
									minLength={1}
									onChange={async (e) => {
										if (e.target.value == "") return;
										const value = parseFloat(e.target.value);

										// handleNewCollateralPercent(value);
									}}
									type="percent"
									name="setCollateralTo"
									id="setCollateralTo"
									min={0.4}
									max={1}
									value={fromBigNumber(setCollateralTo)}
									className={`w-16 rounded-full py-1 border-2 border-zinc-200 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 text-right pr-2  ${
										isUpdating && "cursor-disabled"
									}`}
								/>

								<div>
									<XMarkIcon
										className="h-4 w-4 text-rose-500"
										onClick={() => setEditCollateral(false)}
									/>
								</div>

								<div>
									<CheckIcon
										className="h-4 w-4 text-emerald-500"
										onClick={() => handleConfirmCollateral()}
									/>
								</div>
							</div>
						) : (
							<div className="flex gap-3 items-center">
								{setCollateralTo && formatUSD(fromBigNumber(setCollateralTo), { showSign: false })}{" "}
								USDC
								<PencilSquareIcon
									className="h-4 w-4 dark:text-zinc-500 text-zinc-400"
									onClick={() => {
										setEditCollateral(true);
										setEditPricing(false);
									}}
								/>
							</div>
						)}
					</td>
				)}
			</motion.tr>

			{editCollateral && (
				<td colSpan={6}>
					<EditCollateral lyra={lyra} quote={quote} />
				</td>
			)}
		</>
	);
};
