import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import Navigation from "../components/Navigation";
import { RangeSlider } from "../components/RangeSlider";
import { useEffect, useState } from 'react';
import {BacktestChart, BacktestProps, BacktestPropsValues} from "../components/BacktestChart";
import { Switch } from '@headlessui/react'
import { number } from "zod";

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
    step: .5,
    max: 5
  }
]

type StrategyProps = {
  [key: string]: number; 
}

interface VaultStrategyProps extends StrategyProps {
  vaultFunds: number;
  collateralPercent: number;
}

interface StrikeStrategyProps extends StrategyProps {
  targetDelta: number;
  maxDeltaGap: number;
  optionType: number;
}

interface HedgeStrategyProps extends StrategyProps {
  hedgePercentage: number;
  maxHedgeAttempts: number;
  leverageSize: number;
}

const Backtest: NextPage = () => {

  const [loading, setLoading] = useState(false);

  const vsStrategy: VaultStrategyProps = {
    vaultFunds: 1000, 
    collateralPercent: 1
  }
  const [vaultStrategy, setVaultStrategy] = useState(vsStrategy);
  const _setVaultStrategy = (id: string, value: number) => {
    setVaultStrategy(_vaultStrategy => ({
      ..._vaultStrategy, 
      [id]: value
    }))
  }

  const sStrategy: StrikeStrategyProps = {
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

  const hStrategy: HedgeStrategyProps = {
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
  ];
  
  const [enabled, setEnabled] = useState(false); // false is sell put
  const [optionType, setOptionType] = useState(3); // sell put

  useEffect(() => {
    if(enabled) {
      setOptionType(4); 
    } else {
      setOptionType(3);
    }
  }, [enabled]);

  const backtestMutation = trpc.useMutation(["backtest"]);

  const runTest = () => {
    try {
      console.log({ optionType, vaultStrategy, strikeStrategy, hedgeStrategy })
      backtestMutation.mutate({
        isCall: enabled, 
        vaultStrategy, 
        strikeStrategy: { ...strikeStrategy, optionType }, 
        hedgeStrategy
      });
      setLoading(true); 
    } catch (error) {
      console.log({ error });
    }
  }

  const _chartData: BacktestPropsValues[] = [{
    boardId: 0, 
    strikeId: 0,
    startdate: 0,
    expiryDate: 0,
    totalFundsStartWithoutHedge: 0,
    totalFundsEndWithoutHedge: 0,
    totalFundsStartWithHedge: 0,
    totalFundsEndWithHedge: 0,
    premium: 0,
    size: 0,
    startingDelta: 0,
    strikePrice: 0,
    spotPriceStart: 0,
    spotPriceEnd : 0,
  }];
  const [chartData, setChartData] = useState(_chartData);
  const [stat, setStat] = useState({ noHedge: 0, hedge: 0 });

  useEffect(() => {
    if(backtestMutation.status) {
      const status = backtestMutation.status; 
      if(status == 'success') {
        setLoading(false); 
        const aprs = backtestMutation.data.aprs; 
        setChartData(aprs.strikesTraded); 
        setStat({ noHedge: aprs.aprNoHedge.sETH.apr, hedge: aprs.aprHedge.sETH.apr }); 

      }
    }
  }, [backtestMutation.status])

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
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

              <li key={'optionType'} className="px-6 py-4">

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-xs font-bold text-white" passive>
                    Option Type
                  </Switch.Label>
                  <Switch.Description as="span" className="text-xs text-white">
                    { optionType == 3 ? 'Sell Put' : 'Sell Call' }
                  </Switch.Description>
                </span>
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  className={classNames(
                    enabled ? 'bg-green' : 'bg-dark-gray',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      enabled ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>

              </li>
                    
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
          
            <button onClick={() => runTest()} className="btn w-full h-12 bg-green text-black font-sans font-bold">

              {              
                loading ?
                  <>
                  <svg role="status" className="inline mr-3 w-4 h-4 text-black animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                  </svg>
                  Loading...
                  </> :
                  <>Test Strategy</>
              }

            </button> 

          </div>

        </div>
        <div className="flex-1 w-32 p-4">

          <div>
          <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div key={'nohedge'} className="px-4 py-5 border border-1 border-dark-gray overflow-hidden sm:p-6">
                  <dt className="text-xs font-serif font-bold text-white truncate">No Hedge APR</dt>
                  <dd className="mt-1 text-3xl font-light font-sans text-white">{stat.noHedge.toFixed(2)}%</dd>
                </div>
                <div key={'hedge'} className="px-4 py-5 border border-1 border-dark-gray overflow-hidden sm:p-6">
                  <dt className="text-xs font-serif font-bold text-white truncate">Hedge APR</dt>
                  <dd className="mt-1 text-3xl font-light font-sans text-white">{stat.hedge.toFixed(2)}%</dd>
                </div>
                <div key={'nohedge'} className="px-4 py-5 border border-1 border-dark-gray overflow-hidden sm:p-6">
                  <dt className="text-xs font-serif font-bold text-white truncate">No Hedge APR</dt>
                  <dd className="mt-1 text-3xl font-light font-sans text-white">{stat.noHedge.toFixed(2)}%</dd>
                </div>
                <div key={'hedge'} className="px-4 py-5 border border-1 border-dark-gray overflow-hidden sm:p-6">
                  <dt className="text-xs font-serif font-bold text-white truncate">Hedge APR</dt>
                  <dd className="mt-1 text-3xl font-light font-sans text-white">{stat.hedge.toFixed(2)}%</dd>
                </div>
            </dl>
          </div> 
          <div className="mt-4 px-4 py-5 border border-1 border-dark-gray overflow-hidden sm:p-6">
            <BacktestChart data={chartData} />
          </div>
        </div>
      </div>
      </div>
      </section>
    </div>
  );
};

export default Backtest;
