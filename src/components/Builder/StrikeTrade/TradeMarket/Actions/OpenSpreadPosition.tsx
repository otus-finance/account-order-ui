import React, { useState } from "react";

import { Spinner } from "../../../../UI/Components/Spinner";
import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { useBuilderContext } from "../../../../../context/BuilderContext";
import { ActivityType } from "../../../../../utils/types";

export const OpenSpreadPosition = () => {
	const { handleSelectActivityType } = useBuilderContext();
	const { userBalance, spreadMarket } = useMarketOrderContext();

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

			{spreadMarket?.allowance.isZero() ? (
				<div
					onClick={() => spreadMarket.approve?.()}
					className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
				>
					{spreadMarket?.isApproveLoading ? (
						<Spinner size={"medium"} color={"secondary"} />
					) : (
						"Allow Otus to use your Quote"
					)}
				</div>
			) : (
				<div
					onClick={() => spreadMarket?.open?.()}
					className={` rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white
	${
		spreadMarket?.isOpenConfigSuccess
			? "cursor-pointer  bg-gradient-to-t from-emerald-700 to-emerald-500"
			: "bg-zinc-800 cursor-not-allowed "
	}
	`}
				>
					{spreadMarket?.isOpenPositionLoading && spreadMarket?.isTxLoading ? (
						<Spinner />
					) : (
						"Open Spread Position"
					)}
				</div>
			)}

			{spreadMarket?.openConfigError && (
				<div className="py-4 cursor-not-allowed">
					<div
						onClick={() => handleSelectActivityType(ActivityType.Position)}
						className="p-4 text-sm  bg-rose-500 rounded-xl"
					>
						{spreadMarket?.openConfigError.reason}
					</div>
				</div>
			)}
		</>
	);
};
