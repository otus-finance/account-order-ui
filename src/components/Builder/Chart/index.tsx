import React, { useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { useBuilderProfitLossChart } from "../../../hooks/BuilderChart";
import { BuilderPNLChart } from "./BuilderChart";
import { LyraStrike } from "../../../queries/lyra/useLyra";
import { useMarketOrderContext } from "../../../context/MarketOrderContext";

export const Chart = ({ height = 360 }: { height?: number }) => {
	const { selectedMarket, currentPrice, isValid } = useBuilderContext();

	const { updateStrikes } = useMarketOrderContext();

	const chartData = useBuilderProfitLossChart(selectedMarket?.name, currentPrice, updateStrikes);

	return (
		<div className="col-span-3 sm:col-span-3 p-4 dark:bg-black bg-white rounded-lg">
			{chartData.length > 0 && currentPrice > 0 && isValid && (
				<BuilderPNLChart height={height} currentPrice={currentPrice} data={chartData} />
			)}
		</div>
	);
};
