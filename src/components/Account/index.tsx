import { useAccount } from "wagmi";
import { Spinner } from "../UI/Components/Spinner";
import { Dispatch, useState } from "react";
import {
	AccountOrderContextProvider,
	useAccountOrderContext,
} from "../../context/AccountOrderContext";
import { Order } from "../../queries/otus/account";
import { formatPercentage, formatUSD, fromBigNumber } from "../../utils/formatters/numbers";

enum AccountTab {
	Positions,
	Orders,
	Trades,
}

export const AccountPosition = () => {
	const [selectedAccountTab, setSelectedAccountTab] = useState(AccountTab.Positions);

	const { address } = useAccount();

	return (
		<AccountOrderContextProvider owner={address}>
			<>
				<AccountInfoSelect
					selectedAccountTab={selectedAccountTab}
					setSelectedAccountTab={setSelectedAccountTab}
				/>
				<div className="border border-zinc-800 rounded-sm p-6">
					<AccountInfo selectedAccountTab={selectedAccountTab} />
				</div>
			</>
		</AccountOrderContextProvider>
	);
};

const AccountInfoSelect = ({
	selectedAccountTab,
	setSelectedAccountTab,
}: {
	selectedAccountTab: AccountTab;
	setSelectedAccountTab: Dispatch<AccountTab>;
}) => {
	return (
		<div className="flex items-center gap-8 text-sm px-6 pt-6 pb-2">
			<div
				onClick={() => setSelectedAccountTab(AccountTab.Positions)}
				className={`cursor-pointer hover:text-white ${
					selectedAccountTab === AccountTab.Positions ? "text-white underline" : "text-zinc-300"
				}`}
			>
				Limit Positions
			</div>

			<div
				onClick={() => setSelectedAccountTab(AccountTab.Orders)}
				className={`cursor-pointer hover:text-white ${
					selectedAccountTab === AccountTab.Orders ? "text-white underline" : "text-zinc-300"
				}`}
			>
				Limit Orders
			</div>

			<div
				onClick={() => setSelectedAccountTab(AccountTab.Trades)}
				className={`cursor-pointer hover:text-white ${
					selectedAccountTab === AccountTab.Trades ? "text-white underline" : "text-zinc-300"
				}`}
			>
				Limit Trades
			</div>
		</div>
	);
};

const AccountInfo = ({ selectedAccountTab }: { selectedAccountTab: AccountTab }) => {
	const { accountOrder, isLoading } = useAccountOrderContext();

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<>
			<div className="pb-4 col-span-3 overflow-x-scroll scrollbar scrollbar-thumb-zinc-700 scrollbar-track-zinc-500 ">
				{selectedAccountTab === AccountTab.Positions ? (
					<AccountPositions orders={accountOrder?.orders || []} />
				) : null}

				{selectedAccountTab === AccountTab.Orders ? (
					<AccountOrders orders={accountOrder?.orders || []} />
				) : null}

				{selectedAccountTab === AccountTab.Trades ? (
					<AccountTrades orders={accountOrder?.orders || []} />
				) : null}
			</div>
		</>
	);
};

const AccountOrders = ({ orders }: { orders: Array<Order> }) => {
	return (
		<table className="min-w-full divide-y divide-zinc-700">
			<thead className="bg-zinc-800">
				<tr>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Order Id
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Order Type
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Status
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Committed Margin
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Option Type
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Strike Id
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light ">
						Size
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Direction
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Target Price
					</th>
					<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
						Target Volatility
					</th>
				</tr>
			</thead>
			<tbody className="divide-y divide-zinc-700 bg-zinc-800">
				{orders.map((order: Order, index: number) => {
					const {
						id,
						orderId,
						committedMargin,
						gelatoTaskId,
						market,
						collatPercent,
						optionType,
						strikeId,
						size,
						positionId,
						tradeDirection,
						targetPrice,
						targetVolatility,
						status,
					} = order;

					return (
						<tr key={index}>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{orderId}
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								Order Type
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{status}
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{formatUSD(fromBigNumber(committedMargin))}
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{optionType}
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{fromBigNumber(strikeId)}
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{fromBigNumber(size)}
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{fromBigNumber(tradeDirection)}
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								Target Price
							</td>
							<td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-3">
								{formatPercentage(fromBigNumber(targetVolatility))}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

const AccountPositions = ({ orders }: { orders: Array<Order> }) => {
	return <table className="min-w-full divide-y divide-zinc-700 rounded-sm"></table>;
};

const AccountTrades = ({ orders }: { orders: Array<Order> }) => {
	return <table className="min-w-full divide-y divide-zinc-700 rounded-sm"></table>;
};

// need get order id

// need get optiontype

// need trade direction
