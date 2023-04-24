import React, { useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { formatUSD, fromBigNumber, toBN } from "../../../utils/formatters/numbers";
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

export const StrikeTrade = () => {
	const { selectedMarket, strikes } = useBuilderContext();
	const { loading, selectedStrikes } = useMarketOrderContext();
	return (
		<>
			{selectedMarket && strikes.length > 0 && (
				<>
					{/* strikes summary  */}

					<WalletBalance />

					<div className="overflow-x-scroll sm:overflow-auto">
						<table className="  font-semibold min-w-full divide-y divide-zinc-800 table-fixed">
							<thead className="bg-inherit ">
								<tr className="font-mono ">
									<th scope="col" className="py-2 text-xs text-zinc-400 text-left  px-4">
										Expiry
									</th>
									<th scope="col" className="text-xs text-zinc-400 text-left  px-4">
										Type
									</th>
									<th scope="col" className="text-xs text-zinc-400 text-left  px-4">
										Direction
									</th>
									<th scope="col" className="text-xs text-zinc-400 text-left  px-4">
										Strike Price
									</th>
									<th scope="col" className="text-xs  text-zinc-400 text-left  px-4">
										Collateral
									</th>
									<th scope="col" className="text-xs  text-zinc-400 text-left  px-4">
										Price
									</th>
									<th scope="col" className="text-xs  text-zinc-400 text-left  px-4">
										Credit/(Debit)
									</th>
									<th scope="col" className="text-xs  text-zinc-400 text-left  px-4">
										Size
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-800 bg-inherit">
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
	const { selectedMarket, setActiveStrike, selectedStrategy } = useBuilderContext();
	const { updateSize } = useMarketOrderContext();

	const {
		quote: { size, pricePerOption, isCall, isBuy, premium },
		strikePrice,
		isUpdating,
		expiryTimestamp,
	} = strike;

	const [optionPriceLoading, setOptionPriceLoading] = useState(false);

	useEffect(() => {
		setOptionPriceLoading(false);
	}, [size]);

	const [initialCollateral, setInitialCollateral] = useState(
		fromBigNumber(size) * fromBigNumber(strikePrice)
	);

	const [editCollateral, setEditCollateral] = useState(false);

	const [newCollateral, setNewCollateral] = useState(
		fromBigNumber(size) * fromBigNumber(strikePrice)
	);

	const handleNewCollateral = (_newSize: number) => {
		setNewCollateral(_newSize);
	};

	const handleConfirmCollateral = () => {
		// updateSize?.(strike, newSize);
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
			className="bg-inherit hover:bg-zinc-900 cursor-pointer"
			onMouseEnter={() => setActiveStrike({ strikeId: strike.id, isCall })}
			onMouseLeave={() => setActiveStrike({ strikeId: 0, isCall: false })}
		>
			<td className="text-xs font-medium text-zinc-300   px-4">
				{expiryTimestamp && formatExpirationDate(expiryTimestamp)}
			</td>
			<td className="py-3 text-xs px-4">
				{isCall ? (
					<span className="bg-emerald-500 text-zinc-100 font-normal p-1 rounded-lg">Call</span>
				) : (
					<span className="bg-pink-700 text-zinc-100  font-normal p-1 rounded-lg">Put</span>
				)}
			</td>
			<td className="text-xs  px-4">
				{isBuy ? (
					<span className="text-emerald-500 font-normal p-1 rounded-lg">Buy</span>
				) : (
					<span className="text-pink-700 font-normal p-1 rounded-lg">Sell</span>
				)}
			</td>

			<td className="text-xs font-medium text-zinc-300   px-4">
				{formatUSD(strikePrice, { dps: 0 })}
			</td>

			<td className="text-xs font-medium text-zinc-300   px-4">
				{isBuy ? (
					"-"
				) : editCollateral ? (
					<div className="flex gap-2 items-center">
						<DebounceInput
							minLength={1}
							onChange={async (e) => {
								if (e.target.value == "") return;
								const value = parseFloat(e.target.value);

								handleNewSize(value);
							}}
							type="number"
							name="size"
							id="size"
							min={initialCollateral * 0.4}
							max={initialCollateral}
							value={newCollateral}
							className={`w-16 border-2 border-emerald-600 bg-transparent p-1  text-zinc-200 shadow-lg text-xs ${
								isUpdating && "cursor-disabled"
							}`}
						/>

						<div>
							<XMarkIcon
								className=" h-4 w-4 text-rose-500"
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
					<div className="flex gap-2 items-center">
						{formatUSD(strikePrice, { dps: 0 })}

						<PencilSquareIcon
							className="h-4 w-4 text-zinc-200"
							onClick={() => setEditCollateral(true)}
						/>
					</div>
				)}
			</td>

			<td className="text-xs font-medium text-zinc-300   px-4">
				{isUpdating ? (
					<Spinner size="small" />
				) : (
					formatUSD(fromBigNumber(pricePerOption), { dps: 2 })
				)}
			</td>

			<td className="text-xs font-medium text-zinc-300  px-4 ">
				{isUpdating ? (
					<Spinner size="small" />
				) : (
					isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium), { dps: 2 }))
				)}
			</td>

			<td className="text-xs font-semibold text-zinc-300 px-4">
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
							className={`w-12 border-2 border-emerald-600 bg-transparent p-1  text-zinc-200 shadow-lg text-xs ${
								isUpdating && "cursor-disabled"
							}`}
						/>

						<div>
							<XMarkIcon className=" h-4 w-4 text-rose-500" onClick={() => setEditPricing(false)} />
						</div>

						<div>
							<CheckIcon
								className="h-4 w-4 text-emerald-500"
								onClick={() => handleConfirmSizeUpdate()}
							/>
						</div>
					</div>
				) : (
					<div className="flex gap-2 items-center">
						{fromBigNumber(size)}
						<PencilSquareIcon
							className="h-4 w-4 text-zinc-200"
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
