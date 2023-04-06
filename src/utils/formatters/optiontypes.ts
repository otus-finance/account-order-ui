export const calculateOptionType = (isBuy: boolean, isCall: boolean) => {
	if (isBuy && isCall) {
		return 0;
	} else if (isBuy && !isCall) {
		return 1;
	} else if (!isBuy && isCall) {
		return 3;
	}
	//short put
	return 4;
};

export const isLong = (optionType: number) => {
	if (optionType === 0 || optionType === 1) {
		return true;
	} else {
		return false;
	}
};

export const isCall = (optionType: number) => {
	if (optionType === 0 || optionType === 3) {
		return true;
	} else {
		return false;
	}
};

export const extrensicValueFilter = (
	priceAt: number,
	isCall: boolean,
	currentPrice: number,
	strikePrice: number
) => {
	if (priceAt == 0 && isOTM(isCall, currentPrice, strikePrice)) {
		return true;
	}

	if (priceAt == 1 && isITM(isCall, currentPrice, strikePrice)) {
		return true;
	}

	if (priceAt == 2 && isATM(isCall, currentPrice, strikePrice)) {
		return true;
	}

	return false;
};

export const isOTM = (isCall: boolean, currentPrice: number, strikePrice: number) => {
	if (isCall) {
		return strikePrice > currentPrice;
	} else {
		return strikePrice < currentPrice;
	}
};

export const isITM = (isCall: boolean, currentPrice: number, strikePrice: number) => {
	if (isCall) {
		return strikePrice < currentPrice;
	} else {
		return strikePrice > currentPrice;
	}
};

export const isATM = (isCall: boolean, currentPrice: number, strikePrice: number) => {
	return (
		strikePrice < currentPrice + currentPrice * 0.05 &&
		strikePrice > currentPrice - currentPrice * 0.05
	);
};
