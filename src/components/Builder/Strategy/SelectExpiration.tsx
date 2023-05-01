import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { LyraBoard } from "../../../queries/lyra/useLyra";
import { useBuilderContext } from "../../../context/BuilderContext";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export const SelectBuilderExpiration = () => {
	const { selectedMarket, selectedExpirationDate, handleSelectedExpirationDate } =
		useBuilderContext();

	return (
		<Listbox value={selectedExpirationDate} onChange={handleSelectedExpirationDate}>
			{({ open }) => (
				<>
					<div className="relative sm:pl-2 w-full">
						<Listbox.Button className=" relative w-full rounded-full cursor-pointer bg-white border-zinc-300 border dark:border-none dark:bg-zinc-900 dark:shadow-black shadow-zinc-100 shadow-sm py-3 pl-3 pr-20 text-left dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-md">
							<span className="bloc]k truncate">
								{selectedExpirationDate ? selectedExpirationDate.name : "Expiration Date"}
							</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 dark:text-gray-400" aria-hidden="true" />
							</span>
						</Listbox.Button>

						<Transition
							show={open}
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options className="bg-white rounded-md absolute z-10 mt-1 max-h-60 w-full overflow-auto dark:bg-zinc-900 py-1 dark:text-base shadow-lg ring-1 ring-emerald-500 ring-opacity-5 focus:outline-none sm:text-md cursor-pointer">
								{selectedMarket?.liveBoards.map((board: LyraBoard, index: number) => (
									<Listbox.Option
										key={index}
										className={({ active }) =>
											classNames(
												active ? "bg-emerald-400 dark:text-white" : "dark:text-white",
												"relative cursor-default select-none py-2 pl-3 pr-9"
											)
										}
										value={board}
									>
										{({ selected, active }) => (
											<>
												<div className="flex items-center">
													<span
														className={classNames(
															selected ? "font-semibold" : "font-normal",
															"block truncate"
														)}
													>
														{board.name}
													</span>
												</div>

												{selected ? (
													<span
														className={classNames(
															active ? "text-white" : "text-emerald-500",
															"absolute inset-y-0 right-0 flex items-center pr-4"
														)}
													>
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</>
			)}
		</Listbox>
	);
};
