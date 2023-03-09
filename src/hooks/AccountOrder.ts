import { useEffect, useReducer } from 'react';
import {
  useAccount
} from 'wagmi';
import { useAccountWithOrders } from '../queries/otus/account';

import {
  AccountOrderProviderState,
  AccountOrderAction,
  accountOrderInitialState,
  accountOrderReducer,
} from '../reducers'

export const useAccountOrder = (owner: string) => {
  const [state, dispatch] = useReducer(
    accountOrderReducer,
    accountOrderInitialState
  );

  const { isLoading, accountOrder } = state;

  console.log({ owner })
  const { isLoading: isDataLoading, data } = useAccountWithOrders(owner);

  useEffect(() => {
    if (isDataLoading && isDataLoading != isLoading) {
      dispatch({
        type: 'SET_LOADING',
        isLoading: isDataLoading
      })
    }
  }, [isLoading, isDataLoading])

  useEffect(() => {
    if (data) {
      // get first accountorder
      const { accountOrders } = data;
      if (!accountOrders[0]) return;
      dispatch({
        type: 'SET_ACCOUNT_ORDER',
        accountOrder: accountOrders[0]
      })

    }
  }, [data])

  return { isLoading, accountOrder } as AccountOrderProviderState;
}