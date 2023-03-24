import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import { useQuery } from "react-query";
import { Address, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";

const QUERY_KEYS = {
	POOL: {
		SpreadLiquidity: ["spread_liquidity"],
	},
};

type LiquidityPoolData = {
	liquidityPools: LiquidityPool[];
};

export type LiquidityPool = {
	id: Address;
	pendingDeposits: Address;
	pendingWithdrawals: BigNumber;
	lockedCollateral: BigNumber;
	collateralUpdates: Array<any>;
	lpUsers: Array<any>;
};

export const useLiquidityPool = () => {
	const { chain } = useNetwork();
	const otusSpreadLiquidityEndpoint = getOtusEndpoint(chain?.id);

	return useQuery<LiquidityPoolData | null>(
		QUERY_KEYS.POOL.SpreadLiquidity,
		async () => {
			if (!otusSpreadLiquidityEndpoint) return null;
			return await request(
				otusSpreadLiquidityEndpoint,
				gql`
					query {
						liquidityPools {
							id
							pendingDeposits
							pendingWithdrawals
							lockedCollateral
							collateralUpdates {
								id
							}
							lpUsers {
								id
							}
						}
					}
				`
			);
		},
		{
			enabled: false,
		}
	);
};
