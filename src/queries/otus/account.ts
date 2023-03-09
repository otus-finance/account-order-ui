import request, { gql } from 'graphql-request';
import { useQuery } from 'react-query';
import { useNetwork } from 'wagmi';
import { getOtusEndpoint } from '../../utils/endpoints';

const QUERY_KEYS = {
  ACCOUNT: {
    Owner: (addr: string) => ['owner', addr]
  }
}

type AccountOrderData = {
  accountOrders: AccountOrder[]
}

export type AccountOrder = {
  id: number
}

export const useAccountWithOrders = (owner: any) => {
  const { chain } = useNetwork();

  const otusAccountOrderEndpoint = getOtusEndpoint(chain?.id);
  return useQuery<AccountOrderData | null>(
    QUERY_KEYS.ACCOUNT.Owner(owner?.toLowerCase()),
    async () => {
      if (!owner) return null;
      if (!chain) return null;
      return await request(
        otusAccountOrderEndpoint,
        gql`
          query($owner: String!) {
            accountOrders(where: { owner: $owner }) {
              id
              owner 
              balance 
              orders {
                id
              }
            }
          }
        `,
        { owner: owner.toLowerCase() }
      );
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1000 * 60,
    }
  )
}