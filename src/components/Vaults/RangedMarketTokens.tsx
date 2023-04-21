import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Provider } from "@wagmi/core";
import { BigNumber, Bytes, Contract, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { Address, useAccount, useContractRead, useNetwork, useProvider } from "wagmi";
import { ONE_BN, ONE_TENTH_BN, ZERO_BN } from "../../constants/bn";
import { useSpreadLiquidityPoolContext } from "../../context/SpreadLiquidityPoolContext";
import { useLPUser } from "../../queries/otus/user";
import { formatUSD, fromBigNumber, toBN } from "../../utils/formatters/numbers";

import { LiquidityPool } from "../../utils/types";
import { WalletConnect } from "../Builder/StrikeTrade/Common/WalletConnect";
import { Spinner } from "../UI/Components/Spinner";
import SUSDIcon from "../UI/Icons/Color/SUSD";
import Modal from "../UI/Modal";
import ETHIcon from "../UI/Icons/Color/ETH";
import { ArrowDownCircleIcon } from "@heroicons/react/20/solid";
import { ArrowDownIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { RangedMarket, useRangedMarkets } from "../../queries/otus/rangedMarkets";
import { formatExpirationDate, formatExpirationTitle } from "../../utils/formatters/expiry";
import { BTC_MARKET, ETH_MARKET } from "../../constants/markets";
import BTCIcon from "../UI/Icons/Color/BTC";
import { useOtusAccountContracts } from "../../hooks/Contracts";
import { TradeDirection } from "@lyrafinance/lyra-js";
import { RangedMarketPosition, useRangedMarket } from "../../hooks/RangedMarket";
import {
	Area,
	ComposedChart,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ticks } from "../../utils/charting";

const getIcon = (market: string) => {
	if (market == BTC_MARKET) {
		return <BTCIcon />;
	} else {
		return <ETHIcon />;
	}
};

const Market = ({ market }: { market: RangedMarket }) => {
	const [open, setOpen] = useState(false);

	const { address } = useAccount();

	const {
		isPriceLoading,
		isApproveQuoteLoading,
		isSwapLoading,
		swap,
		approveQuote,
		currentAllowance,
		tokenOutBalance,
		tokenInBalance,
		userBalance,
		price,
		size,
		handleSizeUpdate,
		toggleDirection,
		direction,
		rangedMarketPosition,
		setRangedMarketPosition,
	} = useRangedMarket(market);

	const name = `${ethers.utils.parseBytes32String(market.market)} Range Market`;

	return (
		<>
			<div key={market.id} className="border-b border-zinc-100 border-opacity-20">
				<div className="p-4">
					<div className="flex">
						<div>
							<div className="rounded-full bg-zinc-900">
								<SUSDIcon />
							</div>
						</div>
						<div>
							<div className="ml-[-20px] rounded-full bg-zinc-900">{getIcon(market.market)}</div>
						</div>
						<div className="ml-4">
							<h2 className="text-sm font-semibold">{name}</h2>
							<h3 className="text-xs text-white pt-1">Strike Range $1500 - $2000</h3>
							<h3 className="text-xs font-semibold text-white pt-1">
								{formatExpirationTitle(market.expiry)}
							</h3>
						</div>
					</div>
				</div>
			</div>

			<div className="border-b border-zinc-100 border-opacity-20">
				<div className="p-4 py-6">
					<div className="flex justify-between">
						<div
							onClick={() => setRangedMarketPosition(RangedMarketPosition.IN)}
							className={`text-white uppercase cursor-pointer  p-2 font-semibold text-center w-full rounded-l-full text-xs border border-r-0  border-zinc-100 border-opacity-20  hover:opacity-90
								${
									rangedMarketPosition == RangedMarketPosition.IN
										? "bg-gradient-to-b from-black to-zinc-900 "
										: "bg-inherit"
								}
							`}
						>
							In
						</div>
						<div
							onClick={() => setRangedMarketPosition(RangedMarketPosition.OUT)}
							className={`text-white uppercase cursor-pointer p-2 border-l-zinc-900  font-semibold text-center w-full rounded-r-full text-xs border border-zinc-100 border-opacity-20 hover:opacity-90
							${
								rangedMarketPosition == RangedMarketPosition.OUT
									? "bg-gradient-to-b from-black to-zinc-900 "
									: "bg-inherit"
							}
							`}
						>
							Out
						</div>
					</div>
				</div>
			</div>

			<div className="overflow-hidden border-b border-zinc-100 border-opacity-20 ">
				<div className="p-4">
					<div className="flex gap-12">
						<div className="block">
							<div className="font-light text-xxs text-white">Potential Profit</div>

							<div className="font-normal text-sm text-zinc-200 mt-2">
								<strong>
									{RangedMarketPosition.IN == rangedMarketPosition ? "58%" : Infinity}
								</strong>
							</div>
						</div>

						<div className="block w-14">
							<div className="font-light text-xxs text-white">Price</div>

							<div className="font-semibold text-sm uppercase text-zinc-200 mt-2">
								{isPriceLoading ? (
									<Spinner size={"small"} color={"secondary"} />
								) : (
									<strong>
										{formatUSD(fromBigNumber(price) / fromBigNumber(size), { dps: 2 })}
									</strong>
								)}
							</div>
						</div>

						<div className="block">
							<div className="font-light text-xxs text-white">Expires</div>

							<div className="font-normal text-sm text-zinc-200 mt-2">
								<strong>{formatExpirationDate(market.expiry)}</strong>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="overflow-hidden border-b border-zinc-100 border-opacity-20 ">
				<div className="p-4">
					<div className="bg-gradient-to-b from-black to-zinc-900  border border-zinc-900  rounded-lg  border-opacity-20 py-4 p-2 shadow-inner shadow-black">
						<RangedMarketChart
							strikePrice1={2500}
							strikePrice2={3100}
							strikePrice3={2800}
							strikePrice4={2800}
							position={rangedMarketPosition}
						/>
					</div>
				</div>
			</div>

			<div className="py-4">
				{direction === TradeDirection.Open ? (
					<div className="p-4 py-1 ">
						<div className="bg-inherit border rounded-lg border-zinc-100 border-opacity-20  bg-zinc-900 py-4 p-2 shadow-md">
							<div className="flex items-center justify-between px-2">
								<p className="truncate font-mono text-xs font-normal text-white">You Sell</p>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
										Balance: {formatUSD(userBalance, { dps: 2 })}
									</p>
								</div>
							</div>

							<div className="flex items-center justify-between px-2 pt-2">
								<div className="w-full block ring-transparent outline-none bg-transparent pr-2 text-left text-white font-normal text-2xl">
									{isPriceLoading ? (
										<Spinner size={"small"} color={"secondary"} />
									) : (
										parseFloat(fromBigNumber(price).toString()).toFixed(6)
									)}
								</div>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-normal text-2xl text-white">sUSD</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="p-4 py-1 ">
						<div className="bg-gradient-to-b from-black to-zinc-900  border border-zinc-900  rounded-lg  border-opacity-20 py-4 p-2 shadow-inner shadow-black">
							<div className="flex items-center justify-between px-2">
								<p className="truncate font-mono text-xs font-normal text-white">You Sell</p>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
										Balance:{" "}
										{rangedMarketPosition == RangedMarketPosition.OUT
											? fromBigNumber(tokenOutBalance)
											: fromBigNumber(tokenInBalance)}
									</p>
								</div>
							</div>

							<div className="flex items-center justify-between px-2 pt-2">
								<DebounceInput
									minLength={1}
									debounceTimeout={300}
									onChange={async (e) => {
										if (e.target.value == "") return;
										const value = parseFloat(e.target.value);

										handleSizeUpdate(value);
									}}
									type="number"
									name="size"
									id="size"
									value={fromBigNumber(size)}
									step={0.01}
									className="block ring-transparent outline-none w-full bg-transparent pr-2 text-left text-white font-normal text-2xl"
								/>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-normal text-2xl text-white">OTRM1</p>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="flex items-center justify-center mt-[-20px] ">
					<div
						onClick={() => toggleDirection()}
						className="bg-zinc-900 rounded-md p-2 shadow-xl cursor-pointer border-2 border-zinc-800 hover:bg-black transition duration-200 ease-in-out transform hover:scale-110"
					>
						<ArrowDownIcon className="h-4 w-4 text-white" />
					</div>
				</div>

				{direction === TradeDirection.Open ? (
					<div className="p-4 py-1 mt-[-20px]">
						<div className="bg-gradient-to-b from-black to-zinc-900 border border-zinc-900  rounded-lg border-opacity-20 py-4 p-2 shadow-inner shadow-black">
							<div className="flex items-center justify-between px-2">
								<p className="truncate font-mono text-xs font-normal text-white">You Buy</p>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
										Balance:{" "}
										{rangedMarketPosition == RangedMarketPosition.OUT
											? fromBigNumber(tokenOutBalance)
											: fromBigNumber(tokenInBalance)}
									</p>
								</div>
							</div>

							<div className="flex items-center justify-between px-2 pt-2">
								<DebounceInput
									minLength={1}
									debounceTimeout={300}
									onChange={async (e) => {
										if (e.target.value == "") return;
										const value = parseFloat(e.target.value);
										handleSizeUpdate(value);
									}}
									type="number"
									name="size"
									id="size"
									value={fromBigNumber(size)}
									step={0.01}
									className="block ring-transparent outline-none w-full bg-transparent pr-2 text-left text-white font-normal text-2xl"
								/>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-normal text-2xl text-white">OTRM1</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="p-4 py-1 mt-[-20px]">
						<div className="bg-inherit border rounded-lg border-zinc-100 border-opacity-40 bg-zinc-900 py-4 p-2 shadow-md ">
							<div className="flex items-center justify-between px-2">
								<p className="truncate font-mono text-xs font-normal text-white">You Buy</p>
								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-mono text-xs font-normal leading-5 text-white">
										Balance: {formatUSD(userBalance, { dps: 2 })}
									</p>
								</div>
							</div>

							<div className="flex items-center justify-between px-2 pt-2">
								<div className="w-full block ring-transparent outline-none bg-transparent pr-2 text-left text-white font-normal text-2xl">
									{isPriceLoading ? (
										<Spinner size={"small"} color={"secondary"} />
									) : (
										parseFloat(fromBigNumber(price).toString()).toFixed(6)
									)}
								</div>

								<div className="ml-2 flex flex-shrink-0">
									<p className="inline-flex font-normal text-2xl text-white">sUSD</p>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="p-4 pt-4 pb-2">
					<RangedMarketActions
						userBalance={userBalance}
						currentAllowance={currentAllowance}
						approveQuote={approveQuote}
						swap={swap}
						price={price}
						isApproveQuoteLoading={isApproveQuoteLoading}
						isSwapLoading={isSwapLoading}
					/>
				</div>
			</div>
		</>
	);
};
// , approve, buy, sell, excercise
const RangedMarketActions = ({
	userBalance,
	currentAllowance,
	approveQuote,
	swap,
	price,
	isApproveQuoteLoading,
	isSwapLoading,
}: {
	userBalance: number;
	currentAllowance: BigNumber;
	approveQuote: (() => void) | undefined;
	swap: (() => void) | undefined;
	price: BigNumber;
	isApproveQuoteLoading: boolean;
	isSwapLoading: boolean;
}) => {
	const { isConnected } = useAccount();
	const { openConnectModal } = useConnectModal();
	// insufficient balance
	// approve

	// buy

	// sell

	// excercise

	if (!isConnected && openConnectModal) {
		return <WalletConnect />;
	}

	if (userBalance && toBN(userBalance.toString()).lt(price)) {
		return (
			<div
				onClick={() => console.warn("Add funds")}
				className="mb-4 cursor-disabled border-2 border-zinc-800 bg-zinc-800 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
			>
				Insufficient Balance
			</div>
		);
	}

	if (currentAllowance.eq(ZERO_BN) || currentAllowance.lt(price)) {
		return (
			<div
				onClick={() => approveQuote?.()}
				className="cursor-pointer bg-gradient-to-b from-black to-zinc-900 hover:text-zinc-200 rounded-full  p-2 py-3 font-semibold text-sm text-center"
			>
				{isApproveQuoteLoading ? <Spinner size={"medium"} color={"secondary"} /> : "Approve Quote"}
			</div>
		);
	}

	return (
		<div
			onClick={() => swap?.()}
			className="cursor-pointer bg-gradient-to-b from-black to-zinc-900 rounded-full p-2 py-3 font-semibold text-sm text-center"
		>
			{isSwapLoading ? <Spinner size={"medium"} color={"secondary"} /> : "Swap"}
		</div>
	);
};

export type PnlChartPoint = {
	name: number;
	asset_price: number;
	negative_combo_payoff: number | null;
	positive_combo_payoff: number | null;
};

const RangedMarketChart = ({
	strikePrice1,
	strikePrice2,
	strikePrice3,
	strikePrice4,
	position,
}: {
	strikePrice1: number;
	strikePrice2: number;
	strikePrice3: number;
	strikePrice4: number;
	position: RangedMarketPosition;
}) => {
	const [data, setData] = useState<PnlChartPoint[] | []>([]);

	useEffect(() => {
		const _ticks = ticks("sETH-sUSD", 2800);
		console.log({ _ticks });

		console.log({
			strikePrice1,
			strikePrice2,
			strikePrice3,
			strikePrice4,
		});
		const _chartData = _ticks.map((tick, index) => {
			{
				/* @ts-ignore */
			}
			const profitAtTick =
				position === RangedMarketPosition.IN
					? (tick > strikePrice1 ? 0 : strikePrice1 - tick) + // 2500 2100 21 strikePrice1 is buy put
					  (tick > strikePrice2 ? tick - strikePrice2 : 0) +
					  ((tick < strikePrice3 ? 500 : strikePrice3 - tick) +
							(tick < strikePrice4 ? tick - strikePrice4 : 500)) -
					  305
					: (tick > strikePrice1 ? 0 : strikePrice1 - tick) + // 2500 2100 21 strikePrice1 is buy put
					  (tick > strikePrice2 ? tick - strikePrice2 : 0) -
					  194; // - cost // _combo[tick].profitAtTick; strikePrice2 is cbuy call 3100 < 3500

			if (profitAtTick < 0) {
				console.log({ profitAtTick });
			}

			return {
				name: index,
				asset_price: Math.floor(tick),
				combo_payoff: profitAtTick,
				negative_combo_payoff: profitAtTick < 0 ? profitAtTick : null,
				positive_combo_payoff: profitAtTick > 0 ? profitAtTick : null,
			};
		});

		setData(_chartData);
	}, [strikePrice1, strikePrice2, strikePrice3, strikePrice4, position]);

	return (
		<ResponsiveContainer width="99%" height={80}>
			<ComposedChart
				width={730}
				height={250}
				data={data}
				margin={{
					top: 2,
					left: 8,
					right: 8,
					bottom: 8,
				}}
			>
				<XAxis
					hide={true}
					dataKey="asset_price"
					tick={{
						stroke: "#fff",
						strokeWidth: 0.5,
						fontSize: "10px",
						fontWeight: "100",
						fontFamily: "Rubik",
					}}
				/>
				<YAxis
					hide={true}
					tickCount={100}
					tickSize={2}
					tick={{
						stroke: "#f5f5f5",
						strokeWidth: 0.5,
						fontSize: "10px",
						fontWeight: "100",
						fontFamily: "Rubik",
					}}
				/>

				{/* <Tooltip content={<CustomTooltip currentPrice={1800} />} />  */}

				<ReferenceLine y={0} stroke={"#e4e4e7"} strokeWidth={0.1} />
				<ReferenceLine x={2800} stroke={"#fff"} strokeWidth={0.1} />

				<Line
					type="monotone"
					connectNulls={false}
					dataKey="negative_combo_payoff"
					stroke={"#831843"}
					dot={false}
					strokeWidth={2}
				/>
				<Line
					type="monotone"
					connectNulls={false}
					dataKey="positive_combo_payoff"
					stroke={"#047857"}
					dot={false}
					strokeWidth={2}
				/>
				{/* </LineChart> */}
				<Area dataKey="negative_combo_payoff" stroke="#831843" fill="#831843" />
				<Area dataKey="positive_combo_payoff" stroke="#047857" fill="#047857" />
			</ComposedChart>
		</ResponsiveContainer>
	);
};

export default Market;
