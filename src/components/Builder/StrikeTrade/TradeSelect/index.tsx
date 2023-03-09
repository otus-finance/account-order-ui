import React, { Dispatch, useState } from 'react'
import { TradeLimit } from '../TradeLimit';
import { TradeMarket } from '../TradeMarket';
import { TradeTrigger } from '../TradeTrigger';

enum TradeTypes {
  Market,
  Limit,
  Trigger
}

export const TradeType = () => {
  const [typeSelected, setTypeSelected] = useState(TradeTypes.Market);
  return <>
    <TradeTypeSelect typeSelected={typeSelected} setTypeSelected={setTypeSelected} />
    {
      TradeTypes.Market === typeSelected && <TradeMarket />
    }
    {
      TradeTypes.Limit === typeSelected && <TradeLimit />
    }
    {
      TradeTypes.Trigger === typeSelected && <TradeTrigger />
    }
  </>
}

const TradeTypeSelect = ({ typeSelected, setTypeSelected }: { typeSelected: TradeTypes, setTypeSelected: Dispatch<TradeTypes> }) => {

  return <div className="col-span-1">
    <div className='p-2 pt-4'>
      <div className='flex gap-8'>
        <div onClick={() => setTypeSelected(TradeTypes.Market)} className={`p-2 text-xs  hover:text-white cursor-pointer ${typeSelected === TradeTypes.Market ? 'text-white underline' : 'text-zinc-300'}`}>Market</div>
        <div onClick={() => setTypeSelected(TradeTypes.Limit)} className={`p-2 text-xs text-zinc-300 hover:text-white cursor-pointer ${typeSelected === TradeTypes.Limit ? 'text-white underline' : 'text-zinc-300'}`}>Limit</div>
        <div onClick={() => setTypeSelected(TradeTypes.Trigger)} className={`p-2 text-xs text-zinc-300 hover:text-white cursor-not-allowed ${typeSelected === TradeTypes.Trigger ? 'text-white underline' : 'text-zinc-300'}`}>Trigger</div>
      </div>
    </div>
  </div>
}