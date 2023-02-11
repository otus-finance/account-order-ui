import { useQuery } from 'react-query'

import Lyra, { Board, Market, MarketLiquidity, Chain, Quote, Strike } from '@lyrafinance/lyra-js'
import { BigNumber, ethers } from 'ethers'
import { MONTHS } from '../../constants/dates'
import { ONE_BN } from '../../constants/bn'
import { fromBigNumber } from '../../utils/formatters/numbers'

export type LyraChain = {
  name: Chain
  chainId: number
}

export type LyraStrike = {
  market: string
  selectedOptionType: number | 0
  isCall: boolean
  quote: Quote
} & Strike

export type LyraStrikeMapping = {
  [key: number]: LyraStrike[]
}

export type LyraBoard = {
  id: number
  name: string
  expiryTimestamp: number
  baseIv: BigNumber
  strikes: Strike[]
  strikesByOptionTypes?: LyraStrikeMapping
  marketName: string
}

export type LyraMarket = {
  address: string
  name: string
  isPaused: boolean
  tvl: BigNumber
  openInterest: BigNumber
  spotPrice: BigNumber
  liquidity: MarketLiquidity
  liveBoards: LyraBoard[]
}

export const useLyraMarket = (lyra: Lyra | null) => {

  return useQuery<LyraMarket[] | null>(
    ['lyraMarkets', lyra?.chainId],
    async () => {
      if (!lyra) return null;
      const response: Market[] = await lyra.markets()
      return response ? parseMarketResponse(response) : null
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  )
}

export const getStrikeQuote = async (
  lyra: Lyra,
  isCall: boolean,
  isBuy: boolean,
  size: BigNumber,
  trade: LyraStrike
) => {
  const marketName = trade.market
  const _strike = await lyra.strike(marketName, trade.id)
  const quote = await _strike.quote(isCall, isBuy, size)
  return quote;
}
/**
 * @dev add types to liveBoardsWithQuotedStrikes
 */
const parseMarketResponse = async (
  markets: Market[]
): Promise<LyraMarket[]> => {
  return await Promise.all(
    markets.map(async (market) => {
      const { address, name, isPaused, tvl, liquidity, openInterest, spotPrice } = market
      const liveBoards: LyraBoard[] = parseMarketBoards(market.liveBoards())

      const liveBoardsWithQuotedStrikes: any[] = await parseBoardStrikes(
        liveBoards
      )
      return {
        address,
        name,
        isPaused,
        tvl,
        openInterest,
        spotPrice,
        liquidity,
        liveBoards: liveBoardsWithQuotedStrikes,
      }
    })
  )
}

const parseMarketBoards = (boards: Board[]): LyraBoard[] => {
  return boards.map((board) => {
    const { id, expiryTimestamp, baseIv } = board
    const marketName = board.market().name
    const strikes: Strike[] = board
      .strikes()
      .filter((strike) => strike.isDeltaInRange)
      .sort(sortStrikes)
    const name = formatBoardName(expiryTimestamp)
    return { name, id, expiryTimestamp, baseIv, strikes, marketName }
  })
}

const sortStrikes = (a: Strike, b: Strike) => {
  return fromBigNumber(a.strikePrice) - fromBigNumber(b.strikePrice)
}

const parseBoardStrikes = async (boards: LyraBoard[]) => {
  return await Promise.all(
    boards.map(async (board) => {
      const { strikes, marketName } = board

      const strikesLongCallQuotes = await formatStrikeWithQuote(
        marketName,
        strikes,
        true, // isCall
        true // isBuy
      )
      const strikesLongPutQuotes = await formatStrikeWithQuote(
        marketName,
        strikes,
        false,
        true
      )
      const strikesShortCallQuotes = await formatStrikeWithQuote(
        marketName,
        strikes,
        true,
        false
      )
      const strikesShortPutQuotes = await formatStrikeWithQuote(
        marketName,
        strikes,
        false,
        false
      )

      return {
        ...board,
        strikesByOptionTypes: {
          0: strikesLongCallQuotes,
          1: strikesLongPutQuotes,
          3: strikesShortCallQuotes,
          4: strikesShortPutQuotes,
        },
      }
    })
  )
}

const formatStrikeWithQuote = async (
  marketName: string,
  strikes: Strike[],
  isCall: boolean,
  isLong: boolean
) => {
  return await Promise.all(
    strikes.map(async (strike: Strike) => {
      const quote = await strike.quote(isCall, isLong, ONE_BN)
      return { ...strike, isCall, quote, market: marketName }
    })
  )
}

const formatBoardName = (expiryTimestamp: number) => {
  const date = new Date(expiryTimestamp * 1000)
  const month = MONTHS[date.getMonth()]
  const day = date.getDate()
  const hours = date.getHours()
  return `Expires ${month} ${day}, ${hours}:00`
}

type OPTION_TYPE = {
  [key: number]: boolean[]
}

const OPTION_TYPES: OPTION_TYPE = {
  0: [true, true], // buy call
  1: [false, true], // buy put
  2: [true, false], // sell covered call
  3: [true, false], // sell call
  4: [false, false], // sell put
}