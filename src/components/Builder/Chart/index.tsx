import React, { useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { useBuilderProfitLossChart } from "../../../hooks/BuilderChart";
import { BuilderPNLChart } from "./BuilderChart";
import { LyraStrike } from "../../../queries/lyra/useLyra";
import { useMarketOrderContext } from "../../../context/MarketOrderContext";

export const Chart = () => {
	const { selectedMarket, currentPrice, isValid } = useBuilderContext();

	const { selectedStrikes } = useMarketOrderContext();

	const chartData = useBuilderProfitLossChart(selectedMarket?.name, currentPrice, selectedStrikes);

	return (
		<div className="col-span-3 sm:col-span-3 p-4 bg-black rounded-lg">
			{chartData.length > 0 && currentPrice > 0 && isValid && (
				<BuilderPNLChart currentPrice={currentPrice} data={chartData} />
			)}
		</div>
	);
};
