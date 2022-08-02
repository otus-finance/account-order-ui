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

      <div className="overflow-hidden w-full leading-6 text-black" id="#top">
        <div className="absolute w-screen text-black bg-scroll bg-white bg-repeat"></div>

        <div className="overflow-visible pt-8 mx-auto text-black">
          <header
            className="flex justify-between items-center px-4 text-gray-800 xl:px-16"
          >
            <div className="flex items-center w-1/3">
              <img
                src="https://usewindy.com/img/logo.svg"
                alt="Windy"
                className="block mr-3 w-10 max-w-full h-auto align-middle"
              />
              <p className="m-0 text-3xl font-bold leading-9">Windy</p>
            </div>

            <a
              className="hidden justify-center items-center w-1/3 text-sm leading-5 cursor-pointer lg:flex"
              href="https://beyondco.de/"
              target="_blank"
            >
              <span className="">A product by</span>
              <img
                className="block ml-2 max-w-full h-6 align-middle"
                src="https://usewindy.com/img/bc_logo_full.svg"
                alt="Beyond Code"
              />
            </a>

            <nav className="hidden justify-end w-1/3 text-base md:flex">
              <a href="#features" className="cursor-pointer">Features</a>
              <a className="px-10 cursor-pointer" href="#pricing">Pricing</a>
            </nav>
          </header>

          <main
            className="flex relative justify-between px-4 mt-16 lg:items-center xl:px-16"
          >
            <div className="w-full xl:pr-16 sm:pr-4 sm:w-1/2">
              <h1
                className="mx-0 mt-0 mb-4 text-4xl font-bold leading-10 text-gray-800 lg:text-6xl lg:leading-none lg:mt-0 sm:text-5xl sm:leading-none md:text-5xl md:leading-none md:mt-32"
              >
                Discover the wonder of Windy
              </h1>

              <p className="m-0 text-lg leading-7 text-blue-900">
                Speed up your workflow with Windy – the browser extension that
                transforms any HTML element into a Tailwind CSS component. Don’t waste
                another moment.
                <em className="hidden italic md:inline"> See how the magic happens. </em>
              </p>

              <div className="flex flex-col mt-8 lg:flex-row sm:items-center">
                <button
                  id="demoButton"
                  className="flex justify-center items-center py-3 px-4 my-0 mr-4 ml-0 text-base font-bold text-center text-white normal-case bg-indigo-500 bg-none rounded-lg duration-150 ease-in-out cursor-pointer shadow-xs hover:bg-indigo-500"
                >
                  Try Windy on this website
                </button>

                <a
                  href="#pricing"
                  className="hidden items-center py-3 px-4 mr-4 mb-8 text-base font-bold text-gray-800 bg-gray-200 rounded-lg duration-150 ease-in-out cursor-pointer lg:mb-0 md:flex"
                >
                  I’m sold - buy Windy
                </a>
              </div>
            </div>

            <div className="hidden overflow-visible w-1/2 sm:block">
              <div style={{width: '1248px'}} className="w-64">
                <img
                  src="https://usewindy.com/img/hero_frame.svg"
                  alt="Windy Demo on the beyondco.de Website"
                  className="block max-w-full h-auto align-middle"
                />
              </div>
            </div>
          </main>

        </div>

      </div>
    </>
  );
};

export default Home;
