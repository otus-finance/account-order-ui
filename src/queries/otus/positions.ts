import { BigNumber, BigNumberish } from "ethers";
import request, { gql } from "graphql-request";
import { Query, UseQueryResult, useQuery } from "react-query";
import { Address, useAccount, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";
import { LPUser } from "./user";

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
	state: BigNumberish;
	openTimestamp: number;
	txHash: string;
};

export const usePositions = () => {
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
							owner
							state
							openTimestamp
							txHash
						}
					}
				`,
				{ owner: owner.toLowerCase() }
			);
			return response;
		},
		{
			enabled: true,
		}
	);
};
