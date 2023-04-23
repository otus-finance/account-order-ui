import React, { useState } from "react";

import { Spinner } from "../../../UI/Components/Spinner";
import { useMarketOrderContext } from "../../../../context/MarketOrderContext";
import { useAccount, useNetwork } from "wagmi";
import { WalletConnect } from "../../../Builder/StrikeTrade/Common/WalletConnect";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";
import { Switch } from "@headlessui/react";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export const MarketOrderActions = () => {
	const { isValid } = useBuilderContext();

	const { trades, validMaxPNL, spreadSelected, setSpreadSelected } = useMarketOrderContext();
	const { maxLossPost, fee, maxCost, maxPremium, maxLoss, validMaxLoss } = validMaxPNL;

	return trades.length > 0 ? (
		<>
			{validMaxLoss && (
				<div className="border-t border-zinc-800 py-4 p-4">
					<Switch.Group as="div" className="flex items-center justify-between">
						<span className="flex flex-grow flex-col">
							<Switch.Label
								as="span"
								className="text-xs font-medium leading-6 text-zinc-200"
								passive
							>
								Post Max Loss Only
							</Switch.Label>
							<Switch.Description as="span" className="text-xs text-zinc-400">
								|Trade valid spreads through Otus to post max loss only, small collateral fee
								applies.
							</Switch.Description>
						</span>
						<Switch
							disabled={!validMaxLoss}
							checked={spreadSelected}
							onChange={setSpreadSelected}
							className={classNames(
								spreadSelected ? "bg-emerald-500" : "bg-zinc-800",
								`${
									validMaxLoss ? "cursor-pointer" : "cursor-not-allowed"
								} relative inline-flex h-6 w-11 flex-shrink-0  rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2`
							)}
						>
							<span
								aria-hidden="true"
								className={classNames(
									spreadSelected ? "translate-x-5" : "translate-x-0",
									"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-200 shadow ring-0 transition duration-200 ease-in-out"
								)}
							/>
						</Switch>
					</Switch.Group>
				</div>
			)}
			<div className="border-t border-zinc-800 p-4">
				{validMaxLoss && (
					<div className="flex items-center justify-between pb-2">
						<p className="truncate font-mono text-sm font-normal text-zinc-200">Max Loss</p>
						<div className="ml-2 flex flex-shrink-0">
							<span className="inline-flex text-rose-400 font-sans text-sm font-semibold leading-5">
								{formatUSD(fromBigNumber(maxLoss), { dps: 2 })}
							</span>
						</div>
					</div>
				)}

				<div className="flex items-center justify-between py-2">
					<p className="truncate font-mono text-sm font-normal text-zinc-200">Max Cost</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
							{formatUSD(fromBigNumber(maxCost), { dps: 2 })}
						</span>
					</div>
				</div>

				<div className="flex items-center justify-between py-2">
					<p className="truncate font-mono text-sm font-normal text-zinc-200">Premium</p>
					<div className="ml-2 flex flex-shrink-0">
						<span className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
							{formatUSD(fromBigNumber(maxPremium), { dps: 2 })}
						</span>
					</div>
				</div>

				{validMaxLoss && spreadSelected ? (
					<>
						<div className="flex items-center justify-between py-2 pb-4">
							<p className="truncate font-mono text-sm font-normal text-zinc-300">Collateral Fee</p>
							<div className="ml-2 flex flex-shrink-0">
								<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
									{formatUSD(fromBigNumber(fee), { dps: 2 })}
								</span>
							</div>
						</div>
						<div className="border-t border-zinc-800 flex items-center justify-between py-4 ">
							<p className="truncate font-sans font-semibold text-zinc-100 text-sm bg-gradient-to-t from-emerald-700 to-emerald-500 p-1 px-2 rounded-full">
								Post Max Loss
							</p>
							<div className="ml-2 flex flex-shrink-0">
								<span className="inline-flex font-sans text-sm font-semibold leading-5 rounded-md  text-white">
									{formatUSD(fromBigNumber(maxLossPost), { dps: 2 })}
								</span>
							</div>
						</div>
					</>
				) : (
					<div className="flex items-center justify-between py-2">
						<p className="truncate font-mono text-sm font-normal text-zinc-200">
							Total Colalteral Required
						</p>
						<div className="ml-2 flex flex-shrink-0">
							<span className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
								{formatUSD(fromBigNumber(maxPremium), { dps: 2 })}
							</span>
						</div>
					</div>
				)}

				<MarketOrderInfo />
			</div>
		</>
	) : (
		<div className="border-t border-zinc-800 p-4">
			<div className="flex items-center p-2">
				<p className="truncate font-sans text-xs font-normal text-white">
					<ArrowLeftCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
				</p>
				<div className="ml-2 flex flex-shrink-0">
					<p className="inline-flex font-mono text-sm font-normal leading-5 text-white">
						Select Strikes
					</p>
				</div>
			</div>
			<div className="flex items-center p-2">
				{!isValid && (
					<p className="font-mono text-sm font-normal leading-5 text-white">
						Strikes for strategy not available for selected assets or expiry.
					</p>
				)}
			</div>
		</div>
	);
};

