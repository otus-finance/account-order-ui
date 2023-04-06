import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import { useQuery } from "react-query";
import { Address, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";

const QUERY_KEYS = {
	LPUser: (addr?: string, poolAddr?: string) => ["lpUser", `${poolAddr}-${addr}`],
};

type LPUserData = {
	lpusers: LPUser[];
};

export type LPUser = {
	id: string;
	user: Address;
	lpTokenBalance: BigNumber;
	totalAmountDeposited: BigNumber;
	totalAmountWithdrawn: BigNumber;
};

export const useLPUser = (poolId: Address | undefined, owner: Address | undefined) => {
	const { chain } = useNetwork();
	const otusSpreadLiquidityEndpoint = getOtusEndpoint(chain?.id);
	return useQuery<LPUserData | null>(
		QUERY_KEYS.LPUser(owner, poolId),
		async () => {
			if (!otusSpreadLiquidityEndpoint) return null;
			if (!poolId) return null;
			if (!owner) return null;
			if (!chain) return null;

			const id = `${poolId}-${owner}`;
			return await request(
				otusSpreadLiquidityEndpoint,
				gql`
					query ($id: String!) {
						lpusers(where: { id: $id }) {
							id
							user
							lpTokenBalance
							totalAmountDeposited
						}
					}
				`,
				{ id: id.toLowerCase() }
			);
		},
		{
			enabled: true,
		}
	);
};
