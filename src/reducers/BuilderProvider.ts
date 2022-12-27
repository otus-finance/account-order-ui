import { Strategy, StrategyDirection } from "../components/Builder/types"
import { PnlChartPoint } from "../hooks/BuilderChart"
import { LyraBoard, LyraMarket, LyraStrike } from "../queries/lyra/useLyra"

export type BuilderProviderState = {
  isPrebuilt: boolean
  markets: LyraMarket[] | null
  isMarketLoading: any | null | undefined
  currentPrice: number
  selectedMarket: LyraMarket | null
  selectedDirectionTypes: StrategyDirection[]
  selectedExpirationDate: LyraBoard | null
  selectedStrategy: any | null | undefined
  strikes: LyraStrike[]
  positionPnl: any | null | undefined // netcreditdebit max profit max loss
  isValid: boolean
  isBuildingNewStrategy: any | null | undefined
  generateURL: any | null | undefined  // probably move this to state component management
  isSharedStrategy: boolean,
  errorInSharedStrategy: boolean,
  hasLoadedSharedStrategy: boolean,
  handleSelectedMarket: (any: LyraMarket | null) => void
  handleSelectedDirectionTypes: (any: StrategyDirection[]) => void
  handleSelectedExpirationDate: (any: LyraBoard | null) => void
  handleSelectedStrategy: (any: Strategy | null) => void
  handleUpdateQuote: (any: any) => void
  handleToggleSelectedStrike: (strike: LyraStrike, selected: boolean) => void
  handleUpdatePrebuilt: (any: boolean) => void
}


export const builderInitialState: BuilderProviderState = {
  isPrebuilt: true,
  markets: [],
  isMarketLoading: false,
  currentPrice: 0,
  selectedMarket: null,
  selectedDirectionTypes: [],
  selectedExpirationDate: null,
  selectedStrategy: null,
  strikes: [],
  positionPnl: {
    netCreditDebit: 0,
    maxLoss: 0,
    maxPorfit: 0
  },
  isValid: false,
  isBuildingNewStrategy: false,
  generateURL: false,
  isSharedStrategy: false,
  errorInSharedStrategy: false,
  hasLoadedSharedStrategy: false,
  handleSelectedMarket: (any) => void any,
  handleSelectedDirectionTypes: (any) => void any,
  handleSelectedExpirationDate: (any) => void any,
  handleSelectedStrategy: (any) => void any,
  handleUpdateQuote: (any) => void any,
  handleToggleSelectedStrike: (any) => void any,
  handleUpdatePrebuilt: (any) => void any
}

