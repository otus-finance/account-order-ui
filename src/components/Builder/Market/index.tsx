import React from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { MarketDetails } from "./MarketDetails";
import { LyraMarketOptions } from "./SelectMarket";

export const Market = () => {
	const { markets, selectedMarket, handleSelectedMarket } = useBuilderContext();

	return (
		<div className="flex sm:justify-between rounded-lg p-1">
			<LyraMarketOptions
				markets={markets}
				selectedMarket={selectedMarket}
				handleSelectedMarket={handleSelectedMarket}
			/>
			<MarketDetails />
		</div>
	);
};
