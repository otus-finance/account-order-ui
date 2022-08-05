// @ts-nocheck
import { UNIT } from './constants';
import { getBlackScholesPrice, getDelta } from './blackScholes';
import { parseUnits, formatUnits } from '@ethersproject/units';

function fromBigNumber(number, decimals = 18) {
    return parseFloat(formatUnits(number.toString(), decimals));
}

function toBigNumber(number, decimals = 18) {
    if (isNaN(number)) {
        throw new Error('Passed NaN to BigNumber converter');
    }
    return parseUnits(number.toFixed(18), decimals);
}

export const getTimeToExpiryAnnualized = (timeToExpiry) => {
  const timeToExpiryAnnualized = timeToExpiry / (60 * 60 * 24 * 365);
  return timeToExpiryAnnualized;
}

// const marketParams = option.market().__marketData.marketParameters;
// const rate = marketParams.greekCacheParams.rateAndCarry;
// const spotPrice = option.market().spotPrice;
// const strikePrice = option.strike().strikePrice;

// only need to get this at beginning of new strike
export const getPrice = ({ isCall, rate, spotPrice, strikePrice, timeToExpiry }, newBaseIv, newSkew) => {
  const timeToExpiryAnnualized = getTimeToExpiryAnnualized(timeToExpiry);
  const newVol = newBaseIv.div(UNIT);
  const price = toBigNumber(
    getBlackScholesPrice(
      timeToExpiryAnnualized, 
      fromBigNumber(newVol), 
      fromBigNumber(spotPrice), 
      fromBigNumber(strikePrice), 
      fromBigNumber(rate), 
      isCall
    )
  );

  return {
      price,
      volTraded: newVol,
  };
}

export const getStrikeDelta = ({ isCall, rate, spotPrice, strikePrice, timeToExpiry }, newBaseIv) => {
  const timeToExpiryAnnualized = getTimeToExpiryAnnualized(timeToExpiry);
  const newVol = newBaseIv.div(UNIT);
  // console.log({ timeToExpiryAnnualized, , isCall })
  // const {
  //   newVol: parseFloat(formatUnits(newVol)), spotPrice: formatUnits(spotPrice), strikePrice: formatUnits(strikePrice), rate: formatUnits(rate)
  // }
  const delta = getDelta(timeToExpiryAnnualized, parseFloat(formatUnits(newVol)), parseFloat(formatUnits(spotPrice)), parseFloat(formatUnits(strikePrice)), parseFloat(formatUnits(rate)), isCall);
  return delta; 
}

