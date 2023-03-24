import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { BuilderContextProvider } from "../context/BuilderContext";
import { OptionsBuilder } from "../components/Builder";
import Layout from "../components/UI/Layout";
import LiquidityPool from "../components/Vaults/liquidityPool";
import { toBN } from "../utils/formatters/numbers";
import { SpreadLiquidityPoolContextProvider } from "../context/SpreadLiquidityPoolContext";

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
						<div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-12">
							<div className="col-span-1">
								<div className="cursor-pointer rounded-sm border border-zinc-800 shadow-lg ">
									<LiquidityPool
										pool={{
											id: "1",
											isActive: true,
											totalDeposits: toBN("0"),
											quoteAsset: "USD",
											vaultCap: toBN("0"),
										}}
									/>
								</div>
							</div>

							<div className="col-span-1">
								<div className="cursor-pointer rounded-sm border border-zinc-800 shadow-lg "></div>
							</div>

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
