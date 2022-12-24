import { useCallback, useEffect, useState } from 'react'
import { formatProfitAndLostAtTicks, ticks } from '../utils/charting'

type Ticks = {
  [key: number]: { profitAtTick: number }
}

export type PnlChartPoint = {
  name: number
  asset_price: number
  negative_combo_payoff: number | null,
  positive_combo_payoff: number | null
}

export const useBuilderProfitLossChart = (asset: string | undefined, priceOfAsset: number | undefined, builtTrades: []) => {

  const [data, setData] = useState<PnlChartPoint[] | []>([]);

  const formattedChartData = useCallback(() => {
    console.log({ builtTrades })
    if (builtTrades && builtTrades?.length > 0 && asset && priceOfAsset) {
      const _ticks = ticks(asset, priceOfAsset);
      const _combo: Ticks = _ticks.reduce((accum, tick) => {
        const profitAtTick = formatProfitAndLostAtTicks(tick, builtTrades);
        return { ...accum, [tick]: { profitAtTick } }
      }, {})
      const _chartData = _ticks.map((tick, index) => {
        {/* @ts-ignore */ }
        const profitAtTick = _combo[tick].profitAtTick;
        return {
          name: index,
          asset_price: Math.floor(tick),
          combo_payoff: profitAtTick,
          negative_combo_payoff: profitAtTick < 0 ? profitAtTick : null,
          positive_combo_payoff: profitAtTick > 0 ? profitAtTick : null
        }
      })
      setData(_chartData);
    } else {
      setData([])
    }
  }, [builtTrades, priceOfAsset, asset])

  useEffect(() => {
    // if (priceOfAsset != 0 && asset != null && builtTrades && builtTrades?.length > 0) {
    formattedChartData();
    // }
  }, [formattedChartData, builtTrades, priceOfAsset, asset])

  return data;

}
