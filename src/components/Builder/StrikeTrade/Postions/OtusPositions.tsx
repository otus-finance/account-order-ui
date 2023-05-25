import { Chain } from "wagmi";
import { Position, usePositions } from "../../../../queries/otus/positions";
import { Spinner } from "../../../UI/Components/Spinner";
import { useChainContext } from "../../../../context/ChainContext";
import { Dispatch, useState } from "react";
import Modal from "../../../UI/Modal";
import getExplorerUrl from "../../../../utils/chains/getExplorerUrl";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import Lyra, { Position as LyraPosition, PositionFilter } from "@lyrafinance/lyra-js";
import { ArrowTopRightOnSquareIcon, LinkIcon } from "@heroicons/react/20/solid";
import { OtusPositionSplit } from "./Actions/Split";
import { ZERO_BN } from "../../../../constants/bn";
import { OtusPositionClose } from "./Actions/Close";
import LogoIcon from "../../../UI/Icons/Logo/OTUS";
import { useTheme } from "next-themes";
import { LyraPositionRow } from "./LyraPositions";
import { OtusPositionSettle } from "./Actions/Settle";
import { motion } from "framer-motion";

export const OtusPositions = ({ lyra }: { lyra?: Lyra }) => {
	const { theme } = useTheme();

	const { selectedChain: chain } = useChainContext();
	const { isLoading, data } = usePositions(lyra);
	const [showLegPositionId, setShowLegPositionId] = useState(0);

	const [openClosePositionId, setOpenClosePositionId] = useState<Position>();
	const [open, setOpen] = useState(false);

	const [openSplitId, setOpenSplitId] = useState<Position>();
	const [openSplit, setOpenSplit] = useState(false);

	const [openSettlePositionId, setOpenSettlePositionId] = useState<Position>();
	const [openSettle, setOpenSettle] = useState(false);

	const handleSettleSpreadModal = (position: Position) => {
		setOpenSettle(true);
		setOpenSettlePositionId(position);
	};

	const handleCloseSpreadModal = (position: Position) => {
		setOpen(true);
		setOpenClosePositionId(position);
	};

	const handleSplitOtusPositionModal = (position: Position) => {
		setOpenSplit(true);
		setOpenSplitId(position);
	};

	return (
		<>
			<div className="flex rounded-full p-4 text-sm font-semibold dark:text-zinc-200 ">
				<LogoIcon className="h-4 w-4 mt-[1px] mr-2" /> Otus Positions
			</div>
			{isLoading ? (
				<div className="p-4">
					<Spinner />
				</div>
			) : (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="bg-zinc-100 dark:bg-zinc-800 overflow-x-scroll scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto p-4"
				>
					<table className="min-w-full table-fixed  rounded-sm">
						<thead className=""></thead>
						<th scope="col" className="py-3.5 text-left dark:text-zinc-400 font-light"></th>

						<th
							scope="col"
							className=" py-3.5 text-left pl-4 dark:text-zinc-400 text-xs font-light"
						>
							Open Date
						</th>

						<th
							scope="col"
							className=" py-3.5 text-left pl-4 dark:text-zinc-400 text-xs font-light"
						>
							Type
						</th>

						<th
							scope="col"
							className=" py-3.5 text-left pl-4 dark:text-zinc-400 text-xs font-light"
						>
							Size
						</th>

						<th
							scope="col"
							className=" py-3.5 text-left pl-4 dark:text-zinc-400  text-xs font-light"
						>
							Total Cost
						</th>

						<th
							scope="col"
							className=" py-3.5 text-left pl-4 dark:text-zinc-400 text-xs font-light"
						>
							Profit / Loss
						</th>

						<th
							scope="col"
							className=" py-3.5 text-left pl-4 dark:text-zinc-400 text-xs font-light"
						>
							Status
						</th>

						<th
							scope="col"
							className="py-3.5 text-left  pl-4 dark:text-zinc-400 text-xs font-light"
						>
							Transaction
						</th>

						<th
							scope="col"
							className="py-3.5 text-left  pl-4  dark:text-zinc-400 text-xs font-light"
						>
							Action
						</th>

						<tbody className="dark:bg-inherit">
							{data?.positions.map((position: Position, index: number) => {
								return (
									<PositionRow
										handleSettleSpreadModal={handleSettleSpreadModal}
										handleCloseSpreadModal={handleCloseSpreadModal}
										handleSplitOtusPositionModal={handleSplitOtusPositionModal}
										key={index}
										position={position}
										chain={chain}
										showLegPositionId={showLegPositionId}
										setShowLegPositionId={setShowLegPositionId}
									/>
								);
							})}
						</tbody>
					</table>
				</motion.div>
			)}

			<Modal
				setOpen={setOpen}
				open={open}
				title={
					<div className="px-4 pb-3 pt-5">
						<div className="flex">
							<div>
								<div className=" inline-block rounded-full dark:shadow-black shadow-zinc-200">
									<LogoIcon />
								</div>
							</div>

							<div className="ml-4">
								<h2 className="text-sm font-semibold">Close Spread Position</h2>
								<h3 className="text-xxs dark:text-zinc-200 pt-1">
									Close all your legs in a spread position.
								</h3>
							</div>
						</div>
					</div>
				}
			>
				{openClosePositionId && <OtusPositionClose position={openClosePositionId} />}
			</Modal>

			<Modal
				setOpen={setOpenSplit}
				open={openSplit}
				title={
					<div className="px-4 pb-3 pt-5">
						<div className="flex">
							<div>
								<div className=" inline-block rounded-full dark:shadow-black shadow-zinc-200">
									{theme == "dark" ? (
										<LogoIcon />
									) : (
										<img src="./OTUSICONLOGO.png" className="rounded-md h-8" />
									)}
								</div>
							</div>

							<div className="ml-4">
								<h2 className="text-sm font-semibold">Split Multi Leg Position</h2>
								<h3 className="text-xxs dark:text-zinc-200 pt-1">
									Your Otus position will be split into multiple legs.
								</h3>
							</div>
						</div>
					</div>
				}
			>
				{openSplitId && <OtusPositionSplit position={openSplitId} />}
			</Modal>

			<Modal
				setOpen={setOpenSettle}
				open={openSettle}
				title={
					<div className="px-4 pb-3 pt-5">
						<div className="flex">
							<div>
								<div className=" inline-block rounded-full dark:shadow-black shadow-zinc-200">
									{theme == "dark" ? (
										<LogoIcon />
									) : (
										<img src="./OTUSICONLOGO.png" className="rounded-md h-8" />
									)}
								</div>
							</div>

							<div className="ml-4">
								<h2 className="text-sm font-semibold">Settle Otus Spread Position</h2>
								<h3 className="text-xxs dark:text-zinc-200 pt-1">
									Your Otus position will be settled.
								</h3>
							</div>
						</div>
					</div>
				}
			>
				{openSettlePositionId && <OtusPositionSettle position={openSettlePositionId} />}
			</Modal>
		</>
	);
};

