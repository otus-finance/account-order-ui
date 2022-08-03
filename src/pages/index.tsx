import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { useRouter } from 'next/router';
import { useState } from "react";

const Home: NextPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const registerUserMutation = trpc.useMutation(["register-user"]);

  const handleSubmit = async (e: any) => {

    e.preventDefault();

    try {
      registerUserMutation.mutate({ email });
    } catch (error) {
      console.log({ error });
    }

  }

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
      <section className="relative w-full bg-black tails-selected-element">
        <div className="relative z-50 w-full h-24">
          <div className="container flex items-center justify-center h-full max-w-6xl px-8 mx-auto sm:justify-between xl:px-0">
            <Link
              href="/"
              className="relative flex items-center inline-block h-5 h-full font-black leading-none"
            >
              <span className="ml-3 text-2xl font-sans font-bold text-white">
                Otus Finance
              </span>
            </Link>

            <div className="absolute left-0 flex-col items-center justify-center hidden w-full mt-48 border-b border-gray-200 md:relative md:w-auto md:bg-transparent md:border-none md:mt-0 md:flex-row md:p-0 md:items-end md:flex md:justify-between">
              <button
                onClick={() => router.push('https://app.otus.finance')}
                className="relative z-40 inline-block w-auto h-full px-5 py-3 text-sm font-bold text-black bg-green leading-none transition-all transition duration-100 duration-300 shadow-md fold-bold sm:w-full lg:shadow-none hover:shadow-xl"
                data-primary="indigo-600"
                data-rounded="rounded"
              >
                Launch App
              </button>
            </div>

          </div>
        </div>

        <div className="relative items-center justify-center w-full overflow-x-hidden sm:pt-8 md:pt-8">
          <div className="container flex flex-col items-center justify-between h-full max-w-6xl px-8 mx-auto lg:flex-row xl:px-0">
            <div className="w-full py-20 pl-10 pr-10 lg:w-5/12 lg:py-32 lg:pr-0 tails-selected-element">
              <h1 className="text-4xl font-serif font-bold leading-tight text-white sm:text-4xl lg:pr-10">
                <span className="relative inline-block">
                  The Decentralized Options Vaults Marketplace
                </span>
                <span className="block">Built on Lyra.</span>
              </h1>
              <p className="font-sans text-md font-light text-gray sm:text-xl lg:pr-10 pt-10">
                Create or join the best performing options vaults. 
              </p>
              <p className="font-sans mt-6 text-sm font-bold text-gray lg:pr-10">
                Sign up for early access to create options vaults.
              </p>
              <form className="flex justify-between w-full mt-4 border-1 border-white" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="flex-1 w-auto pl-2 text-sm text-gray bg-dark-gray outline-none focus:outline-none"
                  placeholder="Enter Your Email"
                />
                <button
                  type="submit"
                  className="font-sans px-6 py-2 text-sm font-bold text-black bg-green"
                >
                  Get Started
                </button>
              </form>
            </div>
            <div className="relative z-50 flex flex-col items-end justify-center w-full h-full lg:w-1/2 lg:pl-10">
              <div className="container relative left-0 w-full max-w-4xl lg:absolute lg:w-screen bg-[url('https://cdn.devdojo.com/images/december2020/dashboard-dmm.jpeg')]">
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
