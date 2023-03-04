import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer
} from "recharts";
import { PnlChartPoint } from "../../../hooks/BuilderChart";
import { formatUSD } from "../../../utils/formatters/numbers";

export const BuilderPNLChart = ({ currentPrice, data }: { currentPrice: number, data: PnlChartPoint[] | [] }) => {

  return (
    <ResponsiveContainer width="99%"
      height={200}>
      <LineChart
        data={data}
        margin={{
          top: 2,
          left: 8,
          right: 8,
          bottom: 8
        }}
      >
        <XAxis hide={true} dataKey="asset_price" tick={{ stroke: '#fff', strokeWidth: .5, fontSize: '10px', fontWeight: '100', fontFamily: 'Rubik' }} />
        <YAxis hide={true} tickCount={100} tickSize={2} tick={{ stroke: '#f5f5f5', strokeWidth: .5, fontSize: '10px', fontWeight: '100', fontFamily: 'Rubik' }} />

        {/* @ts-ignore */}
        <Tooltip content={<CustomTooltip currentPrice={currentPrice} />} />

        <ReferenceLine y={0} stroke={'#e4e4e7'} strokeWidth={.25} />

        <Line type="monotone" connectNulls={false} dataKey="negative_combo_payoff" stroke={'#831843'} dot={false} strokeWidth={2} />
        <Line type="monotone" connectNulls={false} dataKey="positive_combo_payoff" stroke={'#047857'} dot={false} strokeWidth={2} />

      </LineChart>

    </ResponsiveContainer>
  );
}

const CustomTooltip = ({ currentPrice, active, payload, label }: { currentPrice: number, active: boolean, payload: any, label: number }) => {
  if (active && payload && payload.length) {
    return <div className="grid grid-cols-2">
      <div className="col-span-2 grid-cols-1">
        <div>
          <p className="truncate font-sans text-xs font-medium text-white">
            Asset Price At
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-normal leading-5 text-white">
            {formatUSD(label)}
          </p>
        </div>
      </div>

      <div className="col-span-2 grid-cols-1">
        <div>
          <p className="truncate font-sans text-xs font-medium text-white">
            Profit/Loss
          </p>
        </div>
        <div>
          {
            payload[0].value > 0 ?
              <p className="font-mono text-xs font-bold leading-5 text-emerald-700">
                {formatUSD(payload[0].value)}
              </p> :
              <p className="font-mono text-xs font-bold leading-5 text-pink-900">
                {formatUSD(payload[0].value)}
              </p>
          }

        </div>
      </div>

      <div className="col-span-2 grid-cols-1">
        <div>
          <p className="truncate font-sans text-xs font-medium text-white">
            Current Price
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-normal leading-5 text-white">
            {formatUSD(currentPrice)}
          </p>
        </div>
      </div>

    </div>
  }

  return null;
};