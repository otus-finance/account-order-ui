import React from "react";

import { Spinner } from "../../../UI/Components/Spinner";
import { useMarketOrderContext } from "../../../../context/MarketOrderContext";
import { useAccount, useNetwork } from "wagmi";
import { WalletConnect } from "../../../Builder/StrikeTrade/Common/WalletConnect";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { ArrowLeftCircleIcon } from "@heroicons/react/20/solid";

export const MarketOrderActions = () => {
	const { isValid } = useBuilderContext();

	const { trades, validMaxPNL } = useMarketOrderContext();
	const { maxLossPost, fee, maxCost, maxPremium, maxLoss, validMaxLoss } = validMaxPNL;

	return trades.length > 0 ? (
		<div className="border-t border-zinc-800 p-4 py-2 pt-6">
			<div className="flex items-center justify-between pb-2">
				<p className="truncate font-sans text-sm font-normal text-zinc-300">Max Loss</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex text-rose-400 font-sans text-sm font-semibold leading-5">
						{formatUSD(fromBigNumber(maxLoss), { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between py-2">
				<p className="truncate font-sans text-sm font-normal text-zinc-300">Max Cost</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-rose-400">
						{formatUSD(fromBigNumber(maxCost), { dps: 2 })}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between py-2">
				<p className="truncate font-sans text-sm font-normal text-zinc-300">Premium</p>
				<div className="ml-2 flex flex-shrink-0">
					<span className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
						{formatUSD(fromBigNumber(maxPremium), { dps: 2 })}
					</span>
				</div>
			</div>

			{validMaxLoss ? (
				<>
					<div className="flex items-center justify-between py-2 pb-4">
						<p className="truncate font-sans text-sm font-normal text-zinc-300">Collateral Fee</p>
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
				<>
					<div className="flex items-center justify-between pt-2">
						<p className="truncate font-sans text-sm font-normal text-zinc-300">Collateral</p>
						<div className="ml-2 flex flex-shrink-0">
							<span className="inline-flex font-sans text-sm font-semibold leading-5 text-white">
								{formatUSD(fromBigNumber(maxLoss), { dps: 2 })}
							</span>
						</div>
					</div>
					<div className="pt-2">
						<input
							id="collateral-range"
							type="range"
							value="50"
							className="ring-rose-500 w-full h-[2px] bg-zinc-700 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
						/>
						<div className="flex justify-between">
							<label
								htmlFor="collateral-range"
								className="block mb-2 text-xs font-normal text-zinc-400 "
							>
								$1200
							</label>
							<label
								htmlFor="collateral-range"
								className="block mb-2 text-xs font-normal text-zinc-400 "
							>
								$2000
							</label>
						</div>
					</div>
				</>
			)}

			<MarketOrderInfo />
		</div>
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

			{/* {isConnected && <MarketTransaction />} */}

			{!isConnected && openConnectModal && <WalletConnect />}
		</div>
	);
};

export const MarketTransaction = () => {
	const {
		isApproveQuoteLoading,
		spreadMarketAllowance, // currently allowed
		approveQuote,
		networkNotSupported,
	} = useMarketOrderContext();

	return networkNotSupported ? (
		<div className="cursor-pointer bg-gradient-to-t from-black to-zinc-900 rounded-full p-4 w-full font-semibold hover:text-zinc-200 py-3 text-center text-white">
			Network not supported
		</div>
	) : (
		<>
			{spreadMarketAllowance.isZero() ? (
				<div
					onClick={() => approveQuote?.()}
					className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
				>
					{isApproveQuoteLoading ? (
						<Spinner size={"medium"} color={"secondary"} />
					) : (
						"Approve Quote"
					)}
				</div>
			) : (
				<OpenPosition />
			)}
		</>
	);
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

// onClick={() => openPosition?.({
// 	recklesslySetUnpreparedOverrides: {
// 		gasLimit: 4800000
// 	},
// })}
