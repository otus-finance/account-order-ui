import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import { Query, UseQueryResult, useQuery } from "react-query";
import { Address, Chain, useNetwork } from "wagmi";
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
	quoteBalance: BigNumber;
	freeCollateral: BigNumber;
	feesCollected: BigNumber;
	cap: BigNumber;
	minDepositWithdraw: BigNumber;
	collateralUpdates: Array<CollateralUpdate>;
	lpUsers: Array<LPUser>;
};

export const useLiquidityPool = (chain?: Chain) => {
	const otusSpreadLiquidityEndpoint = getOtusEndpoint(chain?.id);

	return useQuery<LiquidityPool | null | undefined>(
		QUERY_KEYS.POOL.SpreadLiquidity,
		async () => {
			if (!chain) return null;
			if (!otusSpreadLiquidityEndpoint) return null;
			const response: LiquidityPoolData = await request(
				otusSpreadLiquidityEndpoint,
				gql`
					query {
						liquidityPools {
							id
							quoteBalance
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
			return response.liquidityPools.length > 0 ? response.liquidityPools[0] : null;
		},
		{
			enabled: true,
		}
	);
};
