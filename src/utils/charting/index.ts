import { BigNumber } from "ethers";
import { fromBigNumber } from "../formatters/numbers";

export type Ticks = {
  [key: number]: { profitAtTick: number }
}

export const ticks = (asset: string, price: number) => {
  const ticks = [];

  let multiple = asset == 'ETH-USDC' || asset == 'sETH-sUSD' ? 1.5 : 1.1;
  let tickSize = asset == 'ETH-USDC' || asset == 'sETH-sUSD' ? 5 : 10;


  let lowerBound = price / multiple;
  let upperBound = price * multiple;

  let currentTick = lowerBound;

  while (currentTick < upperBound) {
    currentTick = currentTick + tickSize;
    ticks.push(currentTick);
  };

  return ticks;
}

export const formatProfitAndLostAtTicks = (tick: number, strikes: any[]) => {
  
  const pnl = strikes.reduce((totalPnl: number, strike: any) => {
    const { strikePrice, isCall, quote: { size, isBuy, pricePerOption } } = strike;

    const totalPriceForOptions = fromBigNumber(pricePerOption) * fromBigNumber(size);
    const totalSumOfFees = isBuy ? -totalPriceForOptions : totalPriceForOptions;
    const profitAtTick = calculateProfitAtTick(totalSumOfFees, strikePrice, tick, isCall, isBuy, fromBigNumber(size)) // can be negative or positive dependent on option type
    totalPnl = totalPnl + profitAtTick;
    return totalPnl;
  }, 0);
  return pnl;
}

export const calculateProfitAtTick = (totalSumOfFees: number, _strikePrice: BigNumber, tick: number, isCall: boolean, isBuy: boolean, size: number): number => {
  const strikePrice = fromBigNumber(_strikePrice);
  let profitAtTick = 0;

  if (isBuy) {
    if (isCall) {
      if (tick < strikePrice) {
        profitAtTick = totalSumOfFees;
      } else {
        profitAtTick = ((tick - strikePrice) * size) + totalSumOfFees // (tick - (strikePrice - (totalSumOfFees))) * size; // 1200 - 1150 = 50 - 60 = -10 
      }
    } else {
      if (tick < strikePrice) {
        profitAtTick = ((strikePrice - tick) * size) + totalSumOfFees  // (strikePrice - (tick + totalSumOfFees)) * size; // 1200 - 
      } else {
        profitAtTick = totalSumOfFees;
      }
    }
  }

  if (!isBuy) {
    if (isCall) {
      if (tick < strikePrice) {
        profitAtTick = totalSumOfFees;
      } else {
        profitAtTick = ((strikePrice - tick) * size) + totalSumOfFees;
      }

    } else {
      if (tick < strikePrice) {
        profitAtTick = ((tick - strikePrice) * size) + totalSumOfFees
      } else {
        profitAtTick = totalSumOfFees;
      }
    }
  }

  return profitAtTick;
}