// export const getTradeCollateral = async () => {
//   const minCollateral = getMinCollateralForSpotPrice(option, postTradeSize, spotPrice, isBaseCollateral)
//   let maxCollateral = getMaxCollateral(option.isCall, option.strike().strikePrice, postTradeSize, isBaseCollateral)

// }

// export default function getMaxCollateral(
//   isCall: boolean,
//   strikePrice: BigNumber,
//   postTradeSize: BigNumber,
//   isBaseCollateral?: boolean
// ): BigNumber | null {
//   if (isCall) {
//     if (isBaseCollateral) {
//       // size
//       return postTradeSize
//     } else {
//       // no max collateral for cash-secured calls
//       return null
//     }
//   } else {
//     // size * strike
//     return postTradeSize.mul(strikePrice).div(UNIT)
//   }
// }

export const getTradeCollateral = () => {};
