import { LyraStrike } from "../../queries/lyra/useLyra";
import { calculateOptionType } from "../formatters/optiontypes";

export const isStrikeSelected = (
	selected: boolean,
	optionType: number,
	selectedStrike: LyraStrike,
	currentStrike: LyraStrike
) => {
	const {
		quote: { isCall, isBuy, strikeId },
	} = selectedStrike;
	const selectedOptionType = calculateOptionType(isBuy, isCall);

	if (selectedOptionType == optionType && currentStrike.id == strikeId) {
		return selected;
	} else {
		return currentStrike.selected;
	}
};
