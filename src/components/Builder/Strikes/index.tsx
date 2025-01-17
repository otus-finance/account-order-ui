import React from "react";
import { SelectStrikesTable } from "./SelectStrikesTable";
import { motion } from "framer-motion";

export const Strikes = () => {
	return (
		<div className="col-span-3 sm:col-span-3 pb-6 grid grid-cols-6">
			{
				<motion.div
					className="col-span-6"
					animate={"open"}
					variants={{
						open: { opacity: 1, x: 0 },
						closed: { opacity: 0, x: "-100%" },
					}}
				>
					<SelectStrikesTable />
				</motion.div>
			}
		</div>
	);
};
