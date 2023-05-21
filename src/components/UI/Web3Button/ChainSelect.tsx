import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import { optimism, arbitrum, hardhat, Chain, optimismGoerli, arbitrumGoerli } from "wagmi/chains";
import { ONEImage, OPImage } from "../Icons/Color/DataImage";
import { useNetwork } from "wagmi";
import { useChainContext } from "../../../context/ChainContext";

const chains = [optimism, arbitrum, arbitrumGoerli];

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export const OfflineChainSelect = () => {
	const { selectedChain, handleSelectedChain } = useChainContext();

	return (
		<Listbox value={selectedChain} onChange={handleSelectedChain}>
			{({ open }) => (
				<div className="relative">
					<Listbox.Button className="flex items-center dark:bg-zinc-900 bg-zinc-300 p-3 rounded-full dark:text-white text-sm font-semibold">
						<div className={`mr-2`}>
							{selectedChain.id == optimism.id || selectedChain.id == optimismGoerli.id ? (
								<img height={20} width={20} src={OPImage} />
							) : (
								<img height={20} width={20} src={ONEImage} />
							)}
						</div>
						{selectedChain.name}
						<div className="ml-2">
							<ChevronDownIcon className="h-4 w-4 dark:text-white font-bold" />
						</div>
					</Listbox.Button>

					<Transition
						show={open}
						as={Fragment}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Listbox.Options className="rounded-xl absolute z-10 bg-zinc-200 mt-1 max-h-60 w-48  overflow-auto dark:bg-zinc-900 py-1 dark:text-base shadow-md dark:shadow-black shadow-zinc-200">
							{chains?.map((chain: Chain) => (
								<Listbox.Option
									key={chain.id}
									className="dark:text-white relative cursor-default select-none py-2 pl-3 pr-2 w-full text-sm"
									value={chain}
								>
									{({ selected, active }) => (
										<>
											<div className="flex items-center cursor-pointer">
												<div className={`mr-2`}>
													{chain.id == optimism.id || chain.id == optimismGoerli.id ? (
														<img height={20} width={20} src={OPImage} />
													) : (
														<img height={20} width={20} src={ONEImage} />
													)}
												</div>

												<span
													className={classNames(
														selected ? "font-semibold" : "font-normal",
														"block truncate"
													)}
												>
													{chain.name}
												</span>
											</div>

											{selected ? (
												<span
													className={classNames(
														active ? "dark:text-white" : "dark:text-emerald-600",
														"absolute inset-y-0 right-0 flex items-center pr-2"
													)}
												>
													<CheckIcon className="h-4 w-4" aria-hidden="true" />
												</span>
											) : null}
										</>
									)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</Transition>
				</div>
			)}
		</Listbox>
	);
};
