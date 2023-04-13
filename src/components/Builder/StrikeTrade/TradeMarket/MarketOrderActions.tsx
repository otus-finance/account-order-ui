import React, { useCallback, useEffect, useState } from "react";

import { Spinner } from "../../../UI/Components/Spinner";
import {
	MarketOrderContextProvider,
	useMarketOrderContext,
} from "../../../../context/MarketOrderContext";
import { useAccount, useNetwork } from "wagmi";
import { WalletConnect } from "../../../Builder/StrikeTrade/Common/WalletConnect";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { LyraStrike } from "../../../../queries/lyra/useLyra";
import { calculateOptionType } from "../../../../utils/formatters/optiontypes";
import { string } from "zod";
import { fromBigNumber } from "../../../../utils/formatters/numbers";
import { BigNumber } from "ethers";

export const MarketOrderActions = () => {
	return (
		<MarketOrderContextProvider>
			<MarketOrderInfo />
		</MarketOrderContextProvider>
	);
};

const MarketOrderInfo = () => {
	const { isConnected } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { openChainModal } = useChainModal();
	const { chain } = useNetwork();
	return (
		<div className="py-4">
			{/* {
				chain?.id != selectedChain?.id ?
					<div
						onClick={openChainModal}
						className="cursor-pointer border-2 border-zinc-700 hover:border-emerald-600 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
					>
						Wrong network
					</div> :
					isConnected &&
					<MarketTransaction />
			} */}

			{isConnected && <MarketTransaction />}

			{!isConnected && openConnectModal && <WalletConnect />}
		</div>
	);
};

export const MarketTransaction = () => {
	const {
		isApproveQuoteLoading,
		spreadMarketAllowance, // currently allowed
		approveQuote,
	} = useMarketOrderContext();

	return (
		<>
			{spreadMarketAllowance === 0 ? (
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
	const { userBalance, isOpenPositionLoading, openPosition } = useMarketOrderContext();

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
				{isOpenPositionLoading ? <Spinner /> : "Open Position"}
			</div>
		</>
	);
};
