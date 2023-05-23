import React, { useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import {
	formatPercentage,
	formatUSD,
	fromBigNumber,
	toBN,
} from "../../../utils/formatters/numbers";
import { formatName } from "../Market/SelectMarket";
import { DebounceInput } from "react-debounce-input";
import { WalletBalance } from "./Balance";
import { LyraStrike, getStrikeQuote } from "../../../queries/lyra/useLyra";
import { useMarketOrderContext } from "../../../context/MarketOrderContext";
import { Spinner } from "../../UI/Components/Spinner";
import { CheckIcon, PencilIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { formatBoardName, formatExpirationDate } from "../../../utils/formatters/expiry";
import { TradeMarket } from "./TradeMarket";
import { MarketOrderActions } from "./TradeMarket/MarketOrderActions";
import { BuilderType } from "../../../utils/types";
import { isCreditOrDebit } from "../../../utils/formatters/message";
import { Variants, motion } from "framer-motion";

export const StrikeTrade = () => {
	const { selectedMarket, builderType, builderTypeClean, selectedStrategy, strikes } =
		useBuilderContext();
	const { loading, selectedStrikes, spreadSelected, updateMultiSize } = useMarketOrderContext();

	return (
		<div className=" border-t border-zinc-100 dark:border-zinc-800">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="border-b dark:border-zinc-800 border-zinc-100 py-4 p-4"
			>
				{builderType == BuilderType.Builder && builderTypeClean ? (
					<div className="flex justify-between items-center">
						<div className="text-sm font-semibold  dark:text-emerald-100 text-emerald-400">
							{selectedStrategy && selectedStrategy.name}
						</div>
						<div className="flex justify-between items-center">
							<div className="text-sm dark:text-zinc-200 atext-zinc-800 pr-4 font-light">Size</div>
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
									className={`w-24 border-2 text-right rounded-full dark:border-zinc-800 border-zinc-100 dark:bg-transparent p-2 dark:text-zinc-200 text-sm ring-emerald-600 pr-4 font-semibold text-zinc-800 `}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="text-sm font-semibold dark:text-emerald-100">Custom</div>
				)}
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="overflow-x-scroll pb-3 sm:pb-0 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto"
			>
				<table className="font-normal min-w-full divide-y dark:divide-zinc-800 divide-zinc-100 table-fixed">
					<thead className="dark:bg-inherit">
						<tr className=" ">
							<th
								scope="col"
								className="py-2 text-xs dark:text-zinc-400 text-left font-light px-4"
							></th>

							<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
								Strike
							</th>
							{!spreadSelected && (
								<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
									Collateral
								</th>
							)}

							<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light  px-4">
								Price
							</th>
							<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
								Credit/(Debit)
							</th>
							{!builderTypeClean && (
								<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
									Size
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
	const { setActiveStrike, builderType, builderTypeClean } = useBuilderContext();
	const { updateSize, updateCollateralPercent, spreadSelected } = useMarketOrderContext();

	const {
		quote: { size, pricePerOption, isCall, isBuy, premium },
		strikePrice,
		isUpdating,
		expiryTimestamp,
		collateralPercent,
	} = strike;

	const [optionPriceLoading, setOptionPriceLoading] = useState(false);

	useEffect(() => {
		setOptionPriceLoading(false);
	}, [size]);

	const [editCollateral, setEditCollateral] = useState(false);

	const [newCollateralPercent, setNewCollateralPercent] = useState(1);

	const handleNewCollateralPercent = (_collateralPercent: number) => {
		if (_collateralPercent > 1 || _collateralPercent < 0.4) return;
		setNewCollateralPercent(_collateralPercent);
	};

	const handleConfirmCollateral = () => {
		updateCollateralPercent?.(strike, newCollateralPercent);
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
				className="dark:bg-inherit hover:dark:bg-zinc-900 hover:bg-zinc-100 cursor-pointer"
				onMouseEnter={() => setActiveStrike({ strikeId: strike.id, isCall })}
				onMouseLeave={() => setActiveStrike({ strikeId: 0, isCall: false })}
			>
				<td className="text-sm font-normal  dark:text-zinc-300 text-zinc-700 px-4 py-2">
					<div className="text-left py-1">
						{expiryTimestamp && formatExpirationDate(expiryTimestamp)}
					</div>
					<div className="text-left py-1 flex">
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
				<td className="text-sm font-normal  dark:text-zinc-300 text-zinc-700  px-4">
					{formatUSD(strikePrice, { dps: 0 })}
				</td>

				{!spreadSelected && (
					<td className="text-sm font-normal  dark:text-zinc-300 text-zinc-700  px-4">
						{isBuy ? (
							"-"
						) : editCollateral ? (
							<div className="flex gap-3 items-center">
								<DebounceInput
									minLength={1}
									onChange={async (e) => {
										if (e.target.value == "") return;
										const value = parseFloat(e.target.value);

										handleNewCollateralPercent(value);
									}}
									type="percent"
									name="collateralPercent"
									id="collateralPercent"
									min={0.4}
									max={1}
									value={collateralPercent}
									className={`w-16 rounded-full border-2 border-zinc-200 dark:bg-transparent dark:text-zinc-200 text-right pr-2  ${
										isUpdating && "cursor-disabled"
									}`}
								/>

								<div>
									<XMarkIcon
										className="h-4 w-4 dark:text-rose-500"
										onClick={() => setEditCollateral(false)}
									/>
								</div>

								<div>
									<CheckIcon
										className="h-4 w-4 dark:text-emerald-500"
										onClick={() => handleConfirmCollateral()}
									/>
								</div>
							</div>
						) : (
							<div className="flex gap-3 items-center">
								{collateralPercent && formatPercentage(collateralPercent, true)}

								<PencilSquareIcon
									className="h-4 w-4 dark:text-zinc-500 text-zinc-400"
									onClick={() => setEditCollateral(true)}
								/>
							</div>
						)}
					</td>
				)}

				<td className="text-sm font-normal  dark:text-zinc-300 text-zinc-700  px-4">
					{isUpdating ? (
						<Spinner size="small" />
					) : (
						formatUSD(fromBigNumber(pricePerOption), { dps: 2 })
					)}
				</td>

				<td className="text-sm font-normal  dark:text-zinc-300 text-zinc-700 px-4 ">
					{isUpdating ? (
						<Spinner size="small" />
					) : (
						isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium), { dps: 2 }))
					)}
				</td>
				{!builderTypeClean && (
					<td className="text-sm font-normal  dark:text-zinc-300 text-zinc-700 px-4">
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
									className={`w-12 border-2 border-emerald-600 dark:bg-transparent p-1  dark:text-zinc-200 shadow-md dark:shadow-black shadow-zinc-200 text-xs ${
										isUpdating && "cursor-disabled"
									}`}
								/>

								<div>
									<XMarkIcon
										className=" h-4 w-4 dark:text-rose-500"
										onClick={() => setEditPricing(false)}
									/>
								</div>

								<div>
									<CheckIcon
										className="h-4 w-4 dark:text-emerald-500"
										onClick={() => handleConfirmSizeUpdate()}
									/>
								</div>
							</div>
						) : (
							<div className="flex gap-3 items-center">
								{fromBigNumber(size)}

								<PencilSquareIcon
									className="h-4 w-4 dark:text-zinc-500 text-zinc-400"
									onClick={() => setEditPricing(true)}
								/>
							</div>
						)}
					</td>
				)}
			</motion.tr>
			{editCollateral && (
				<td colSpan={6}>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="p-4 dark:bg-zinc-800 bg-zinc-100"
					>
						<label
							htmlFor="default-range"
							className="block mb-2 text-sm font-medium text-zinc-900 dark:text-white"
						>
							Collateral
						</label>
						<input
							id="default-range"
							type="range"
							value="50"
							className=" w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
						/>
						<div className="flex justify-between">
							<div>Min</div>
							<div>Max</div>
						</div>
					</motion.div>
				</td>
			)}
		</>
	);
};
