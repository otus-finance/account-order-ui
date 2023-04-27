import { useQuery } from "react-query";

import Lyra, { Board, Market, Chain, Quote, Strike, Position } from "@lyrafinance/lyra-js";
import { BigNumber, ethers } from "ethers";
import { ONE_BN } from "../../constants/bn";
import { fromBigNumber } from "../../utils/formatters/numbers";
import { formatBoardName } from "../../utils/formatters/expiry";
import { ETH_MARKET } from "../../constants/markets";
import { Address } from "wagmi";

export type LyraChain = {
	name: Chain;
	chainId: number;
};

export type LyraStrike = {
	market: string;
	selectedOptionType: number | 0;
	isCall: boolean;
	quote: Quote;
	expiryTimestamp: number;
	selected?: boolean;
	isUpdating?: boolean;
	collateralPercent: number;
} & Strike;

export type LyraStrikeMapping = {
	[key: number]: LyraStrike[];
};

export type LyraBoard = {
	id: number;
	name: string;
	expiryTimestamp: number;
	baseIv: BigNumber;
	strikes: Strike[];
	strikesByOptionTypes?: LyraStrikeMapping;
	strikesWithQuotes: LyraStrike[];
	marketName: string;
};

export type LyraMarket = {
	address: string;
	bytes: string;
	name: string;
	isPaused: boolean;
	tvl: BigNumber;
	openInterest: BigNumber;
	spotPrice: BigNumber;
	liquidity: BigNumber;
	liveBoards: LyraBoard[];
};

export const useLyraMarket = (lyra: Lyra | null) => {
	return useQuery<LyraMarket[] | null>(
		["lyraMarkets", lyra?.chainId],
		async () => {
			if (!lyra) return null;
			const response: Market[] = await lyra.markets();
			return response ? parseMarketResponse(response) : null;
		},
		{
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		}
	);
};

export const useLyraPositions = (lyra: Lyra | null, owner?: Address) => {
	return useQuery<Position[] | null>(
		["positions", owner],
		async () => {
			if (!lyra) return null;
			if (!owner) return null;
			const positions = await lyra.positions(owner);
			return positions;
		},
		{
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		}
	);
};

export const getStrikeQuote = async (
	lyra: Lyra,
	isCall: boolean,
	isBuy: boolean,
	size: BigNumber,
	trade: LyraStrike
) => {
	const marketName = trade.market;
	const _strike = await lyra.strike(marketName, trade.id);
	const quote = await _strike.quote(isCall, isBuy, size);
	return quote;
};
/**
 * @dev add types to liveBoardsWithQuotedStrikes
 */
const parseMarketResponse = async (markets: Market[]): Promise<LyraMarket[]> => {
	return await Promise.all(
		markets.map(async (market) => {
			const { address, name, isPaused, openInterest, spotPrice, lyra } = market;
			{
				/* @ts-ignore */
			}
			const liveBoards: LyraBoard[] = parseMarketBoards(market.liveBoards());

			const { tvl, freeLiquidity } = await market.liquidity();

			const liveBoardsWithQuotedStrikes: any[] = await parseBoardStrikes(liveBoards);
			return {
				bytes: getMarketInBytes(name),
				address,
				name,
				isPaused,
				tvl,
				openInterest,
				spotPrice,
				liquidity: freeLiquidity,
				liveBoards: liveBoardsWithQuotedStrikes,
			};
		})
	);
};

const getMarketInBytes = (name: string) => {
	return ETH_MARKET;
};

// temp fix arbitrum and optimism appear to return different board properties
const parseMarketBoards = (boards: Board[]): LyraBoard[] => {
	return boards.map((board) => {
		const { id, expiryTimestamp, baseIv } = board;
		const marketName = board.market().name;

		const strikes: Strike[] = board
			.strikes()
			.filter((strike) => strike.isDeltaInRange)
			.sort(sortStrikes);
		const name = formatBoardName(expiryTimestamp);
		return { name, id, expiryTimestamp, baseIv, strikes, marketName, strikesWithQuotes: [] };
	});
};

const sortStrikes = (a: Strike, b: Strike) => {
	return fromBigNumber(a.strikePrice) - fromBigNumber(b.strikePrice);
};

const parseBoardStrikes = async (boards: LyraBoard[]) => {
	return await Promise.all(
		boards.map(async (board) => {
			const { strikes, marketName, expiryTimestamp } = board;

			const strikesLongCallQuotes = await formatStrikeWithQuote(
				expiryTimestamp,
				marketName,
				strikes,
				true, // isCall
				true // isBuy
			);
			const strikesLongPutQuotes = await formatStrikeWithQuote(
				expiryTimestamp,
				marketName,
				strikes,
				false,
				true
			);
			const strikesShortCallQuotes = await formatStrikeWithQuote(
				expiryTimestamp,
				marketName,
				strikes,
				true,
				false
			);
			const strikesShortPutQuotes = await formatStrikeWithQuote(
				expiryTimestamp,
				marketName,
				strikes,
				false,
				false
			);

			return {
				...board,
				strikesByOptionTypes: {
					0: strikesLongCallQuotes,
					1: strikesLongPutQuotes,
					3: strikesShortCallQuotes,
					4: strikesShortPutQuotes,
				},
				strikesWithQuotes: [
					...strikesLongCallQuotes,
					...strikesLongPutQuotes,
					...strikesShortCallQuotes,
					...strikesShortPutQuotes,
				],
			};
		})
	);
};

const formatStrikeWithQuote = async (
	expiryTimestamp: number,
	marketName: string,
	strikes: Strike[],
	isCall: boolean,
	isLong: boolean
) => {
	return await Promise.all(
		strikes.map(async (strike: Strike) => {
			const quote = await strike.quote(isCall, isLong, ONE_BN);
			return {
				...strike,
				isCall,
				quote,
				market: marketName,
				expiryTimestamp,
				collateralPercent: 1,
			};
		})
	);
};

type OPTION_TYPE = {
	[key: number]: boolean[];
};

const OPTION_TYPES: OPTION_TYPE = {
	0: [true, true], // buy call
	1: [false, true], // buy put
	2: [true, false], // sell covered call
	3: [true, false], // sell call
	4: [false, false], // sell put
};
