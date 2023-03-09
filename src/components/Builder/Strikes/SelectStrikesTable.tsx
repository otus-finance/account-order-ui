import React, { useEffect, useState } from 'react'
import { formatUSD, formatNumber, formatPercentage, fromBigNumber, toBN } from '../../../utils/formatters/numbers'
import { LyraStrike } from '../../../queries/lyra/useLyra';
import { BuilderType, OptionType } from '../../../utils/types';
import { motion, AnimatePresence } from "framer-motion"
import { calculateOptionType } from '../../../utils/formatters/optiontypes';
import { useBuilderContext } from '../../../context/BuilderContext';
import { SelectBuilderExpiration } from '../Strategy/SelectExpiration';

const style = 'border-2 cursor-pointer text-white-700 rounded-full bg-zinc-900 text-center w-24 px-6 p-2 mr-1 text-sm font-light'

type SelectedStrike = {
  id: number,
  isCall: boolean,
  isBuy: boolean;
}

export const SelectStrikesTable = () => {

  const { builderType, strikes, selectedExpirationDate, handleToggleSelectedStrike } = useBuilderContext();

  const [availableStrikes, setAvailableStrikes] = useState<LyraStrike[] | undefined>([]);

  const [isBuy, setIsBuy] = useState(false);
  const [isCall, setIsCall] = useState(false);
  const [optionType, setOptionType] = useState<OptionType>(0);

  useEffect(() => {
    setOptionType(calculateOptionType(isBuy, isCall));
  }, [isBuy, isCall, optionType])

  useEffect(() => {
    if (selectedExpirationDate) {
      const { strikesByOptionTypes } = selectedExpirationDate;
      if (strikesByOptionTypes && strikesByOptionTypes[optionType]) {
        const _strikes = strikesByOptionTypes[optionType];
        setAvailableStrikes(_strikes);
      }
    }
  }, [selectedExpirationDate, optionType]);

  const [selectedStrikeIds, setSelectedStrikeIds] = useState<SelectedStrike[]>([]);

  useEffect(() => {
    setSelectedStrikeIds(strikes.map(({ id, isCall, quote: { isBuy } }: { id: number, isCall: boolean, quote: { isBuy: boolean } }) => {
      return { id, isCall, isBuy }
    }))
  }, [strikes])

  return <div className='grid grid-cols-1 sm:grid-cols-4'>
    <div className='flex justify-between mt-6'>

      <div onClick={() => setIsBuy(true)} className={`${isBuy ? 'border-emerald-600 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-700'} ${style}`}>
        Buy
      </div>
      <div onClick={() => setIsBuy(false)} className={`${!isBuy ? 'border-emerald-600 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-700'} ${style}`}>
        Sell
      </div>
      <div onClick={() => setIsCall(true)} className={`${isCall ? 'border-emerald-600 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-700'} ${style} ml-2`}>
        Call
      </div>
      <div onClick={() => setIsCall(false)} className={`${!isCall ? 'border-emerald-600 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-700'} ${style}`}>
        Put
      </div>

      {
        builderType === BuilderType.Custom &&
        <div className=''>
          <SelectBuilderExpiration />
        </div>
      }

    </div>

    <div className='col-span-4 mt-4 mb-4'>
      <table className="min-w-full divide-y divide-zinc-700 ">
        <thead className="bg-zinc-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-light uppercase text-white sm:pl-6">
              Strike
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-xs font-light uppercase text-white"
            >
              IV
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
            >
              Vega
            </th>
            <th scope="col" className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell">
              Theta
            </th>
            <th scope="col" className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell">
              Delta
            </th>
            <th scope="col" className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell">
              Gamma
            </th>
            <th scope="col" className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell">
              Size
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-light uppercase text-white">
              Credit/(Debit)
            </th>
            <th scope="col" className="relative py-3.5">
              <span className="sr-only">Price</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700 bg-zinc-800">
          <AnimatePresence>
            {availableStrikes && availableStrikes.map((strike: LyraStrike) => {
              {/* @ts-ignore */ }
              const { strikePrice, iv, vega, gamma, quote, id, isCall, market, __board: { expiryTimestamp } } = strike;
              const { size, premium, pricePerOption, isBuy, greeks } = quote;

              const { delta, theta } = greeks;
              return <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={id}>
                <td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
                  {formatUSD(fromBigNumber(strikePrice))}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-200">
                  {formatPercentage(fromBigNumber(iv))}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
                  {formatNumber(fromBigNumber(vega), { maxDps: 2 })}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
                  {formatNumber(fromBigNumber(theta), { maxDps: 2 })}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
                  {formatNumber(fromBigNumber(delta), { maxDps: 2 })}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
                  {formatNumber(fromBigNumber(gamma), { maxDps: 4 })}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 text-xs text-zinc-200 sm:table-cell">
                  {fromBigNumber(size)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-200">
                  {isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium)))}
                </td>
                <td className="whitespace-nowrap py-2 pl-3 pr-4 text-center text-xs font-medium sm:pr-6 flex">
                  {
                    selectedStrikeIds.filter((selected: SelectedStrike) => {
                      if (selected.id == id) {
                        return selected.isBuy == isBuy && selected.isCall == isCall
                      }
                      return false;
                    }).length > 0 ?
                      <a onClick={() => handleToggleSelectedStrike(strike, false)} className="cursor-pointer text-white font-medium w-full rounded-full p-2 inline border-2 border-emerald-600 hover:border-emerald-600 hover:bg-zinc-800 bg-zinc-800">
                        <span className='content-center'>
                          Remove
                        </span>
                      </a> :
                      <a onClick={() => handleToggleSelectedStrike(strike, true)} className="cursor-pointer text-white font-medium w-full rounded-full p-2 inline border-2 border-zinc-900 hover:border-emerald-600 hover:bg-zinc-800 bg-zinc-800">
                        <span className='content-center'>
                          Select
                        </span>
                      </a>
                  }

                </td>
              </motion.tr>
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  </div>

}

const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
  return isBuy ? `(${usd})` : usd
}