import React from "react";

import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { ActivityType } from "../../../../../utils/types";
import { useBuilderContext } from "../../../../../context/BuilderContext";
import { motion } from "framer-motion";
import { Button } from "../../../../UI/Components/Button";

export const OpenLyraPosition = () => {
	const { handleSelectActivityType } = useBuilderContext();
	const { userBalance, otusMarket } = useMarketOrderContext();

	return (
		<>
			{userBalance && userBalance.isZero() && (
				<div
					onClick={() => console.warn("Add funds")}
					className="mb-4 cursor-disabled border-2 dark:border-zinc-800 border-zinc-100 dark:bg-zinc-800 p-2 py-3 col-span-3 font-normal text-sm dark:text-white text-center rounded-full"
				>
					Insufficient Balance
				</div>
			)}

			{otusMarket?.allowance.isZero() ? (
				<Button
					isDisabled={!otusMarket?.isOpenConfigSuccess}
					label={"Allow Otus to use your USDC"}
					isLoading={otusMarket?.isApproveLoading || otusMarket?.isTxLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => otusMarket.approve?.()}
				/>
			) : (
				<Button
					isDisabled={!otusMarket?.isOpenConfigSuccess}
					label={"Open Position"}
					isLoading={otusMarket?.isOpenPositionLoading || otusMarket?.isTxLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => otusMarket?.open?.()}
				/>
			)}

			{otusMarket?.isOpenPositionSuccess && (
				<div className="py-4">
					<div
						onClick={() => handleSelectActivityType(ActivityType.Position)}
						className="cursor-pointer rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white bg-gradient-to-t from-black to-zinc-800"
					>
						View Position
					</div>
				</div>
			)}

			{otusMarket?.openConfigError && otusMarket?.openConfigError.reason && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="pt-4 cursor-not-allowed"
				>
					<div className="p-4 text-sm text-zinc-800  bg-rose-400 rounded-xl">
						{otusMarket?.openConfigError.reason}
					</div>
				</motion.div>
			)}
		</>
	);
};
