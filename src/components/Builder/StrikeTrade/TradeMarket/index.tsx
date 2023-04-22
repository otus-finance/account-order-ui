import React from "react";
import { MarketOrderActions } from "./MarketOrderActions";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { formatUSD } from "../../../../utils/formatters/numbers";

export const TradeMarket = () => {
	return <MarketOrderActions />;
};
