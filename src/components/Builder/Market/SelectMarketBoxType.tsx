import React from "react";
import BTCIcon from "../../UI/Icons/Color/BTC";
import ETHIcon from "../../UI/Icons/Color/ETH";
import { LyraBoard, LyraMarket } from "../../../queries/lyra/useLyra";
import { ONEImage, OPImage } from "../../UI/Icons/Color/DataImage";
import { formatName } from "../../../utils/formatters/message";

export const SelectMarketBoxType = ({
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
						? "bg-zinc-100 dark:bg-zinc-800"
						: "bg-inherit dark:bg-inherit hover:bg-zinc-100 dark:hover:bg-zinc-800";
					return (
						<div
							key={index}
							onClick={() => {
								handleSelectedMarket && handleSelectedMarket(market);
							}}
							className={`rounded-full p-2 px-4  mr-1 last:mr-0 cursor-pointer ${selectedClass}`}
						>
							<div className="flex items-center">
								{name == "ETH-USDC" && <ETHIcon className="h-8 w-8" />}

								{name == "WBTC-USDC" && <BTCIcon className="h-8 w-8" />}

								{name == "OP-USDC" && (
									<div className="h-8 w-8 block">
										<img className="mt-[3px]" height={26} width={26} src={OPImage} />
									</div>
								)}

								{name == "ARB-USDC" && (
									<div className="h-8 w-8 block">
										<img className="mt-[3px]" height={26} width={26} src={ONEImage} />
									</div>
								)}

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
