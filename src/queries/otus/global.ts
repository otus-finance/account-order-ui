import request, { gql } from "graphql-request";
import { useQuery } from "react-query";
import { Address, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";

const QUERY_KEYS = {
	Global: ["Global"],
};

type OtusGlobalData = {
	globals: Global[];
};

export type Global = {
	id: number;
	otusAMM: Address;
	lyraBaseETH: Address;
	lyraBaseBTC: Address;
	spreadOptionMarket: Address;
};

export const useGlobal = () => {
	const { chain } = useNetwork();

	const otusEndpoint = getOtusEndpoint(chain?.id);
	return useQuery<Global | null | undefined>(
		QUERY_KEYS.Global,
		async () => {
			if (!otusEndpoint) return null;
			const response: OtusGlobalData = await request(
				otusEndpoint,
				gql`
					query {
						globals {
							id
							otusAMM
							lyraBaseETH
							lyraBaseBTC
							spreadOptionMarket
						}
					}
				`
			);
			return response ? response.globals[0] : null;
		},
		{
			enabled: true,
		}
	);
};
