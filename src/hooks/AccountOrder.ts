import { Chain, Provider } from '@wagmi/core';
import { BigNumber, BigNumberish, Contract, ethers } from 'ethers';
import { useCallback, useEffect, useReducer, useState } from 'react';
import {
  Address,
  erc20ABI,
  useBalance, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite, useProvider, useSigner
} from 'wagmi';
import { MAX_BN, ZERO_ADDRESS, ZERO_BN } from '../constants/bn';
import { quote } from '../constants/quote';
import { LyraMarket } from '../queries/lyra/useLyra';
import { useAccountWithOrders } from '../queries/otus/account';

import {
  AccountOrderProviderState,
  AccountOrderAction,
  accountOrderInitialState,
  accountOrderReducer,
} from '../reducers'
import { formatUSD, fromBigNumber, toBN } from '../utils/formatters/numbers';
import { useContractConfig } from './Contracts';

export const useAccountOrder = (owner: Address) => {

  const [state, dispatch] = useReducer(
    accountOrderReducer,
    accountOrderInitialState
  );

  const { isLoading, accountOrder } = state;

  const { isLoading: isDataLoading, data } = useAccountWithOrders(owner);

  const { chain } = useNetwork();

  const provider = useProvider();

  useEffect(() => {
    if (isDataLoading && isDataLoading != isLoading) {
      dispatch({
        type: 'SET_LOADING',
        isLoading: isDataLoading
      })
    }
  }, [isLoading, isDataLoading])

  useEffect(() => {
    if (data) {
      // get first accountorder
      const { accountOrders } = data;
      if (!accountOrders[0]) {
        dispatch({
          type: 'SET_ACCOUNT_ORDER',
          accountOrder: null,
          isLoading: false
        })
        return;
      };
      dispatch({
        type: 'SET_ACCOUNT_ORDER',
        accountOrder: accountOrders[0],
        isLoading: false
      })

    }
  }, [data]);

  const [tokenAddr, setTokenAddr] = useState<Address>();

  useEffect(() => {
    if (chain && chain.id) {
      const _quoteAddr = quote[chain.id];
      setTokenAddr(_quoteAddr);
    }
  }, [chain]);

  const [userBalance, setUserBalance] = useState('');
  const [accountBalance, setAccountBalance] = useState('');

  const _userBalance = useBalance({
    address: owner,
    token: tokenAddr,
    chainId: chain?.id,
    watch: true
  })

  const _accountBalance = useBalance({
    address: accountOrder?.id,
    token: tokenAddr,
    chainId: chain?.id,
    watch: true
  })

  const accountAllowance = useAccountAllowance(tokenAddr, erc20ABI, owner, accountOrder?.id, provider);

  useEffect(() => {
    if (_userBalance.data?.value) {
      setUserBalance(formatUSD(fromBigNumber(_userBalance.data?.value), { dps: 2 }));
    }
  }, [_userBalance])

  useEffect(() => {
    if (_accountBalance.data?.value) {
      setAccountBalance(formatUSD(fromBigNumber(_accountBalance.data?.value), { dps: 2 }));
    }
  }, [_accountBalance])

  // allowance 
  const [allowanceAmount, setAllowanceAmount] = useState(0);

  const { config: allowanceConfig } = usePrepareContractWrite({
    address: accountOrder?.id && allowanceAmount ? tokenAddr : undefined,
    abi: erc20ABI,
    functionName: 'approve',
    args: accountOrder?.id && allowanceAmount ? [accountOrder?.id, toBN(allowanceAmount.toString())] : [ZERO_ADDRESS, ZERO_BN],
    chainId: chain?.id,
  })

  const { isSuccess, isLoading: isApproveQuoteLoading, write: approveQuote } = useContractWrite({
    ...allowanceConfig,
    onSettled: (data, error) => {
      console.log('Settled', { data, error })
    },
    onSuccess: (data) => {
      console.log({ data })
    },
  });

  const contractsConfig = useContractConfig();

  // deposit  
  const [depositAmount, setDepositAmount] = useState(0);

  const { config: accountOrderDepositConfig } = usePrepareContractWrite({
    address: accountOrder?.id,
    abi: chain?.id && contractsConfig?.deployedContracts[chain?.id][0]['contracts']['AccountOrder'].abi,
    functionName: 'deposit',
    args: [toBN(depositAmount.toString())],
    chainId: chain?.id
  });

  const {
    isSuccess: isDepositSuccess,
    isLoading: isDepositLoading,
    write: deposit
  } = useContractWrite({
    ...accountOrderDepositConfig,
    onSettled: (data, error) => {
      console.log('Settled', { data, error })
    },
    onSuccess: (data) => {
      console.log({ data })
    },
    onError: (error) => {
      console.log({ error })
    },
    onMutate: ({ args, overrides }) => {
      console.log('Mutate', { args, overrides })
    }
  });

  // const { data, isError, isLoading } = useWaitForTransaction({
  //   hash: '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060',
  // })

  // withdraw
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const { config: accountOrderWithdrawConfig } = usePrepareContractWrite({
    address: accountOrder?.id,
    abi: chain?.id && contractsConfig?.deployedContracts[chain?.id][0]['contracts']['AccountOrder'].abi,
    functionName: 'withdraw',
    args: [toBN(withdrawAmount.toString())],
    chainId: chain?.id
  });

  const { isSuccess: isWithdrawSuccess, isLoading: isWithdrawLoading, write: withdraw } = useContractWrite(accountOrderWithdrawConfig);

  // place order 
  const { order, setOrder, placeOrder } = useLimitOrder({
    chainId: chain?.id,
    accountOrderAddr: accountOrder?.id,
    accountOrderAbi: chain?.id && contractsConfig?.deployedContracts[chain?.id][0]['contracts']['AccountOrder'].abi
  });

  return {
    isLoading,
    isApproveQuoteLoading,
    isDepositLoading,
    isWithdrawLoading,
    accountOrder,
    accountBalance,
    userBalance,
    accountAllowance,
    order,
    setOrder,
    setAllowanceAmount,
    setDepositAmount,
    setWithdrawAmount,
    approveQuote,
    deposit,
    withdraw,
    placeOrder
  } as AccountOrderProviderState;
}

