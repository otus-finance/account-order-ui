import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import Layout from "../components/UI/Layout";
import SpreadLiquidityPool from "../components/Vaults/SpreadLiquidityPool";
import { SpreadLiquidityPoolContextProvider } from "../context/SpreadLiquidityPoolContext";
import Vault from "../components/Vaults/Vault";

const Builder: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Otus Finance: Spread Options Trading, Limit Orders and Vaults</title>
				<meta name="description" content="Spread Options Trading, Limit Orders and Vaults" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Layout>
				<div className="mx-auto max-w-screen-sm py-4 sm:py-24 dark:text-white min-h-[76vh]">
					<div className="grid grid-cols-4 gap-4">
						<div className="col-span-4">
							<SpreadLiquidityPoolContextProvider>
								<SpreadLiquidityPool />
							</SpreadLiquidityPoolContextProvider>
						</div>
					</div>
				</div>
			</Layout>
		</div>
	);
};

export default Builder;
