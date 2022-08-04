import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Navigation from "../components/Navigation";
import { RangeSlider } from "../components/RangeSlider";
import { useState } from 'react';
import {BacktestChart} from "../components/BacktestChart";

type SliderProp = {
  id: string; 
  title: string; 
  min: number; 
  step: number;
  max: number;
}

const vaultStrategySliders: SliderProp[] = [
  {
    id: 'vaultFunds', 
    title: 'Vault Funds',
    min: 1000,
    step: 1000,
    max: 100000
  },
  {
    id: 'collateralPercent', 
    title: 'Collateral Percent',
    min: 0,
    step: .1,
    max: 1
  }
]; 

const strikeStrategySliders: SliderProp[] = [
  {
    id: 'targetDelta', 
    title: 'Target Delta',
    min: -1,
    step: .1,
    max: 1
  },
  {
    id: 'maxDeltaGap', 
    title: 'Max Delta Gap',
    min: 0,
    step: .1,
    max: 1
  }
]

const hedgeStrategySliders: SliderProp[] = [
  {
    id: 'hedgePercentage', 
    title: 'Hedge Percentage',
    min: 0,
    step: .1,
    max: .5
  },
  {
    id: 'maxHedgeAttempts', 
    title: 'Max Hedge Attempts',
    min: 0,
    step: 1,
    max: 10
  },
  {
    id: 'leverageSize', 
    title: 'Leverage Size',
    min: 0,
    step: 1,
    max: 5
  }
]

type StrategyProps = {
  [key: string]: number; 
}

const Backtest: NextPage = () => {

  const vsStrategy: StrategyProps = {
    collateralPercent: 100
  }
  const [vaultStrategy, setVaultStrategy] = useState(vsStrategy);
  const _setVaultStrategy = (id: string, value: number) => {
    setVaultStrategy(_vaultStrategy => ({
      ..._vaultStrategy, 
      [id]: value
    }))
  }

  const sStrategy: StrategyProps = {
    targetDelta: .5, 
    maxDeltaGap: .5, 
    optionType: 3 // sell call 4 sell put
  }
  const [strikeStrategy, setStrikeStrategy] = useState(sStrategy)
  const _setStrikeStrategy = (id: string, value: number) => {
    setStrikeStrategy(_strikeStrategy => ({
      ..._strikeStrategy, 
      [id]: value
    }))
  }

  const hStrategy: StrategyProps = {
    hedgePercentage: 0,
    maxHedgeAttempts: 5,
    leverageSize: 5
  }
  const [hedgeStrategy, setHedgeStrategy] = useState(hStrategy);
  const _setHedgeStrategy = (id: string, value: number) => {
    setHedgeStrategy(_hedgeStrategy => ({
      ..._hedgeStrategy, 
      [id]: value
    }))
  }

  const stats = [
    {
      name: 'APR',
      stat: '-10%'
    },
    {
      name: 'APR with Hedging',
      stat: '18%'
    },
    {
      name: 'Earnings',
      stat: '$2000'
    }
  ]

  const backtestQuery = trpc.useMutation(["backtest"]);

  const runTest = async () => {
    try {
      const aprs = await backtestQuery.mutate({vaultStrategy, strikeStrategy, hedgeStrategy});
      console.log({ aprs });
    } catch (error) {
      console.log({ error });
    }
  }

  return (
    <div className="h-full bg-black">
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
        <div className="flex-1 w-64 p-4">
          <div className="mt-4 border border-1 border-dark-gray px-4 py-5 sm:px-6">
            <h3 className="font-serif text-sm leading-6 font-bold text-white">Vault Strategy</h3>
            <div className="bg-black overflow-hidden mt-4">
              <ul role="list" className="divide-y divide-dark-gray">
                {vaultStrategySliders.map((slider: SliderProp) => (
                  <li key={slider.id} className="px-6 py-4">
                    
                    <RangeSlider 
                      title={slider.title} 
                      min={slider.min} 
                      max={slider.max}
                      step={slider.step}
                      value={vaultStrategy[slider.id] || slider.min} 
                      setValue={(value) => _setVaultStrategy(slider.id, value)} 
                    />


                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 border border-1 border-dark-gray px-4 py-5 sm:px-6">
            <h3 className="font-serif text-sm leading-6 font-bold text-white">Strike Strategy</h3>
            <div className="bg-black overflow-hidden mt-4">
              <ul role="list" className="divide-y divide-dark-gray">
                {strikeStrategySliders.map((slider: SliderProp) => (
                  <li key={slider.id} className="px-6 py-4">
                    
                    <RangeSlider 
                      title={slider.title} 
                      min={slider.min} 
                      max={slider.max}
                      step={slider.step}
                      value={strikeStrategy[slider.id] || slider.min} 
                      setValue={(value) => _setStrikeStrategy(slider.id, value)} 
                    />


                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 border border-1 border-dark-gray px-4 py-5 sm:px-6">
            <h3 className="font-serif text-sm leading-6 font-bold text-white">Hedge Strategy</h3>
            <div className="bg-black overflow-hidden mt-4">
              <ul role="list" className="divide-y divide-dark-gray">
                {hedgeStrategySliders.map((slider: SliderProp) => (
                  <li key={slider.id} className="px-6 py-4">
                    
                    <RangeSlider 
                      title={slider.title} 
                      min={slider.min} 
                      max={slider.max}
                      step={slider.step}
                      value={hedgeStrategy[slider.id] || slider.min} 
                      setValue={(value) => _setHedgeStrategy(slider.id, value)} 
                    />


                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 border border-1 border-dark-gray px-4 py-5 sm:px-6">
          
            <button onClick={() => runTest()} className="btn w-full h-6 bg-green text-black font-sans font-bold">Test Strategy</button> 

          </div>

        </div>
        <div className="flex-1 w-32 p-4">

          <div>
          <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.name} className="px-4 py-5 border border-1 border-dark-gray overflow-hidden sm:p-6">
                  <dt className="text-xs font-serif font-bold text-white truncate">{item.name}</dt>
                  <dd className="mt-1 text-3xl font-light font-sans text-white">{item.stat}</dd>
                </div>
              ))}
            </dl>
          </div> 
          <div className="mt-4 px-4 py-5 border border-1 border-dark-gray overflow-hidden sm:p-6">

          <BacktestChart />
          </div>
        </div>
      </div>
      </div>
      </section>
    </div>
  );
};

export default Backtest;
