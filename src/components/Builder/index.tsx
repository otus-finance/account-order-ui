import React from 'react'
import { Chain } from './Chain'
import { Chart } from './Chart'
import { Market } from './Market'
import { Strategy } from './Strategy'
import { Strikes } from './Strikes'

export const OptionsBuilder = () => {

  return <div className="grid sm:grid-cols-2 grid-cols-2">

    <Chain />

    <Market />

    <Strategy />

    <Strikes />

    <Chart />

  </div>

}

