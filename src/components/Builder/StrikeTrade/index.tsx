import React, { Dispatch, useCallback, useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { formatUSD, fromBigNumber, toBN } from "../../../utils/formatters/numbers";
import { MAX_BN, ZERO_BN } from "../../../constants/bn";

import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";

import { useAccount, useNetwork } from "wagmi";

import useTransaction from "../../../hooks/Transaction";
import { Spinner } from "../../UI/Components/Spinner";
import { useLyraAccountContext } from "../../../context/LyraAccountContext";
import { formatName } from "../Market/SelectMarket";
import { DebounceInput } from "react-debounce-input";
import { TradeType } from "./TradeSelect";
import { LyraStrike } from "../../../queries/lyra/useLyra";
import { AccountOrderActions } from "../../Account/AccountOrderActions";

export const StrikeTrade = () => {
	const { selectedMarket, strikes, positionPnl } = useBuilderContext();

	const { netCreditDebit, collateralRequired, maxCost } = positionPnl;

	return (
		<>
			{selectedMarket && strikes.length > 0 && (
				<div className="col-span-1 sm:col-span-1 grid grid-cols-1">
					{/* strikes summary  */}
					<div className="col-span-1">
						{strikes.map((strike, index) => {
							return <StrikeTradeDetail strike={strike} key={index} />;
						})}
					</div>

					<div className="col-span-1 border-b border-zinc-800">
						<div className="grid grid-cols-2 p-4 gap-2">
							<div className="text-xs text-zinc-200">Min. Premium Received</div>
							<div className="text-xs text-white font-semibold col-span-1 text-right">
								{formatUSD(netCreditDebit < 0 ? 0 : netCreditDebit)}
							</div>

							<div className=" col-span-1 text-xs text-zinc-200">Collateral Required</div>
							<div className="text-xs text-white font-semibold col-span-1 text-right">
								{formatUSD(collateralRequired)}
							</div>

							<div className=" col-span-1 text-xs text-zinc-200">Max Cost</div>
							<div className="text-xs text-white font-semibold col-span-1 text-right">
								{formatUSD(maxCost)}
							</div>

							<div className="text-xs text-zinc-200">Total Funds Required</div>
							<div className="text-xs text-white font-semibold col-span-1 text-right">
								{formatUSD(collateralRequired + maxCost)}
							</div>
						</div>
					</div>

					{/* limit / market / trigger button header  */}
					<TradeType />
				</div>
			)}
		</>
	);
};

const StrikeTradeDetail = ({ strike }: { strike: LyraStrike }) => {
	const { selectedMarket, handleUpdateQuote, setActiveStrike } = useBuilderContext();

	const {
		quote: { size, pricePerOption, isCall, isBuy, premium },
		strikePrice,
	} = strike;

	const [formattedSize, setFormattedSize] = useState(1);

	const [optionPriceLoading, setOptionPriceLoading] = useState(false);

	useEffect(() => {
		setOptionPriceLoading(false);
	}, [size]);

	return (
		<div
			className="border-b border-zinc-800 hover:bg-black"
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
					<p className="truncate font-sans text-xs font-normal text-white">Contracts</p>
					<div className="ml-2 flex flex-shrink-0">
						<label htmlFor="size" className="sr-only">
							Size
						</label>
						<div className="mt-1">
							<DebounceInput
								minLength={1}
								debounceTimeout={300}
								onChange={async (e) => {
									if (e.target.value == "") return;
									const value = parseFloat(e.target.value);
									handleUpdateQuote({ size: value.toString(), strike: strike });

									setOptionPriceLoading(true);
									setFormattedSize(value);
								}}
								min={0}
								type="number"
								name="size"
								id="size"
								value={formattedSize}
								className="block w-24 rounded-sm border border-zinc-700 bg-transparent px-4 pr-2 py-2 text-right text-zinc-200 shadow-lg text-xs"
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between p-2">
					<p className="truncate font-sans text-xs font-normal text-white">Price Per Option</p>
					<div className="ml-2 flex flex-shrink-0">
						<p className="inline-flex font-mono text-xs font-semibold  leading-5 text-white">
							{optionPriceLoading ? (
								<Spinner size={"small"} />
							) : (
								formatUSD(fromBigNumber(pricePerOption), { dps: 2 })
							)}
						</p>
					</div>
				</div>
				<div className="flex items-center justify-between p-2">
					<p className="truncate font-sans text-xs font-normal text-white">Credit/(Debit)</p>
					<div className="ml-2 flex flex-shrink-0">
						<p className="inline-flex font-mono text-xs font-semibold leading-5 text-white">
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
