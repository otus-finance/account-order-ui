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
					? "bg-zinc-100 dark:bg-zinc-800 font-semibold"
					: "";

				return (
					<div
						onClick={() => {
							handleSelectedDirectionTypes(direction);
						}}
						key={index}
						className={`m-2 text-sm font-normal dark:text-white text-zinc-800  hover:bg-zinc-100 hover:dark:bg-zinc-800 text-center whitespace-nowrap   first:ml-0 last:mr-0 p-3 mx-1 rounded-full cursor-pointer ${isSelectedStyle}`}
					>
						{direction.name}
					</div>
				);
			})}
		</div>
	);
};
