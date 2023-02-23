import { useCallback, useEffect, useState } from 'react'
import { useBuilderContext } from '../context/BuilderContext'
import { LyraStrike } from '../queries/lyra/useLyra'
import { formatProfitAndLostAtTicks, ticks, Ticks } from '../utils/charting'

export type PnlChartPoint = {
  name: number
  asset_price: number
  negative_combo_payoff: number | null,
  positive_combo_payoff: number | null
}

const assetInTrades = (asset: string, trades: LyraStrike[]): boolean => {
  return trades[0]?.market == asset;
}

export const useBuilderProfitLossChart = (asset: string | undefined, priceOfAsset: number | undefined, builtTrades: LyraStrike[]) => {

  const [data, setData] = useState<PnlChartPoint[] | []>([]);

  // const { handleSetPnl } = useBuilderContext();

  const formattedChartData = useCallback(() => {
    if (builtTrades && builtTrades?.length > 0 && asset && priceOfAsset && assetInTrades(asset, builtTrades)) {
      const _ticks = ticks(asset, priceOfAsset);

      const _combo: Ticks = _ticks.reduce((accum: any, tick: any) => {
        const profitAtTick = formatProfitAndLostAtTicks(tick, builtTrades);
        return { ...accum, [tick]: { profitAtTick } }
      }, {});

      let maxProfit = 0;
      let maxLoss = 0;
      let len = _ticks.length;

      const _chartData = _ticks.map((tick, index) => {
        {/* @ts-ignore */ }
        const profitAtTick = _combo[tick].profitAtTick;

        // maxprofit is < profit attick 
        // then profit is increasing
        // if maxprofit is the same as profitattick then 
        console.log({ len, index: index + 1 })
        if (maxProfit < profitAtTick && len == index + 1) {
          maxProfit = Infinity;
        } else if (maxProfit < profitAtTick) {
          maxProfit = profitAtTick;
        }

        if (maxLoss > profitAtTick) {
          maxLoss = profitAtTick;
        }

        return {
          name: index,
          asset_price: Math.floor(tick),
          combo_payoff: profitAtTick,
          negative_combo_payoff: profitAtTick < 0 ? profitAtTick : null,
          positive_combo_payoff: profitAtTick > 0 ? profitAtTick : null
        }
      })
      console.log('at builder', { maxProfit, maxLoss })
      // setMaxPNL
      // handleSetPnl(maxProfit, maxLoss);
      setData(_chartData);
    } else {
      setData([])
    }
  }, [builtTrades, priceOfAsset, asset])

  useEffect(() => {
    //if (priceOfAsset != 0 && asset != null && builtTrades && builtTrades?.length > 0) {
    formattedChartData();
    // }
  }, [formattedChartData, builtTrades, priceOfAsset, asset])

  return data;

}
