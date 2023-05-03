import { useCallback, useEffect, useState } from "react";
import { LyraStrike } from "../queries/lyra/useLyra";
import { formatProfitAndLostAtTicks, ticks, Ticks } from "../utils/charting";

export type PnlChartPoint = {
	name: number;
	asset_price: number;
	negative_combo_payoff: number | null;
	positive_combo_payoff: number | null;
	negative_payoff: number | null;
	positive_payoff: number | null;
};

const assetInTrades = (asset: string, trades: LyraStrike[]): boolean => {
	return trades[0]?.market == asset;
};

export const useBuilderProfitLossChart = (
	asset: string | undefined,
	priceOfAsset: number | undefined,
	builtTrades: LyraStrike[]
) => {
	const [data, setData] = useState<PnlChartPoint[] | []>([]);

	const formattedChartData = useCallback(() => {
		if (
			builtTrades &&
			builtTrades?.length > 0 &&
			asset &&
			priceOfAsset &&
			assetInTrades(asset, builtTrades)
		) {
			const _ticks = ticks(asset, priceOfAsset);
			const _combo: Ticks = _ticks.reduce((accum: any, tick: any) => {
				const profitAtTick = formatProfitAndLostAtTicks(tick, builtTrades);
				return { ...accum, [tick]: { profitAtTick } };
			}, {});

			const _chartData = _ticks.map((tick, index) => {
				// @ts-ignore
				const profitAtTick = _combo[tick].profitAtTick;

				return {
					name: index,
					asset_price: Math.floor(tick),
					combo_payoff: profitAtTick,
					negative_combo_payoff: profitAtTick < 0 ? profitAtTick.toFixed(0) : null,
					positive_combo_payoff: profitAtTick > 0 ? profitAtTick.toFixed(0) : null,
					negative_payoff: profitAtTick < 0 ? null : 0,
					positive_payoff: profitAtTick > 0 ? null : 0,
				} as PnlChartPoint;
			});
			// setMaxPNL
			// handleSetPnl(maxProfit, maxLoss);
			setData(_chartData);
		} else {
			setData([]);
		}
	}, [builtTrades, priceOfAsset, asset]);

	useEffect(() => {
		formattedChartData();
	}, [formattedChartData, builtTrades, priceOfAsset, asset]);

	return data;
};