export type BuilderAction =
  | {
    type: 'SET_PREBUILT',
    isPrebuilt: BuilderProviderState['isPrebuilt']
  }
  | {
    type: 'SET_MARKETS_LOADING',
    isMarketLoading: BuilderProviderState['isMarketLoading'],
  }
  | {
    type: 'SET_MARKETS',
    markets: BuilderProviderState['markets'],
    isMarketLoading: BuilderProviderState['isMarketLoading'],
  }
  | {
    type: 'SET_MARKET',
    selectedMarket: BuilderProviderState['selectedMarket'],
    strikes: BuilderProviderState['strikes'],
    selectedExpirationDate: BuilderProviderState['selectedExpirationDate'],
    selectedStrategy: BuilderProviderState['selectedStrategy'],
  }
  | {
    type: 'SET_CURRENT_PRICE',
    currentPrice: BuilderProviderState['currentPrice']
  }
  | {
    type: 'SET_DIRECTION_TYPES',
    selectedDirectionTypes: BuilderProviderState['selectedDirectionTypes']
  }
  | {
    type: 'SET_EXPIRATION_DATE',
    selectedExpirationDate: BuilderProviderState['selectedExpirationDate'],
  }
  | {
    type: 'SET_STRATEGY',
    selectedStrategy: BuilderProviderState['selectedStrategy']
  }
  | {
    type: 'SET_STRIKES',
    strikes: BuilderProviderState['strikes'],
    isValid: BuilderProviderState['isValid']
  }
  | {
    type: 'UPDATE_STRIKES',
    strikes: BuilderProviderState['strikes'],
  }
  | {
    type: 'RESET_MARKET',
    strikes: BuilderProviderState['strikes'],
    currentPrice: BuilderProviderState['currentPrice'],
    selectedExpirationDate: BuilderProviderState['selectedExpirationDate'],
    selectedStrategy: BuilderProviderState['selectedStrategy'],
    isSharedStrategy: BuilderProviderState['isSharedStrategy']
  }
  | {
    type: 'SET_POSITION_PNL',
    positionPnl: BuilderProviderState['positionPnl']
  }
  | {
    type: 'SET_SHARED_BUILD'
    strikes: BuilderProviderState['strikes'],
    selectedMarket: BuilderProviderState['selectedMarket'],
    selectedExpirationDate: BuilderProviderState['selectedExpirationDate'],
    isSharedStrategy: BuilderProviderState['isSharedStrategy'],
    errorInSharedStrategy: BuilderProviderState['errorInSharedStrategy'],
    isValid: BuilderProviderState['isValid'],
    hasLoadedSharedStrategy: BuilderProviderState['hasLoadedSharedStrategy'],
  }
  | {
    type: 'SET_ERROR_SHARED_BUILD'
    errorInSharedStrategy: BuilderProviderState['errorInSharedStrategy'],
  }
  | {
    type: 'RESET_BUILDER_PROVIDER',
  }

export function builderReducer(
  state: BuilderProviderState,
  action: BuilderAction
): BuilderProviderState {
  switch (action.type) {
    case 'SET_PREBUILT':
      return { ...state, isPrebuilt: action.isPrebuilt }
    case 'SET_MARKETS':
      return { ...state, markets: action.markets, isMarketLoading: action.isMarketLoading }
    case 'SET_MARKETS_LOADING':
      return { ...state, isMarketLoading: action.isMarketLoading }
    case 'SET_MARKET':
      return {
        ...state,
        selectedMarket: action.selectedMarket,
        strikes: action.strikes,
        selectedExpirationDate: action.selectedExpirationDate,
        selectedStrategy: action.selectedStrategy,
      }
    case 'SET_CURRENT_PRICE':
      return { ...state, currentPrice: action.currentPrice }
    case 'SET_DIRECTION_TYPES':
      return { ...state, selectedDirectionTypes: action.selectedDirectionTypes }
    case 'SET_EXPIRATION_DATE':
      return { ...state, selectedExpirationDate: action.selectedExpirationDate }
    case 'SET_STRATEGY':
      return { ...state, selectedStrategy: action.selectedStrategy }
    case 'SET_STRIKES':
      return { ...state, strikes: action.strikes, isValid: action.isValid }
    case 'UPDATE_STRIKES':
      return { ...state, strikes: action.strikes }
    case 'RESET_MARKET':
      return {
        ...state,
        strikes: action.strikes,
        currentPrice: action.currentPrice,
        selectedExpirationDate: action.selectedExpirationDate,
        selectedStrategy: action.selectedStrategy,
        isSharedStrategy: action.isSharedStrategy
      }
    case 'SET_POSITION_PNL':
      return { ...state, positionPnl: action.positionPnl }
    case 'SET_SHARED_BUILD':
      return {
        ...state,
        strikes: action.strikes,
        selectedMarket: action.selectedMarket,
        selectedExpirationDate: action.selectedExpirationDate,
        isSharedStrategy: action.isSharedStrategy,
        errorInSharedStrategy: action.errorInSharedStrategy,
        isValid: action.isValid,
        hasLoadedSharedStrategy: action.hasLoadedSharedStrategy
      }
    case 'SET_ERROR_SHARED_BUILD':
      return {
        ...state,
        errorInSharedStrategy: action.errorInSharedStrategy
      }
    case 'RESET_BUILDER_PROVIDER':
      return builderInitialState
    default:
      throw new Error()
  }
}
