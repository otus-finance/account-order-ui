import React, { useEffect, useState } from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { useBuilderProfitLossChart } from "../../../hooks/BuilderChart";
import { BuilderPNLChart } from "./BuilderChart";
import { LyraStrike } from "../../../queries/lyra/useLyra";

export const Chart = () => {
	const [selected, setSelected] = useState<LyraStrike[]>([]);

	const { selectedMarket, strikes, currentPrice, isValid } = useBuilderContext();

	const chartData = useBuilderProfitLossChart(selectedMarket?.name, currentPrice, selected);

	useEffect(() => {
		let _selected: LyraStrike[] = strikes.filter((strike: LyraStrike) => {
			if (strike.selected) {
				return true;
			} else {
				return false;
			}
		});
		setSelected(_selected);
	}, [strikes]);

	return (
		<div className="col-span-3 sm:col-span-3 p-4 bg-black rounded-lg">
			{chartData.length > 0 && currentPrice > 0 && isValid && (
				<BuilderPNLChart currentPrice={currentPrice} data={chartData} />
			)}
		</div>
	);
};