const useAccountAllowance = (tokenAddr: Address | undefined, abi: any, owner: Address, accountOrderId: Address | undefined, provider: Provider) => {
  const [accountAllowance, setAccountAllowance] = useState<number>(0);

  const getAllowance = useCallback(async () => {
    if (tokenAddr && abi && owner && accountOrderId && provider) {
      const _contract: Contract = new ethers.Contract(tokenAddr, abi, provider);
      try {
        let _allowance = await _contract.allowance(owner, accountOrderId);
        setAccountAllowance(fromBigNumber(_allowance));
      } catch (error) {
        // log error
      }

    }
  }, [tokenAddr, abi, owner, accountOrderId, provider])

  useEffect(() => {
    if (tokenAddr && abi && owner && accountOrderId && provider) {
      getAllowance();
    }
  }, [getAllowance, tokenAddr, abi, owner, accountOrderId, provider])

  return accountAllowance;
}

export type StrikeTrade = {
  orderType: number;
  market: string;
  iterations: BigNumberish;
  collatPercent: BigNumber;
  optionType: BigNumberish;
  strikeId: BigNumber;
  size: BigNumber;
  positionId: BigNumberish;
  tradeDirection: BigNumberish;
  targetPrice: BigNumber;
  targetVolatility: BigNumber;
}

const useLimitOrder = ({
  chainId,
  accountOrderAddr,
  accountOrderAbi
}: {
  chainId: number | undefined,
  accountOrderAddr: Address | undefined,
  accountOrderAbi: any
}) => {

  const [order, setOrder] = useState<StrikeTrade>({
    orderType: 0,
    market: ethers.utils.formatBytes32String("ETH"),
    iterations: 3,
    collatPercent: toBN('1'),
    optionType: 0,
    strikeId: toBN('1'),
    size: toBN('1'),
    positionId: 0,
    tradeDirection: 0,
    targetPrice: toBN('1'),
    targetVolatility: toBN('1')
  });

  useEffect(() => {
    // if (selectedMarket.name) {
    //   // setOrder({
    //   //   orderType: number;
    //   //   market: string;
    //   //   iterations: BigNumber;
    //   //   collatPercent: toBN("1");
    //   //   optionType: toBN(".45");
    //   //   strikeId: BigNumber;
    //   //   size: BigNumber;
    //   //   positionId: BigNumber;
    //   //   tradeDirection: BigNumber;
    //   //   targetPrice: BigNumber;
    //   //   targetVolatility: BigNumber;
    //   // })
    // }
  }, []);

  const { config: placeOrderConfig } = usePrepareContractWrite({
    address: accountOrderAddr,
    abi: accountOrderAbi,
    functionName: 'placeOrder',
    args: [order],
    chainId: chainId,
    overrides: { value: toBN("0.01") },
    onSettled: (data, error) => {
      console.log('Settled', { data, error })
    },
    onSuccess: (data) => {
      console.log({ data })
    },
    onError: (error) => {
      console.log({ error })
    },
    // overrides: {
    //   value: toBN('.01'),
    // },
  });

  const { data, isLoading, isSuccess, write: placeOrder } = useContractWrite(placeOrderConfig)

  return { order, setOrder, placeOrder };

}

// const strikeTrade: AccountOrder.StrikeTradeStruct = buildOrder(
//   2,
//   toBN("2000"),
//   toBN(".80"),
//   strikes[2],
//   0 // long call
// );

// const MARKET_KEY_ETH = ethers.utils.formatBytes32String("ETH");


// const buildOrder = (
//   orderType: number,
//   _targetPrice: BigNumber,
//   _targetVol: BigNumber,
//   _strikeId: BigNumber,
//   _optionType: number
// ): AccountOrder.StrikeTradeStruct => {
//   return {
//     collatPercent: toBN(".45"),
//     iterations: 3,
//     market: MARKET_KEY_ETH,
//     optionType: _optionType, // long call
//     strikeId: _strikeId,
//     size: toBN("3"),
//     positionId: 0,
//     orderType: orderType, // LIMIT_PRICE 1 LIMIT_VOL 2
//     tradeDirection: 0, // OPEN
//     targetPrice: _targetPrice,
//     targetVolatility: _targetVol,
//   };
// };
