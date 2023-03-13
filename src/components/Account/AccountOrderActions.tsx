import React, { Dispatch, useCallback, useState } from "react";

import { Spinner } from "../UI/Components/Spinner";
import { useAccountFactoryContract } from "../../hooks/Contracts";
import {
  AccountOrderContextProvider,
  useAccountOrderContext,
} from "../../context/AccountOrderContext";
import {
  Address,
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import Modal from "../UI/Modal";
import { DebounceInput } from "react-debounce-input";
import { WalletConnect } from "../Builder/StrikeTrade/Common/WalletConnect";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const AccountOrderActions = () => {
  const { address } = useAccount();

  return (
    <AccountOrderContextProvider owner={address}>
      <AccountOrderInfo />
    </AccountOrderContextProvider>
  );
};

const AccountOrderInfo = () => {
  const [open, setOpen] = useState(false);
  const { isLoading, accountOrder } = useAccountOrderContext();
  return (
    <div className="border border-zinc-800 rounded-sm shadow-sm mb-2 p-4">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {accountOrder && <AccountDeposit setOpen={setOpen} />}

          {!accountOrder && <CreateAccount />}
        </>
      )}

      {/* for deposits and withdrawals show withdrawl */}
      <Modal
        setOpen={setOpen}
        open={open}
        title={<div className="font-normal text-sm">Manage Account Funds</div>}
      >
        <AccountManage />
      </Modal>
    </div>
  );
};

enum AccountActionType {
  DEPOSIT,
  WITHDRAW,
}

export const AccountManage = () => {
  const {
    accountBalance,
    userBalance,
    accountAllowance,
    isApproveQuoteLoading,
    isDepositLoading,
    isWithdrawLoading,
    depositAmount,
    withdrawAmount,
    allowanceAmount,
    setAllowanceAmount,
    setDepositAmount,
    setWithdrawAmount,
    approveQuote,
    deposit,
    withdraw,
  } = useAccountOrderContext();

  const [accountActionType, setAccountActionType] = useState(
    AccountActionType.DEPOSIT
  );

  return (
    <>
      <div className="pt-4 pb-2">
        <div className="flex justify-between">
          <div
            onClick={() => setAccountActionType(AccountActionType.DEPOSIT)}
            className={`hover:border-emerald-600 text-white cursor-pointer p-2 font-normal text-center w-full rounded-l-full text-xs bg-zinc-900 border-2 ${
              AccountActionType.DEPOSIT === accountActionType
                ? "border-emerald-600"
                : "border-zinc-800 border-r-transparent"
            }`}
          >
            Deposit
          </div>
          <div
            onClick={() => setAccountActionType(AccountActionType.WITHDRAW)}
            className={`hover:border-emerald-600 text-white cursor-pointer p-2 font-normal text-center w-full rounded-r-full text-xs bg-zinc-900 border-2  ${
              AccountActionType.WITHDRAW === accountActionType
                ? "border-emerald-600"
                : "border-zinc-800 border-l-transparent"
            }`}
          >
            Withdraw
          </div>
        </div>
      </div>

      <div className="pb-2">
        <div className="bg-black border border-zinc-800 py-4 p-2">
          <div className="flex items-center justify-between px-2">
            <p className="truncate font-sans text-xs font-normal text-zinc-400">
              Wallet Balance
            </p>
            <div className="ml-2 flex flex-shrink-0">
              <p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-400">
                {userBalance}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <p className="truncate font-sans text-xs font-normal text-zinc-400">
              Margin Account Balance
            </p>
            <div className="ml-2 flex flex-shrink-0">
              <p className="inline-flex font-mono text-xs font-normal leading-5 text-zinc-400">
                {accountBalance}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-3">
            {AccountActionType.DEPOSIT === accountActionType &&
            accountAllowance &&
            accountAllowance > 0 ? (
              <DebounceInput
                minLength={1}
                debounceTimeout={300}
                onChange={async (e) => {
                  if (e.target.value == "") return;
                  const value = parseFloat(e.target.value);
                  setDepositAmount(value);
                }}
                type="number"
                name="size"
                id="size"
                value={depositAmount || 0}
                className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
              />
            ) : null}

            {AccountActionType.DEPOSIT === accountActionType &&
            accountAllowance === 0 ? (
              <DebounceInput
                minLength={1}
                debounceTimeout={300}
                onChange={async (e) => {
                  if (e.target.value == "") return;
                  const value = parseFloat(e.target.value);
                  setAllowanceAmount(value);
                }}
                type="number"
                name="size"
                id="size"
                value={allowanceAmount || 0}
                className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
              />
            ) : null}

            {AccountActionType.WITHDRAW === accountActionType ? (
              <DebounceInput
                minLength={1}
                debounceTimeout={300}
                onChange={async (e) => {
                  if (e.target.value == "") return;
                  const value = parseFloat(e.target.value);
                  setWithdrawAmount(value);
                }}
                type="number"
                name="size"
                id="size"
                value={withdrawAmount || 0}
                className="block ring-transparent outline-none w-32 bg-transparent pr-2 text-left text-white font-normal text-2xl"
              />
            ) : null}

            <div className="ml-2 flex flex-shrink-0">
              <p className="inline-flex font-normal text-2xl text-white">USD</p>
            </div>
          </div>
        </div>
      </div>

      {accountAllowance === 0 &&
      AccountActionType.DEPOSIT === accountActionType ? (
        <div
          onClick={() => approveQuote?.()}
          className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
        >
          {isApproveQuoteLoading ? <Spinner /> : "Approve Quote"}
        </div>
      ) : null}

      {accountAllowance &&
      accountAllowance > 0 &&
      AccountActionType.DEPOSIT === accountActionType ? (
        <div
          onClick={() => deposit?.()}
          className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
        >
          {isDepositLoading ? <Spinner /> : "Deposit"}
        </div>
      ) : null}

      {AccountActionType.WITHDRAW === accountActionType ? (
        <div
          onClick={() => withdraw?.()}
          className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
        >
          {isWithdrawLoading ? <Spinner /> : "Withdraw"}
        </div>
      ) : null}
    </>
  );
};

