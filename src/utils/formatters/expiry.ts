import { MONTHS } from "../../constants/dates";

export const formatBoardName = (expiryTimestamp: number) => {
	const date = new Date(expiryTimestamp * 1000);
	const month = MONTHS[date.getMonth()];
	const day = date.getDate();
	const hours = date.getHours();
	return `Expires ${month} ${day}, ${hours}:00`;
};

export const formatExpirationDate = (expiryTimestamp: number) => {
	const date = new Date(expiryTimestamp * 1000);
	const month = MONTHS[date.getMonth()];
	const day = date.getDate();
	const hours = date.getHours();
	return `${month} ${day}, ${hours}:00 UTC`;
};

export const formatExpirationTitle = (expiryTimestamp: number) => {
	const date = new Date(expiryTimestamp * 1000);
	const month = MONTHS[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();
	return `Expires ${month} ${day}, ${year}`;
};
