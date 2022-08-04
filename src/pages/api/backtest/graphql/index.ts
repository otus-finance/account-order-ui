import { request, gql } from 'graphql-request'

const KWENTA_API_URL = 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-main'
const LYRA_API_URL = 'https://api.thegraph.com/subgraphs/name/lyra-finance/mainnet';

const getLyraBoardsForMarket = gql`
 { 
    markets {
      id
      address
      name
      boards {
        id
        boardId
        isExpired
        expiryTimestamp
        expiryTimestampReadable
        spotPriceAtExpiry
        strikes {
          id 
          strikeId
          strikePrice
        }
        boardBaseIVHistory {
          timestamp
          baseIv
        }
      }
    }
 }
`

const getCandleUpdatesForMarket = gql`
  query getCandleUpdates($synth: String!, $timestamp_gte: Int!, $timestamp_lte: Int!, $period: Int!) {
    candles(where: { synth: $synth, timestamp_gte: $timestamp_gte, timestamp_lte: $timestamp_lte, period: $period }, orderBy: timestamp) {
      id
      synth 
      close
      average
      timestamp
      period
      high
    }
  }
`

// {currencyKey: "0x734c494e4b", block_gt: 3700, block_lt:4000}
export const getLyraMarkets = async () => {
  try {
    const { markets } = await request(LYRA_API_URL,  getLyraBoardsForMarket);
    return markets; 
  } catch (error) {
    console.log('Error fetching data: ', error);
  }
}

export const getCandleUpdates = async ({ synth, timestamp_gte, timestamp_lte, period }) => {
  try {
    const { candles } = await request(KWENTA_API_URL,  getCandleUpdatesForMarket, { synth, timestamp_gte, timestamp_lte, period });
    return candles; 
  } catch (error) {
    console.log('Error fetching data: ', error);
  }
}
