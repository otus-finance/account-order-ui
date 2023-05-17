import { useBuilderContext } from "../../../../context/BuilderContext";
import { CheckIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useAdminVaultOrderContext } from "../../../../context/Admin/AdminVaultOrderContext";
import { Spinner } from "../../../UI/Components/Spinner";
import { useEffect, useState } from "react";
import { LyraStrike } from "../../../../queries/lyra/useLyra";
import { formatUSD, fromBigNumber } from "../../../../utils/formatters/numbers";
import { formatExpirationDate } from "../../../../utils/formatters/expiry";
import { DebounceInput } from "react-debounce-input";
import { isCreditOrDebit } from "../../../../utils/formatters/message";

export const VaultStrikeTrade = () => {
	const { selectedMarket, strikes } = useBuilderContext();
	const { loading, selectedStrikes, spreadSelected, updateMultiSize } = useAdminVaultOrderContext();

	return (
		<>
			{selectedMarket && strikes.length > 0 && (
				<>
					<div className="overflow-x-scroll pb-3 sm:pb-0 scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-500 sm:overflow-auto">
						<table className="font-normal min-w-full divide-y dark:divide-zinc-800 divide-zinc-100 table-fixed">
							<thead className="dark:bg-inherit">
								<tr className=" ">
									<th
										scope="col"
										className="py-2 text-xs dark:text-zinc-400 text-left font-light px-4"
									>
										Expiry
									</th>
									<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
										Type
									</th>
									{/* <th scope="col" className="text-xs dark:text-zinc-400 text-left  px-4">
										Direction
									</th> */}
									<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
										Strike Price
									</th>

									<th
										scope="col"
										className="text-xs  dark:text-zinc-400 text-left font-light  px-4"
									>
										Price
									</th>
									<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
										Credit/(Debit)
									</th>
									<th scope="col" className="text-xs  dark:text-zinc-400 text-left font-light px-4">
										Size
									</th>
								</tr>
							</thead>
							<tbody className="divide-y dark:divide-zinc-800 divide-zinc-100 dark:bg-inherit">
								{loading && <Spinner />}
								{selectedStrikes.map((strike, index) => {
									return <StrikeTradeDetail strike={strike} key={index} />;
								})}
							</tbody>
						</table>
					</div>

					{/* <MarketOrderActions /> */}
				</>
			)}
		</>
	);
};

const StrikeTradeDetail = ({ strike }: { strike: LyraStrike }) => {
	const { setActiveStrike } = useBuilderContext();
	const { updateSize } = useAdminVaultOrderContext();

	const {
		quote: { size, pricePerOption, isCall, isBuy, premium },
		strikePrice,
		isUpdating,
		expiryTimestamp,
		collateralPercent,
	} = strike;

	const [optionPriceLoading, setOptionPriceLoading] = useState(false);

	useEffect(() => {
		setOptionPriceLoading(false);
	}, [size]);

	const [editPricing, setEditPricing] = useState(false);

	useEffect(() => {
		return () => {
			setEditPricing(false);
		};
	}, []);

	const [newSize, setNewSize] = useState(fromBigNumber(size));

	const handleNewSize = (_newSize: number) => {
		setNewSize(_newSize);
	};

	const handleConfirmSizeUpdate = () => {
		updateSize?.(strike, newSize);
		setEditPricing(false);
	};

	return (
		<tr
			className="dark:bg-inherit hover:dark:bg-zinc-900 hover:bg-zinc-100 cursor-pointer"
			onMouseEnter={() => setActiveStrike({ strikeId: strike.id, isCall })}
			onMouseLeave={() => setActiveStrike({ strikeId: 0, isCall: false })}
		>
			<td className="text-xs font-medium dark:text-zinc-300   px-4">
				{expiryTimestamp && formatExpirationDate(expiryTimestamp)}
			</td>
			<td className="py-3 text-xs px-4">
				<div>
					{isCall ? (
						<span className="bg-emerald-500 text-zinc-100 font-normal p-1 rounded-lg">Call</span>
					) : (
						<span className="bg-pink-700 text-zinc-100  font-normal p-1 rounded-lg">Put</span>
					)}
				</div>
				<div className="pt-1">
					{isBuy ? (
						<span className="text-emerald-500 font-normal p-1 rounded-lg">Buy</span>
					) : (
						<span className="text-pink-700 font-normal p-1 rounded-lg">Sell</span>
					)}
				</div>
			</td>
			{/* <td className="text-xs  px-4">

			</td> */}

			<td className="text-xs font-medium dark:text-zinc-300   px-4">
				{formatUSD(strikePrice, { dps: 0 })}
			</td>

			<td className="text-xs font-medium dark:text-zinc-300   px-4">
				{isUpdating ? (
					<Spinner size="small" />
				) : (
					formatUSD(fromBigNumber(pricePerOption), { dps: 2 })
				)}
			</td>

			<td className="text-xs font-medium dark:text-zinc-300  px-4 ">
				{isUpdating ? (
					<Spinner size="small" />
				) : (
					isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium), { dps: 2 }))
				)}
			</td>

			<td className="text-xs font-semibold dark:text-zinc-300 px-4">
				{editPricing ? (
					<div className="flex gap-2 items-center">
						<DebounceInput
							minLength={1}
							onChange={async (e) => {
								if (e.target.value == "") return;
								const value = parseFloat(e.target.value);

								handleNewSize(value);
							}}
							min={0}
							type="number"
							name="size"
							id="size"
							value={newSize}
							className={`w-12 border-2 border-emerald-600 dark:bg-transparent p-1  dark:text-zinc-200 shadow-md dark:shadow-black shadow-zinc-200 text-xs ${
								isUpdating && "cursor-disabled"
							}`}
						/>

						<div>
							<XMarkIcon
								className=" h-4 w-4 dark:text-rose-500"
								onClick={() => setEditPricing(false)}
							/>
						</div>

						<div>
							<CheckIcon
								className="h-4 w-4 dark:text-emerald-500"
								onClick={() => handleConfirmSizeUpdate()}
							/>
						</div>
					</div>
				) : (
					<div className="flex gap-2 items-center">
						{fromBigNumber(size)}

						<PencilSquareIcon
							className="h-4 w-4 dark:text-zinc-200"
							onClick={() => setEditPricing(true)}
						/>
					</div>
				)}
			</td>
		</tr>
	);
};
