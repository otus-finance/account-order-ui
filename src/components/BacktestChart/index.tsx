// @ts-nocheck
import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export type BacktestProps = {
  data: [BacktestPropsValues]
}

export type BacktestPropsValues = {
  [key: string]: number; 
}

const CustomTooltip = ({ active, payload, label }) => {
  console.log({ active, payload, label })
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-1 border-gray text-white font-serif p-4">
        {
          payload.map(pay => {

            const { dataKey } = pay;  

            if(dataKey == 'totalFundsEndWithHedge') {

              return (
                <div className='mb-2'>
                  <span className='underline pb-2'>{pay.name}</span>
                  <p className="font-serif font-bold font-xs">Premium: {pay.payload.premium}</p>
                  <p className="font-serif font-xs">Strike Price: {pay.payload.strikePrice}</p>
                  <p className="font-serif font-xs">Size: {pay.payload.size}</p>
                  <p className="font-serif font-xs">Delta: {pay.payload.delta}</p>
                  <p className="font-serif font-xs">Recovered Profit: {pay.payload.recoveredProfit}</p>
                </div>
              )

            } else {

              return (
                <div className='mb-2'>
                  <span className='underline pb-2'>{pay.name}</span>
                  <p className="font-serif font-bold font-xs">Premium: {pay.payload.premiumNoHedge}</p>
                  <p className="font-serif font-xs">Strike Price: {pay.payload.strikePrice}</p>
                  <p className="font-serif font-xs">Size: {pay.payload.sizeNoHedge}</p>
                  <p className="font-serif font-xs">Delta: {pay.payload.delta}</p>
                </div>
              )

            }


          })
        }
      </div>
    );
  }
}

export const BacktestChart = ({ data }: any) => {
    console.log({ data })
    return (
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="expiryDate" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="totalFundsEndWithHedge" stroke="#fff" name='Funds with Hedge' />
          <Line type="monotone" dataKey="totalFundsEndWithoutHedge" stroke="#333" name='Funds Without Hedge' />
        </LineChart>
    );
}
