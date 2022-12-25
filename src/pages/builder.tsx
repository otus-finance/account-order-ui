import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { BuilderPNLChart } from '../components/Builder/BuilderChart'
import { MarketDetails } from '../components/Builder/MarketDetails'
import { SelectDirectionType } from '../components/Builder/SelectDirectionType'
import { SelectBuilderExpiration } from '../components/Builder/SelectExpiration'
import { LyraMarketOptions } from '../components/Builder/SelectMarket'
import { SelectStrikesTable } from '../components/Builder/SelectStrikesTable'
import { Strategies, strategies } from '../components/Builder/Strategies'
import { StrikesTable } from '../components/Builder/StrikesTable'
import { Strategy, StrategyDirection } from '../components/Builder/types'
import { Spinner } from '../components/UI/Components/Spinner'

import LyraIcon from '../components/UI/Icons/Color/LYRA'
import { useBuilderProfitLossChart } from '../hooks/Builder'
import { useLyraMarket, LyraMarket, LyraStrike, useLyra, getStrikeQuote } from '../queries/lyra/useLyra'
import { formatUSD, fromBigNumber, toBN } from '../utils/formatters/numbers'
import { motion } from "framer-motion"

type StrikeSizeUpdate = {
  size: string,
  strike: LyraStrike
}

