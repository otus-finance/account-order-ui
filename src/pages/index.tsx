import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Otus Finance</title>
        <meta name="description" content="Otus Finance Build and Manage Options Vaults" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="relative w-full bg-white tails-selected-element">
        <div className="relative z-50 w-full h-24">
            <div className="container flex items-center justify-center h-full max-w-6xl px-8 mx-auto sm:justify-between xl:px-0">

                <Link href="/" className="relative flex items-center inline-block h-5 h-full font-black leading-none">
                    <span className="ml-3 text-xl text-gray-800">tails<span className="text-indigo-600" data-primary="indigo-600">.</span></span>
                </Link>

                <div className="absolute left-0 flex-col items-center justify-center hidden w-full pb-8 mt-48 border-b border-gray-200 md:relative md:w-auto md:bg-transparent md:border-none md:mt-0 md:flex-row md:p-0 md:items-end md:flex md:justify-between">
                    <Link href="#_" className="relative z-40 px-3 py-2 mr-0 text-sm font-bold text-indigo-600 md:px-5 sm:mr-3 md:mt-0" data-primary="indigo-600">Login</Link>
                    <Link href="#_" className="relative z-40 inline-block w-auto h-full px-5 py-3 text-sm font-bold leading-none text-white transition-all transition duration-100 duration-300 bg-indigo-600 rounded shadow-md fold-bold sm:w-full lg:shadow-none hover:shadow-xl" data-primary="indigo-600" data-rounded="rounded">Get Started</Link>

                </div>

                <div className="absolute top-0 right-0 z-50 block w-6 mt-8 mr-10 cursor-pointer select-none md:hidden sm:mt-10">
                    <span className="block w-full h-1 mt-2 duration-200 transform bg-gray-800 rounded-full sm:mt-1"></span>
                    <span className="block w-full h-1 mt-1 duration-200 transform bg-gray-800 rounded-full"></span>
                </div>

            </div>
        </div>

        <div className="relative items-center justify-center w-full overflow-x-hidden lg:pb-40 sm:pt-8 md:pt-12">
            <div className="container flex flex-col items-center justify-between h-full max-w-6xl px-8 mx-auto lg:flex-row xl:px-0">
            <div className="w-full py-20 pl-10 pr-10 lg:w-5/12 lg:py-32 lg:pr-0 tails-selected-element">
                <h1 className="text-5xl font-black leading-tight text-black sm:text-6xl lg:pr-10">
                    <span className="relative inline-block">TailwindCSS
                        <svg className="absolute w-full h-auto -mt-3 text-yellow-200 stroke-current" viewBox="0 0 554 43" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" strokeWidth="5" strokeLinecap="round"><path d="M4.533 20.643s347.445-16.108 542.096 6.73M2.622 19.54S354.53 8.562 550.46 33.753"></path></g>
            </svg>
                    </span>
                    <span className="block">designs for your app.</span>
                </h1>
                <p className="mt-5 text-lg text-gray-500 sm:text-xl lg:pr-10">An awesome collection of designs that will help you tell your story.</p>
                <form className="flex justify-between w-full p-1 mt-12 border-2 border-black rounded">
                    <input type="text" className="flex-1 w-auto pl-2 text-sm text-gray-400 outline-none focus:outline-none" placeholder="Enter Your Email" />
                    <button type="submit" className="px-6 py-2 text-sm text-white bg-red-400 rounded">Get Started</button>
                </form>
                <div className="flex pt-4 space-x-1 text-xs text-gray-600 sm:space-x-3">
                    <span className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Live Chat
                    </span>
                    <span className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        24/7 Support
                    </span>
                    <span className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        14-day Free Trial
                    </span>
                </div>
        </div>
                <div className="relative z-50 flex flex-col items-end justify-center w-full h-full lg:w-1/2 lg:pl-10">
                    <div className="container relative left-0 w-full max-w-4xl lg:absolute lg:w-screen">
                        <Image src="https://cdn.devdojo.com/images/december2020/dashboard-dmm.jpeg" layout='fill' className="w-full h-auto mt-20 mb-20 ml-0 shadow-2xl rounded-xl lg:mb-0 lg:h-full xl:-ml-12" data-rounded="rounded-xl" data-rounded-max="rounded-full" />
                    </div>
                </div>
            </div>
        </div>


      </section>
    </>
  );
};

export default Home;
