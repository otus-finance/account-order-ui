import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import Layout from "../components/UI/Layout";
import { AdminContextProvider } from "../context/Admin/AdminContext";
import { Admin } from "../components/Admin";

const Builder: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Otus Finance: Spread Options Trading, Limit Orders and Vaults</title>
				<meta name="description" content="Spread Options Trading, Limit Orders and Vaults" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AdminContextProvider>
				<Layout>
					<div className="mx-auto max-w-screen-2xl py-0 sm:py-10 dark:text-white min-h-[76vh]">
						<Admin />
					</div>
				</Layout>
			</AdminContextProvider>
		</div>
	);
};

export default Builder;
