import { Address, Chain } from "wagmi";
import { getOtusEndpoint } from "../../utils/endpoints";
import { useQuery } from "react-query";
import request, { gql } from "graphql-request";
import { BigNumber, BigNumberish } from "ethers";

const QUERY_KEYS = {
	VAULT: ["otus_vault"],
};

export type OtusVaultData = {
	vaults: OtusVault[];
};

export type OtusVault = {
	id: Address;
	owner: Address;
	name: string;
	tokenName: string;
	tokenSymbol: string;
	tokenDecimals: BigNumber;
	asset: Address;
	cap: BigNumber;
	round: BigNumberish;
	lockedBalance: BigNumber;
};

export const useVaults = (chain: Chain | undefined) => {
	const otusSpreadLiquidityEndpoint = getOtusEndpoint(chain?.id);

	return useQuery<OtusVaultData | null | undefined>(
		QUERY_KEYS.VAULT,
		async () => {
			if (!chain) return null;
			if (!otusSpreadLiquidityEndpoint) return null;
			const response: OtusVaultData = await request(
				otusSpreadLiquidityEndpoint,
				gql`
					query {
						vaults {
							id
							owner
							name
							tokenName
							tokenSymbol
							tokenDecimals
							asset
							cap
							round
							lockedBalance
						}
					}
				`
			);

			return response;
		},
		{
			enabled: true,
		}
	);
};

export const useVaultById = (chain: Chain | undefined, vaultId: string) => {
	const otusSpreadLiquidityEndpoint = getOtusEndpoint(chain?.id);

	return useQuery<OtusVault | null | undefined>(
		QUERY_KEYS.VAULT,
		async () => {
			if (!vaultId) return null;
			if (!chain) return null;
			if (!otusSpreadLiquidityEndpoint) return null;
			const response: OtusVaultData = await request(
				otusSpreadLiquidityEndpoint,
				gql`
					query ($vaultId: String!) {
						vaults(where: { id: $vaultId }) {
							id
							owner
							name
							tokenName
							tokenSymbol
							tokenDecimals
							asset
							cap
							round
							lockedBalance
						}
					}
				`,
				{ vaultId: vaultId.toLowerCase() }
			);

			return response ? response.vaults[0] : null;
		},
		{
			enabled: true,
		}
	);
};
