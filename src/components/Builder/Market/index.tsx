import React from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { MarketDetails } from "./MarketDetails";
import { LyraMarketOptions } from "./SelectMarket";
import { Spinner } from "../../UI/Components/Spinner";

export const Market = () => {
	const { markets, selectedMarket, isMarketLoading, handleSelectedMarket } = useBuilderContext();

	return (
		<div className="flex flex-wrap sm:justify-between border dark:border-zinc-800 shadow-xl dark:shadow-black shadow-zinc-100 rounded-lg p-1">
			<LyraMarketOptions
				markets={markets}
				selectedMarket={selectedMarket}
				handleSelectedMarket={handleSelectedMarket}
			/>
			{isMarketLoading ? (
				<div className="flex items-center">
					<Spinner />
				</div>
			) : (
				<MarketDetails />
			)}
		</div>
	);
};
