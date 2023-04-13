import { BigNumber, BigNumberish, Bytes } from "ethers";
import request, { gql } from "graphql-request";
import { useQuery } from "react-query";
import { Address, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";

const QUERY_KEYS = {
	MARKET: {
		Ranged: ["ranged_markets"],
	},
};

type RangedMarketData = {
	rangedMarkets: RangedMarket[];
};

export type RangedMarket = {
	id: Address;
	rangedMarketTokenIn: Address;
	rangedMarketTokenOut: Address;
	positionMarketIn: Address;
	positionMarketOut: Address;
	expiry: number;
	market: string;
};

export const useRangedMarkets = () => {
	const { chain } = useNetwork();

	const otusEndpoint = getOtusEndpoint(chain?.id);
	return useQuery<RangedMarketData | null>(
		QUERY_KEYS.MARKET.Ranged,
		async () => {
			if (!otusEndpoint) return null;
			return await request(
				otusEndpoint,
				gql`
					query {
						rangedMarkets {
							id
							rangedMarketTokenIn
							rangedMarketTokenOut
							positionMarketIn
							positionMarketOut
							expiry
							market
						}
					}
				`
			);
		},
		{
			enabled: true,
		}
	);
};
