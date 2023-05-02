import React from "react";
import { SelectDirectionType } from "./SelectDirectionType";
import { SelectBuilderExpiration } from "./SelectExpiration";
import { Strategies } from "./Strategies";

export const Strategy = () => {
	return (
		<div className="flex flex-col">
			<div className="border-b dark:border-zinc-800 py-4 sm:flex sm:justify-between">
				<div className="py-2 p-4 pr-2 w-full">
					<SelectDirectionType />
				</div>

				<div className="py-2 p-4 pl-2  w-full">
					<SelectBuilderExpiration />
				</div>
			</div>

			<div className="hidden sm:flex flex-row flex-wrap p-4">
				<Strategies />
			</div>

			<div className="sm:hidden pr-4  max-h-40 overflow-y-scroll scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 mt-8 gap-6">
				<Strategies />
			</div>
		</div>
	);
};
