import React, { Fragment } from "react";
import BTCIcon from "../../UI/Icons/Color/BTC";
import ETHIcon from "../../UI/Icons/Color/ETH";
import { LyraBoard, LyraMarket } from "../../../queries/lyra/useLyra";
import { ONEImage, OPImage } from "../../UI/Icons/Color/DataImage";
import { formatName } from "../../../utils/formatters/message";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export const SelectMarket = ({
	markets,
	selectedMarket,
	handleSelectedMarket,
}: {
	markets: LyraMarket[] | null;
	selectedMarket: LyraMarket | null;
	handleSelectedMarket?: any;
}) => {
	const isSelected = (data: any) => {
		return selectedMarket?.address == data.address;
	};

	return (
		<Listbox value={selectedMarket} onChange={handleSelectedMarket}>
			{({ open }) => (
				<div className="relative">
					<Listbox.Button className="relative w-full rounded-full cursor-pointer bg-zinc-100 dark:bg-zinc-800 pl-4 pr-20 text-left dark:text-white text-sm py-2 h-12">
						{selectedMarket?.name ? (
							<div className="flex justify-between">
								<div className="items-center  align-middle">
									{selectedMarket?.name == "ETH-USDC" && (
										<ETHIcon className="bg-emerald-400 rounded-full w-8 h-8" />
									)}
									{selectedMarket?.name == "WBTC-USDC" && (
										<BTCIcon className="bg-emerald-400 rounded-full w-8 h-8" />
									)}
									{selectedMarket.name == "OP-USDC" && (
										<div className="bg-emerald-400 rounded-full w-6 h-6">
											<img className="mt-[4px]" height={26} width={26} src={OPImage} />
										</div>
									)}

									{selectedMarket.name == "ARB-USDC" && (
										<div className="bg-emerald-400 rounded-full w-6 h-6">
											<img className="mt-[4px]" height={26} width={26} src={ONEImage} />
										</div>
									)}
								</div>
								<div className="px-2 mt-[2px] text-lg items-center align-middle font-semibold">
									{formatName(selectedMarket.name)}
								</div>
							</div>
						) : (
							"Select Market"
						)}
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronDownIcon className="h-5 w-5 dark:text-gray-400" aria-hidden="true" />
						</span>
					</Listbox.Button>

					<Transition
						show={open}
						as={Fragment}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Listbox.Options className="rounded-xl absolute z-10 mt-1 max-h-60 w-full bg-white overflow-auto dark:bg-zinc-900 py-1 dark:text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-md">
							{markets
								?.filter(({ liveBoards }: { liveBoards: LyraBoard[] }) => liveBoards.length > 0)
								.map((market: LyraMarket, index: number) => (
									<Listbox.Option
										key={index}
										className={({ active }) =>
											classNames(
												active ? "bg-zinc-100 dark:bg-zinc-700" : "dark:text-white",
												"relative cursor-default select-none py-2 pl-3 pr-9"
											)
										}
										value={market}
									>
										{({ active }) => {
											const selected = isSelected(market);
											return (
												<>
													<div className="flex items-center">
														{/* <span
															className={classNames(
																selected ? "font-semibold" : "font-normal",
																"block truncate"
															)}
														>
															{market.name}
														</span> */}

														{market.name == "ETH-USDC" && <ETHIcon className="h-8 w-8" />}

														{market.name == "WBTC-USDC" && <BTCIcon className="h-8 w-8" />}

														{market.name == "OP-USDC" && (
															<div className="h-8 w-8 block">
																<img className="mt-[3px]" height={26} width={26} src={OPImage} />
															</div>
														)}

														{market.name == "ARB-USDC" && (
															<div className="h-8 w-8 block">
																<img className="mt-[3px]" height={26} width={26} src={ONEImage} />
															</div>
														)}

														<div className="pl-1 pr-2">
															<strong className="text-md">{formatName(market.name)}</strong>
														</div>
													</div>

													{selected ? (
														<span
															className={classNames(
																active ? "dark:text-white" : "dark:text-emerald-400",
																"absolute inset-y-0 right-0 flex items-center pr-4"
															)}
														>
															<CheckIcon className="h-5 w-5" aria-hidden="true" />
														</span>
													) : null}
												</>
											);
										}}
									</Listbox.Option>
								))}
						</Listbox.Options>
					</Transition>
				</div>
			)}
		</Listbox>
	);
};
