import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { BuilderContextProvider } from "../context/BuilderContext";
import { OptionsBuilder } from "../components/Builder";
import Layout from "../components/UI/Layout";

const Builder: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Otus Finance: Spread Options Trading, Limit Orders and Vaults</title>
				<meta name="description" content="Spread Options Trading, Limit Orders and Vaults" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<BuilderContextProvider>
				<Layout>
					<div className="mx-auto max-w-screen-2xl py-14 text-white ">
						<OptionsBuilder />
					</div>
				</Layout>
			</BuilderContextProvider>
		</div>
	);
};

export default Builder;
