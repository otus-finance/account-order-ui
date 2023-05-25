import React from "react";
import Lyra, { Quote } from "@lyrafinance/lyra-js";

import { motion } from "framer-motion";
// import { useTradeCollateralRequired } from "../../../../queries/lyra/useLyra";

type Props = {
	lyra?: Lyra;
	quote?: Quote;
};

export const EditCollateral = ({ lyra, quote }: Props) => {
	// const { isLoading, data } = useTradeCollateralRequired(lyra, quote);
	// console.log({ data })
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="p-4 dark:bg-zinc-800 bg-zinc-100"
		>
			<label
				htmlFor="default-range"
				className="block mb-2 text-xs font-medium text-zinc-800 dark:text-zinc-200"
			>
				Collateral
			</label>
			<input
				id="default-range"
				type="range"
				value="50"
				className=" w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
			/>
			<div className="flex justify-between text-xs">
				<div>Min</div>
				<div>Max</div>
			</div>
		</motion.div>
	);
};
