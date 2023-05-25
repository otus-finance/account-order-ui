import React from "react";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { useLyraAccountContext } from "../../../../context/LyraAccountContext";

export const WalletBalance = () => {
	const { quoteAsset, quoteAssetBalance } = useLyraAccountContext();
	return (
		<div className="flex justify-between bg-zinc-800 dark:border-b dark:bg-inherit dark:border-zinc-800 mb-4 py-4 p-4 rounded-t-xl">
			<div className="text-sm dark:text-zinc-200 text-zinc-200">Wallet Balance</div>
			<div className="text-sm dark:text-white text-white font-semibold col-span-1 dark:text-right">
				{formatUSD(fromBigNumber(quoteAssetBalance, quoteAsset?.decimals), { dps: 2 })}{" "}
				{quoteAsset?.symbol}
			</div>
		</div>
	);
};
