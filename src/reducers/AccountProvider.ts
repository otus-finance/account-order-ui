import { AccountQuoteBalance, Trade } from "@lyrafinance/lyra-js"

export type AccountProviderState = {
  isLoading: boolean
  tradeInit: Trade | null
  marketAddress: string
  quoteAsset: AccountQuoteBalance | null
  fetchMarketQuoteBalance: () => void
}

export const accountInitialState: AccountProviderState = {
  isLoading: false,
  tradeInit: null,
  marketAddress: '',
  quoteAsset: null,
  fetchMarketQuoteBalance: () => { }
}

export type AccountAction =
  | {
    type: 'SET_LOADING',
    isLoading: AccountProviderState['isLoading']
  }
  | {
    type: 'SET_TRADE_INIT',
    tradeInit: AccountProviderState['tradeInit'],
    marketAddress: AccountProviderState['marketAddress'],
    isLoading: AccountProviderState['isLoading']
  }
  | {
    type: 'SET_QUOTE_ASSET',
    quoteAsset: AccountProviderState['quoteAsset'],
    isLoading: AccountProviderState['isLoading']
  }
  | {
    type: 'RESET_ACCOUNT_PROVIDER',
  }

export function accountReducer(
  state: AccountProviderState,
  action: AccountAction
): AccountProviderState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'SET_TRADE_INIT':
      return { ...state, tradeInit: action.tradeInit, marketAddress: action.marketAddress, isLoading: action.isLoading }
    case 'SET_QUOTE_ASSET':
      return { ...state, quoteAsset: action.quoteAsset, isLoading: action.isLoading }
    case 'RESET_ACCOUNT_PROVIDER':
      return accountInitialState
    default:
      throw new Error()
  }
}
