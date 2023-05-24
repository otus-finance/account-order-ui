import React from "react";

import { motion } from "framer-motion";

export const EditCollateral = () => {
	// const handleConfirmCollateral = () => {
	// 	updateCollateralPercent?.(strike, newCollateralPercent);
	// 	setEditCollateral(false);
	// };

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="p-4 dark:bg-zinc-800 bg-zinc-100"
		>
			<label
				htmlFor="default-range"
				className="block mb-2 text-sm font-medium text-zinc-900 dark:text-white"
			>
				Collateral
			</label>
			<input
				id="default-range"
				type="range"
				value="50"
				className=" w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
			/>
			<div className="flex justify-between">
				<div>Min</div>
				<div>Max</div>
			</div>
		</motion.div>
	);
};
