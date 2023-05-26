import { MAX_BN, ZERO_ADDRESS, ZERO_BN } from "../../constants/bn";
import { LyraStrike } from "../../queries/lyra/useLyra";
import { fromBigNumber, toBN } from "../formatters/numbers";
import { calculateOptionType, isLong } from "../formatters/optiontypes";
import { TradeInputParameters } from "../types";

export const convertTradeParams = (
	strikes: LyraStrike[],
	slippage: number
): TradeInputParameters[] => {
	return strikes.map((strike: LyraStrike) => {
		const {
			setCollateralTo,
			quote: { isBuy, isCall, premium, size },
		} = strike;
		const optionType = calculateOptionType(isBuy, isCall);
		const _isLong = isLong(optionType);
		const _premium = _isLong
			? fromBigNumber(premium) + fromBigNumber(premium) * 0.01 // slippage
			: fromBigNumber(premium) - fromBigNumber(premium) * 0.01;

		return {
			strikeId: strike.id,
			positionId: 0,
			iterations: 1,
			optionType: optionType,
			amount: size,
			setCollateralTo: setCollateralTo,
			minTotalCost: _isLong ? ZERO_BN : toBN(_premium.toString()),
			maxTotalCost: _isLong ? toBN(_premium.toString()) : MAX_BN,
			rewardRecipient: ZERO_ADDRESS,
		} as TradeInputParameters;
	});
};

export const isStrikeMatch = (newStrike: LyraStrike, existingStrike: LyraStrike) => {
	if (
		newStrike.id == existingStrike.id &&
		calculateOptionType(newStrike.quote.isBuy, newStrike.isCall) ==
			calculateOptionType(existingStrike.quote.isBuy, existingStrike.quote.isCall)
	) {
		return true;
	}
	return false;
};
