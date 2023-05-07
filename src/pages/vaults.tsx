import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import Layout from "../components/UI/Layout";
import SpreadLiquidityPool from "../components/Vaults/SpreadLiquidityPool";
import { SpreadLiquidityPoolContextProvider } from "../context/SpreadLiquidityPoolContext";
import Vault from "../components/Vaults/Vault";
import VaultBuild from "../components/Vaults/Build";

const Vaults: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Otus Finance: Spread Options Trading, Limit Orders and Vaults</title>
				<meta name="description" content="Spread Options Trading, Limit Orders and Vaults" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Layout>
				<div className="mx-auto max-w-screen-2xl py-0 sm:py-8 dark:text-white min-h-[70vh]">
					<div className="grid grid-cols-4 gap-4 auto-cols-max">
						<div className="col-span-4 lg:col-span-2 xl:col-span-1">
							<VaultBuild />
						</div>
					</div>
				</div>
			</Layout>
		</div>
	);
};

export default Vaults;
