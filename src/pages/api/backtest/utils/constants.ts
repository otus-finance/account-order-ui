import { BigNumber } from '@ethersproject/bignumber';

export enum ChainId {
  MAINNET = 1,
  RINKEBY = 4,
  POLYGON = 137,
  AVALANCHE = 43114,
  FANTOM = 250,
  BSC = 56,
  AURORA = 1313161554,
  LOCAL = 1337,
}

export enum Period {
	ONE_HOUR = 'ONE_HOUR',
	FOUR_HOURS = 'FOUR_HOURS',
	ONE_DAY = 'ONE_DAY',
	ONE_WEEK = 'ONE_WEEK',
	ONE_MONTH = 'ONE_MONTH',
}

export const PERIOD_IN_HOURS: Record<Period, number> = {
	ONE_HOUR: 1,
	FOUR_HOURS: 4,
	ONE_DAY: 24,
	ONE_MONTH: 672,
	ONE_WEEK: 168,
};

export const PERIOD_IN_SECONDS: Record<Period, number> = {
	ONE_HOUR: 60 * 60,
	FOUR_HOURS: 4 * 60 * 60,
	ONE_DAY: 24 * 60 * 60,
	ONE_MONTH: 672 * 60 * 60,
	ONE_WEEK: 168 * 60 * 60,
};

export const SECONDS_PER_DAY = 24 * 60 * 60;

export const INFURA_ID = "db5ea6f9972b495ab63d88beb08b8925";

export const futuresEndpoint = 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-main'; 

export const ZERO_BN = BigNumber.from(0);
export const UNIT = BigNumber.from(10).pow(18);
export const ONE_BN = BigNumber.from(1).mul(UNIT);
export const MAX_BN = BigNumber.from(2).pow(256).sub(1);
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
//# sourceMappingURL=bn.js.map