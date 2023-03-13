import { BigNumber, Bytes } from "ethers";
import request, { gql } from "graphql-request";
import { useQuery } from "react-query";
import { Address, useNetwork } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";

const QUERY_KEYS = {
	ACCOUNT: {
		Owner: (addr: string) => ["owner", addr],
	},
};

type AccountOrderData = {
	accountOrders: AccountOrder[];
};

export type Order = {
	id: string;
	orderId: number;
	committedMargin: BigNumber;
	gelatoTaskId: Bytes;
	market: Bytes;
	collatPercent: BigNumber;
	optionType: number;
	strikeId: BigNumber;
	size: BigNumber;
	positionId: BigNumber;
	tradeDirection: BigNumber;
	targetPrice: BigNumber;
	targetVolatility: BigNumber;
	status: number | null;
};

export type AccountOrder = {
	id: Address;
	owner: Address;
	balance: BigNumber;
	orders: Array<Order>;
};

export const useAccountWithOrders = (owner: any) => {
	const { chain } = useNetwork();

	const otusAccountOrderEndpoint = getOtusEndpoint(chain?.id);
	return useQuery<AccountOrderData | null>(
		QUERY_KEYS.ACCOUNT.Owner(owner?.toLowerCase()),
		async () => {
			if (!otusAccountOrderEndpoint) return null;
			if (!owner) return null;
			if (!chain) return null;
			return await request(
				otusAccountOrderEndpoint,
				gql`
					query ($owner: String!) {
						accountOrders(where: { owner: $owner }) {
							id
							owner
							balance
							orders {
								id
								orderId
								committedMargin
								gelatoTaskId
								market
								collatPercent
								optionType
								strikeId
								size
								positionId
								tradeDirection
								targetPrice
								targetVolatility
								status
							}
						}
					}
				`,
				{ owner: owner.toLowerCase() }
			);
		},
		{
			enabled: !!owner,
		}
	);
};
