import { Strategy, StrategyDirection } from "../components/Builder/types"
import { PnlChartPoint } from "../hooks/BuilderChart"
import { LyraBoard, LyraMarket, LyraStrike } from "../queries/lyra/useLyra"

export type SharedBuildProviderState = {
  markets: LyraMarket[] | null
  isMarketLoading: boolean
  errorInSharedStrategy: boolean,
  selectedMarket: LyraMarket | null
  selectedExpirationDate: LyraBoard | null
  strikes: LyraStrike[]
  positionPnl: any | null | undefined // netcreditdebit max profit max loss
  errorReason: string
  currentPrice: number
}

export const sharedBuildInitialState: SharedBuildProviderState = {
  markets: [],
  isMarketLoading: false,
  errorInSharedStrategy: false,
  selectedMarket: null,
  selectedExpirationDate: null,
  strikes: [],
  positionPnl: {
    netCreditDebit: 0,
    maxLoss: 0,
    maxPorfit: 0
  },
  errorReason: '',
  currentPrice: 0
}

export type SharedBuildAction =
  | {
    type: 'SET_MARKETS',
    markets: SharedBuildProviderState['markets'],
    isMarketLoading: SharedBuildProviderState['isMarketLoading'],
  }
  | {
    type: 'SET_MARKETS_LOADING',
    isMarketLoading: SharedBuildProviderState['isMarketLoading'],
  }
  | {
    type: 'SET_SHARED_BUILD'
    strikes: SharedBuildProviderState['strikes'],
    selectedMarket: SharedBuildProviderState['selectedMarket'],
    selectedExpirationDate: SharedBuildProviderState['selectedExpirationDate'],
  }
  | {
    type: 'SET_CURRENT_PRICE',
    currentPrice: SharedBuildProviderState['currentPrice']
  }
  | {
    type: 'SET_POSITION_PNL',
    positionPnl: SharedBuildProviderState['positionPnl']
  }
  | {
    type: 'SET_ERROR_SHARED_BUILD'
    errorReason: SharedBuildProviderState['errorReason'],
    errorInSharedStrategy: SharedBuildProviderState['errorInSharedStrategy']
  }
  | {
    type: 'SET_IS_EXPIRED'
    errorReason: SharedBuildProviderState['errorReason'],
    errorInSharedStrategy: SharedBuildProviderState['errorInSharedStrategy']
  }
  | {
    type: 'RESET_BUILDER_PROVIDER',
  }


export function sharedBuildReducer(
  state: SharedBuildProviderState,
  action: SharedBuildAction
): SharedBuildProviderState {
  switch (action.type) {
    case 'SET_MARKETS':
      return { ...state, markets: action.markets, isMarketLoading: action.isMarketLoading }
    case 'SET_MARKETS_LOADING':
      return { ...state, isMarketLoading: action.isMarketLoading }
    case 'SET_SHARED_BUILD':
      return {
        ...state,
        strikes: action.strikes,
        selectedMarket: action.selectedMarket,
        selectedExpirationDate: action.selectedExpirationDate,
      }
    case 'SET_CURRENT_PRICE':
      return { ...state, currentPrice: action.currentPrice }
    case 'SET_POSITION_PNL':
      return { ...state, positionPnl: action.positionPnl }
    case 'SET_ERROR_SHARED_BUILD':
      return {
        ...state,
        errorReason: action.errorReason,
        errorInSharedStrategy: action.errorInSharedStrategy
      }
    case 'SET_IS_EXPIRED':
      return {
        ...state,
        errorReason: action.errorReason,
        errorInSharedStrategy: action.errorInSharedStrategy
      }
    case 'RESET_BUILDER_PROVIDER':
      return sharedBuildInitialState
    default:
      throw new Error()
  }
}
