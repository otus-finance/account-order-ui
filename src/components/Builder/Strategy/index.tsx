import React from "react";
import { SelectDirectionType } from "./SelectDirectionType";
import { SelectBuilderExpiration } from "./SelectExpiration";
import { Strategies } from "./Strategies";
import { SelectStrategy } from "./SelectStrategy";

export const Strategy = () => {
	return (
		<div className="flex flex-col">
			<div className="border-b dark:border-zinc-800 py-4 xl:flex xl:justify-between">
				<div className="py-2 p-4 w-full">
					<SelectDirectionType />
				</div>

				<div className="py-2 p-4  w-full">
					<SelectBuilderExpiration />
				</div>
			</div>

			{/* <div className="hidden xl:grid xl:grid-cols-4 p-4 xl:gap-4 xl:gap-y-2 ">
				<Strategies />
			</div> */}

			<div className="p-4">
				<SelectStrategy />
			</div>
		</div>
	);
};
