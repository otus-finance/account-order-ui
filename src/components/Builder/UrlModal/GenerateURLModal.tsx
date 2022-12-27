import { Dispatch, Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { trpc } from '../../../utils/trpc'
import { LyraBoard, LyraMarket, LyraStrike } from '../../../queries/lyra/useLyra'
import { calculateOptionType } from '../../../utils/formatters/optiontypes'
import { fromBigNumber } from '../../../utils/formatters/numbers'
import { useBuilderContext } from '../../../context/BuilderContext'
import { Spinner } from '../../UI/Components/Spinner'

export default function GenerateURLModal(
  { open, setOpen }:
    { open: boolean, setOpen: Dispatch<boolean> }
) {

  const { selectedMarket, selectedExpirationDate, strikes } = useBuilderContext();

  const [twitter, setTwitter] = useState('');
  const buildURL = trpc.useMutation('builder-id');

  const handleBuildURL = () => {
    if (selectedExpirationDate == null) return;
    if (selectedMarket == null) return;
    buildURL.mutate({
      generatedBy: twitter,
      expiry: selectedExpirationDate.expiryTimestamp,
      board: selectedExpirationDate.id,
      asset: selectedMarket.name,
      trades: strikes.map((_strike: LyraStrike) => {
        const { id, quote: { size, isBuy }, isCall } = _strike;
        return {
          strikeId: id,
          size: fromBigNumber(size),
          optionType: calculateOptionType(isBuy, isCall)
        }
      })
    }, {
      onSuccess: async (data) => {
        navigator.clipboard.writeText(`https://otus.finance/builder?strategy=${data}`)
      }
    })
  }


  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-none bg-zinc-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mx-auto flex h-6 w-12 items-center justify-center rounded-full ">
                    <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-zinc-100">
                      Share Trade Idea
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-zinc-400">
                        Add twitter handle (Not Required)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <input
                    onChange={(e) => setTwitter(e.target.value)}
                    type="text"
                    className="inline-flex w-full justify-center p-1 border border-zinc-700 bg-zinc-800 text-white font-light text-sm"
                  />
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    disabled={(selectedExpirationDate == null || selectedMarket == null) || buildURL.isSuccess}
                    className="inline-flex w-full justify-center rounded-2xl border border-emerald-700  hover:border-emerald-800 bg-zinc-900 p-2 col-span-3 font-semibold text-sm text-white text-center"
                    onClick={handleBuildURL}
                  >
                    {
                      buildURL.isLoading ?
                        <Spinner /> :
                        buildURL.isSuccess ?
                          'Copied to Clipboard' :
                          'Generate URL'
                    }

                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}