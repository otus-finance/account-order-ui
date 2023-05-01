import React from "react";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { useLyraTrade } from "../../../../hooks";
import { useBuilderContext } from "../../../../context/BuilderContext";

export const WalletBalance = () => {
	const { lyra } = useBuilderContext();

	const { quoteAsset, quoteAssetBalance } = useLyraTrade(lyra);
	return (
		<div className="flex justify-between border-b dark:border-zinc-800 py-4 p-4">
			<div className="text-sm font-mono dark:text-zinc-200">Wallet Balance</div>
			<div className="text-sm dark:text-white font-semibold col-span-1 dark:text-right">
				{formatUSD(fromBigNumber(quoteAssetBalance, quoteAsset?.decimals), { dps: 2 })}{" "}
				{quoteAsset?.symbol}
			</div>
		</div>
	);
};
