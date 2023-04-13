import React, { useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { formatUSD, fromBigNumber } from "../../../utils/formatters/numbers";
import { formatName } from "../Market/SelectMarket";
import { DebounceInput } from "react-debounce-input";
import { TradeType } from "./TradeSelect";
import { LyraStrike } from "../../../queries/lyra/useLyra";

export const StrikeTrade = () => {
	const { selectedMarket, strikes, handleUpdateQuote } = useBuilderContext();

	return (
		<>
			{selectedMarket && strikes.length > 0 && (
				<div className="col-span-1 sm:col-span-1 grid grid-cols-1">
					{/* strikes summary  */}
					<div className="col-span-1">
						{strikes
							.filter((strike: LyraStrike) => strike.selected)
							.map((strike, index) => {
								return (
									<StrikeTradeDetail
										strike={strike}
										key={index}
										handleUpdateQuote={handleUpdateQuote}
									/>
								);
							})}
					</div>

					{/* limit / market / trigger button header  */}
					<TradeType />
				</div>
			)}
		</>
	);
};

const StrikeTradeDetail = ({
	strike,
	handleUpdateQuote,
}: {
	strike: LyraStrike;
	handleUpdateQuote: any;
}) => {
	const { selectedMarket, setActiveStrike, isUpdating, selectedStrategy } = useBuilderContext();

	const {
		quote: { size, pricePerOption, isCall, isBuy, premium },
		strikePrice,
	} = strike;

	// const [formattedSize, setFormattedSize] = useState(1);

	const [optionPriceLoading, setOptionPriceLoading] = useState(false);

	useEffect(() => {
		setOptionPriceLoading(false);
	}, [size]);

	return (
		<div
			className="border-b border-zinc-800 hover:bg-black hover:first:rounded-t-lg"
			onMouseEnter={() => setActiveStrike({ strikeId: strike.id, isCall })}
			onMouseLeave={() => setActiveStrike({ strikeId: 0, isCall: false })}
		>
			<div className="p-2">
				<div className="text-white font-semibold text-sm p-2">
					{`${isBuy ? "Buy" : "Sell"} ${formatName(selectedMarket?.name || "N/A")} ${formatUSD(
						strikePrice,
						{ dps: 2 }
					)}  ${isCall ? "Call" : "Put"} `}
				</div>
				<div className="flex items-center justify-between p-2">
					<p className="truncate font-sans text-sm font-normal text-white">Contracts</p>
					<div className="ml-2 flex flex-shrink-0">
						<label htmlFor="size" className="sr-only">
							Size
						</label>
						<div className="mt-1">
							<DebounceInput
								minLength={1}
								debounceTimeout={400}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value);
									handleUpdateQuote(selectedStrategy, { size: value.toString(), strike: strike });

									setOptionPriceLoading(true);
									// setFormattedSize(value);
								}}
								min={0}
								type="number"
								name="size"
								id="size"
								value={fromBigNumber(size)}
								className={`block w-24 rounded-sm border border-zinc-700 bg-transparent px-4 pr-2 py-2 text-right text-zinc-200 shadow-lg text-sm ${
									isUpdating && "cursor-disabled"
								}`}
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between p-2">
					<p className="truncate font-sans text-sm font-normal text-zinc-300">Price Per Option</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold  leading-5 text-white">
							{formatUSD(fromBigNumber(pricePerOption), { dps: 2 })}
						</span>
					</div>
				</div>
				<div className="flex items-center justify-between p-2">
					<p className="truncate font-sans text-sm font-normal text-zinc-300">Credit/(Debit)</p>
					<div className="ml-2 flex flex-shrink-0">
						<p className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
							{optionPriceLoading ? "-" : isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium)))}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
	return isBuy ? `(${usd})` : usd;
};
