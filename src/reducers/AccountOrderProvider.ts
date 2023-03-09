import { AccountOrder } from "../queries/otus/account"

export type AccountOrderProviderState = {
  isLoading: boolean,
  accountOrder: AccountOrder | null
}

export const accountOrderInitialState: AccountOrderProviderState = {
  isLoading: false,
  accountOrder: null
}

export type AccountOrderAction =
  | {
    type: 'SET_LOADING',
    isLoading: AccountOrderProviderState['isLoading']
  }
  | {
    type: 'SET_ACCOUNT_ORDER',
    accountOrder: AccountOrderProviderState['accountOrder']
  }
  | {
    type: 'RESET_ACCOUNT_ORDER_PROVIDER',
  }

export function accountOrderReducer(
  state: AccountOrderProviderState,
  action: AccountOrderAction
): AccountOrderProviderState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'SET_ACCOUNT_ORDER':
      return { ...state, accountOrder: action.accountOrder }
    case 'RESET_ACCOUNT_ORDER_PROVIDER':
      return accountOrderInitialState
    default:
      throw new Error()
  }
}
