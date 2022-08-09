// @ts-nocheck
import Lyra from '@lyrafinance/lyra-js';

import { PERIOD_IN_SECONDS, INFURA_ID } from './utils/constants';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { getLyraMarkets, getCandleUpdates } from './graphql';

import { getPrice, getStrikeDelta } from './utils/quote';
import { z } from 'zod';
import { HedgeStrategyProps, StrikeStrategyProps, VaultStrategyProps } from './types';

const KOVAN_RPC = `https://optimism-kovan.infura.io/v3/${INFURA_ID}`;
const MAINNET_RPC = `https://optimism-mainnet.infura.io/v3/${INFURA_ID}`;

const lyra = new Lyra();

const getMarketsWithBoards = async () => {

  const markets = await getLyraMarkets(); 

  const historicalMarketsBoards = await Promise.all(markets.map(async (market: any) => {
    const expiredBoards = market.boards.filter(({ isExpired }) => isExpired).map(board => {
      const { expiryTimestamp } = board; 
      const startTimestamp = expiryTimestamp - PERIOD_IN_SECONDS.ONE_WEEK;
      return { ...board, timestamp_gte: startTimestamp, timestamp_lte: expiryTimestamp + 7200 }; 
    })

    return { ...market, boards: expiredBoards };
  }));

  return historicalMarketsBoards;
}

const getAdditionalDataForBoard = async (isCall, historicalMarkets) => {
  const timeToExpiry = PERIOD_IN_SECONDS.ONE_WEEK; // should be around 1 week in time

  return await Promise.all(historicalMarkets.map(async market => {
    const { boards, name } = market; 
    const _market = await lyra.market(name);
    const _updatedBoards = await Promise.all(boards.map(async board => {

      const { timestamp_gte, timestamp_lte, boardId, boardBaseIVHistory } = board; 
      const _rateUpdates = await getCandleUpdates({ synth: 'ETH', timestamp_gte, timestamp_lte, period: 28800 }); 
      const rateUpdates = _rateUpdates.map(update => ({ ...update, close: parseFloat(update.close) }))

      const _additionalBoardData = await _market.board(parseInt(boardId));
      const marketParams = _additionalBoardData.market().__marketData.marketParameters;
      const rate = marketParams.greekCacheParams.rateAndCarry;
      const strikes = _additionalBoardData.strikes();

      const spotPrice = parseUnits(rateUpdates[0].close.toFixed(2).toString()); // get from block board price at the time
      const newBaseIv = parseUnits(boardBaseIVHistory[0].baseIv); // probably the least accurate
      const strikesWithPricing = await Promise.all(strikes.map(async (strike, index) => {
        const { strikePrice } = strike; 
        const bs = getPrice({ isCall, rate, spotPrice, strikePrice, timeToExpiry }, newBaseIv, parseUnits('.1', 18));
        const delta = getStrikeDelta({ isCall, rate, spotPrice, strikePrice, timeToExpiry }, newBaseIv)
        const { price, volTraded } = bs;
        return { ...strike, price, volTraded, delta, spotPriceAtStart: spotPrice };
      }));
      return { ...board, rateUpdates, strikesWithPricing, marketParams, isCall }

    }));
    return { ...market, boards: _updatedBoards};
  }));

}

const getStrikeForMarketBoard = (isCall, strikeStrategy, additionalDataMarketsBoardsStrikes) => {
  
  return additionalDataMarketsBoardsStrikes.map(market => {
    const { name, boards } = market; 
    const selectedBoardStrikes = boards.map(board => {
      const { strikesWithPricing } = board; 

      const strikeWithMatch = strikesWithPricing.find(strikeWithPricing => {
        const { delta, strikePrice, spotPriceAtStart, price } = strikeWithPricing;
        const strikePriceFormat = parseFloat(formatUnits(strikePrice));
        const spotPriceStartWithMatchFormat = parseFloat(formatUnits(spotPriceAtStart));

        const outOfTheMoney = isCall ? (spotPriceStartWithMatchFormat < strikePriceFormat) : (spotPriceStartWithMatchFormat > strikePriceFormat); // out of money is good

        if(Math.abs(delta) > .1 && Math.abs(delta) < .9 && outOfTheMoney) {

          const deltaGap = Math.abs(strikeStrategy.targetDelta - delta);
          return deltaGap < strikeStrategy.maxDeltaGap;
        }

      });
      return { ...board, strikeWithMatch }
    })
    return { name, boards: selectedBoardStrikes}; 
  });
}

