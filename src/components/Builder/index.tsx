import React from 'react'
import { useBuilderContext } from '../../context/BuilderContext'
import { Spinner } from '../UI/Components/Spinner'
import { Chart } from './Chart'
import { Market } from './Market'
import { Strategy } from './Strategy'
import { StrategyType } from './StrategyType'
import { Strikes } from './Strikes'

export const OptionsBuilder = () => {

  // const { isPrebuilt } = useBuilderContext();

  // const { isPrebuilt } = useBuilderContext();

  return <div className="grid sm:grid-cols-3 grid-cols-1 sm:gap-8">

    <Market />



    {/* custom or prebuilt strategies  */}
    {/* <StrategyType /> */}

    {/* {
      isPrebuilt ?
        <Strategy /> :
        null
    } */}
    <Strategy />

    <Strikes />

    <Chart />

  </div>

}

