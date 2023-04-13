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
					<div className="mx-auto max-w-screen-2xl py-14 text-white h-[70vh]">
						<div className="grid grid-cols-5 gap-4">
							<div className="sm:col-start-2 sm:col-span-3 col-span-5">
								<SpreadLiquidityPool />
							</div>
						</div>
					</div>
				</Layout>
			</SpreadLiquidityPoolContextProvider>
		</div>
	);
};

export default Builder;
