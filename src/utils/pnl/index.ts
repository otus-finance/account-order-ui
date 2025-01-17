import { BigNumber } from "ethers";
import { LyraStrike } from "../../queries/lyra/useLyra";
import { fromBigNumber } from "../formatters/numbers";
import { calculateOptionType } from "../formatters/optiontypes";
import { ZERO_BN } from "../../constants/bn";

enum OptionType {
	"LongCall" = 0,
	"LongPut" = 1,
	"ShortCallQuote" = 2,
	"ShortCall" = 3,
	"ShortPut" = 4,
}

type OptionTypeStrikes = {
	[OptionType.LongCall]: number;
	[OptionType.LongPut]: number;
	[OptionType.ShortCallQuote]: number;
	[OptionType.ShortCall]: number;
	[OptionType.ShortPut]: number;
};

// calculates max cost for buys
// calculates max premium for sells

export const _calculateMaxPremiums = (strikes: LyraStrike[]) => {
	return strikes.reduce(
		(totalPremiums: [number, number], strike: LyraStrike) => {
			const {
				quote: { size, isBuy, pricePerOption },
			} = strike;

			const _totalPriceForOptions = fromBigNumber(pricePerOption) * fromBigNumber(size);

			if (isBuy) {
				totalPremiums[0] += _totalPriceForOptions;
			} else {
				totalPremiums[1] += _totalPriceForOptions;
			}

			return totalPremiums;
		},
		[0, 0] as [number, number]
	);
};

export const _furthestOutExpiry = (strikes: LyraStrike[]) => {
	return (
		strikes.reduce((expiration: number, strike: LyraStrike) => {
			const {
				expiryTimestamp,
				quote: { isBuy },
			} = strike;
			if (!isBuy) {
				return expiration > expiryTimestamp ? expiration : expiryTimestamp;
			} else {
				return expiration;
			}
		}, 0 as number) * 1000
	);
};

