import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import Layout from "../components/UI/Layout";
import SpreadLiquidityPool from "../components/Vaults/SpreadLiquidityPool";
import { SpreadLiquidityPoolContextProvider } from "../context/SpreadLiquidityPoolContext";
import VaultsList from "../components/Vaults";

const Vaults: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Otus Finance: Spread Options Trading, Limit Orders and Vaults</title>
				<meta name="description" content="Spread Options Trading, Limit Orders and Vaults" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Layout>
				<div className="mx-auto max-w-screen-3xl py-0 sm:py-10 min-h-[76vh]">
					<VaultsList />
				</div>
			</Layout>
		</div>
	);
};

export default Vaults;
