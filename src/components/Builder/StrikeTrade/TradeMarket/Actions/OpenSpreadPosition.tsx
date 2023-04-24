import React, { useState } from "react";

import { Spinner } from "../../../../UI/Components/Spinner";
import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";

export const OpenPosition = () => {
	const { userBalance, isOpenPositionLoading, openPosition, isTxLoading } = useMarketOrderContext();

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

			<div
				onClick={() => openPosition?.()}
				className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
			>
				{isOpenPositionLoading && isTxLoading ? <Spinner /> : "Open Spread Position"}
			</div>
		</>
	);
};
