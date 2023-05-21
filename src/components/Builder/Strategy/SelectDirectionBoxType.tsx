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

export const SelectDirectionBoxType = () => {
	const { selectedDirectionTypes, handleSelectedDirectionTypes } = useBuilderContext();

	const isSelected = (data: StrategyDirection) => {
		return selectedDirectionTypes.find((_direction: StrategyDirection) => _direction.id == data.id);
	};

	return (
		<div className="flex justify-between">
			{DirectionType.map((direction: StrategyDirection, index: number) => {
				const isSelectedStyle = isSelected(direction)
					? "border-emerald-400 dark:border-emerald-400"
					: "";

				return (
					<div
						onClick={() => {
							if (isSelected(direction)) {
								// filter out
								const _directionTypesFiltered = selectedDirectionTypes.filter(
									(_direction: StrategyDirection) => _direction.id != direction.id
								);
								handleSelectedDirectionTypes(_directionTypesFiltered);
							} else {
								handleSelectedDirectionTypes(selectedDirectionTypes.concat([direction]));
							}
						}}
						key={index}
						className={`border-2 whitespace-nowrap bg-white dark:bg-inherit border-zinc-100 dark:border-zinc-800 first:ml-0 last:mr-0 p-3 mx-1 rounded-full cursor-pointer ${isSelectedStyle}`}
					>
						{direction.name}
					</div>
				);
			})}
		</div>
	);
};