const calculateStrikeProfitWithNoHedge = (isCall, fundsAvailable, selectedStrikeForMarketBoard) => {

  return selectedStrikeForMarketBoard.map(market => {
    const { boards } = market; 

    const boardsWithStrikes = boards.filter(board => {
      const { strikeWithMatch } = board; 
      return strikeWithMatch != undefined; 
    })  
    let tradefundsAvailable = fundsAvailable;
    const profitForBoardStrike = boardsWithStrikes.map((board) => {
      const { strikeWithMatch, spotPriceAtExpiry } = board; 

      const { price, spotPriceAtStart, strikePrice } = strikeWithMatch; 
      const _spotPriceAtExpiry = parseUnits(spotPriceAtExpiry); 
      const numSpotPrice = parseFloat(formatUnits(_spotPriceAtExpiry)) / (10 ** 18);
      const strikeWithMatchFormat = parseFloat(formatUnits(strikePrice));
      const spotPriceStartWithMatchFormat = parseFloat(formatUnits(spotPriceAtStart));
      const size = tradefundsAvailable / strikeWithMatchFormat;

      const premiumCollected = size * parseFloat(formatUnits(price)); 

      const outOfTheMoney = isCall ? (numSpotPrice < strikeWithMatchFormat) : (numSpotPrice > strikeWithMatchFormat); // out of money is good
      
      if(!outOfTheMoney) { // at a loss
        const fundsLost = isCall ? (numSpotPrice - strikeWithMatchFormat) : (strikeWithMatchFormat - numSpotPrice)
        tradefundsAvailable = tradefundsAvailable - (fundsLost * size); 
      }
      return { ...board, outOfTheMoney, _fundsAvailableForHedge:0, tradefundsAvailable, recoveredProfit: 0, premiumCollected, numSpotPrice, spotPriceStartWithMatchFormat, strikeWithMatchFormat, size }; 
    });

    const updatedFunds = profitForBoardStrike.reduce((accum, board) => {
      const { outOfTheMoney, numSpotPrice, strikeWithMatchFormat, isCall, size } = board; 

      if(!outOfTheMoney) {
        if(isCall) {
          return accum - ((numSpotPrice - strikeWithMatchFormat) * size)
        } else {
          return accum - ((strikeWithMatchFormat - numSpotPrice) * size)
        }
      } else {
        return accum;
      }
    }, fundsAvailable); 
    return { ...market, profitForBoardStrike, updatedFunds, fundsAvailable };
  })
}

