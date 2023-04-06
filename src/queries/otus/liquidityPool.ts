import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import { Query, UseQueryResult, useQuery } from "react-query";
import { Address, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";
import { LPUser } from "./user";

const QUERY_KEYS = {
	POOL: {
		SpreadLiquidity: ["spread_liquidity"],
	},
};

type LiquidityPoolData = {
	liquidityPools: LiquidityPool[];
};

type CollateralUpdate = {
	id: Address;
};

export type LiquidityPool = {
	id: Address;
	pendingDeposits: BigNumber;
	pendingWithdrawals: BigNumber;
	lockedCollateral: BigNumber;
	freeCollateral: BigNumber;
	feesCollected: BigNumber;
	cap: BigNumber;
	minDepositWithdraw: BigNumber;
	collateralUpdates: Array<CollateralUpdate>;
	lpUsers: Array<LPUser>;
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
							freeCollateral
							feesCollected
							cap
							minDepositWithdraw
							collateralUpdates
							lpUsers {
								id
								user
								lpTokenBalance
								totalAmountDeposited
							}
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
