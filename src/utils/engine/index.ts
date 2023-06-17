import { BigNumber } from "ethers";
import { LyraBoard, LyraStrike } from "../../queries/lyra/useLyra";
import { fromBigNumber } from "../formatters/numbers";
import { calculateOptionType, extrensicValueFilter, orderFilter } from "../formatters/optiontypes";
import { Strategy, StrategyStrikeTrade } from "../types";

export const strikeSelector = (
	selectedExpirationDate: LyraBoard,
	selectedStrategy: Strategy,
	currentPrice: number
) => {
	const { strikesByOptionTypes, strikesWithQuotes } = selectedExpirationDate;

	// build indexes of
	const tradeOptionTypes = selectedStrategy.trade.reduce(
		(accum: Record<0 | 1 | 2 | 3 | 4, StrategyStrikeTrade[]>, trade: StrategyStrikeTrade) => {
			const trades = accum[trade.optionType]?.concat({ ...trade, matched: false });

			return { ...accum, [trade.optionType]: trades };
		},
		{
			0: [] as StrategyStrikeTrade[],
			1: [] as StrategyStrikeTrade[],
			3: [] as StrategyStrikeTrade[],
			4: [] as StrategyStrikeTrade[],
		} as Record<0 | 1 | 2 | 3 | 4, StrategyStrikeTrade[]>
	);

	let found = {
		0: 0,
		1: 0,
		3: 0,
		4: 0,
	};

	const _strikes1 = Object.keys(strikesByOptionTypes || {})
		.reduce((combo: LyraStrike[], key: string) => {
			const _key = parseInt(key);
			combo =
				strikesByOptionTypes && strikesByOptionTypes[_key]
					? combo.concat(strikesByOptionTypes[_key] || [])
					: combo;
			return combo;
		}, [] as LyraStrike[])
		.map((strike: LyraStrike) => {
			const {
				strikePrice,
				isCall,
				quote: { isBuy },
			} = strike;

			const optionType = calculateOptionType(isBuy, isCall);

			if (tradeOptionTypes.hasOwnProperty(optionType)) {
				const _strikePrice = fromBigNumber(strikePrice);

				const trades = tradeOptionTypes[optionType];

				let strikeMatch = strike;

				trades.forEach((trade: StrategyStrikeTrade) => {
					if (!trade.matched) {
						let orderMatch = false;
						let valueMatch = extrensicValueFilter(
							trade.priceAt,
							isCall,
							currentPrice || 0,
							_strikePrice
						);

						if (valueMatch) {
							orderMatch = orderFilter(trade, found[optionType]);
						}

						if (orderMatch) {
							trade.matched = true;
							strikeMatch = { ...strike, selected: true } as LyraStrike;
						}

						if (valueMatch && !orderMatch) {
							found[optionType] = found[optionType] + 1;
						}
					}
				});

				tradeOptionTypes[optionType] = trades;

				return strikeMatch;
			} else {
				return strike;
			}
		});

	const isValid =
		_strikes1.filter((strike: LyraStrike) => strike.selected).length ==
		selectedStrategy.trade.length;

	return { _strikes1, strikesWithQuotes, isValid };
};
