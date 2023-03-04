import type { NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import { BuilderContextProvider } from '../context/BuilderContext'
import { OptionsBuilder } from '../components/Builder'

const Builder: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Otus Finance: Decentralized Options Vaults</title>
        <meta name="descript ion" content="Decentralized Options Vaults" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto max-w-7xl py-6 text-white">
        <BuilderContextProvider>
          <OptionsBuilder />
        </BuilderContextProvider>
      </div>

    </div>
  )
}

export default Builder
