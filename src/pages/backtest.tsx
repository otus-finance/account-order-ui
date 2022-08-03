import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Navigation from "../components/Navigation";

const Backtest: NextPage = () => {

  return (
    <>
      <Head>
        <title>Otus Finance</title>
        <meta
          name="description"
          content="Otus Finance Build and Manage Options Vaults"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <section className="relative w-full bg-black tails-selected-element">
        ttes
      </section>
    </>
  );
};

export default Backtest;
