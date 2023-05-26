import React, { useEffect, useState } from "react";
import Lyra, { Quote } from "@lyrafinance/lyra-js";

import { motion } from "framer-motion";
import { useLyraTrade } from "../../../../queries/lyra/useLyra";
import { BigNumber } from "ethers";
import { Spinner } from "../../../UI/Components/Spinner";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";

type Props = {
	handleUpdateCollateral: (any: number) => void;
	setCollateralTo: BigNumber;
	lyra?: Lyra;
	quote?: Quote;
};

export const EditCollateral = ({ handleUpdateCollateral, setCollateralTo, lyra, quote }: Props) => {
	const { isLoading, data, refetch } = useLyraTrade(setCollateralTo, lyra, quote);

	const [min, setMin] = useState(0);
	const [max, setMax] = useState(0);

	useEffect(() => {
		if (data?.min) {
			setMin(fromBigNumber(data.min));
		}
		if (data?.max) {
			setMax(fromBigNumber(data.max));
		} else if (quote?.strikePrice) {
			setMax(fromBigNumber(quote?.strikePrice.mul(2)));
		}
	}, [quote, data]);

	return isLoading ? (
		<Spinner />
	) : (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="p-4 dark:bg-zinc-800 bg-zinc-100"
		>
			{" "}
			{data && (
				<>
					<div className="flex justify-between text-xs">
						<label
							htmlFor="collateral-range"
							className="block mb-2 text-xs font-medium text-zinc-800 dark:text-zinc-200"
						>
							Collateral
						</label>
						<div>
							Liquidation Price At:{" "}
							{data.liquidationPrice && formatUSD(fromBigNumber(data.liquidationPrice))}
						</div>
					</div>

					{min && max && (
						<>
							<input
								onChange={(e) => {
									handleUpdateCollateral(parseInt(e.target.value));
									refetch();
								}}
								id="collateral-range"
								type="range"
								value={fromBigNumber(setCollateralTo)}
								min={min}
								max={max}
								className=" w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
							/>
							<div className="flex justify-between text-xs">
								<div>Min: {formatUSD(min)}</div>
								<div>Max: {formatUSD(max)}</div>
							</div>
						</>
					)}
				</>
			)}
		</motion.div>
	);
};
