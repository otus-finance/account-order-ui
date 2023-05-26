import React from "react";

import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { useBuilderContext } from "../../../../../context/BuilderContext";
import { motion } from "framer-motion";
import { Button } from "../../../../UI/Components/Button";

export const OpenSpreadPosition = () => {
	const { userBalance, spreadMarket } = useMarketOrderContext();

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

			{spreadMarket?.allowance.isZero() ? (
				<Button
					isDisabled={false}
					label={"Allow Otus to use your USDC"}
					isLoading={spreadMarket?.isApproveLoading || spreadMarket?.isTxLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => spreadMarket.approve?.()}
				/>
			) : (
				<Button
					isDisabled={!spreadMarket?.isOpenConfigSuccess}
					label={"Open Position"}
					isLoading={spreadMarket?.isOpenPositionLoading || spreadMarket?.isTxLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => spreadMarket?.open?.()}
				/>
			)}

			{spreadMarket?.openConfigError && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="pt-4 cursor-not-allowed"
				>
					<div className="p-4 text-sm text-zinc-800 bg-rose-400 rounded-xl">
						{spreadMarket?.openConfigError.reason}
					</div>
				</motion.div>
			)}
		</>
	);
};
