import { useAccount, useNetwork } from "wagmi";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { Position, usePositions } from "../../../../queries/otus/positions";
import { useLyraPositions } from "../../../../queries/lyra/useLyra";
import getExplorerUrl from "../../../../utils/chains/getExplorerUrl";
import { fromBigNumber } from "../../../../utils/formatters/numbers";
import { Position as LyraPosition } from "@lyrafinance/lyra-js";
import { formatExpirationDate } from "../../../../utils/formatters/expiry";
import { Spinner } from "../../../UI/Components/Spinner";
import { useChainContext } from "../../../../context/ChainContext";

export const Positions = () => {
	return (
		<>
			<OtusPositions />
			<LyraPositions />
		</>
	);
};

export const OtusPositions = () => {
	const { selectedChain: chain } = useChainContext();
	const { isLoading, data } = usePositions();

	return (
		<>
			<div className="border-b border-zinc-900 p-4 text-sm font-normal text-zinc-200">
				Otus Positions
			</div>
			{isLoading ? (
				<div className="p-4">
					<Spinner />
				</div>
			) : (
				<table className="min-w-full  rounded-sm">
					<thead className="divide-b divide-zinc-900 bg-zinc-800"></thead>
					<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
						Position Id
					</th>

					<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
						Status
					</th>

					<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
						Open Date
					</th>

					<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
						Type
					</th>

					<th scope="col" className="sr-only">
						Action
					</th>
					<tbody className="divide-y divide-zinc-900 bg-inherit">
						{data?.positions.map((position: Position, index: number) => {
							const { id, owner, state, openTimestamp, txHash } = position;
							const txHref = chain && txHash && getExplorerUrl(chain, txHash);
							return (
								<tr key={index}>
									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{fromBigNumber(id, 0)}
									</td>

									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{state === 0 ? "Open" : "Closed"}
									</td>

									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{new Date(openTimestamp * 1000).toDateString()}
									</td>

									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										Spread
									</td>

									<td className="whitespace-nowrap py-4 text-xs font-medium text-zinc-200">
										{txHref && (
											<a target="_blank" rel="noreferrer" href={txHref}>
												View
											</a>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}
		</>
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
			<div className="border-t border-zinc-900 pt-8 p-4 text-sm font-normal text-zinc-200">
				Lyra Positions
			</div>

			{isLyraPositionsLoading ? (
				<div className="p-4">
					<Spinner />
				</div>
			) : (
				<table className="min-w-full  rounded-sm">
					<thead className="divide-b divide-zinc-900 bg-zinc-800 ">
						<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
							Type
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
							Direction
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4 text-xs font-light">
							Position Id
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Status
						</th>

						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Open Date
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Delta
						</th>
						<th scope="col" className=" py-3.5 text-left pl-4  text-xs font-light">
							Hedge Delta
						</th>
						<th scope="col" className="sr-only">
							Action
						</th>
					</thead>
					<tbody className="divide-y divide-zinc-900 bg-inherit">
						{lyraPositions?.map((position: LyraPosition, index: number) => {
							const { isCall, isLong, id, isOpen, expiryTimestamp, delta } = position;
							return (
								<tr key={index}>
									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{isCall ? (
											<span className="bg-emerald-500 text-zinc-100 font-normal p-1 rounded-lg">
												Call
											</span>
										) : (
											<span className="bg-pink-700 text-zinc-100  font-normal p-1 rounded-lg">
												Put
											</span>
										)}
									</td>

									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{isLong ? (
											<span className="text-emerald-500 font-normal p-1 rounded-lg">Buy</span>
										) : (
											<span className="text-pink-700 font-normal p-1 rounded-lg">Sell</span>
										)}
									</td>

									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{id}
									</td>

									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{isOpen ? "Open" : "Closed"}
									</td>

									<td className="whitespace-nowrap py-4 text-left pl-4  text-xs font-medium text-zinc-200">
										{formatExpirationDate(expiryTimestamp)}
									</td>

									<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium text-zinc-200">
										{parseFloat(fromBigNumber(delta).toString()).toFixed(4)}
									</td>

									<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium text-zinc-200">
										<button className="">Hedge</button>
									</td>

									<td className="whitespace-nowrap py-4 text-xs  pl-4 font-medium text-zinc-200">
										<a target="_blank" rel="noreferrer">
											View
										</a>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}
		</>
	);
};
