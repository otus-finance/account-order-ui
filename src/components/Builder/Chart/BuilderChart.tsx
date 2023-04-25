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
	ResponsiveContainer,
} from "recharts";
import { PnlChartPoint } from "../../../hooks/BuilderChart";
import { formatUSD } from "../../../utils/formatters/numbers";

export const BuilderPNLChart = ({
	currentPrice,
	data,
	height = 360,
}: {
	currentPrice: number;
	data: PnlChartPoint[] | [];
	height?: number;
}) => {
	return (
		<ResponsiveContainer width={"99%"} height={height}>
			<LineChart
				data={data}
				margin={{
					top: 2,
					left: -16,
					right: 2,
					bottom: 8,
				}}
			>
				<XAxis
					dataKey="asset_price"
					tickSize={10}
					tick={{
						stroke: "#fff",
						strokeWidth: 0.25,
						fontSize: "10px",
						fontWeight: "100",
						fontFamily: "Rubik",
					}}
				/>
				<YAxis
					tickCount={100}
					tickSize={10}
					tick={{
						stroke: "#fff",
						strokeWidth: 0.25,
						fontSize: "10px",
						fontWeight: "100",
						fontFamily: "Rubik",
					}}
				/>

				<CartesianGrid stroke={"#27272a"} strokeDasharray="3 3" />

				{/* @ts-ignore */}
				<Tooltip content={<CustomTooltip currentPrice={currentPrice} />} />

				<ReferenceLine y={0} stroke={"#3f3f46"} strokeWidth={1} />

				<Line
					type="monotone"
					connectNulls={false}
					strokeDasharray={"3 3"}
					dataKey="combo_payoff"
					stroke={"#eab308"}
					dot={false}
					strokeWidth={4}
				/>
				<Line
					type="monotone"
					connectNulls={false}
					dataKey="negative_combo_payoff"
					stroke={"#831843"}
					dot={false}
					strokeWidth={2}
				/>
				<Line
					type="monotone"
					connectNulls={false}
					dataKey="positive_combo_payoff"
					stroke={"#047857"}
					dot={false}
					strokeWidth={2}
				/>

				<Line
					type="monotone"
					connectNulls={false}
					dataKey="negative_payoff"
					stroke={"#047857"}
					dot={false}
					strokeWidth={2}
				/>
				<Line
					type="monotone"
					connectNulls={false}
					dataKey="positive_payoff"
					stroke={"#831843"}
					dot={false}
					strokeWidth={2}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

const CustomTooltip = ({
	currentPrice,
	active,
	payload,
	label,
}: {
	currentPrice: number;
	active: boolean;
	payload: any;
	label: number;
}) => {
	if (active && payload && payload.length) {
		return (
			<div className="grid grid-cols-2">
				<div className="col-span-2 grid-cols-1">
					<div>
						<p className="truncate font-sans text-xs font-medium text-white">Asset Price At</p>
					</div>
					<div>
						<p className="font-mono text-xs font-normal leading-5 text-white">{formatUSD(label)}</p>
					</div>
				</div>

				<div className="col-span-2 grid-cols-1">
					<div>
						<p className="truncate font-sans text-xs font-medium text-white">Profit/Loss</p>
					</div>
					<div>
						{payload[0].value > 0 ? (
							<p className="font-mono text-xs font-bold leading-5 text-emerald-600">
								{formatUSD(payload[0].value)}
							</p>
						) : (
							<p className="font-mono text-xs font-bold leading-5 text-pink-900">
								{formatUSD(payload[0].value)}
							</p>
						)}
					</div>
				</div>

				<div className="col-span-2 grid-cols-1">
					<div>
						<p className="truncate font-sans text-xs font-medium text-white">Current Price</p>
					</div>
					<div>
						<p className="font-mono text-xs font-normal leading-5 text-white">
							{formatUSD(currentPrice)}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return null;
};
