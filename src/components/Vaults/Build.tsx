import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { useAccount, useNetwork } from "wagmi";
import { ZERO_BN } from "../../constants/bn";
import { useSpreadLiquidityPoolContext } from "../../context/SpreadLiquidityPoolContext";
import { useLPUser } from "../../queries/otus/user";
import { formatUSD, fromBigNumber, toBN } from "../../utils/formatters/numbers";

import { LiquidityPool } from "../../utils/types";
import { WalletConnect } from "../Builder/StrikeTrade/Common/WalletConnect";
import { Spinner } from "../UI/Components/Spinner";
import SUSDIcon from "../UI/Icons/Color/SUSD";
import Modal from "../UI/Modal";
import ETHIcon from "../UI/Icons/Color/ETH";
import BTCIcon from "../UI/Icons/Color/BTC";

const VaultBuild = () => {
	return (
		<div className="dark:border-zinc-900 border border-zinc-200 cursor-pointer rounded-xl bg-gradient-to-l shadow-md h-full">
			<div key={0} className="border-b dark:border-zinc-800 ">
				<div className="p-4">
					<div className="flex">
						<div>
							<div className="bg-emerald-500 inline-block rounded-full dark:shadow-black shadow-zinc-100">
								<SUSDIcon />
							</div>
							<div className="bg-emerald-500 inline-block rounded-full dark:shadow-black shadow-zinc-100 ml-[-24px]">
								<ETHIcon />
							</div>
							<div className="bg-emerald-500 inline-block rounded-full dark:shadow-black shadow-zinc-100 ml-[-24px]">
								<BTCIcon />
							</div>
						</div>

						<div className="ml-4">
							<h2 className="text-sm font-semibold">Build an Options Vault</h2>
							<h3 className="text-xxs dark:text-zinc-200 pt-1">
								Build your own vault, with discounts on fees.
							</h3>
						</div>
					</div>
				</div>
			</div>

			<div className="border-b dark:border-zinc-800 ">
				<div className="p-4">
					{/* <p className="text-black dark:text-zinc-200 text-xs leading-6 ">
            Otus provide the tools to successfully and easily manage an options vault built on Otus Pools, Lyra and Synthetix Futures.
          </p> */}
					<ul className="text-black dark:text-zinc-200 text-xs leading-6 px-4 list-disc">
						<li>Hedge delta using Synthetix V2 Perps.</li>
						<li>Set Limit Orders.</li>
						<li>Trade spread options and receive a discount on Otus fees.</li>
						<li>Earn performance fees on your vault.</li>
					</ul>
				</div>
			</div>

			<div className="pt-6 p-4">
				<div
					onClick={() => console.log("test")}
					className="text-md cursor-pointer bg-gradient-to-t dark:from-emerald-700 dark:to-emerald-500 from-emerald-500 to-emerald-400 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-2 text-center text-white"
				>
					Start
				</div>
			</div>
		</div>
	);
};

export default VaultBuild;
