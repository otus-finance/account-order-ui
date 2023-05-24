import React from "react";
import BTCIcon from "../../UI/Icons/Color/BTC";
import ETHIcon from "../../UI/Icons/Color/ETH";
import { LyraBoard, LyraMarket } from "../../../queries/lyra/useLyra";

export const formatName = (marketName: string) => {
	switch (marketName) {
		case "sETH-sUSD":
		case "ETH-USDC":
			return "ETH";
		default:
			return "BTC";
	}
};

export const LyraMarketOptions = ({
	markets,
	selectedMarket,
	handleSelectedMarket,
}: {
	markets: LyraMarket[] | null;
	selectedMarket: LyraMarket | null;
	handleSelectedMarket?: any;
}) => {
	return (
		<div className="flex">
			{markets
				?.filter(({ liveBoards }: { liveBoards: LyraBoard[] }) => liveBoards.length > 0)
				.map((market: LyraMarket, index: number) => {
					const { name } = market;
					const isSelected = selectedMarket?.name == name;
					const selectedClass = isSelected
						? " dark:border-emerald-400 border-emerald-400"
						: "border-zinc-100 dark:border-zinc-800";
					return (
						<div
							key={index}
							onClick={() => {
								handleSelectedMarket && handleSelectedMarket(market);
							}}
							className={`rounded-full p-2 px-4 border-2  hover:border-emerald-400 first:mr-1 cursor-pointer ${selectedClass}`}
						>
							<div className="flex items-center">
								{name == "sETH-sUSD" && <ETHIcon className="h-8 w-8" />}
								{name == "ETH-USDC" && <ETHIcon className="h-8 w-8" />}

								{name == "sBTC-sUSD" && <BTCIcon className="h-8 w-8" />}
								{name == "WBTC-USDC" && <BTCIcon className="h-8 w-8" />}
								<div className="pl-1 pr-2">
									<strong className="text-md">{formatName(name)}</strong>
								</div>
							</div>
						</div>
					);
				})}
		</div>
	);
};
