import { useEffect, useState } from "react"
import ETHIcon from "../../UI/Icons/Color/ETH"
import { Strategy, StrategyTag } from "../../../utils/types"
import { motion } from "framer-motion"
import { useBuilderContext } from "../../../context/BuilderContext"
import BTCIcon from "../../UI/Icons/Color/BTC"
import { strategies } from "../../../strategies"

export const Strategies = () => {

  const { selectedMarket, selectedDirectionTypes, selectedExpirationDate, selectedStrategy, handleSelectedStrategy } = useBuilderContext();

  const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    if (selectedExpirationDate != null && selectedDirectionTypes.length > 0) {
      const _selectedDirectionTypesIds = selectedDirectionTypes.map(({ id }: { id: number }) => id);
      const _filteredStrategies = strategies.filter(strategy => {
        return strategy.type.some(r => _selectedDirectionTypesIds.includes(r))
      })
      setFilteredStrategies(_filteredStrategies)
    } else {
      setFilteredStrategies([]);
    }
  }, [selectedExpirationDate, selectedDirectionTypes])

  const isSelected = (_strategy: Strategy) => selectedStrategy?.id == _strategy.id;

  return <>
    {
      filteredStrategies.map((strategy: Strategy, index: number) => {

        const { name, description, type, tags } = strategy;

        const isSelectedStyle = isSelected(strategy) ? 'border-emerald-600' : 'border-zinc-800'

        return <motion.div whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }} onClick={() => handleSelectedStrategy(strategy)} key={index} className={`cursor-pointer basis-full sm:basis-1/2 flex-none flex flex-col border  hover:border-emerald-600 mt-2 mb-8 rounded-sm ${isSelectedStyle}`}>
          <div className="grid grid-cols-1 p-4">
            <div className="grid grid-cols-3 place-content-between">
              <div className="col-span-2 text-xl font-bold">
                {name}
                <div>
                  {
                    tags.map((tag: StrategyTag, index: number) => <span key={index} className="text-xs font-light rounded-sm bg-zinc-800 text-zinc-100 p-1 mr-1">{tag}</span>)
                  }
                </div>
              </div>
              <div className="col-span-1">
                <div className="float-right">
                  {
                    selectedMarket?.name == 'sETH-sUSD' || selectedMarket?.name == 'ETH-USDC' ?
                      <ETHIcon /> :
                      <BTCIcon />
                  }

                </div>
              </div>
            </div>

            <div className="col-span-1 mt-4 mb-4">
              <p className="text-xs leading-5 font-light text-zinc-200">{description}</p>
            </div>

          </div>
        </motion.div>
      })
    }
  </>
}