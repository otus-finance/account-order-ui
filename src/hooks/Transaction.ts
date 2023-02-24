import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { HeroIcon, IconType } from '../components/UI/Icons/IconSVG'

import {
  closeToast,
  createPendingToast,
  createToast,
  CreateToastOptions,
  updatePendingToast,
  updateToast,
} from '../components/UI/Toast';
import { Network } from '@lyrafinance/lyra-js'
import { ContractReceipt, ethers, PopulatedTransaction } from 'ethers'
import { useCallback } from 'react'

import logError from '../utils/log'


import { useSigner } from 'wagmi'
import getExplorerUrl from '../utils/chains/getExplorerUrl';

const DEFAULT_OPTIMISM_TRANSACTION_TIMEOUT = 1000 * 10 // 10 seconds
const DEFAULT_TOAST_TIMEOUT = 1000 * 5 // 5 seconds
const POLL_INTERVAL = 1000 // 1 second

// https://docs.ethers.io/v5/single-page/#/v5/api/providers/types/-%23-providers-TransactionReceipt
enum TransactionStatus {
  Failure = 0,
  Success = 1,
}

const reportError = (
  network: Network,
  error: any,
  toastId: string | null,
  skipToast?: boolean,
  transactionReceipt?: TransactionReceipt | null
) => {
  if (error?.code === 4001) {
    // user rejected the transaction
    if (toastId) {
      closeToast(toastId)
    }
    return null
  }

  // Remove parentheses from error message
  const rawMessage = error?.data?.message ?? error?.message
  let message = rawMessage ? rawMessage.replace(/ *\([^)]*\) */g, '') : 'Something went wrong'
  console.log({ message })
  if (transactionReceipt?.transactionHash) {
    console.log('is url?');
    message += '. Click to view failed transaction.'
  }
  // Uppercase first letter
  message = message.charAt(0).toUpperCase() + message.slice(1)

  // Log error to Sentry
  logError(message, { error, transactionReceipt, network })
  console.log({ error: message })
  const args: CreateToastOptions = {
    variant: 'error',
    description: message,
    icon: HeroIcon(IconType.ExclamationTriangleIcon),
    href: transactionReceipt ? getExplorerUrl(network, transactionReceipt.transactionHash) : undefined,
    autoClose: false,
  }

  if (toastId) {
    updateToast(toastId, { ...args, autoClose: false })
  } else if (!skipToast) {
    createToast({ ...args, autoClose: false })
  }
}

export type TransactionOptions = {
  title?: string
  description?: string
  timeout?: number
  skipToast?: boolean
  onComplete?: (receipt: ContractReceipt) => any
  onSubmitted?: (receipt: TransactionResponse) => any
  onError?: (error: Error) => any
}

export default function useTransaction(provider: ethers.providers.JsonRpcProvider | null, network: Network | null): (
  populatedTx: PopulatedTransaction,
  options?: TransactionOptions
) => Promise<ContractReceipt | null> {

  const { data: signer } = useSigner();

  return useCallback(async (populatedTx: PopulatedTransaction, options?: TransactionOptions): Promise<ContractReceipt | null> => {

    if (!signer) {
      console.warn('No signer')
      return null
    }

    if (!provider) {
      console.warn('No provider')
      return null
    }


    if (!network) {
      console.warn('No network')
      return null
    }

    const description = options?.description ? options.description.toLowerCase() : 'transaction'

    const toastId = createPendingToast({
      description: `Confirm your ${description}`,
      autoClose: false,
    });

    const onError = options?.onError ?? emptyFunction

    let tx: TransactionResponse

    try {
      console.time('tx')
      // update to send multiple transactions ? 
      tx = await signer.sendTransaction(await populatedTx)
      console.timeEnd('tx')
    } catch (e) {
      console.timeEnd('tx')
      console.error(e)
      setTimeout(() => {
        reportError(network, e, toastId)
        onError(e as Error)
      }, 200)
      return null
    }

    if (options?.onSubmitted) {
      options.onSubmitted(tx)
    }

    const defaultTimeout = DEFAULT_OPTIMISM_TRANSACTION_TIMEOUT
    const transactionTimeout = options?.timeout ?? defaultTimeout
    const autoClose = transactionTimeout + POLL_INTERVAL // add buffer
    const txHref = getExplorerUrl(network, tx.hash)

    // TODO: Pending spinner on top of wallet icon
    if (toastId) {
      updatePendingToast(toastId, {
        description: `Your ${description} is pending, click to view on etherscan`,
        href: txHref,
        autoClose,
      })
    }

    try {
      console.debug('tx', tx)
      console.time('waitForTransaction')
      // Poll for transaction receipt (can lead to faster results than .wait())
      const receipt = await new Promise<TransactionReceipt>(resolve => {
        let n = 0
        const pollReceipt = async () => {
          const receipt = await provider.getTransactionReceipt(tx.hash)
          if (receipt) {
            resolve(receipt)
          } else if (n < 100) {
            n++
            setTimeout(pollReceipt, 500)
          } else {
            console.warn('Max retries exceeded')
          }
        }
        setTimeout(pollReceipt, 500)
      })
      console.debug('receipt', receipt)
      console.timeEnd('waitForTransaction')

      if (receipt && receipt.status === TransactionStatus.Failure) {
        try {
          const transaction = await provider.getTransaction(tx.hash)
          await provider.call(transaction as any, tx.blockNumber)
        } catch (e) {
          reportError(network, e, toastId)
        }
        return null
      }

      if (receipt && receipt.status === TransactionStatus.Success) {
        // Transaction was polled successfully
        if (options?.onComplete != null) {
          // Execute middleware mutation for successful transactions
          console.time('onComplete')
          await options.onComplete(receipt)
          console.timeEnd('onComplete')
        }

        const args: CreateToastOptions = {
          variant: 'success',
          description: `Your ${description} was successful`,
          href: txHref,
          autoClose: DEFAULT_TOAST_TIMEOUT,
          icon: HeroIcon(IconType.CheckIcon),
        }
        if (toastId) {
          updateToast(toastId, args)
        }
        return receipt
      } else {
        // Transaction timed out
        const args: CreateToastOptions = {
          variant: 'warning',
          description: `Your ${description} took longer than ${Math.floor(
            transactionTimeout / 1000
          )} seconds, view your transaction progress`,
          href: txHref,
          autoClose: DEFAULT_TOAST_TIMEOUT,
          icon: HeroIcon(IconType.ExclamationTriangleIcon),
        }
        if (toastId) {
          updateToast(toastId, args)
        }
        onError(new Error('Transaction timed out'))
        return null
      }
    } catch (e) {
      // Capture error
      console.error(e)
      try {
        const receipt = await provider.getTransactionReceipt(tx.hash)
        const transaction = await provider.getTransaction(tx.hash)
        try {
          await provider.call(transaction as any, receipt.blockNumber)
          return null // Should never happen
        } catch (e) {
          reportError(network, e, toastId)
          onError(e as Error)
          return null
        }
      } catch (e) {
        reportError(network, new Error('Failed to fetch transaction receipt'), toastId)
        onError(e as Error)
        return null
      }
    }

  }, [provider, network, signer])
}

const emptyFunction = () => { }