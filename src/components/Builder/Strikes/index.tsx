import React from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import LyraIcon from "../../UI/Icons/Color/LYRA";
import { SelectStrikesTable } from "./SelectStrikesTable";
import { StrikesTable } from "./StrikesTable";
import { motion } from "framer-motion";

import { BuilderType } from "../../../utils/types";

export const Strikes = () => {
	const {
		builderType,
		isBuildingNewStrategy,
		showStrikesSelect,
		selectedStrategy,
		handleBuildNewStrategy,
	} = useBuilderContext();

	return (
		<div className="col-span-3 sm:col-span-3 px-6 pb-6 grid grid-cols-6">
			<motion.div
				className="col-span-6 overflow-x-scroll scrollbar scrollbar-thumb-zinc-700 scrollbar-track-zinc-500  mb-8"
				animate={"open"}
				variants={{
					open: { opacity: 1, x: 0 },
					closed: { opacity: 0, x: "-100%" },
				}}
			>
				<SelectStrikesTable />
			</motion.div>
		</div>
	);
};
