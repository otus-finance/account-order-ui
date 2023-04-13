import React from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { MarketDetails } from "./MarketDetails";
import { LyraMarketOptions } from "./SelectMarket";
import { Spinner } from "../../UI/Components/Spinner";

export const Market = () => {
	const { markets, selectedMarket, isMarketLoading, handleSelectedMarket } = useBuilderContext();
	return (
		<div className="flex justify-between border border-zinc-800 shadow-xl rounded-lg p-1">
			<LyraMarketOptions
				markets={markets}
				selectedMarket={selectedMarket}
				handleSelectedMarket={handleSelectedMarket}
			/>
			{isMarketLoading ? <Spinner /> : <MarketDetails />}
		</div>
	);
};
