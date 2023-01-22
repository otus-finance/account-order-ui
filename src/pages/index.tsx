import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useState } from "react";
import { Navigation } from "../components/Navigation";
import Image from 'next/image'
import IntegrationIcons from "../components/UI/Icons/Integrations";
import GMXIcon from "../components/UI/Icons/Color/GMX";
import LyraIcon from "../components/UI/Icons/Color/LYRA";

import OptimismIcon from "../components/UI/Icons/Color/OP";
import SNXIcon from "../components/UI/Icons/Color/SNX";
import ArbitrumIcon from "../components/UI/Icons/Color/ONE";

const Home: NextPage = () => {

  const [email, setEmail] = useState("");

  const registerUserMutation = trpc.useMutation(["register-user"]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    registerUserMutation.mutate({ email });
  }

  return (
    <div>
      <Head>
        <title>Otus Finance</title>
        <meta
          name="description"
          content="Otus Finance Build and Manage Options Vaults"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-6xl sm:pt-10">

        <div className="grid grid-cols-2 gap-12 pt-8 md:pt-32 pb-16">

          <div className="col-span-2 md:col-span-1">

            <h1 className="text-4xl font-sans font-semibold text-white sm:text-5xl sm:leading-[56px] lg:pr-14">
              <span className="relative inline-block">
                <div>The Community </div>
                <div>Managed Vaults</div>
                <div>Marketplace</div>
              </span>
            </h1>

            <div className="py-6">
              <p className="font-sans mt-6 text-normal font-normal text-zinc-200 lg:pr-10">
                Whitelist will open up soon get notified early!
              </p>
              <form className="flex justify-between w-full md:w-[80%] mt-4 border-1 border-white" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="flex-1 w-auto p-3 text-sm text-zinc-200 bg-zinc-800 outline-none focus:outline-none"
                  placeholder="Enter Your Email"
                />
                <button
                  type="submit"
                  className="font-sans px-6 py-2 text-sm font-bold bg-emerald-600 hover:bg-zinc-900 text-white"
                >
                  {
                    registerUserMutation.isLoading ?
                      <>
                        <svg role="status" className="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>
                        Loading...
                      </> :
                      <>
                        {
                          registerUserMutation.isSuccess ?
                            <>Subscribed!</> :
                            <>Get Notified</>
                        }
                      </>
                  }
                </button>

              </form>

              <p className="font-sans mt-2 text-sm font-normal text-uppercase text-pink-900 lg:pr-10">

                {
                  registerUserMutation.error &&
                  <p>
                    {
                      registerUserMutation.error.message
                    }
                  </p>
                }
              </p>
            </div>

          </div>

        </div>

        <div className="grid grid-cols-8 gap-4 sm:gap-12 py-4">
          <div className="sm:col-span-3 col-span-8">
            <div>
              <h1 className="text-white text-xl font-semibold">For Managers</h1>
              <p className="text-zinc-200 text-md font-normal py-4">Otus provides the tools to successfully and easily manage an asset management vault.</p>
            </div>
          </div>
          <div className="sm:col-span-3 col-span-8">
            <div>
              <h1 className="text-white text-xl font-semibold">For Investors</h1>
              <p className="text-zinc-200 text-md font-normal py-4">Invest with friends, earn rewards and join the best performing vaults.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-4 sm:gap-12 py-8 pb-16">
          <div className="col-span-4 sm:col-span-3">
            <div>
              <h1 className="text-white text-xl font-semibold">Available On</h1>
              <div className="py-4">
                <div className="flex flex-row">
                  <div className="pr-2">
                    <OptimismIcon />
                  </div>
                  <div className="px-2">
                    <ArbitrumIcon />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="col-span-4 sm:col-span-3">
            <div>
              <h1 className="text-white text-xl font-semibold">Integrations</h1>
              <div className="py-4">
                <div className="flex flex-row">
                  <div className="pr-2">
                    <GMXIcon />
                  </div>
                  <div className="px-2">
                    <SNXIcon />
                  </div>
                  <div className="px-2">
                    <LyraIcon />
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* <div className="grid grid-cols-3 gap-8 py-12">
          <div className="sm:col-span-1 col-span-3">
            <div>
              <h1 className="text-white text-xl font-semibold">Supported By</h1>
            </div>
          </div>
        </div> */}
      </div>

    </div>
  );
};

export default Home;
