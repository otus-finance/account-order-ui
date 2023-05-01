import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import Layout from "../components/UI/Layout";
import SpreadLiquidityPool from "../components/Vaults/SpreadLiquidityPool";
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
					<div className="mx-auto max-w-screen-2xl py-0 sm:py-8 dark:text-white">
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2 sm:col-span-1">
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
