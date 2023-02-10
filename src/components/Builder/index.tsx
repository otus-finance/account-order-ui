import React from 'react'
import { Chart } from './Chart'
import { Market } from './Market'
import { Strategy } from './Strategy'
import { Strikes } from './Strikes'

export const OptionsBuilder = () => {

  return <div className="grid sm:grid-cols-3 grid-cols-1 sm:gap-8">

    <Market />

    <Strategy />

    <Strikes />

    <Chart />

  </div>

}

