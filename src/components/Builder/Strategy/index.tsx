import React from "react";
import { SelectDirectionType } from "./SelectDirectionType";
import { SelectBuilderExpiration } from "./SelectExpiration";
import { Strategies } from "./Strategies";
import { SelectStrategy } from "./SelectStrategy";

export const Strategy = () => {
	return (
		<div className="flex flex-col">
			<div className="border-b dark:border-zinc-800 py-4 sm:flex sm:justify-between">
				<div className="py-2 p-4 w-full">
					<SelectDirectionType />
				</div>

				<div className="py-2 p-4  w-full">
					<SelectBuilderExpiration />
				</div>
			</div>

			<div className="hidden sm:grid sm:grid-cols-4 p-4 sm:gap-4 sm:gap-y-2 ">
				<Strategies />
			</div>

			<div className="sm:hidden p-4">
				<SelectStrategy />
			</div>
		</div>
	);
};
