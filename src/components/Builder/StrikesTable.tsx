import React from 'react'
import { formatUSD, formatNumber, formatPercentage, fromBigNumber, toBN } from '../../utils/formatters/numbers'
import { DebounceInput } from 'react-debounce-input';
import { LyraStrike } from '../../queries/lyra/useLyra';

export const StrikesTable = ({ strikes, setStrikeSize }: { strikes: LyraStrike[], setStrikeSize: any }) => {

  return <table className="min-w-full divide-y divide-zinc-700 ">
    <thead className="bg-zinc-800">
      <tr>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
          <span className="sr-only">Option Type</span>
        </th>
        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-light uppercase text-white sm:pl-6">
          Strike
        </th>
        <th
          scope="col"
          className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell"
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
        <th scope="col" className="hidden px-3 py-3.5 text-left text-xs font-light uppercase text-white sm:table-cell">
          Credit/(Debit)
        </th>
        <th scope="col" className="relative py-3.5">
          <span className="sr-only">Price</span>
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-700 bg-zinc-800">
      {strikes.map((strike: LyraStrike) => {
        const { strikePrice, iv, vega, gamma, quote, id, isCall, market, __board: { expiryTimestamp } } = strike;
        const { size, premium, pricePerOption, isBuy, greeks } = quote;

        const { delta, theta } = greeks;
        return <tr key={id}>
          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
            {isBuy ? <span className='text-zinc-100 font-light p-1'>Buy</span> : <span className='text-zinc-100 font-light p-1'>Sell</span>}
            {isCall ? <span className='text-emerald-700 font-light p-1 block'>Call</span> : <span className='text-pink-700 font-light p-1 block'>Put</span>}
          </td>
          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-zinc-200 sm:pl-6">
            {formatUSD(fromBigNumber(strikePrice))}
          </td>
          <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
            {formatPercentage(fromBigNumber(iv))}
          </td>
          <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
            {formatNumber(fromBigNumber(vega), { maxDps: 2 })}
          </td>
          <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
            {formatNumber(fromBigNumber(theta), { maxDps: 2 })}
          </td>
          <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
            {formatNumber(fromBigNumber(delta), { maxDps: 2 })}
          </td>
          <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
            {formatNumber(fromBigNumber(gamma), { maxDps: 4 })}
          </td>
          <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              onChange={(e) => {
                const value = e.target.value;
                setStrikeSize({ size: value ? value : '0', strike: strike });
              }}
              className="p-1 border border-zinc-700 bg-zinc-800 w-16" type='number' value={fromBigNumber(size)}
            />
          </td>
          <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-zinc-200 sm:table-cell">
            {isCreditOrDebit(isBuy, formatUSD(fromBigNumber(premium)))}
          </td>
          <td className="whitespace-nowrap py-4 pl-3 pr-4 text-center text-xs font-medium sm:pr-6 flex">
            <a target='_blank' rel="noreferrer" href={`https://app.lyra.finance/#/trade/s${market.toLowerCase()}-susd?expiry=${expiryTimestamp}`} className="border-2 border-emerald-700 text-emerald-700 font-medium w-full rounded-lg p-2 inline hover:bg-zinc-900">
              <span className='content-center'>
                {formatUSD(fromBigNumber(pricePerOption))}
              </span>
            </a>
          </td>
        </tr>
      })}
    </tbody>
  </table>

}

const isCreditOrDebit = (isBuy: boolean, usd: string): string => {
  return isBuy ? `(${usd})` : usd
}