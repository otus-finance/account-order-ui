import React from "react";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { useLyraTrade } from "../../../../hooks";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { useRouter } from "next/router";
import { useLyraAccountContext } from "../../../../context/LyraAccountContext";

export const VaultBalance = () => {
	const { quoteAsset, quoteAssetBalance } = useLyraAccountContext();

	return (
		<div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 py-4 p-4">
			<div className="text-sm font-mono dark:text-zinc-200">Vault Balance</div>
			<div className="text-sm dark:text-white font-semibold col-span-1 dark:text-right">
				{formatUSD(fromBigNumber(quoteAssetBalance, quoteAsset?.decimals), { dps: 2 })}{" "}
				{quoteAsset?.symbol}
			</div>
		</div>
	);
};
