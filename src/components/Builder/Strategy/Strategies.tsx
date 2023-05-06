import { useEffect, useState } from "react";
import ETHIcon from "../../UI/Icons/Color/ETH";
import { Strategy, StrategyTag } from "../../../utils/types";
import { motion } from "framer-motion";
import { useBuilderContext } from "../../../context/BuilderContext";
import BTCIcon from "../../UI/Icons/Color/BTC";
import { strategies } from "../../../strategies";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

export const Strategies = () => {
	const {
		selectedMarket,
		selectedDirectionTypes,
		selectedExpirationDate,
		selectedStrategy,
		handleSelectedStrategy,
	} = useBuilderContext();

	const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);

	useEffect(() => {
		if (selectedDirectionTypes.length > 0) {
			const _selectedDirectionTypesIds = selectedDirectionTypes.map(({ id }: { id: number }) => id);
			const _filteredStrategies = strategies.filter((strategy) => {
				return strategy.type.some((r) => _selectedDirectionTypesIds.includes(r));
			});
			setFilteredStrategies(_filteredStrategies);
		} else {
			setFilteredStrategies([]);
		}
	}, [selectedDirectionTypes]);

	const isSelected = (_strategy: Strategy) => selectedStrategy?.id == _strategy.id;

	return (
		<>
			{filteredStrategies.map((strategy: Strategy, index: number) => {
				const { name, description, type, tags } = strategy;

				const isSelectedStyle = isSelected(strategy)
					? "border-emerald-400"
					: "dark:border-zinc-900";

				return (
					<motion.div
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.99 }}
						onClick={() => handleSelectedStrategy(strategy)}
						key={index}
						className={`mb-8 sm:mb-0   sm:col-span-1 cursor-pointer border-4 hover:border-emerald-400 mt-2 rounded-lg ${isSelectedStyle}`}
					>
						<div className="p-2">
							<div className="flex place-content-between">
								<div className="py-1 text-lg font-semibold">{name}</div>
								<div className="">
									<div className="float-right">
										{selectedMarket?.name == "sETH-sUSD" || selectedMarket?.name == "ETH-USDC" ? (
											<ETHIcon className="w-8 h-8" />
										) : (
											<BTCIcon className="w-8 h-8" />
										)}
									</div>
								</div>
							</div>

							<div className="flex flex-wrap">
								{tags.map((tag: StrategyTag, index: number) => {
									if (StrategyTag.PostMaxLossOnly === tag) {
										return (
											<span
												key={index}
												className="text-xs font-normal rounded-sm dark:bg-emerald-600 dark:text-zinc-200 bg-emerald-400 text-white p-1 mr-1"
											>
												{tag}
											</span>
										);
									}
									return (
										<span
											key={index}
											className="text-xs font-light rounded-sm dark:bg-zinc-800 dark:text-zinc-100 p-1 mr-1"
										>
											{tag}
										</span>
									);
								})}
							</div>

							<div className="has-tooltip mt-2 inline-block ">
								<InformationCircleIcon className="dark:text-zinc-200 h-4 w-4" />

								<motion.div className="dark:bg-zinc-900 p-4 tooltip bg-zinc-100 -mt-16">
									<p className="text-xs leading-5 font-light dark:text-zinc-200">{description}</p>
								</motion.div>
							</div>
						</div>
					</motion.div>
				);
			})}
		</>
	);
};
