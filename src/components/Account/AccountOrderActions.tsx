import React, { Dispatch, useCallback, useState } from 'react'

import useTransaction from '../../hooks/Transaction';
import { Spinner } from '../UI/Components/Spinner'
import { useAccountFactoryContract } from '../../hooks/Contracts'
import { ethers } from 'ethers'
import { Network } from '@lyrafinance/lyra-js'
import { AccountOrderContextProvider, useAccountOrderContext } from '../../context/AccountOrderContext'
import { useAccount } from 'wagmi';
import Modal from '../UI/Modal';
import { DebounceInput } from 'react-debounce-input';

export const AccountOrderActions = () => {
  const { address } = useAccount();

  return <AccountOrderContextProvider owner={address || ''}>
    <AccountOrderInfo />
  </AccountOrderContextProvider>
}

const AccountOrderInfo = () => {

  const [open, setOpen] = useState(false);
  const { accountOrder } = useAccountOrderContext();
  return <div className='border border-zinc-800 rounded-sm shadow-sm mb-2 p-4'>
    {
      accountOrder &&
      <AccountDeposit setOpen={setOpen} />
    }

    {
      !accountOrder &&
      <CreateAccount />
    }

    {/* for deposits and withdrawals show withdrawl */}
    <Modal
      setOpen={setOpen}
      open={open}
      title={<div className='font-normal text-sm'>Manage Account Funds</div>}
    >
      <AccountManage />
    </Modal>

  </div>

}

enum AccountActionType {
  DEPOSIT,
  WITHDRAW
}

export const AccountManage = () => {

  const [accountActionType, setAccountActionType] = useState(AccountActionType.DEPOSIT)

  return <>

    <div className='pt-4 pb-2'>
      <div className='flex justify-between'>
        <div
          onClick={() => setAccountActionType(AccountActionType.DEPOSIT)}
          className={`hover:border-emerald-600 text-white cursor-pointer p-2 font-normal text-center w-full rounded-l-full text-xs bg-zinc-900 border-2 ${AccountActionType.DEPOSIT === accountActionType ? 'border-emerald-600' : 'border-zinc-800 border-r-transparent'}`}
        >
          Deposit
        </div>
        <div
          onClick={() => setAccountActionType(AccountActionType.WITHDRAW)}
          className={`hover:border-emerald-600 text-white cursor-pointer p-2 font-normal text-center w-full rounded-r-full text-xs bg-zinc-900 border-2  ${AccountActionType.WITHDRAW === accountActionType ? 'border-emerald-600' : 'border-zinc-800 border-l-transparent'}`}
        >
          Withdraw
        </div>
      </div>

    </div>

    <div className='pb-2'>

      <div className='bg-black border border-zinc-800 py-4 p-2'>
        <div className="flex items-center justify-between px-2">
          <p className="truncate font-sans text-xs font-normal text-zinc-400">
            Wallet Balance
          </p>
          <div className="ml-2 flex flex-shrink-0">
            <p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-400">
              $10000.22
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <p className="truncate font-sans text-xs font-normal text-zinc-400">
            Margin Account Balance
          </p>
          <div className="ml-2 flex flex-shrink-0">
            <p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-400">
              $1200.22
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-3">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            onChange={async (e) => {
              if (e.target.value == '') return
              const value = parseFloat(e.target.value);
            }}
            type="number"
            name="size"
            id="size"
            value={10.00}
            className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
          />
          <div className="ml-2 flex flex-shrink-0">
            <p className="inline-flex font-normal text-2xl text-white">
              USD
            </p>
          </div>
        </div>
      </div>

    </div>

    <div className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full">
      Deposit
    </div>
  </>
}

export const AccountDeposit = ({ setOpen }: { setOpen: Dispatch<boolean> }) => {
  return <>
    <div className='flex justify-between pb-4'>
      <div className='text-xs text-zinc-200'>Margin Account Balance</div>
      <div className='text-xs text-zinc-200 font-semibold'>$10.00</div>
    </div>
    <div onClick={() => setOpen(true)} className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full">
      Margin Account Deposit
    </div>
  </>
}

export const AccountWithdraw = () => {
  return <>
    <div className="cursor-pointer border-2 border-orange-500 hover:border-orange-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full">
      Margin Account Withdraw
    </div>
  </>
}

export const CreateAccount = () => {

  const accountFactoryContract = useAccountFactoryContract();

  const provider = new ethers.providers.JsonRpcProvider()

  const execute = useTransaction(provider, Network.Local);

  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const handleAccountCreate = useCallback(async () => {
    if (accountFactoryContract === null) {
      console.warn('No factory available');
      return null;
    }

    setIsCreateLoading(true);

    // const tx = await accountFactoryContract.newAccount();

    // if (tx) {

    // }

  }, [accountFactoryContract]);

  return <>
    <div onClick={() => handleAccountCreate()} className="cursor-pointer border-2 border-orange-500 hover:border-orange-600 p-2 py-3 col-span-3 font-normal text-md text-white text-center rounded-full">
      {
        isCreateLoading ?
          <Spinner /> :
          'Create Margin Account'
      }
    </div>
  </>
}