const calculateStrikeProfitWitHedge = (isCall, hedgeStrategy, fundsAvailable, fundsAvailableForHedge, selectedStrikeForMarketBoard) => {
  
  const kwentaFees = .003;

  return selectedStrikeForMarketBoard.map(market => {
    const { boards } = market; 
    const boardsWithStrikes = boards.filter(board => {
      const { strikeWithMatch } = board; 
      return strikeWithMatch != undefined; 
    })

    let tradefundsAvailable = fundsAvailable;

    let _fundsAvailableForHedge = fundsAvailableForHedge; 
    const profitForBoardStrike = boardsWithStrikes.map(board => {
      const { strikeWithMatch, spotPriceAtExpiry, rateUpdates, boardId, timestamp_gte, timestamp_lte, expiryTimestamp } = board; 
      
      const { price, spotPriceAtStart, delta } = strikeWithMatch;
      const spotPriceStartWithMatchFormat = parseFloat(formatUnits(spotPriceAtStart));

      const _spotPriceAtExpiry = parseUnits(spotPriceAtExpiry); 
      const numSpotPrice = parseFloat(formatUnits(_spotPriceAtExpiry)) / (10 ** 18);
      const strikeWithMatchFormat = parseFloat(formatUnits(strikeWithMatch.strikePrice));
      const size = tradefundsAvailable / strikeWithMatchFormat;

      const premiumCollected = size * parseFloat(formatUnits(price)); 

      let counter = 0;
      let stopCounter = 0; 
      let hedgeFundsWithLeverage = _fundsAvailableForHedge * hedgeStrategy.leverageSize;
      let fees = 0; 
      let _close = 0; 
      let _high = 0; 

      rateUpdates.forEach(update => {
        const { close, high } = update;
        if(isCall) {
          if(close > strikeWithMatchFormat) {
            fees = counter == 0 ? fees + (hedgeFundsWithLeverage * kwentaFees) : fees;
            hedgeFundsWithLeverage = hedgeFundsWithLeverage - fees; 
            _close = close; 
            counter++;
          }
          if(counter > 0 && (close < strikeWithMatchFormat)) {
            counter = 0; 
            fees = fees + (hedgeFundsWithLeverage * kwentaFees);
            let loss = strikeWithMatchFormat - close;
            let lossWithLeverage = hedgeStrategy.leverageSize * loss;
            hedgeFundsWithLeverage = hedgeFundsWithLeverage - lossWithLeverage - fees;
            stopCounter++; 
          }
        } else {
          if(strikeWithMatchFormat > close) {
            fees = counter == 0 ? fees + (hedgeFundsWithLeverage * kwentaFees) : fees;
            hedgeFundsWithLeverage = hedgeFundsWithLeverage - fees; 
            _close = close; 
            counter++; 
            // calculate open fees and hedge size
          }
          // check how many times we stop the hedge counter
          if(counter > 0 && (strikeWithMatchFormat < close)) {
            counter = 0; 
            fees = fees + (hedgeFundsWithLeverage * kwentaFees);
            let loss = close - strikeWithMatchFormat;
            let lossWithLeverage = hedgeStrategy.leverageSize * loss;
            hedgeFundsWithLeverage = hedgeFundsWithLeverage - lossWithLeverage - fees;
            stopCounter++; 
            // calculate close fees and stop loss total - need to subtract from updatefunds
          }
        }
      })

      let recoveredProfit = 0; 

      if(counter > 0) {
        if(isCall) {
          recoveredProfit = (hedgeFundsWithLeverage * ((_close - strikeWithMatchFormat) / strikeWithMatchFormat)); // 1320 - 1300 ~ 20/1300 1.5% * leverage size = 3% * hedgefunds = (3% * 10000) = $300 
        } else {
          recoveredProfit = (hedgeFundsWithLeverage * ((strikeWithMatchFormat - _close) / strikeWithMatchFormat));
        }
      }

      tradefundsAvailable = tradefundsAvailable + recoveredProfit; 

      console.log({ _fundsAvailableForHedge, tradefundsAvailable, recoveredProfit })

      const outOfTheMoney = isCall ? (numSpotPrice < strikeWithMatchFormat) : (numSpotPrice > strikeWithMatchFormat); // out of money is good
      return { ...board, outOfTheMoney,  _fundsAvailableForHedge, tradefundsAvailable, recoveredProfit, premiumCollected, spotPriceStartWithMatchFormat, numSpotPrice, strikeWithMatchFormat, size, counter }; 
    });

    const updatedFunds = profitForBoardStrike.reduce((accum, board) => {
      const { outOfTheMoney, numSpotPrice, strikeWithMatchFormat, isCall, size } = board; 

      if(!outOfTheMoney) {
        if(isCall) {
          return accum - ((numSpotPrice - strikeWithMatchFormat) * size)
        } else {
          return accum - ((strikeWithMatchFormat - numSpotPrice) * size)
        }
      } else {
        return accum;
      }
    }, fundsAvailable); 
    return { ...market, profitForBoardStrike, updatedFunds };
  })
}

const calculateApr = (originalFunds, fundsAvailable, strikesSelectedProfitability) => {

  const marketProfit = strikesSelectedProfitability.reduce((accum, market) => {

    const { profitForBoardStrike, updatedFunds } = market;
    let fundsAvailableForHedge = 0;  

    const profitForBoards = profitForBoardStrike.map(board => {
      const { premiumCollected, boardId, outOfTheMoney, recoveredProfit, counter, _fundsAvailableForHedge } = board; 
      fundsAvailableForHedge = _fundsAvailableForHedge;
      return { boardId, premiumCollected, outOfTheMoney, recoveredProfit, counter }; 
    })  

    const totalProfit = profitForBoards.reduce((accum, board) => {
      const { premiumCollected, recoveredProfit, outOfTheMoney } = board;  
      return accum + premiumCollected + recoveredProfit; 
    }, 0);

    const leftOverFundsPlusPremium = updatedFunds + totalProfit + fundsAvailableForHedge; 

    const apr = ((leftOverFundsPlusPremium - fundsAvailable) / originalFunds) * (52 / profitForBoards.length) * 100;

    return { 
      ...accum, 
      [market.name]: { totalProfit, apr } 
    }

  }, {})

  return marketProfit; 

}

