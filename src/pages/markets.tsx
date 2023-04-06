import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { BuilderContextProvider } from "../context/BuilderContext";
import { OptionsBuilder } from "../components/Builder";
import Layout from "../components/UI/Layout";
import SpreadLiquidityPool from "../components/Vaults/SpreadLiquidityPool";
import { toBN } from "../utils/formatters/numbers";
import { SpreadLiquidityPoolContextProvider } from "../context/SpreadLiquidityPoolContext";
import Vault from "../components/Vaults/RangedMarketTokens";

const Builder: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Otus Finance: Spread Options Trading, Limit Orders and Vaults</title>
				<meta name="description" content="Spread Options Trading, Limit Orders and Vaults" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<SpreadLiquidityPoolContextProvider>
				<Layout>
					<div className="mx-auto max-w-screen-2xl py-6 text-white">
						<div className="grid lg:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-12">
							<div className="col-span-1">
								<div className="cursor-disabled rounded-xl bg-gradient-to-b from-purple-700 to-emerald-500  border-4 border-zinc-800 shadow-lg shadow-zinc-800">
									<Vault title="ETH RANGE" />
								</div>
							</div>

							<div className="col-span-1">
								<div className="cursor-disabled rounded-xl bg-gradient-to-b from-purple-700 to-emerald-500 border-4  border-zinc-800 shadow-lg shadow-zinc-800">
									<Vault title="ETH RANGE" />
								</div>
							</div>

							<div className="col-span-1">
								<div className="cursor-disabled rounded-xl bg-gradient-to-b from-orange-400 to-orange-700 border-4 border-zinc-800 shadow-lg shadow-zinc-800">
									<Vault title="BTC RANGE" />
								</div>
							</div>

							<div className="col-span-1">
								<div className="cursor-disabled rounded-xl bg-gradient-to-b from-orange-400 to-orange-700 bg-emerald-500 border-4 border-zinc-800 shadow-lg shadow-zinc-800">
									<Vault title="BTC RANGE" />
								</div>
							</div>

							{/* <div className="col-span-1">
								<div className="cursor-pointer rounded-sm border border-zinc-800 shadow-lg shadow-zinc-800">
									<Vault title="ETH OUT" />
								</div>
							</div> */}

							{/* <div className="col-span-1 border-zinc-800 p-4">
              Delta Neutral Vault (Perps and Options)
              <h2>Spread Liquidity Pool</h2>

            </div>

            <div className="col-span-1 border-zinc-800 p-4">
              Pool using spreads
            </div> */}
						</div>
					</div>
				</Layout>
			</SpreadLiquidityPoolContextProvider>
		</div>
	);
};

export default Builder;
