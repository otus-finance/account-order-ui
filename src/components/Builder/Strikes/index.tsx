import React from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { SelectStrikesTable } from "./SelectStrikesTable";
import { motion } from "framer-motion";

export const Strikes = () => {
	const { strikes } = useBuilderContext();

	return (
		<div className="col-span-3 sm:col-span-3 px-6 pb-6 grid grid-cols-6 bg-gradient-to-l from-black to-zinc-900 rounded-b-lg ">
			{strikes.length > 0 && (
				<motion.div
					className="col-span-6 overflow-x-scroll scrollbar scrollbar-thumb-zinc-700 scrollbar-track-zinc-500"
					animate={"open"}
					variants={{
						open: { opacity: 1, x: 0 },
						closed: { opacity: 0, x: "-100%" },
					}}
				>
					<SelectStrikesTable />
				</motion.div>
			)}
		</div>
	);
};
