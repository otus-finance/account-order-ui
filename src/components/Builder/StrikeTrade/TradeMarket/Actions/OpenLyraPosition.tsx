import React from "react";

import { Spinner } from "../../../../UI/Components/Spinner";
import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { ActivityType, MarketOrderTransaction } from "../../../../../utils/types";
import { useBuilderContext } from "../../../../../context/BuilderContext";

export const OpenLyraPosition = () => {
	const { handleSelectActivityType } = useBuilderContext();
	const { userBalance, otusMarket } = useMarketOrderContext();

	return (
		<>
			{userBalance && userBalance.isZero() && (
				<div
					onClick={() => console.warn("Add funds")}
					className="mb-4 cursor-disabled border-2 border-zinc-800 bg-zinc-800 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
				>
					Insufficient Balance
				</div>
			)}

			{otusMarket?.allowance.isZero() ? (
				<div
					onClick={() => otusMarket.approve?.()}
					className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
				>
					{otusMarket?.isApproveLoading ? (
						<Spinner size={"medium"} color={"secondary"} />
					) : (
						"Allow Otus to use your Quote"
					)}
				</div>
			) : (
				<div
					onClick={() => otusMarket?.open?.()}
					className={` rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white
          ${
						otusMarket?.isOpenConfigSuccess
							? "cursor-pointer  bg-gradient-to-t from-emerald-700 to-emerald-500"
							: "bg-zinc-800 cursor-not-allowed "
					}
          `}
				>
					{otusMarket?.isOpenPositionLoading || otusMarket?.isTxLoading ? (
						<Spinner size={"medium"} color={"secondary"} />
					) : (
						"Open Position"
					)}
				</div>
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

			{otusMarket?.openConfigError && (
				<div className="py-4 cursor-not-allowed">
					<div className="p-4 text-sm  bg-rose-500 rounded-xl">
						{otusMarket?.openConfigError.reason}
					</div>
				</div>
			)}
		</>
	);
};
