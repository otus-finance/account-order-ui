import React from "react";
import { StrategyDirection } from "../../../utils/types";
import { useBuilderContext } from "../../../context/BuilderContext";
import { DirectionType } from "../../../utils/direction";

export const SelectDirectionBoxType = () => {
	const { selectedDirectionTypes, handleSelectedDirectionTypes } = useBuilderContext();

	const isSelected = (data: StrategyDirection) => {
		return selectedDirectionTypes?.id == data.id;
	};

	return (
		<div className="">
			{DirectionType.map((direction: StrategyDirection, index: number) => {
				const isSelectedStyle = isSelected(direction)
					? "border-emerald-400 dark:border-emerald-400"
					: "border-zinc-100 dark:border-zinc-800";

				return (
					<div
						onClick={() => {
							handleSelectedDirectionTypes(direction);
						}}
						key={index}
						className={`m-2 border-2 whitespace-nowrap bg-white dark:bg-inherit  first:ml-0 last:mr-0 p-3 mx-1 rounded-full cursor-pointer ${isSelectedStyle}`}
					>
						{direction.name}
					</div>
				);
			})}
		</div>
	);
};
