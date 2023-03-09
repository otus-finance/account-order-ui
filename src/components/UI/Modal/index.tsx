import React, { ReactElement } from 'react'
import { Fragment, Dispatch } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export default function Modal(
  { setOpen, open, title, children }:
    { setOpen: Dispatch<boolean>, open: boolean, title: ReactElement, children?: ReactElement | ReactElement[] | null }
) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-black fixed inset-0 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-sm bg-zinc-900 border border-zinc-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mt-1 text-left sm:mt-1">
                    <Dialog.Title
                      as="h3"
                      className="text-md font-medium leading-6 text-zinc-200"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">{children}</div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
