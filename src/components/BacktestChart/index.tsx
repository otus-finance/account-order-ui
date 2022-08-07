// @ts-nocheck
import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data1 = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    expiryDate: 4300,
    strikePrice: 0,
    spotPriceEnd: 0,
    amt: 2100,
  },
];

  // board1/expiry5: { 
  //   boardId (tooltip), 
  //   strikeId (tooltip),
  //   startdate (tooltip),
  //   expiryDate (graph x), 
  //   totalFundsStartWithoutHedge (tooltip), 
  //   totalFundsEndWithoutHedge (graph line),
  //   totalFundsStartWithHedge (tooltip), 
  //   totalFundsEndWithHedge (graph line), 
  //   premium (graph line), 
  //   size (tooltip), 
  //   startingDelta (tooltip), 
  //   strikePrice (graph line), 
  //   spotPriceStart (tooltip), 
  //   spotPriceEnd (graph line) 
  // }

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
            return (
              <>
                <p className="font-serif font-bold font-xs">{pay.payload.premium}</p>
                <p className="font-serif font-xs">{pay.payload.strikePrice}</p>
                <p className="font-serif font-xs">{pay.payload.delta}</p>
              </>
            )
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
          <Line type="monotone" dataKey="totalFundsEndWithoutHedge" stroke="#333" name='Funds with Without Hedge' />
        </LineChart>
    );
}