export const MarketOrderInfo = () => {
	const { selectedChain } = useBuilderContext();

	const { isConnected } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { openChainModal } = useChainModal();
	const { chain } = useNetwork();

	return (
		<div className="py-4 cursor-pointer">
			{isConnected && chain?.id != selectedChain?.id ? (
				<div
					onClick={openChainModal}
					className="cursor-pointer  hover:border-emerald-600 p-2 py-3 col-span-3 font-semibold text-sm text-white text-center rounded-full bg-black hover:bg-zinc-800 mb-2"
				>
					Wrong network
				</div>
			) : (
				isConnected && <MarketTransaction />
			)}

			{!isConnected && openConnectModal && <WalletConnect />}
		</div>
	);
};

export const MarketTransaction = () => {
	const {
		isApproveQuoteLoading,
		otusOptionMarketAllowance, // currently allowed for otus option market
		spreadMarketAllowance, // currently allowed for otus spread market
		approveQuote,
		approveOtusQuote,
		networkNotSupported,
		validMaxPNL,
		spreadSelected,
	} = useMarketOrderContext();

	const { validMaxLoss } = validMaxPNL;

	return networkNotSupported ? (
		<div className="cursor-pointer bg-gradient-to-t from-black to-zinc-900 rounded-full p-4 w-full font-semibold hover:text-zinc-200 py-3 text-center text-white">
			Network not supported
		</div>
	) : validMaxLoss && spreadSelected ? (
		spreadMarketAllowance.isZero() ? (
			<div
				onClick={() => approveQuote?.()}
				className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
			>
				{isApproveQuoteLoading ? (
					<Spinner size={"medium"} color={"secondary"} />
				) : (
					"Approve Quote Spread"
				)}
			</div>
		) : (
			<OpenPosition />
		)
	) : otusOptionMarketAllowance.isZero() ? (
		<div
			onClick={() => approveOtusQuote?.()}
			className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
		>
			{isApproveQuoteLoading ? (
				<Spinner size={"medium"} color={"secondary"} />
			) : (
				"Approve Quote Otus"
			)}
		</div>
	) : (
		<OpenLyraPosition />
	);

	// <>
	// 	{/* {
	// 		validMaxLoss && spreadSelected &&
	// 			spreadMarketAllowance.isZero() ? (
	// 			<div
	// 				onClick={() => approveQuote?.()}
	// 				className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
	// 			>
	// 				{isApproveQuoteLoading ? (
	// 					<Spinner size={"medium"} color={"secondary"} />
	// 				) : (
	// 					"Approve Quote"
	// 				)}
	// 			</div>
	// 		) : (
	// 			<OpenPosition />
	// 		)
	// 	} */}

	// 	<>
	// 		{
	// 			(!validMaxLoss || !spreadSelected) &&
	// 				otusOptionMarketAllowance.isZero() ? (
	// 				<div
	// 					onClick={() => approveQuote?.()}
	// 					className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
	// 				>
	// 					{isApproveQuoteLoading ? (
	// 						<Spinner size={"medium"} color={"secondary"} />
	// 					) : (
	// 						"Approve Quote2"
	// 					)}
	// 				</div>
	// 			) : (
	// 				<OpenLyraPosition />
	// 			)
	// 		}
	// 	</>

	// </>
};

export const OpenPosition = () => {
	const { userBalance, isOpenPositionLoading, openPosition, isTxLoading } = useMarketOrderContext();

	return (
		<>
			{userBalance && userBalance.isZero() && (
				<div
					onClick={() => console.warn("Add funds")}
					className="mb-4 cursor-disabled border-2 border-zinc-800 bg-zinc-800 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
				>
					Insufficient Balance
				</div>
			)}

			<div
				onClick={() => openPosition?.()}
				className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
			>
				{isOpenPositionLoading && isTxLoading ? <Spinner /> : "Open Position"}
			</div>
		</>
	);
};

export const OpenLyraPosition = () => {
	const { userBalance, isOpenPositionLoading, openLyraPosition, isTxLoading } =
		useMarketOrderContext();

	return (
		<>
			{userBalance && userBalance.isZero() && (
				<div
					onClick={() => console.warn("Add funds")}
					className="mb-4 cursor-disabled border-2 border-zinc-800 bg-zinc-800 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
				>
					Insufficient Balance
				</div>
			)}

			<div
				onClick={() => openLyraPosition?.()}
				className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
			>
				{isOpenPositionLoading && isTxLoading ? <Spinner /> : "Open Position"}
			</div>
		</>
	);
};

// onClick={() => openPosition?.({
// 	recklesslySetUnpreparedOverrides: {
// 		gasLimit: 4800000
// 	},
// })}
