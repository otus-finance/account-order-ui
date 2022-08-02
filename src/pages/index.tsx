import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Otus Finance</title>
        <meta name="description" content="Otus Finance Build and Manage Options Vaults" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Marketplace for Options Vault, Built on Lyra
        </h1>
        <p className="text-2xl text-gray-700">This stack uses:</p>
        <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3">

        </div>
        <div className="pt-6 text-2xl text-blue-500 flex justify-center items-center w-full">
        </div>
      </main>
    </>
  );
};