const Builder: NextPage = () => {

  const { query: { expiration, strategy } } = useRouter();

  const lyra = useLyra();

  const [selectedMarket, setSelectedMarket] = useState<LyraMarket | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const [selectedDirectionTypes, setSelectedDirectionTypes] = useState<StrategyDirection[]>([]);
  const [selectedExpirationDate, setSelectedExpirationDate] = useState<any>(null);

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [strikes, setStrikes] = useState<any>([]);

  const { data, isLoading: isMarketLoading } = useLyraMarket();

  useEffect(() => {
    if (selectedMarket != null && selectedMarket.spotPrice) {
      setStrikes([])
      setCurrentPrice(fromBigNumber(selectedMarket.spotPrice))
      setSelectedExpirationDate(null);
      setSelectedStrategy(null)
    }
  }, [selectedMarket]);

  const [netCreditDebit, setNetCreditDebit] = useState(null);
  const [maxProfit, setMaxProfit] = useState(null);
  const [maxLoss, setMaxLoss] = useState(null);

  const [strikeSize, setStrikeSize] = useState<StrikeSizeUpdate | null>(null);

  const updateQuote = useCallback(async () => {
    if (lyra && strikeSize && strikes.length > 0) {
      const { strike: _strike, size } = strikeSize;
      const { id: _id, quote, isCall } = _strike;
      const { isBuy } = quote;

      const _quote = await getStrikeQuote(lyra, isCall, isBuy, toBN(size), _strike);

      const _updateStrikes = strikes.map((strike: LyraStrike) => {
        const { id } = strike;
        if (id == _id) {
          return { ...strike, quote: _quote }
        } else {
          return strike;
        }

      });

      setStrikes(_updateStrikes)
    }
  }, [lyra, strikeSize, strikes])

  useEffect(() => {
    if (strikeSize != null && strikeSize.size != null && strikeSize.strike != null) {
      updateQuote()
    }

    return () => {
      setStrikeSize(null);
    }
  }, [updateQuote, strikeSize])

  const [isValid, setIsValid] = useState<boolean>(false);

  const filterStrikes = useCallback(() => {
    if (currentPrice > 0 && selectedStrategy && selectedExpirationDate) {
      const { strikesByOptionTypes } = selectedExpirationDate;
      // if a trade has 2 of same they need to be merged and include size update quote 
      const _strikes = selectedStrategy.trade.map((trade, index) => {
        const { optionType, priceAt, order } = trade;
        const _optionTypeStrikes: [] = strikesByOptionTypes[optionType];
        let found = 0;
        return _optionTypeStrikes.find(strike => {
          const { strikePrice, isCall } = strike;
          const _strikePrice = fromBigNumber(strikePrice);
          let foundMatch = extrensicValueFilter(priceAt, isCall, currentPrice || 0, _strikePrice);
          if (foundMatch && order == found) {
            return true;
          } if (foundMatch && order != found) {
            found++;
          } else {
            return false;
          }
        });

      })
      // if any _strikes are undefined, most likely strategy not valid for asset 
      if (_strikes.filter(_strike => _strike == undefined).length > 0) {
        setStrikes([]);
        setIsValid(false);
      } else {
        setStrikes(_strikes);
        setIsValid(true);
      }
    } else {
      setStrikes([])
    }
  }, [currentPrice, selectedStrategy, selectedExpirationDate])

  useEffect(() => {
    filterStrikes();
  }, [filterStrikes, currentPrice, selectedStrategy, selectedExpirationDate])

  useEffect(() => {
    if (strikes.length > 0) {
      // max profit 

      // net credit 
      const creditDebit = strikes.reduce((accum: any, strike: any) => {
        const { quote: { size, isBuy, pricePerOption } } = strike;
        const totalPriceForOptions = fromBigNumber(pricePerOption) * fromBigNumber(size);

        return isBuy ? accum - totalPriceForOptions : accum + totalPriceForOptions;
      }, 0);

      setNetCreditDebit(creditDebit);
    }
  }, [strikes])

  const chartData = useBuilderProfitLossChart(selectedMarket?.name, currentPrice, strikes);

  const [isBuildingNewStrategy, setIsBuildingNewStrategy] = useState<boolean>(false);

  const handleToggletrike = (strike: LyraStrike, select: boolean) => {

    if (select) {
      setStrikes((params: LyraStrike[]) => [...params, strike]);
    } else {
      setStrikes((params: LyraStrike[]) => {
        return params.filter(({ id }: { id: number }) => {
          return id !== strike.id;
        })
      });
    }
  }

  return (
    <div>
      <Head>
        <title>Otus Finance: Decentralized Options Vaults</title>
        <meta name="descript ion" content="Decentralized Options Vaults" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto max-w-6xl py-6 text-white">
        <div className="grid sm:grid-cols-3 grid-cols-1 sm:gap-8">

          <div className='col-span-3 sm:col-span-1 mt-4'>

            <div className='font-bold'>
              I want to see strategies for
            </div>
            {
              isMarketLoading ?
                <div className='mt-4'><Spinner /></div> :
                data && <LyraMarketOptions markets={data} selectedMarket={selectedMarket} setSelectedMarket={setSelectedMarket} />
            }

            <div className='bg-zinc-800 shadow-sm mt-6 p-4'>
              <MarketDetails market={selectedMarket} />
            </div>
          </div>

          <div className='col-span-3 sm:col-span-3 mt-4'>
            <div className='font-bold'>
              Show me strategies if my bet is the market will be
              <span>
                <div className='inline-block sm:pl-1 pr-2'>

                  <SelectDirectionType
                    selectedDirectionTypes={selectedDirectionTypes}
                    setSelectedDirectionTypes={setSelectedDirectionTypes}
                  />
                </div>
              </span>
              by
              <span>
                <div className='inline-block sm:pl-1 mt-2 sm:mt-0 min-w-full sm:min-w-min'>
                  <SelectBuilderExpiration
                    liveBoards={selectedMarket?.liveBoards || []}
                    selectedExpirationDate={selectedExpirationDate}
                    setSelectedExpirationDate={setSelectedExpirationDate}
                  />
                </div>
              </span>
            </div>

            <div className="flex flex-nowrap overflow-x-scroll mt-8 gap-6">
              <Strategies selectedDirectionTypes={selectedDirectionTypes} selectedExpirationDate={selectedExpirationDate} selectedStrategy={selectedStrategy} setSelectedStrategy={setSelectedStrategy} />
            </div>
          </div>

          <div className='col-span-3 sm:col-span-3 mt-4 grid grid-cols-6'>

            <div className="sm:col-end-7 sm:col-span-2 col-start-1 col-end-7">
              <div className="col-span-1 grid grid-cols-3 gap-3 mt-6">

                <div className="bg-zinc-800 p-4 pt-1">
                  <span className="text-xs font-light text-zinc-100">{netCreditDebit && netCreditDebit > 0 ? 'Net Credit' : 'Net (Debit)'}</span>
                  <div className='pt-4'>
                    <span className="text-base font-semibold text-white">
                      {netCreditDebit && formatUSD(Math.abs(netCreditDebit))}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-800 p-4 pt-1">
                  <span className="text-xs font-light text-zinc-100">Max Loss</span>
                  <div className='pt-4'>
                    <span className="text-base font-semibold text-white">
                      {maxLoss && formatUSD(maxLoss)}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-800 p-4 pt-1">
                  <span className="text-xs font-light text-zinc-100">Max Profit</span>
                  <div className='pt-4'>
                    <span className="text-base font-semibold text-white">
                      {maxProfit && formatUSD(maxProfit)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="sm:col-end-7 sm:col-span-2 col-start-1 col-end-7">

              <div className="col-span-1 grid grid-cols-3 gap-3 mt-2">

                {
                  selectedStrategy &&
                  <div onClick={() => setIsBuildingNewStrategy(!isBuildingNewStrategy)} className="cursor-pointer border border-zinc-800 hover:border-emerald-700 hover:bg-zinc-800 bg-zinc-900 p-2 col-span-3 font-semibold text-xs text-white text-center rounded-2xl">
                    {isBuildingNewStrategy ? 'Reset Strategy' : 'Use Strategy as Template'}
                  </div>
                }

              </div>

            </div>


            {
              selectedStrategy && isBuildingNewStrategy &&
              <motion.div className='col-span-6' animate={selectedStrategy && isBuildingNewStrategy ? "open" : "closed"} variants={{
                open: { opacity: 1, x: 0 },
                closed: { opacity: 0, x: "-100%" },
              }}>
                <SelectStrikesTable selectedExpirationDate={selectedExpirationDate} handleToggletrike={handleToggletrike} strikes={strikes} />
              </motion.div>

            }

            <div className='col-span-6 '>
              <div className="flex items-center pt-2 pb-2">
                <LyraIcon />
                <div className='pl-2 font-light text-xs uppercase'>
                  <strong> Powered by lyra.finance </strong>
                </div>
              </div>
              <StrikesTable strikes={strikes} handleToggletrike={handleToggletrike} setStrikeSize={setStrikeSize} />
            </div>

          </div>

          <div className='col-span-3 sm:col-span-3 mt-8'>
            {
              chartData.length > 0 && currentPrice > 0 && isValid && <BuilderPNLChart currentPrice={currentPrice} data={chartData} />
            }

            {
              !isValid && <div className='p-6 text-sm font-semibold'>Strategy not available for asset, expiration and for the strikes available on lyra.finance</div>
            }
          </div>

        </div>
      </div>

    </div>
  )
}

const extrensicValueFilter = (priceAt: number, isCall: boolean, currentPrice: number, strikePrice: number) => {
  if (priceAt == 0 && isOTM(isCall, currentPrice, strikePrice)) {
    return true;
  }

  if (priceAt == 1 && isITM(isCall, currentPrice, strikePrice)) {
    return true;
  }

  if (priceAt == 2 && isATM(isCall, currentPrice, strikePrice)) {
    return true;
  }

  return false;
}

const isOTM = (isCall: boolean, currentPrice: number, strikePrice: number) => {
  if (isCall) {
    return strikePrice > currentPrice;
  } else {
    return strikePrice < currentPrice;
  }
}

const isITM = (isCall: boolean, currentPrice: number, strikePrice: number) => {
  if (isCall) {
    return strikePrice < currentPrice;
  } else {
    return strikePrice > currentPrice;
  }
}

const isATM = (isCall: boolean, currentPrice: number, strikePrice: number) => {
  if (isCall) {
    return strikePrice == currentPrice;
  } else {
    return strikePrice == currentPrice;
  }
}

export default Builder
