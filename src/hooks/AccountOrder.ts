import { Provider } from '@wagmi/core';
import { Contract, ethers } from 'ethers';
import { useCallback, useEffect, useReducer, useState } from 'react';
import {
	Address,
	erc20ABI,
	useBalance,
	useContractWrite,
	useNetwork,
	usePrepareContractWrite,
	useProvider,
	useSigner,
	useWaitForTransaction,
} from 'wagmi';
import { HeroIcon, IconType } from '../components/UI/Icons/IconSVG';
import {
	createPendingToast,
	CreateToastOptions,
	ToastIcon,
	updatePendingToast,
	updateToast,
} from '../components/UI/Toast';
import { ZERO_ADDRESS, ZERO_BN } from '../constants/bn';
import { quote } from '../constants/quote';
import { useAccountWithOrders } from '../queries/otus/account';

import {
	AccountOrderProviderState,
	AccountOrderAction,
	accountOrderInitialState,
	accountOrderReducer,
} from '../reducers';
import getExplorerUrl from '../utils/chains/getExplorerUrl';
import { formatUSD, fromBigNumber, toBN } from '../utils/formatters/numbers';
import { OrderTypes, StrikeTrade } from '../utils/types';
import { useOtusAccountContracts } from './Contracts';

const DEFAULT_TOAST_TIMEOUT = 1000 * 5; // 5 seconds

