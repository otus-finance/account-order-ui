import { Button } from "../../../UI/Components/Button";

export const VaultManage = () => {
	return (
		<>
			<div className="border-b font-mono dark:border-zinc-800 border-zinc-100 p-4 text-sm font-normal dark:text-zinc-200">
				Round Info
			</div>
			<table className="font-normal min-w-full divide-b dark:divide-zinc-800 divide-zinc-100 table-fixed">
				<thead className="dark:bg-inherit"></thead>
				<th scope="col" className="py-2 text-xs dark:text-zinc-400 text-left font-light px-4">
					cap
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					lastLockedAmount
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					lockedAmountLeft
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					totalPending
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					queuedWithdrawShares
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					nextRoundReadyTimestamp
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					roundInProgress
				</th>
				<tbody className="divide-y dark:divide-zinc-800 divide-zinc-100 dark:bg-inherit"></tbody>
			</table>
			<div className="border-y font-mono dark:border-zinc-800 border-zinc-100 p-4 text-sm font-normal dark:text-zinc-200">
				Vault Info
			</div>
			<table className="font-normal min-w-full divide-b dark:divide-zinc-800  divide-zinc-100 table-fixed">
				<thead className="dark:bg-inherit"></thead>

				<th scope="col" className="py-2 text-xs dark:text-zinc-400 text-left font-light px-4">
					vaultName
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					tokenName
				</th>

				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					tokenSymbol
				</th>

				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					feeRecipient
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					vaultCapacity
				</th>
				<th scope="col" className="text-xs dark:text-zinc-400 text-left font-light px-4">
					performanceFee
				</th>

				<tbody className="divide-y dark:divide-zinc-800 divide-zinc-100 dark:bg-inherit"></tbody>
			</table>

			<div className="border-y font-mono dark:border-zinc-800 border-zinc-100 p-4 text-sm font-normal dark:text-zinc-200">
				<div className="flex justify-between items-center align-middle">
					<div>Strategy Details</div>
					<div>
						<Button
							isDisabled={false}
							label={"Edit"}
							isLoading={false}
							variant={"action"}
							radius={"full"}
							size={"sm"}
							onClick={() => console.log(true)}
						/>
					</div>
				</div>
			</div>
			<div className="pt-0 p-4 text-xs">
				{StrategyDetailFields.map((field: StrategyDetailField, index: number) => {
					return (
						<div key={index} className="flex justify-between py-2 dark:text-zinc-200 text-zinc-800">
							<div>{field.name}</div>
							<div>0</div>
						</div>
					);
				})}
			</div>

			<div className="border-y font-mono dark:border-zinc-800 border-zinc-100 p-4 text-sm font-normal dark:text-zinc-200">
				<div className="flex justify-between items-center align-middle">
					<div>Hedge Strategy Details</div>
					<div>
						<Button
							isDisabled={false}
							label={"Edit"}
							isLoading={false}
							variant={"action"}
							radius={"full"}
							size={"sm"}
							onClick={() => console.log(true)}
						/>
					</div>
				</div>
			</div>
			<div className="pt-0 p-4 text-xs">
				{HedgeStrategyDetailFields.map((field: StrategyDetailField, index: number) => {
					return (
						<div key={index} className="flex justify-between py-2 dark:text-zinc-200 text-zinc-800">
							<div>{field.name}</div>
							<div>0</div>
						</div>
					);
				})}
			</div>
		</>
	);
};

type StrategyDetailField = {
	name: string;
	type: string;
};

const StrategyDetailFields: StrategyDetailField[] = [
	{
		name: "minTimeToExpiry",
		type: "uint256",
	},
	{
		name: "maxTimeToExpiry",
		type: "uint256",
	},
	{
		name: "targetDelta",
		type: "uint256",
	},
	{
		name: "maxDeltaGap",
		type: "uint256",
	},
	{
		name: "minTradeInterval",
		type: "uint256",
	},
	{
		name: "collatPercent",
		type: "uint256",
	},
	{
		name: "hedgeReserve",
		type: "uint256",
	},
	{
		name: "hedgeReserve",
		type: "uint256",
	},
	{
		name: "hedge",
		type: "bool",
	},
];

const HedgeStrategyDetailFields: StrategyDetailField[] = [
	{
		name: "hedgeIntervalDelay",
		type: "uint256",
	},
	{
		name: "hedgeFundsBuffer",
		type: "uint256",
	},
	{
		name: "maxLeverage",
		type: "uint256",
	},
	{
		name: "deltaHedgePercentage",
		type: "uint256",
	},
];
