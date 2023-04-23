import React from "react";
import { SelectDirectionType } from "./SelectDirectionType";
import { SelectBuilderExpiration } from "./SelectExpiration";
import { Strategies } from "./Strategies";

export const Strategy = () => {
	return (
		<div className="col-span-3 sm:col-span-3 p-6">
			<div className="font-normal text-sm">
				Show me strategies if my bet is the market will be
				<span>
					<div className="inline-block pl-1 pr-2">
						<SelectDirectionType />
					</div>
				</span>
				by
				<span>
					<div className="inline-block sm:pl-1 mt-2 sm:mt-0 min-w-full sm:min-w-min">
						<SelectBuilderExpiration />
					</div>
				</span>
			</div>

			<div className="hidden sm:flex flex-row flex-wrap mt-6">
				<Strategies />
			</div>

			<div className="sm:hidden pr-10  max-h-40 overflow-y-scroll scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 mt-8 gap-6">
				<Strategies />
			</div>
		</div>
	);
};
