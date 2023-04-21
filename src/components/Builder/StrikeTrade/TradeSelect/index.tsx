import React, { Dispatch, useState } from "react";
import { useLyraAccountContext } from "../../../../context/LyraAccountContext";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { AccountOrderActions } from "../../../Account/AccountOrderActions";
import { TradeLimit } from "../TradeLimit";
import { TradeMarket } from "../TradeMarket";
import { TradeTrigger } from "../TradeTrigger";
import { ZERO_BN } from "../../../../constants/bn";
import { useLyraTrade } from "../../../../hooks";
import { useBuilderContext } from "../../../../context/BuilderContext";

enum TradeTypes {
	Market,
	Limit,
	Trigger,
}

export const TradeType = () => {
	const [typeSelected, setTypeSelected] = useState(TradeTypes.Market);

	const { lyra } = useBuilderContext();

	const { quoteAsset, quoteAssetBalance } = useLyraTrade(lyra);

	return (
		<>
			{/* <TradeTypeSelect typeSelected={typeSelected} setTypeSelected={setTypeSelected} /> */}
			{TradeTypes.Market === typeSelected && <TradeMarket />}
			{TradeTypes.Limit === typeSelected && <TradeLimit />}
			{TradeTypes.Trigger === typeSelected && <TradeTrigger />}

			{TradeTypes.Limit === typeSelected && <AccountOrderActions />}
			{TradeTypes.Trigger === typeSelected && <AccountOrderActions />}

			{typeSelected === TradeTypes.Market && (
				<div className="col-span-1 border-t border-zinc-800">
					<div className="grid grid-cols-2 p-4">
						<div className="text-xs text-zinc-200">Wallet Balance</div>
						<div className="text-xs text-white font-semibold col-span-1 text-right">
							{formatUSD(fromBigNumber(quoteAssetBalance, quoteAsset?.decimals), { dps: 2 })}{" "}
							{quoteAsset?.symbol}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const TradeTypeSelect = ({
	typeSelected,
	setTypeSelected,
}: {
	typeSelected: TradeTypes;
	setTypeSelected: Dispatch<TradeTypes>;
}) => {
	return (
		<div className="col-span-1">
			<div className="p-2 pt-4">
				<div className="flex gap-8">
					<div
						onClick={() => setTypeSelected(TradeTypes.Market)}
						className={`p-2 text-xs  hover:text-white cursor-pointer ${
							typeSelected === TradeTypes.Market ? "text-white underline" : "text-zinc-300"
						}`}
					>
						Market
					</div>
					<div
						onClick={() => setTypeSelected(TradeTypes.Limit)}
						className={`p-2 text-xs text-zinc-300 hover:text-white cursor-pointer ${
							typeSelected === TradeTypes.Limit ? "text-white underline" : "text-zinc-300"
						}`}
					>
						Limit
					</div>
					<div
						onClick={() => setTypeSelected(TradeTypes.Trigger)}
						className={`p-2 text-xs text-zinc-300 hover:text-white cursor-not-allowed ${
							typeSelected === TradeTypes.Trigger ? "text-white underline" : "text-zinc-300"
						}`}
					>
						Trigger
					</div>
				</div>
			</div>
		</div>
	);
};