export const useAccountOrder = (owner: Address | undefined) => {
	const [state, dispatch] = useReducer(accountOrderReducer, accountOrderInitialState);

	const { isLoading, accountOrder } = state;

	const { isLoading: isDataLoading, data } = useAccountWithOrders(owner);

	const { chain } = useNetwork();

	const provider = useProvider();

	useEffect(() => {
		if (isDataLoading && isDataLoading != isLoading) {
			dispatch({
				type: 'SET_LOADING',
				isLoading: isDataLoading,
			});
		}
	}, [isLoading, isDataLoading]);

	useEffect(() => {
		if (data) {
			// get first accountorder
			const { accountOrders } = data;
			if (!accountOrders[0]) {
				dispatch({
					type: 'SET_ACCOUNT_ORDER',
					accountOrder: null,
					isLoading: false,
				});
				return;
			}
			dispatch({
				type: 'SET_ACCOUNT_ORDER',
				accountOrder: accountOrders[0],
				isLoading: false,
			});
		} else {
			dispatch({
				type: 'SET_ACCOUNT_ORDER',
				accountOrder: null,
				isLoading: false,
			});
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
		token: chain && quote[chain.id],
		chainId: chain?.id,
		watch: true,
	});

	const _accountBalance = useBalance({
		address: accountOrder?.id,
		token: chain && quote[chain.id],
		chainId: chain?.id,
		watch: true,
	});

	const accountAllowance = useAccountAllowance(
		tokenAddr,
		erc20ABI,
		owner,
		accountOrder?.id,
		provider
	);

	useEffect(() => {
		if (_userBalance.data?.value) {
			setUserBalance(formatUSD(fromBigNumber(_userBalance.data?.value), { dps: 2 }));
		}
	}, [_userBalance]);

	useEffect(() => {
		if (_accountBalance.data?.value) {
			setAccountBalance(formatUSD(fromBigNumber(_accountBalance.data?.value), { dps: 2 }));
		}
	}, [_accountBalance]);

	// allowance
	const [allowanceAmount, setAllowanceAmount] = useState(0);

	const { config: allowanceConfig } = usePrepareContractWrite({
		address: accountOrder?.id && allowanceAmount ? tokenAddr : undefined,
		abi: erc20ABI,
		functionName: 'approve',
		args:
			accountOrder?.id && allowanceAmount
				? [accountOrder?.id, toBN(allowanceAmount.toString())]
				: [ZERO_ADDRESS, ZERO_BN],
		chainId: chain?.id,
	});

	const {
		isSuccess,
		isLoading: isApproveQuoteLoading,
		write: approveQuote,
	} = useContractWrite({
		...allowanceConfig,
		onSettled: (data, error) => {},
		onSuccess: (data) => {},
	});

	const otusContracts = useOtusAccountContracts();

	// deposit
	const [depositAmount, setDepositAmount] = useState(0);

	let depositToastId = '';

	const { config: accountOrderDepositConfig } = usePrepareContractWrite({
		address: accountOrder?.id,
		abi: otusContracts && otusContracts['AccountOrder'] && otusContracts['AccountOrder'].abi,
		functionName: 'deposit',
		args: [toBN(depositAmount.toString())],
		chainId: chain?.id,
	});

	const {
		isSuccess: isDepositSuccess,
		isLoading: isDepositLoading,
		write: deposit,
		data: depositData,
	} = useContractWrite({
		...accountOrderDepositConfig,
		onSuccess: (data, variables, context) => {
			// if (depositToastId && chain) {
			//   const txHref = getExplorerUrl(chain?.id, data.hash)
			//   updatePendingToast(depositToastId, {
			//     description: `Your deposit is pending, click to view on etherscan`,
			//     href: txHref,
			//     autoClose: DEFAULT_TOAST_TIMEOUT,
			//   })
			// }
		},
		onError: (error: Error, variables, context) => {
			const rawMessage = error?.message;
			let message = rawMessage ? rawMessage.replace(/ *\([^)]*\) */g, '') : 'Something went wrong';
		},
		onMutate: () => {
			depositToastId = createPendingToast({
				description: `Confirm your deposit`,
				autoClose: false,
				icon: ToastIcon.Error,
			});
		},
	});

	const waitForDeposit = useWaitForTransaction({
		hash: depositData?.hash,
		onSuccess: (data) => {
			if (chain && data.blockHash) {
				const txHref = getExplorerUrl(chain?.id, data.blockHash);

				// const args: CreateToastOptions = {
				//   variant: 'success',
				//   description: `Your tx was successful`,
				//   href: txHref,
				//   autoClose: DEFAULT_TOAST_TIMEOUT,
				//   // icon: HeroIcon(IconType.CheckIcon),
				// }
				// updatePendingToast(depositToastId, {
				//   description: `Your deposit is pending, click to view on etherscan`,
				//   href: txHref,
				//   autoClose: false,
				// })
				// updateToast(depositToastId, args)
			}
		},
		onError(err) {},
	});

	// withdraw
	const [withdrawAmount, setWithdrawAmount] = useState(0);

	const { config: accountOrderWithdrawConfig } = usePrepareContractWrite({
		address: accountOrder?.id,
		abi: otusContracts && otusContracts['AccountOrder'] && otusContracts['AccountOrder'].abi,
		functionName: 'withdraw',
		args: [toBN(withdrawAmount.toString())],
		chainId: chain?.id,
	});

	const {
		isSuccess: isWithdrawSuccess,
		isLoading: isWithdrawLoading,
		write: withdraw,
	} = useContractWrite(accountOrderWithdrawConfig);

	// place order
	const { order, setOrder, placeOrder } = useLimitOrder({
		chainId: chain?.id,
		accountOrderAddr: accountOrder?.id,
		accountOrderAbi:
			otusContracts && otusContracts['AccountOrder'] && otusContracts['AccountOrder'].abi,
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
		depositAmount,
		withdrawAmount,
		allowanceAmount,
		setOrder,
		setAllowanceAmount,
		setDepositAmount,
		setWithdrawAmount,
		approveQuote,
		deposit,
		withdraw,
		placeOrder,
	} as AccountOrderProviderState;
};

const useAccountAllowance = (
	tokenAddr: Address | undefined,
	abi: any,
	owner: Address | undefined,
	accountOrderId: Address | undefined,
	provider: Provider
) => {
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
	}, [tokenAddr, abi, owner, accountOrderId, provider]);

	useEffect(() => {
		if (tokenAddr && abi && owner && accountOrderId && provider) {
			getAllowance();
		}
	}, [getAllowance, tokenAddr, abi, owner, accountOrderId, provider]);

	return accountAllowance;
};

const useLimitOrder = ({
	chainId,
	accountOrderAddr,
	accountOrderAbi,
}: {
	chainId: number | undefined;
	accountOrderAddr: Address | undefined;
	accountOrderAbi: any;
}) => {
	const [order, setOrder] = useState<StrikeTrade>({
		orderType: OrderTypes.LIMIT_PRICE,
		market: ethers.utils.formatBytes32String('ETH'),
		iterations: 3,
		collatPercent: toBN('1'),
		optionType: 0,
		strikeId: toBN('1'),
		size: toBN('1'),
		positionId: 0,
		tradeDirection: 0,
		targetPrice: toBN('1'),
		targetVolatility: toBN('1'),
	});

	// console.log({ order })
	const { config: placeOrderConfig } = usePrepareContractWrite({
		address: accountOrderAddr,
		abi: accountOrderAbi,
		functionName: 'placeOrder',
		args: [order],
		chainId: chainId,
		overrides: { value: toBN('0.003') },
		onSettled: (data, error) => {},
		onSuccess: (data) => {},
		onError: (error) => {},
		// overrides: {
		//   value: toBN('.01'),
		// },
	});

	const { data, isLoading, isSuccess, write: placeOrder } = useContractWrite(placeOrderConfig);

	return { order, setOrder, placeOrder };
};