const calculateFunds = (_fundsAvailable, _hedgeStrategy, _strikeStrategy, _vaultStrategy) => {
  const fundsForHedge = _fundsAvailable * _hedgeStrategy.hedgePercentage;
  const newFunds =  (_fundsAvailable - fundsForHedge) / _vaultStrategy.collateralPercent // parseUnits(_fundsAvailable.toString()).sub(fundsForHedge).mul(_vaultStrategy.collatPercent);
  return [_fundsAvailable, newFunds, fundsForHedge];
}

const formatStrikesTraded = (profitForBoardStrikeNoHedge, profitForBoardStrikeHedge) => {
  const expiries = [];

  profitForBoardStrikeNoHedge.forEach((board, index) => {
    const boardNoHedge = profitForBoardStrikeNoHedge[index];
    const boardHedge = profitForBoardStrikeHedge[index];
    const _expiryDate = new Date(boardNoHedge.expiryTimestamp * 1000); 
    const expiry = { 
      boardId: parseInt(boardNoHedge.boardId), 
      strikeId: boardNoHedge.strikeWithMatch.id,
      startdate: boardNoHedge.timestamp_gte,
      expiryDate: (_expiryDate.getMonth() + 1) + ' / ' + _expiryDate.getDate(), 
      totalFundsEndWithoutHedge: boardNoHedge.tradefundsAvailable,
      totalFundsEndWithHedge: boardHedge.tradefundsAvailable + boardHedge._fundsAvailableForHedge, 
      premium: boardHedge.premiumCollected.toFixed(2), 
      premiumNoHedge: boardNoHedge.premiumCollected.toFixed(2), 
      size: boardHedge.size, 
      sizeNoHedge: boardNoHedge.size,
      recoveredProfit: boardHedge.recoveredProfit,
      delta: boardHedge.strikeWithMatch.delta, 
      strikePrice: boardNoHedge.strikeWithMatchFormat, 
      spotPriceStart: boardNoHedge.spotPriceStartWithMatchFormat, 
      spotPriceEnd: parseFloat(formatUnits(boardNoHedge.spotPriceAtExpiry))
    }

    expiries.push(expiry);

  });

  return expiries; 
}

export const calculate = async (
    isCall: boolean,
    vaultStrategy: VaultStrategyProps, 
    strikeStrategy: StrikeStrategyProps, 
    hedgeStrategy: HedgeStrategyProps
  ) => {
  const fundsAvailable = vaultStrategy.vaultFunds; // $50000 starting

  // get expired boards
  const historicalMarketsWithBoardBlocks = await getMarketsWithBoards(); 
  
  // calculate premium - need start price first
  const additionalDataMarketsBoardsStrikes = await getAdditionalDataForBoard(isCall, historicalMarketsWithBoardBlocks); 

  // select strike for board based on strike strategy
  const selectedStrikeForMarketBoard = getStrikeForMarketBoard(isCall, strikeStrategy, additionalDataMarketsBoardsStrikes);  // {}; // { 'eth': { [boardId]: Strike }, 'btc':  [boardId]: Strike } }

  // calculate profitability at end with no hedge 
  const strikesSelectedProfitabilityNoHedge = calculateStrikeProfitWithNoHedge(isCall, fundsAvailable, selectedStrikeForMarketBoard);

  // calculate profitability at end with a hedge 
  const [originalFunds, fundsAvailableForOptions, fundsAvailableForHedge] = calculateFunds(fundsAvailable, hedgeStrategy, strikeStrategy, vaultStrategy);

  const strikesSelectedProfitabilityWithHedge = calculateStrikeProfitWitHedge(isCall, hedgeStrategy, fundsAvailableForOptions, fundsAvailableForHedge, selectedStrikeForMarketBoard);

  // calculate total apr with no hedge
  const totalAPRForBoardsWithNoHedge = calculateApr(fundsAvailable, fundsAvailable, strikesSelectedProfitabilityNoHedge); 

  // calculate total apr with hedge
  const totalAPRForBoardsWithHedge = calculateApr(originalFunds, fundsAvailableForOptions, strikesSelectedProfitabilityWithHedge); 

  // return { noHedge: {strikesSelectedProfitabilityNoHedge, totalAPRForBoardsWithNoHedge}, hedge: {strikesSelectedProfitabilityWithHedge, totalAPRForBoardsWithHedge} }
 
  const strikesTraded = formatStrikesTraded(
    strikesSelectedProfitabilityNoHedge[0].profitForBoardStrike, 
    strikesSelectedProfitabilityWithHedge[0].profitForBoardStrike
  );

  return {
    aprHedge: totalAPRForBoardsWithHedge,
    aprNoHedge: totalAPRForBoardsWithNoHedge, 
    strikesTraded
  }
}