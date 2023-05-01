import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { StrategyDirection, StrategyType } from "../../../utils/types";
import { useBuilderContext } from "../../../context/BuilderContext";
import { DirectionType } from "../../../utils/direction";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

const buildTextSelectedDirections = (directionTypes: StrategyDirection[]) => {
	return directionTypes.map(({ name }: { name: string }) => name).join(" ");
};

export const SelectDirectionType = () => {
	const { selectedDirectionTypes, handleSelectedDirectionTypes } = useBuilderContext();

	const isSelected = (data: any) => {
		return selectedDirectionTypes.find((_direction: StrategyDirection) => _direction.id == data.id);
	};

	return (
		<Listbox
			value={selectedDirectionTypes}
			onChange={(data: any) => {
				if (isSelected(data)) {
					// filter out
					const _directionTypesFiltered = selectedDirectionTypes.filter(
						(_direction: StrategyDirection) => _direction.id != data.id
					);
					handleSelectedDirectionTypes(_directionTypesFiltered);
				} else {
					handleSelectedDirectionTypes(selectedDirectionTypes.concat([data]));
				}
			}}
		>
			{({ open }) => (
				<>
					<div className="relative sm:pl-2">
						<Listbox.Button className=" relative w-full rounded-full cursor-pointer bg-white border-zinc-300 border dark:bg-zinc-900 dark:shadow-black shadow-zinc-100 shadow-sm py-3 pl-3 pr-20 text-left dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-md">
							<span className="block truncate">
								{selectedDirectionTypes.length > 0
									? buildTextSelectedDirections(selectedDirectionTypes)
									: "Market Expectation"}
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
							<Listbox.Options className="rounded-md absolute z-10 mt-1 max-h-60 w-full bg-white overflow-auto dark:bg-zinc-900 py-1 dark:text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-md">
								{DirectionType.map((direction: StrategyDirection) => (
									<Listbox.Option
										key={direction.id}
										className={({ active }) =>
											classNames(
												active ? "bg-emerald-500 text-white" : "dark:text-white",
												"relative cursor-default select-none py-2 pl-3 pr-9"
											)
										}
										value={direction}
									>
										{({ active }) => {
											const selected = isSelected(direction);
											return (
												<>
													<div className="flex items-center">
														<span
															className={classNames(
																selected ? "font-semibold" : "font-normal",
																"block truncate"
															)}
														>
															{direction.name}
														</span>
													</div>

													{selected ? (
														<span
															className={classNames(
																active ? "dark:text-white" : "dark:text-emerald-400",
																"absolute inset-y-0 right-0 flex items-center pr-4"
															)}
														>
															<CheckIcon className="h-5 w-5" aria-hidden="true" />
														</span>
													) : null}
												</>
											);
										}}
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
