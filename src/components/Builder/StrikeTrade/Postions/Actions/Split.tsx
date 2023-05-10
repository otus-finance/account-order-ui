import { Position } from "../../../../../queries/otus/positions";
import { formatExpirationDate } from "../../../../../utils/formatters/expiry";
import { formatUSD, fromBigNumber } from "../../../../../utils/formatters/numbers";
import { Position as LyraPosition } from "@lyrafinance/lyra-js";
import LyraIcon from "../../../../UI/Icons/Color/LYRA";
import { ArrowRightCircleIcon } from "@heroicons/react/20/solid";
import LogoIcon from "../../../../UI/Icons/Logo/OTUS";
import { useOtusPosition } from "../../../../../hooks/markets/useOtusPosition";
import { useOtusAccountContracts } from "../../../../../hooks/Contracts";
import { useNetwork } from "wagmi";
import { Spinner } from "../../../../UI/Components/Spinner";

export const OtusPositionSplit = ({ position }: { position: Position }) => {
	const { chain } = useNetwork();

	const { otusContracts, networkNotSupported } = useOtusAccountContracts();

	const otusOptionMarket =
		otusContracts && otusContracts["OtusOptionMarket"] && otusContracts["OtusOptionMarket"];

	const { burn, isBurnPositionLoading, isTxLoading, isBurnPositionSuccess } = useOtusPosition(
		otusOptionMarket,
		chain,
		position?.id
	);

	const { lyraPositions } = position;

	return (
		<div>
			<table className="min-w-full table-fixed rounded-sm">
				<thead className="divide dark:divide-zinc-900 divide-zinc-300 "></thead>
				<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
					Protocol
				</th>
				<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
					Strike Price
				</th>
				<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
					Profit / Loss
				</th>

				<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
					Expiry
				</th>

				<th scope="col" className="sr-only">
					Transfer
				</th>
				<tbody className="divide-y dark:divide-zinc-900 divide-zinc-200 dark:bg-inherit">
					{lyraPositions?.map((position: LyraPosition, index: number) => {
						return <LyraSplitPositionRow key={index} position={position} />;
					})}
				</tbody>
			</table>

			<div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
				<div
					onClick={() => (isBurnPositionSuccess ? console.log("Close") : burn?.())}
					className={` rounded-full p-4 w-full font-semibold hover:dark:text-emerald-100 py-3 text-center text-white cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400`}
				>
					{isBurnPositionSuccess ? "Success" : isTxLoading ? <Spinner /> : "Split Position"}
				</div>
			</div>
		</div>
	);
};

const LyraSplitPositionRow = ({ position }: { position: LyraPosition }) => {
	const { isCall, isLong, isOpen, size, expiryTimestamp, delta, strikePrice, marketName, id } =
		position;
	const { totalAverageOpenCost, unrealizedPnl, realizedPnl } = position.pnl();
	const formattedRealizedPnl = fromBigNumber(realizedPnl);
	const formattedUnrealizedPnl = fromBigNumber(unrealizedPnl);

	return (
		<tr className="hover:bg-zinc-100 hover:dark:bg-zinc-900">
			<td className="whitespace-nowrap py-4 text-xs pl-4 font-medium dark:text-zinc-200">
				<div className="flex ">
					<div className="items-center">
						<LyraIcon className="h-4 w-4" />
					</div>
				</div>
			</td>

			<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{formatUSD(fromBigNumber(strikePrice))}
			</td>

			<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium dark:text-zinc-200">
				{formattedUnrealizedPnl < 0 ? (
					<span className="text-rose-500 font-bold">{formatUSD(formattedUnrealizedPnl)}</span>
				) : (
					<span className="text-emerald-500 font-bold">{formatUSD(formattedUnrealizedPnl)}</span>
				)}
			</td>
			<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
				{formatExpirationDate(expiryTimestamp)}
			</td>

			<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium dark:text-zinc-200">
				<ArrowRightCircleIcon className="h-5 w-5 text-emerald-500" />
			</td>
		</tr>
	);
};
