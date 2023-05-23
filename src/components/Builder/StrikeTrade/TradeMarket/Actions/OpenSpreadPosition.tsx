import React, { useState } from "react";

import { Spinner } from "../../../../UI/Components/Spinner";
import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { useBuilderContext } from "../../../../../context/BuilderContext";
import { motion } from "framer-motion";
import { Button } from "../../../../UI/Components/Button";

export const OpenSpreadPosition = () => {
	const { handleSelectActivityType } = useBuilderContext();
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
				// <div
				// 	onClick={() => spreadMarket.approve?.()}
				// 	className="cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400 rounded-full p-4 w-full font-semibold hover:dark:text-emerald-100 py-3 text-center dark:text-white"
				// >
				// 	{spreadMarket?.isApproveLoading ? (
				// 		<Spinner size={"medium"} color={"secondary"} />
				// 	) : (
				// 		"Allow Otus to use your Quote"
				// 	)}
				// </div>

				<Button
					isDisabled={!spreadMarket?.isOpenConfigSuccess}
					label={"Allow Otus to use your USDC"}
					isLoading={spreadMarket?.isApproveLoading && spreadMarket?.isTxLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => spreadMarket.approve?.()}
				/>
			) : (
				// 			<div
				// 				onClick={() => spreadMarket?.open?.()}
				// 				className={` rounded-full p-4 w-full font-semibold hover:dark:text-emerald-100 py-3 text-center dark:text-white
				// ${spreadMarket?.isOpenConfigSuccess
				// 						? "cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400"
				// 						: "dark:bg-zinc-800 cursor-not-allowed bg-zinc-200 "
				// 					}
				// `}
				// 			>
				// 				{spreadMarket?.isOpenPositionLoading && spreadMarket?.isTxLoading ? (
				// 					<Spinner />
				// 				) : (
				// 					"Open Position"
				// 				)}
				// 			</div>

				<Button
					isDisabled={!spreadMarket?.isOpenConfigSuccess}
					label={"Open Position"}
					isLoading={spreadMarket?.isOpenPositionLoading && spreadMarket?.isTxLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => spreadMarket?.open?.()}
				/>
			)}

			{spreadMarket?.openConfigError && spreadMarket?.openConfigError.reason && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="py-4 cursor-not-allowed"
				>
					<div className="p-4 text-sm  bg-rose-500 rounded-xl">
						{spreadMarket?.openConfigError.reason}
					</div>
				</motion.div>
			)}
		</>
	);
};
