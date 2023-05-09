import { BigNumber, BigNumberish } from "ethers";
import request, { gql } from "graphql-request";
import { Query, UseQueryResult, useQuery } from "react-query";
import { Address, useAccount, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";
import { LPUser } from "./user";
import Lyra, { Position as LyraPosition } from "@lyrafinance/lyra-js";
import { fromBigNumber } from "../../utils/formatters/numbers";

const QUERY_KEYS = {
	POSITION: {
		SpreadPosition: (addr: string | undefined) => ["spread_positions", addr],
	},
};

type PositionData = {
	positions: Position[];
};

export type Position = {
	id: BigNumber;
	owner: Address;
	market: string;
	state: BigNumberish;
	openTimestamp: number;
	txHash: string;
	allPositions: [];
	tradeType: BigNumberish;
	lyraPositions: LyraPosition[];
	isInTheMoney: boolean;
	unrealizedPnl: number;
	trade: Trade;
};

type Trade = {
	cost: BigNumber;
	fee: BigNumber;
	marginBorrowed: BigNumber;
};

export const usePositions = (lyra: Lyra | null) => {
	const { chain } = useNetwork();
	const { address: owner } = useAccount();

	const otusEndpoint = getOtusEndpoint(chain?.id);
	return useQuery<PositionData | null | undefined>(
		QUERY_KEYS.POSITION.SpreadPosition(owner?.toLowerCase()),
		async () => {
			if (!owner) return null;
			if (!chain) return null;
			if (!otusEndpoint) return null;
			const response: PositionData = await request(
				otusEndpoint,
				gql`
					query ($owner: String!) {
						positions(where: { owner: $owner }) {
							id
							market
							owner
							state
							openTimestamp
							txHash
							allPositions
							tradeType
							trade {
								cost
								fee
								marginBorrowed
							}
						}
					}
				`,
				{ owner: owner.toLowerCase() }
			);
			console.log({ response });
			if (lyra) {
				const positionsWithLegs: Position[] = await Promise.all(
					response.positions.map(async (position: Position) => {
						const { allPositions, market } = position;

						const positions: LyraPosition[] = await Promise.all(
							allPositions.map(async (id) => {
								return await lyra.position("ETH-USDC", id);
							})
						);

						const unrealizedPnl = positions.reduce(
							(totalUnrealized: number, position: LyraPosition) => {
								const { unrealizedPnl } = position.pnl();
								return totalUnrealized + fromBigNumber(unrealizedPnl);
							},
							0
						);

						return {
							...position,
							unrealizedPnl,
							lyraPositions: positions,
						} as Position;
					})
				);

				return { ...response, positions: positionsWithLegs };
			}

			return { ...response, lyraPositions: [] };
		},
		{
			enabled: true,
		}
	);
};

// type OtusPositionPnl = {
// 	unrealizedPnl = BigNumber;
// settlementPnl: BigNumber;
// }