const PositionRow = ({
	handleSettleSpreadModal,
	handleCloseSpreadModal,
	handleSplitOtusPositionModal,
	position,
	chain,
	showLegPositionId,
	setShowLegPositionId,
}: {
	handleSettleSpreadModal: any;
	handleCloseSpreadModal: any;
	handleSplitOtusPositionModal: any;
	position: Position;
	chain?: Chain;
	showLegPositionId: number;
	setShowLegPositionId: Dispatch<number>;
}) => {
	const { id, state, tradeType, openTimestamp, txHash, unrealizedPnl, trade, totalCost, expiry } =
		position;
	const txHref = chain && txHash && getExplorerUrl(chain, txHash);

	// const cost = trade?.cost || ZERO_BN;
	const fee = trade?.fee || ZERO_BN;

	const currentTimeStamp = Math.floor(Date.now() / 1000);

	return (
		<>
			<tr className="">
				<td className="whitespace-nowrap py-4 text-left  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{txHref && (
						<div
							className="p-1 dark:bg-zinc-900 dark:text-zinc-300 text-zinc-700  bg-zinc-200  rounded-lg inline cursor-pointer"
							onClick={() => {
								if (showLegPositionId == fromBigNumber(id, 0)) {
									setShowLegPositionId(0);
								} else {
									setShowLegPositionId(fromBigNumber(id, 0));
								}
							}}
						>
							{showLegPositionId != fromBigNumber(id, 0) ? "View Legs" : "Hide"}
						</div>
					)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{new Date(openTimestamp * 1000).toDateString()}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{tradeType === 0 ? (
						<span className="bg-zinc-700 text-zinc-200 font-normal p-1 rounded-lg">Multi Leg</span>
					) : (
						<span className="bg-blue-500 text-zinc-100 font-normal p-1 rounded-lg">Spread</span>
					)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{fromBigNumber(id, 0)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{formatUSD(totalCost, { dps: 2 })}
				</td>
				{/* 
				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{formatUSD(fromBigNumber(fee), { dps: 2 })}
				</td> */}

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{unrealizedPnl < 0 ? (
						<span className="text-rose-500 font-bold">{formatUSD(unrealizedPnl)}</span>
					) : (
						<span className="text-emerald-500 font-bold">{formatUSD(unrealizedPnl)}</span>
					)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{state === 0 ? "Open" : "Closed"}
				</td>

				<td className="whitespace-nowrap py-4 pl-4 text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{txHref && (
						<a className="p-1 block" target="_blank" rel="noreferrer" href={txHref}>
							<ArrowTopRightOnSquareIcon className=" dark:text-zinc-300 text-zinc-700 h-4 w-4 ml-1" />
						</a>
					)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-normal dark:text-zinc-300 text-zinc-700">
					{tradeType === 0 ? (
						expiry < currentTimeStamp ? (
							<div
								onClick={() => handleSplitOtusPositionModal(position)}
								className="cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400 inline text-white p-1 rounded-lg"
							>
								Settle
							</div>
						) : (
							<div
								onClick={() => handleSplitOtusPositionModal(position)}
								className="cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400 inline text-white p-1 rounded-lg"
							>
								Split
							</div>
						)
					) : expiry < currentTimeStamp ? (
						<div
							onClick={() => handleSettleSpreadModal(position)}
							className="cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400 inline text-white p-1 rounded-lg"
						>
							Settle2
						</div>
					) : (
						<div
							onClick={() => handleCloseSpreadModal(position)}
							className="cursor-pointer bg-gradient-to-t dark:from-rose-700 dark:to-rose-500 from-rose-500 to-rose-400 inline text-white p-1 rounded-lg"
						>
							Close
						</div>
					)}
				</td>
			</tr>
			{showLegPositionId == fromBigNumber(id, 0) && (
				<td colSpan={10}>
					<OtusLegPositions lyraPositions={position.lyraPositions} />
				</td>
			)}
		</>
	);
};

const OtusLegPositions = ({ lyraPositions }: { lyraPositions: LyraPosition[] }) => {
	return (
		<table className="border-y dark:border-zinc-900 border-zinc-300 min-w-full   px-2">
			<thead className="divide-b dark:divide-zinc-900 divide-zinc-300 dark:bg-zinc-800"></thead>
			<th scope="col" className="sr-only">
				Market
			</th>

			<th scope="col" className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light">
				Strike Price
			</th>
			<th scope="col" className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light">
				Size
			</th>
			<th scope="col" className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light">
				Average Cost
			</th>
			<th scope="col" className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light">
				Profit / Loss
			</th>

			<th scope="col" className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light">
				Status
			</th>

			{/* <th scope="col" className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light">
				Expiry
			</th> */}
			<th scope="col" className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light">
				Delta
			</th>
			<th scope="col" className="sr-only">
				Action
			</th>
			<tbody className="divide-y dark:divide-zinc-800 divide-zinc-100 dark:bg-inherit">
				{lyraPositions?.map((position: LyraPosition, index: number) => {
					return <LyraPositionRow key={index} position={position} />;
				})}
			</tbody>
		</table>
	);
};
