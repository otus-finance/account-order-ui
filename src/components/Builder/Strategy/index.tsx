import React from "react";
import { SelectDirectionType } from "./SelectDirectionType";
import { SelectBuilderExpiration } from "./SelectExpiration";
import { SelectStrategy } from "./SelectStrategy";
import { SelectDirectionBoxType } from "./SelectDirectionBoxType";
import { SelectStrategyBoxType } from "./SelectStrategyBoxType";

export const Strategy = () => {
	return (
		<div className="flex flex-col">
			<div className="hidden lg:grid grid-cols-5 border-t border-zinc-100 dark:border-zinc-800">
				<div className="col-span-1 border-r border-zinc-100 dark:border-zinc-800 p-2">
					<SelectDirectionBoxType />
				</div>

				<div className="col-span-4 p-2">
					<SelectStrategyBoxType />
				</div>
			</div>

			<div className="border-t border-zinc-100 dark:border-zinc-800 xl:flex xl:justify-between lg:flex-nowrap flex-wrap">
				<div className="lg:hidden pt-4 px-4 xl:pr-2  w-full">
					<SelectDirectionType />
				</div>

				<div className="lg:hidden pt-4 px-4 md:px-4 w-full">
					<SelectStrategy />
				</div>

				<div className="py-4 px-4 md:px-4 w-full">
					<SelectBuilderExpiration />
				</div>
			</div>
		</div>
	);
};
