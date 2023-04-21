import React from "react";
import { MarketOrderActions } from "./MarketOrderActions";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { formatUSD } from "../../../../utils/formatters/numbers";
import { MarketOrderContextProvider } from "../../../../context/MarketOrderContext";

export const TradeMarket = () => {
	return (
		<MarketOrderContextProvider>
			<MarketOrderActions />
		</MarketOrderContextProvider>
	);
};
