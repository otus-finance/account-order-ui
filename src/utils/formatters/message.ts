export const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
	return isBuy ? `(${usd})` : usd;
};

export const formatName = (marketName: string) => {
	return marketName.substring(0, marketName.indexOf("-"));
};