export const AccountDeposit = ({ setOpen }: { setOpen: Dispatch<boolean> }) => {
  const { accountBalance } = useAccountOrderContext();

  return (
    <>
      <div className="flex justify-between pb-4">
        <div className="text-xs text-zinc-200">Margin Account Balance</div>
        <div className="text-xs text-zinc-200 font-semibold">
          {accountBalance}
        </div>
      </div>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer border-2 border-emerald-600 hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full"
      >
        Margin Account Deposit
      </div>
    </>
  );
};

export const AccountWithdraw = () => {
  return (
    <>
      <div className="cursor-pointer border-2 border-orange-500 hover:border-orange-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full">
        Margin Account Withdraw
      </div>
    </>
  );
};

export const CreateAccount = () => {
  const { openConnectModal } = useConnectModal();

  const { address, isConnected } = useAccount();

  const accountFactoryContract = useAccountFactoryContract();

  const { chain } = useNetwork();

  // }, [accountFactoryContract]);
  const { isLoading, newAccount } = useAccountFactory(
    accountFactoryContract[0],
    accountFactoryContract[1],
    chain?.id
  );

  return (
    <>
      {isConnected ? (
        <div
          onClick={() => newAccount?.()}
          className="cursor-pointer border-2 border-orange-500 hover:border-orange-600 p-2 py-3 col-span-3 font-normal text-md text-white text-center rounded-full"
        >
          {isLoading ? <Spinner /> : "Create Margin Account"}
        </div>
      ) : null}

      {!isLoading && !isConnected && openConnectModal && <WalletConnect />}
    </>
  );
};

const useAccountFactory = (
  accountFactoryAddr: Address | undefined,
  abi: any,
  chainId: number | undefined
) => {
  const { config: accountFactoryConfig } = usePrepareContractWrite({
    address: accountFactoryAddr,
    abi: abi,
    functionName: "newAccount",
    chainId: chainId,
  });

  const { isLoading, write: newAccount } = useContractWrite({
    ...accountFactoryConfig,
    onSettled: (data, error) => {},
    onSuccess: (data) => {},
  });

  return { isLoading, newAccount };
};