export const _calculateMaxLoss = (
	strikes: LyraStrike[],
	maxCost: number
): [boolean, number, number, number] => {
	if (strikes.length > 0) {
		let strikesByOptionTypes: OptionTypeStrikes = {
			0: 0,
			1: 0,
			2: 0,
			3: 0,
			4: 0,
		};

		const optionTypeMatch = strikes.reduce((accum: OptionTypeStrikes, strike: LyraStrike) => {
			const {
				quote: { isBuy, isCall },
			} = strike;

			const optionType = calculateOptionType(isBuy, isCall);
			accum[optionType] += 1;

			return accum;
		}, strikesByOptionTypes as OptionTypeStrikes);

		// if no shorts
		if (optionTypeMatch[3] === 0 && optionTypeMatch[4] === 0) {
			return [true, maxCost, Infinity, 0];
		}

		// if size of longs puts < short puts
		// infinite loss
		let validCalls = true;
		if (optionTypeMatch[3] != 0 && optionTypeMatch[0] < optionTypeMatch[3]) {
			validCalls = false; // max loss is collateral
		}

		// if size of long calls < short calls
		// infinite loss
		let validPuts = true;
		if (optionTypeMatch[4] != 0 && optionTypeMatch[1] < optionTypeMatch[4]) {
			validPuts = false;
		}

		// max loss - calls
		const calls = strikes
			.filter((strike: LyraStrike) => {
				const {
					quote: { isCall },
				} = strike;
				return isCall;
			})
			.sort((a: LyraStrike, b: LyraStrike) => {
				return fromBigNumber(a.strikePrice) - fromBigNumber(b.strikePrice);
			});

		const shortCallCollateralMax = calls.reduce(
			(total: [number, number], strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				if (!isBuy) {
					total[0] += fromBigNumber(strikePrice) * fromBigNumber(size);
					total[1] += fromBigNumber(size);
				}
				return total;
			},
			[0, 0] as [number, number]
		);

		if (!validCalls) {
			return [validCalls, shortCallCollateralMax[0], 0, 0];
		}

		let shortCallSize = shortCallCollateralMax[1];
		let maxCallLoss = 0;

		if (shortCallSize > 0) {
			calls.forEach((strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				let longSize = fromBigNumber(size);

				if (isBuy) {
					let cover = fromBigNumber(strikePrice) * fromBigNumber(size);
					maxCallLoss = cover - shortCallCollateralMax[0];
					shortCallSize = shortCallSize - longSize;
					if (shortCallSize <= 0) {
						return;
					}
				}
			});
		}

		// max loss - puts
		const puts = strikes
			.filter((strike: LyraStrike) => {
				const {
					quote: { isCall },
				} = strike;
				return !isCall;
			})
			.sort((a: LyraStrike, b: LyraStrike) => {
				return fromBigNumber(b.strikePrice) - fromBigNumber(a.strikePrice);
			});

		const shortPutCollateralMax = puts.reduce(
			(total: [number, number], strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				if (!isBuy) {
					total[0] += fromBigNumber(strikePrice) * fromBigNumber(size);
					total[1] += fromBigNumber(size);
				}
				return total;
			},
			[0, 0] as [number, number]
		);

		if (!validPuts) {
			return [validPuts, shortPutCollateralMax[0], 0, 0];
		}

		let shortPutSize = shortPutCollateralMax[1];
		let maxPutLoss = 0;

		if (shortPutSize > 0) {
			puts.forEach((strike: LyraStrike) => {
				const {
					strikePrice,
					quote: { isBuy, size },
				} = strike;
				let longSize = fromBigNumber(size);

				if (isBuy) {
					let cover = fromBigNumber(strikePrice) * fromBigNumber(size);
					maxPutLoss = cover - shortPutCollateralMax[0];
					shortPutSize = shortPutSize - longSize;
					if (shortPutSize <= 0) {
						return;
					}
				}
			});
		}

		return [
			true,
			Math.abs(maxPutLoss) > Math.abs(maxCallLoss) ? Math.abs(maxPutLoss) : Math.abs(maxCallLoss),
			0,
			shortPutCollateralMax[0] + shortCallCollateralMax[0],
		];
	}

	return [false, 0, 0, 0];
};

export const checkValidSpread = (strikes: LyraStrike[]): boolean => {
	let calls = strikes.filter((strike: LyraStrike) => strike.quote.isCall);
	let puts = strikes.filter((strike: LyraStrike) => !strike.quote.isCall);

	let callSizes = calls.reduce(
		(size: { buys: BigNumber; sells: BigNumber }, strike: LyraStrike) => {
			const { quote } = strike;
			const { isBuy } = quote;

			return isBuy
				? { ...size, buys: size.buys.add(strike.quote.size) }
				: { ...size, sells: size.sells.add(strike.quote.size) };
		},
		{ buys: ZERO_BN, sells: ZERO_BN }
	);

	if (callSizes.buys.lt(callSizes.sells)) {
		return false; // more sell calls than buy calls
	}

	let putSizes = puts.reduce(
		(size: { buys: BigNumber; sells: BigNumber }, strike: LyraStrike) => {
			const { quote } = strike;
			const { isBuy } = quote;

			return isBuy
				? { ...size, buys: size.buys.add(strike.quote.size) }
				: { ...size, sells: size.sells.add(strike.quote.size) };
		},
		{ buys: ZERO_BN, sells: ZERO_BN }
	);

	if (putSizes.buys.lt(putSizes.sells)) {
		return false; // more sell calls than buy calls
	}

	return true;
};

export const calculateTotalCost = (
	spreadSelected: boolean,
	maxLoss: number,
	maxCost: number,
	maxPremium: number
) => {
	if (!spreadSelected || maxLoss == -Infinity || maxLoss == Infinity) {
		return maxCost - maxPremium;
	}

	if (spreadSelected) {
		return Math.abs(maxLoss);
	}

	return maxCost - maxPremium;
};
