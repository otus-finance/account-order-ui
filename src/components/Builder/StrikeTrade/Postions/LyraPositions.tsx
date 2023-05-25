import { Address, useAccount } from "wagmi";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { useLyraPositions } from "../../../../queries/lyra/useLyra";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import Lyra, { Position as LyraPosition } from "@lyrafinance/lyra-js";
import { formatExpirationDate } from "../../../../utils/formatters/expiry";
import { Spinner } from "../../../UI/Components/Spinner";
import { useChainContext } from "../../../../context/ChainContext";
import LyraIcon from "../../../UI/Icons/Color/LYRA";
import getLyraPositionUrl from "../../../../utils/chains/getLyraPositionUrl";
import { motion } from "framer-motion";

export const LyraPositions = ({ lyra, address }: { lyra?: Lyra; address?: Address }) => {
	const { isLoading: isLyraPositionsLoading, data: lyraPositions } = useLyraPositions(
		lyra,
		address
	);

	return (
		<>
			<div className=" rounded-full p-4 text-sm font-semibold dark:text-zinc-200 flex ">
				<LyraIcon className="h-4 w-4 mt-[1px] mr-2" />
				Lyra Positions
			</div>

			{isLyraPositionsLoading ? (
				<div className="p-4">
					<Spinner />
				</div>
			) : (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="bg-zinc-100 dark:bg-zinc-800 rounded-b-xl overflow-x-scroll p-4 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto"
				>
					<table className="min-w-full table-fixed rounded-sm">
						<thead className="divide-b dark:divide-zinc-800 divide-zinc-100 "></thead>

						<th
							scope="col"
							className="hidden sm:table-cell dark:text-zinc-400 py-3.5 text-left  text-xs font-light"
						>
							Market
						</th>
						<th
							scope="col"
							className=" py-3.5 dark:text-zinc-400 text-left pl-4 text-xs font-light"
						>
							Type
						</th>

						<th
							scope="col"
							className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light"
						>
							Strike Price
						</th>
						<th
							scope="col"
							className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light"
						>
							Size
						</th>
						<th
							scope="col"
							className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light"
						>
							Average Cost
						</th>
						<th
							scope="col"
							className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light"
						>
							Profit / Loss
						</th>

						<th
							scope="col"
							className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light"
						>
							Status
						</th>

						<th
							scope="col"
							className=" py-3.5 dark:text-zinc-400 text-left pl-4  text-xs font-light"
						>
							Expiry
						</th>
						<th
							scope="col"
							className="hidden sm:table-cell dark:text-zinc-400 py-3.5 text-left pl-4  text-xs font-light"
						>
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
				</motion.div>
			)}
		</>
	);
};

export const LyraPositionRow = ({ position }: { position: LyraPosition }) => {
	const { isCall, isLong, isOpen, size, expiryTimestamp, delta, strikePrice, marketName, id } =
		position;
	const { totalAverageOpenCost, unrealizedPnl, realizedPnl } = position.pnl();
	const formattedUnrealizedPnl = fromBigNumber(unrealizedPnl);
	const formattedRealizedPnl = fromBigNumber(realizedPnl);
	const { selectedChain: chain } = useChainContext();

	const lyraHref = chain && id && getLyraPositionUrl(chain, marketName, id);

	return (
		<tr className="">
			<td className=" hidden sm:table-cell whitespace-nowrap py-4 text-left  text-xs font-medium dark:text-zinc-200">
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

			<td className="hidden sm:table-cell whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
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
