import { StrategyDirection, StrategyType } from "../types";

export const DirectionType: StrategyDirection[] = [
	{
		id: StrategyType.Bearish,
		name: "🐻Bearish",
	},
	{
		id: StrategyType.Bullish,
		name: "🐂Bullish",
	},
	{
		id: StrategyType.Volatile,
		name: "🌊Volatile",
	},
	{
		id: StrategyType.Calm,
		name: "⛵Calm",
	},
	{
		id: StrategyType.Neutral,
		name: "✌Neutral",
	},
];
