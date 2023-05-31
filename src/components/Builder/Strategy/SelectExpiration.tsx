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
					<div className="relative w-full">
						<Listbox.Button className=" relative w-full rounded-full cursor-pointer   bg-zinc-100 dark:bg-zinc-800   pl-4 pr-20 text-left dark:text-white text-sm py-2 ">
							<span className="block truncate text-zinc-900 dark:text-zinc-200">
								{selectedExpirationDate ? selectedExpirationDate.name : "Select an Expiration Date"}
							</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 dark:text-gray-400" aria-hidden="true" />
							</span>
						</Listbox.Button>

						<Transition
							show={open}
							as={Fragment}
							enter="transition ease-in duration-200"
							leave="transition ease-in duration-100"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options className="overflow-hidden bg-white w-full rounded-xl absolute z-10 mt-1 max-h-48 dark:bg-zinc-800 focus:outline-none cursor-pointer">
								{selectedMarket?.liveBoards.map((board: LyraBoard, index: number) => (
									<Listbox.Option
										key={index}
										className={({ active }) =>
											classNames(
												active ? "bg-zinc-100 dark:bg-zinc-700" : "dark:text-white",
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
															"block truncate text-sm"
														)}
													>
														{board.name}
													</span>
												</div>

												{selected ? (
													<span
														className={classNames(
															active ? "text-emerald-400" : "text-emerald-500",
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
