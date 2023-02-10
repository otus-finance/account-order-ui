import type { NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import { BuilderPNLChart } from '../../components/Builder/Chart/BuilderChart'
import { LyraMarketOptions } from '../../components/Builder/Market/SelectMarket'
import { Strikes } from '../../components/SharedBuild/Strikes'
import { SharedBuildContextProvider } from '../../context/SharedBuildContext'
import { useSharedBuild } from '../../hooks'
import { useBuilderProfitLossChart } from '../../hooks/BuilderChart'
import { ArrowSmallRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Avatar, { Cache, ConfigProvider } from 'react-avatar';

const Builder: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Otus Finance: Decentralized Options Vaults</title>
        <meta name="descript ion" content="Decentralized Options Vaults" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto max-w-6xl py-6 text-white">
        <SharedBuildContextProvider>
          <SharedOptionsBuild />
        </SharedBuildContextProvider>
      </div>

    </div>
  )
}

const SharedOptionsBuild = () => {
  const {
    errorReason,
    errorInSharedStrategy,
    markets,
    isMarketLoading,
    selectedMarket,
    selectedExpirationDate
  } = useSharedBuild();

  return <div className="grid sm:grid-cols-3 grid-cols-1 sm:gap-8">

    <div className='col-span-3 sm:col-span-1'>
      <LyraMarketOptions markets={markets} isMarketLoading={isMarketLoading} selectedMarket={selectedMarket} />
      <div className='border hover:border-emerald-700 sm:mr-4 mt-4 cursor-pointer border-zinc-700 text-sm p-2'>{selectedExpirationDate && selectedExpirationDate.name}</div>

      <Link href='/builder'>
        <a className='p-2 text-sm font-light text-white border border-zinc-700 mt-4 inline-flex'>
          <ArrowSmallRightIcon
            className="cursor-pointer h-5 w-4 font-bold text-emerald-700 rounded-2xl "
            aria-hidden="true"
          />
          <span className='pl-2'>Build Your own Strategy</span>
        </a>
      </Link>
    </div>

    {
      errorInSharedStrategy ?
        <div className='col-span-3 sm:col-span-3 border border-zinc-700 p-4'>
          <span className='text-sm text-rose-500'>Error in shared strategy: {errorReason}</span>
        </div> :
        <>
          <Strikes />
          <Chart />
        </>

    }

  </div>
}

const Chart = () => {

  const { selectedMarket, strikes, currentPrice, errorInSharedStrategy } = useSharedBuild();

  const chartData = useBuilderProfitLossChart(selectedMarket?.name, currentPrice, strikes);
  return <div className='col-span-3 sm:col-span-3 mt-8'>
    {
      chartData.length > 0 && currentPrice > 0 && !errorInSharedStrategy && <BuilderPNLChart currentPrice={currentPrice} data={chartData} />
    }

    {
      errorInSharedStrategy && <div className='p-6 text-sm font-semibold'>Strategy not available for asset, expiration and for the strikes available on lyra.finance</div>
    }
  </div>
}

export default Builder
