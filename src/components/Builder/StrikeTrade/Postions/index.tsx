import { Chain, useAccount, useNetwork } from "wagmi";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { Position, usePositions } from "../../../../queries/otus/positions";
import { useLyraPositionIds, useLyraPositions } from "../../../../queries/lyra/useLyra";
import getExplorerUrl from "../../../../utils/chains/getExplorerUrl";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { Position as LyraPosition, PositionFilter } from "@lyrafinance/lyra-js";
import { formatExpirationDate } from "../../../../utils/formatters/expiry";
import { Spinner } from "../../../UI/Components/Spinner";
import { useChainContext } from "../../../../context/ChainContext";
import { ArrowTopRightOnSquareIcon, LinkIcon } from "@heroicons/react/20/solid";
import { Dispatch, useState } from "react";
import LyraIcon from "../../../UI/Icons/Color/LYRA";
import getLyraPositionUrl from "../../../../utils/chains/getLyraPositionUrl";
import { ZERO_BN } from "../../../../constants/bn";
import Modal from "../../../UI/Modal";
import { WalletBalance } from "../TradeSelect";

export const Positions = () => {
	return (
		<>
			<OtusPositions />
			<LyraPositions />
		</>
	);
};

export const OtusPositions = () => {
	const { lyra } = useBuilderContext();

	const { selectedChain: chain } = useChainContext();
	const { isLoading, data } = usePositions(lyra);
	const [showLegPositionId, setShowLegPositionId] = useState(0);
	const [openId, setOpenId] = useState(0);
	const [open, setOpen] = useState(false);

	const [openSplitId, setOpenSplitId] = useState<Position | null>(null);
	const [openSplit, setOpenSplit] = useState(false);

	const handleCloseSpreadModal = (positionId: number) => {
		setOpen(true);
		setOpenId(positionId);
	};

	const handleSplitOtusPositionModal = (position: Position) => {
		setOpenSplit(true);
		setOpenSplitId(position);
	};

	return (
		<>
			<div className="border-b font-mono dark:border-zinc-900 p-4 text-sm font-normal dark:text-zinc-200">
				Otus Positions
			</div>
			{isLoading ? (
				<div className="p-4">
					<Spinner />
				</div>
			) : (
				<div className="overflow-x-scroll pb-3 sm:pb-0 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto">
					<table className="min-w-full table-fixed  rounded-sm">
						<thead className="divide-b dark:divide-zinc-900 divide-zinc-300 dark:bg-zinc-800"></thead>
						<th scope="col" className="py-3.5 text-left pl-4  text-xs font-light"></th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Open Date
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Type
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Size
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Total Cost
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Otus Fee
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Profit / Loss
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Status
						</th>

						<th scope="col" className="py-3.5 text-left  pl-4  text-xs font-light">
							Transaction
						</th>

						<th scope="col" className="py-3.5 text-left  pl-4  text-xs font-light">
							Action
						</th>

						<tbody className="divide-y dark:divide-zinc-900 divide-zinc-200 dark:bg-inherit">
							{data?.positions.map((position: Position, index: number) => {
								return (
									<PositionRow
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
				</div>
			)}

			<Modal
				setOpen={setOpen}
				open={open}
				title={<div className="font-semibold text-md">Close Otus Position</div>}
			>
				<div className="">{openId}</div>
			</Modal>

			<Modal
				setOpen={setOpenSplit}
				open={openSplit}
				title={<div className="font-semibold text-md">Split Otus Position</div>}
			>
				<OtusPositionSplit position={openSplitId} />
			</Modal>
		</>
	);
};

const OtusPositionSplit = ({ position }: { position: Position | null }) => {
	if (!position) {
		return <div>Error</div>;
	}

	const { lyraPositions } = position;

	return <div>Otus Position Token Burned</div>;
};

const PositionRow = ({
	handleCloseSpreadModal,
	handleSplitOtusPositionModal,
	position,
	chain,
	showLegPositionId,
	setShowLegPositionId,
}: {
	handleCloseSpreadModal: any;
	handleSplitOtusPositionModal: any;
	position: Position;
	chain: Chain | null;
	showLegPositionId: number;
	setShowLegPositionId: Dispatch<number>;
}) => {
	const { id, state, tradeType, openTimestamp, txHash, unrealizedPnl, trade } = position;
	const txHref = chain && txHash && getExplorerUrl(chain, txHash);

	const cost = trade?.cost || ZERO_BN;
	const fee = trade?.fee || ZERO_BN;

	return (
		<>
			<tr className="hover:bg-zinc-100 hover:dark:bg-zinc-900">
				<td className="whitespace-nowrap py-4 text-left pl-4 text-xs font-medium dark:text-zinc-200">
					{txHref && (
						<div
							className="p-1 dark:bg-zinc-900 dark:text-zinc-200 hover:dark:bg-zinc-800 bg-zinc-200 text-zinc-900 rounded-lg hover:bg-zinc-300 inline cursor-pointer"
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

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{new Date(openTimestamp * 1000).toDateString()}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{tradeType === 0 ? (
						<span className="bg-zinc-700 text-zinc-200 font-normal p-1 rounded-lg">Multi Leg</span>
					) : (
						<span className="bg-blue-500 text-zinc-100 font-normal p-1 rounded-lg">Spread</span>
					)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{fromBigNumber(id, 0)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{formatUSD(fromBigNumber(cost), { dps: 2 })}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{formatUSD(fromBigNumber(fee), { dps: 2 })}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{unrealizedPnl < 0 ? (
						<span className="text-rose-500 font-bold">{formatUSD(unrealizedPnl)}</span>
					) : (
						<span className="text-emerald-500 font-bold">{formatUSD(unrealizedPnl)}</span>
					)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{state === 0 ? "Open" : "Closed"}
				</td>

				<td className="whitespace-nowrap py-4 pl-4 text-xs font-medium dark:text-zinc-200">
					{txHref && (
						<a className="p-1 block" target="_blank" rel="noreferrer" href={txHref}>
							<ArrowTopRightOnSquareIcon className="text-zinc-900 dark:text-zinc-200 h-4 w-4 ml-1" />
						</a>
					)}
				</td>

				<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
					{tradeType === 0 ? (
						<div
							onClick={() => handleSplitOtusPositionModal(position)}
							className="cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400 inline text-white p-1 rounded-lg"
						>
							Split
						</div>
					) : (
						<div
							onClick={() => handleCloseSpreadModal(id)}
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
		<table className="bg-zinc-100 dark:bg-black min-w-full">
			<thead className="divide-b dark:divide-zinc-900 divide-zinc-300 dark:bg-zinc-800"></thead>
			<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
				Market
			</th>
			<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
				Type
			</th>

			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Strike Price
			</th>
			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Size
			</th>
			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Average Cost
			</th>
			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Profit / Loss
			</th>

			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Status
			</th>

			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Expiry
			</th>
			<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
				Delta
			</th>
			<th scope="col" className="sr-only">
				Action
			</th>
			<tbody className="divide-y dark:divide-zinc-900 divide-zinc-200 dark:bg-inherit">
				{lyraPositions?.map((position: LyraPosition, index: number) => {
					return <LyraPositionRow key={index} position={position} />;
				})}
			</tbody>
		</table>
	);
};

const LyraPositions = () => {
	const { lyra } = useBuilderContext();
	const { address } = useAccount();

	const { isLoading: isLyraPositionsLoading, data: lyraPositions } = useLyraPositions(
		lyra,
		address
	);

	return (
		<>
			<div className="font-mono border-b flex dark:border-zinc-900 pt-8 p-4 text-sm font-normal dark:text-zinc-200">
				<LyraIcon className="h-4 w-4 mr-2" />
				Lyra Positions
			</div>

			{isLyraPositionsLoading ? (
				<div className="p-4">
					<Spinner />
				</div>
			) : (
				<div className="overflow-x-scroll pb-3 sm:pb-0 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto">
					<table className="min-w-full table-fixed rounded-sm">
						<thead className="divide-b dark:divide-zinc-900 divide-zinc-300 "></thead>

						<th scope="col" className="hidden sm:block py-3.5 text-left pl-4 text-xs font-light">
							Market
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
							Type
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Strike Price
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Size
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Average Cost
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Profit / Loss
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Status
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Expiry
						</th>
						<th scope="col" className="hidden sm:block py-3.5 text-left pl-4  text-xs font-light">
							Delta
						</th>
						<th scope="col" className="sr-only">
							Action
						</th>

						<tbody className="divide-y dark:divide-zinc-900 divide-zinc-200 dark:bg-inherit">
							{lyraPositions?.map((position: LyraPosition, index: number) => {
								return <LyraPositionRow key={index} position={position} />;
							})}
						</tbody>
					</table>
				</div>
			)}
		</>
	);
};

const LyraPositionRow = ({ position }: { position: LyraPosition }) => {
	const { isCall, isLong, isOpen, size, expiryTimestamp, delta, strikePrice, marketName, id } =
		position;
	const { totalAverageOpenCost, unrealizedPnl, realizedPnl } = position.pnl();
	const formattedUnrealizedPnl = fromBigNumber(unrealizedPnl);
	const formattedRealizedPnl = fromBigNumber(realizedPnl);
	const { selectedChain: chain } = useChainContext();

	const lyraHref = chain && id && getLyraPositionUrl(chain, marketName, id);

	return (
		<tr className="hover:bg-zinc-100 hover:dark:bg-zinc-900">
			<td className=" hidden sm:block whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
				{marketName}
			</td>

			<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
				<div>
					{isCall ? (
						<span className="bg-emerald-500 text-zinc-100 font-normal p-1 rounded-lg">Call</span>
					) : (
						<span className="bg-pink-700 text-zinc-100  font-normal p-1 rounded-lg">Put</span>
					)}
				</div>
				<div className="pt-1">
					{isLong ? (
						<span className="text-emerald-500 font-normal p-1 rounded-lg">Buy</span>
					) : (
						<span className="text-pink-700 font-normal p-1 rounded-lg">Sell</span>
					)}
				</div>
			</td>

			<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{formatUSD(fromBigNumber(strikePrice))}
			</td>
			<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
				{fromBigNumber(size)}
			</td>
			<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{formatUSD(fromBigNumber(totalAverageOpenCost))}
			</td>

			<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{formattedUnrealizedPnl < 0 ? (
					<span className="text-rose-500 font-bold">{formatUSD(formattedUnrealizedPnl)}</span>
				) : (
					<span className="text-emerald-500 font-bold">{formatUSD(formattedUnrealizedPnl)}</span>
				)}
			</td>

			{/* <td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{
					formattedRealizedPnl < 0 ?
						<span className="text-rose-500 font-bold">{formatUSD(formattedRealizedPnl)}</span> :
						<span className="text-emerald-500 font-bold">{formatUSD(formattedRealizedPnl)}</span>
				}
			</td> */}

			<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
				{isOpen ? "Open" : "Closed"}
			</td>

			<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
				{formatExpirationDate(expiryTimestamp)}
			</td>

			<td className="hidden sm:block whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{parseFloat(fromBigNumber(delta).toString()).toFixed(4)}
			</td>

			<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{lyraHref && (
					<a
						href={lyraHref}
						className="p-1 dark:bg-zinc-900 dark:text-zinc-200 hover:dark:bg-zinc-800 bg-zinc-200 text-zinc-900 rounded-lg hover:bg-zinc-300 inline cursor-pointer"
						target="_blank"
						rel="noreferrer"
					>
						View
					</a>
				)}
			</td>
		</tr>
	);
};
