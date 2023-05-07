import React from "react";
import { useBuilderContext } from "../../../context/BuilderContext";

import { formatUSD, fromBigNumber } from "../../../utils/formatters/numbers";

export const MarketDetails = () => {
	const { selectedMarket } = useBuilderContext();

	return (
		<div className="flex divider items-center sm:ml-4">
			<div className="font-semibold text-lg uppercase dark:text-zinc-200 p-2 px-2">
				<strong>
					{selectedMarket &&
						selectedMarket.spotPrice &&
						formatUSD(fromBigNumber(selectedMarket.spotPrice))}{" "}
				</strong>
			</div>

			{selectedMarket && (
				<div className="hidden sm:block px-2">
					<div className="font-semibold text-xs dark:text-zinc-400 text-zinc-600">
						Free Liquidity
					</div>

					<div className="font-light text-sm uppercase dark:text-zinc-200">
						<strong>
							{selectedMarket &&
								selectedMarket.liquidity &&
								formatUSD(fromBigNumber(selectedMarket.liquidity))}{" "}
						</strong>
					</div>
				</div>
			)}
		</div>
	);
};
