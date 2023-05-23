import React from "react";

import { Spinner } from "../../../../UI/Components/Spinner";
import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { ActivityType, MarketOrderTransaction } from "../../../../../utils/types";
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
				// <div
				// 	onClick={() => otusMarket.approve?.()}
				// 	className="cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400 rounded-full p-4 w-full font-semibold hover:dark:text-emerald-100 py-3 text-center dark:text-white"
				// >
				// 	{otusMarket?.isApproveLoading ? (
				// 		<Spinner size={"medium"} color={"secondary"} />
				// 	) : (
				// 		"Allow Otus to use your Quote"
				// 	)}
				// </div>
				<Button
					isDisabled={!otusMarket?.isOpenConfigSuccess}
					label={"Allow Otus to use your USDC"}
					isLoading={otusMarket?.isApproveLoading && otusMarket?.isTxLoading}
					variant={"action"}
					radius={"full"}
					size={"full"}
					onClick={() => otusMarket.approve?.()}
				/>
			) : (
				// <div
				// 	onClick={() => otusMarket?.open?.()}
				// 	className={` rounded-full p-4 w-full font-semibold hover:dark:text-emerald-100 py-3 text-center text-white
				//   ${otusMarket?.isOpenConfigSuccess
				// 			? "cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400"
				// 			: "dark:bg-zinc-800 cursor-not-allowed bg-zinc-200"
				// 		}
				//   `}
				// >
				// 	{otusMarket?.isOpenPositionLoading || otusMarket?.isTxLoading ? (
				// 		<Spinner size={"medium"} color={"secondary"} />
				// 	) : (
				// 		"Open Position"
				// 	)}
				// </div>

				<Button
					isDisabled={!otusMarket?.isOpenConfigSuccess}
					label={"Open Position"}
					isLoading={otusMarket?.isOpenPositionLoading && otusMarket?.isTxLoading}
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
					className="py-4 cursor-not-allowed"
				>
					<div className="p-4 text-sm  bg-rose-500 rounded-xl">
						{otusMarket?.openConfigError.reason}
					</div>
				</motion.div>
			)}
		</>
	);
};
