import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Navigation from "../components/Navigation";

const Backtest: NextPage = () => {

  return (
    <div className="h-screen bg-black">
      <Head>
        <title>Otus Finance</title>
        <meta
          name="description"
          content="Otus Finance Build and Manage Options Vaults"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <section className="relative w-full tails-selected-element">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div className="flex">
        <div className="flex-1 w-64">
          02
        </div>
        <div className="flex-1 w-32">
          03
        </div>
      </div>
      </div>
      </section>
    </div>
  );
};

export default Backtest;
