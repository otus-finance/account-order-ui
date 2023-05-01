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
import { WalletBalance } from "./TradeSelect";
import { LyraStrike, getStrikeQuote } from "../../../queries/lyra/useLyra";
import { useMarketOrderContext } from "../../../context/MarketOrderContext";
import { Spinner } from "../../UI/Components/Spinner";
import { CheckIcon, PencilIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { formatBoardName, formatExpirationDate } from "../../../utils/formatters/expiry";
import { TradeMarket } from "./TradeMarket";
import { MarketOrderActions } from "./TradeMarket/MarketOrderActions";
import { BuilderType } from "../../../utils/types";

export const StrikeTrade = () => {
	const { selectedMarket, builderType, builderTypeClean, selectedStrategy, strikes } =
		useBuilderContext();
	const { loading, selectedStrikes, spreadSelected, updateMultiSize } = useMarketOrderContext();

	return (
		<>
			{selectedMarket && strikes.length > 0 && (
				<>
					{/* strikes summary  */}
					<WalletBalance />

					<div className="border-b dark:border-zinc-800 py-4 p-4">
						{builderType == BuilderType.Builder && builderTypeClean ? (
							<div className="flex justify-between items-center">
								<div className="text-sm font-semibold font-mono dark:text-emerald-100">
									{selectedStrategy && selectedStrategy.name}
								</div>
								<div className="flex justify-between items-center">
									<div className="text-sm font-normal font-mono dark:text-zinc-200 pr-4">Size</div>
									<div>
										<DebounceInput
											debounceTimeout={300}
											minLength={1}
											onChange={async (e) => {
												if (e.target.value == "") return;
												const value = parseFloat(e.target.value);
												// setMultiSize(value);
												updateMultiSize?.(value);
											}}
											min={0.1}
											step={0.1}
											type="number"
											name="multiSize"
											id="multiSize"
											value={1}
											className={`w-24 border dark:border-zinc-800 dark:bg-transparent p-2  dark:text-zinc-200 shadow-lg text-sm ring-emerald-600`}
										/>
									</div>
								</div>
							</div>
						) : (
							<div className="text-sm font-semibold font-mono dark:text-emerald-100">Custom</div>
						)}
					</div>

					<div className="overflow-x-scroll pb-3 sm:pb-0 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto">
						<table className="  font-semibold min-w-full divide-y dark:divide-zinc-800 divide-zinc-300 table-fixed">
							<thead className="dark:bg-inherit ">
								<tr className="font-mono ">
									<th scope="col" className="py-2 text-xs dark:text-zinc-400 text-left  px-4">
										Expiry
									</th>
									<th scope="col" className="text-xs dark:text-zinc-400 text-left  px-4">
										Type
									</th>
									<th scope="col" className="text-xs dark:text-zinc-400 text-left  px-4">
										Direction
									</th>
									<th scope="col" className="text-xs dark:text-zinc-400 text-left  px-4">
										Strike Price
									</th>
									{!spreadSelected && (
										<th scope="col" className="text-xs  dark:text-zinc-400 text-left  px-4">
											Collateral Percent
										</th>
									)}

									<th scope="col" className="text-xs  dark:text-zinc-400 text-left  px-4">
										Price
									</th>
									<th scope="col" className="text-xs  dark:text-zinc-400 text-left  px-4">
										Credit/(Debit)
									</th>
									<th scope="col" className="text-xs  dark:text-zinc-400 text-left  px-4">
										Size
									</th>
								</tr>
							</thead>
							<tbody className="divide-y dark:divide-zinc-800 divide-zinc-200 dark:bg-inherit">
								{loading && <Spinner />}
								{selectedStrikes.map((strike, index) => {
									return <StrikeTradeDetail strike={strike} key={index} />;
								})}
							</tbody>
						</table>
					</div>
					<MarketOrderActions />
				</>
			)}
		</>
	);
};

const StrikeTradeDetail = ({ strike }: { strike: LyraStrike }) => {
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
		<tr
			className="dark:bg-inherit hover:dark:bg-zinc-900 hover:bg-zinc-100 cursor-pointer"
			onMouseEnter={() => setActiveStrike({ strikeId: strike.id, isCall })}
			onMouseLeave={() => setActiveStrike({ strikeId: 0, isCall: false })}
		>
			<td className="text-xs font-medium dark:text-zinc-300   px-4">
				{expiryTimestamp && formatExpirationDate(expiryTimestamp)}
			</td>
			<td className="py-3 text-xs px-4">
				{isCall ? (
					<span className="dark:bg-emerald-500 dark:text-zinc-100 font-normal p-1 rounded-lg">
						Call
					</span>
				) : (
					<span className="dark:bg-pink-700 dark:text-zinc-100  font-normal p-1 rounded-lg">
						Put
					</span>
				)}
			</td>
			<td className="text-xs  px-4">
				{isBuy ? (
					<span className="dark:text-emerald-500 font-normal p-1 rounded-lg">Buy</span>
				) : (
					<span className="dark:text-pink-700 font-normal p-1 rounded-lg">Sell</span>
				)}
			</td>

			<td className="text-xs font-medium dark:text-zinc-300   px-4">
				{formatUSD(strikePrice, { dps: 0 })}
			</td>

			{!spreadSelected && (
				<td className="text-xs font-medium dark:text-zinc-300   px-4">
					{isBuy ? (
						"-"
					) : editCollateral ? (
						<div className="flex gap-2 items-center">
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
								className={`w-16 border-2 border-emerald-600 dark:bg-transparent p-1  dark:text-zinc-200 shadow-lg text-xs ${
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
						<div className="flex gap-2 items-center">
							{/* {formatUSD(strikePrice, { dps: 0 })} */}
							{collateralPercent && formatPercentage(collateralPercent, true)}

							<PencilSquareIcon
								className="h-4 w-4 dark:text-zinc-200"
								onClick={() => setEditCollateral(true)}
							/>
						</div>
					)}
				</td>
			)}

			<td className="text-xs font-medium dark:text-zinc-300   px-4">
				{isUpdating ? (
					<Spinner size="small" />
				) : (
					formatUSD(fromBigNumber(pricePerOption), { dps: 2 })
				)}
			</td>

			<td className="text-xs font-medium dark:text-zinc-300  px-4 ">
				{isUpdating ? (
					<Spinner size="small" />
				) : (
					isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium), { dps: 2 }))
				)}
			</td>

			<td className="text-xs font-semibold dark:text-zinc-300 px-4">
				{editPricing ? (
					<div className="flex gap-2 items-center">
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
							className={`w-12 border-2 border-emerald-600 dark:bg-transparent p-1  dark:text-zinc-200 shadow-lg text-xs ${
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
					<div className="flex gap-2 items-center">
						{fromBigNumber(size)}

						<PencilSquareIcon
							className="h-4 w-4 dark:text-zinc-200"
							onClick={() => setEditPricing(true)}
						/>
					</div>
				)}
			</td>
		</tr>
	);
};

const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
	return isBuy ? `(${usd})` : usd;
};
