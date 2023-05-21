import React from "react";
import { SelectDirectionType } from "./SelectDirectionType";
import { SelectBuilderExpiration } from "./SelectExpiration";
import { SelectStrategy } from "./SelectStrategy";
import { SelectDirectionBoxType } from "./SelectDirectionBoxType";

export const Strategy = () => {
	return (
		<div className="flex flex-col">
			<div className="border-t border-zinc-100 dark:border-zinc-800 xl:flex xl:justify-between lg:flex-nowrap flex-wrap">
				<div className="lg:hidden pt-4 px-4 xl:pr-2  w-full">
					<SelectDirectionType />
				</div>

				<div className="hidden lg:flex pt-4 px-4 xl:pr-2 w-full">
					<SelectDirectionBoxType />
				</div>

				<div className="pt-4 px-4 md:px-4 w-full">
					<SelectBuilderExpiration />
				</div>
			</div>

			<div className="pt-4 px-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
				<SelectStrategy />
			</div>
		</div>
	);
};
