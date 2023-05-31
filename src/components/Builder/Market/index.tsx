import React from "react";
import { useBuilderContext } from "../../../context/BuilderContext";
import { MarketDetails } from "./MarketDetails";
import { SelectMarket } from "./SelectMarket";
import { SelectMarketBoxType } from "./SelectMarketBoxType";

export const Market = () => {
	const { markets, selectedMarket, handleSelectedMarket } = useBuilderContext();

	return (
		<div className="flex justify-between rounded-lg p-1">
			<div className="hidden sm:flex">
				<SelectMarketBoxType
					markets={markets}
					selectedMarket={selectedMarket}
					handleSelectedMarket={handleSelectedMarket}
				/>
			</div>

			<div className="sm:hidden flex">
				<SelectMarket
					markets={markets}
					selectedMarket={selectedMarket}
					handleSelectedMarket={handleSelectedMarket}
				/>
			</div>

			<MarketDetails />
		</div>
	);
};
