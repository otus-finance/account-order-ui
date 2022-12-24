import { useEffect, useState } from "react"
import { ResponsiveContainer } from "recharts"
import ETHIcon from "../UI/Icons/Color/ETH"
import { OptionType, PriceAt, Strategy, StrategyTag, StrategyType } from "./types"


export const strategies: Strategy[] = [
  {
    id: 0,
    name: 'Iron Condor',
    type: [StrategyType.Bearish, StrategyType.Bullish, StrategyType.Neutral], // bearish bullish volatile calm 
    tags: [StrategyTag.LimitedLoss, StrategyTag.UnlimitedGain], // [limited loss, unlimited gain] limited gain unlimited loss 
    description: 'A bet on volatility 🌊🤪. You are neutral of direction but require price/IV to increase. You are bullish on volatility.',
    trade: [
      { optionType: OptionType.LONG_PUT, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 1 },
      { optionType: OptionType.SHORT_CALL_QUOTE, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.LONG_CALL, priceAt: PriceAt.OTM, order: 1 },
    ]
  },
  {
    id: 1,
    name: 'Sell Call',
    type: [StrategyType.Bearish, StrategyType.Calm], // bearish bullish volatile calm 
    tags: [StrategyTag.UnlimitedLoss, StrategyTag.LimitedGain], // [limited loss, unlimited gain] limited gain unlimited loss 
    description: 'A short call obligates you to sell 100 shares of the underlying stock at a specific strike price (if assigned). This is a neutral to bearish 🚫🐂 bet that profits through time decay as well as the underlying asset going down.',
    trade: [
      { optionType: OptionType.SHORT_CALL_QUOTE, priceAt: PriceAt.OTM, order: 0 },
    ]
  },
  {
    id: 2,
    name: 'Sell Put',
    type: [StrategyType.Bullish, StrategyType.Neutral], // bearish bullish volatile calm 
    tags: [StrategyTag.UnlimitedLoss, StrategyTag.LimitedGain], // [limited loss, unlimited gain] limited gain unlimited loss 
    description: 'A short put obligates you to buy 100 shares of the underlying stock at a specific strike price (if assigned). This is a neutral to bullish 🚫🐻 bet that profits through time decay as well as the underlying asset going up.',
    trade: [
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 0 },
    ]
  },
  {
    id: 3,
    name: 'Call Debit Spread',
    type: [StrategyType.Bullish],
    tags: [StrategyTag.LimitedLoss, StrategyTag.LimitedGain],
    description: 'A call debit spread is an alternative to the long call, which involves buying a call at one strike and selling a call at a higher strike with the same expiration date. Similarly to a long call this is a bullish 🐂 bet that profits on the underlying asset going up and outpacing the negative effects of theta and volatility.',
    trade: [
      { optionType: OptionType.LONG_CALL, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_CALL_QUOTE, priceAt: PriceAt.OTM, order: 1 },
    ]
  },
  {
    id: 4,
    name: 'Put Credit Spread',
    type: [StrategyType.Bearish, StrategyType.Neutral],
    tags: [StrategyTag.LimitedLoss, StrategyTag.LimitedGain],
    description: 'A put credit spread is an alternative to the short put, which involves selling a put at one strike and buying a put at a lower strike with the same expiration date. Similarly to a short put this is a neutral to bullish 🚫🐻 bet that profits through time decay as well as the underlying asset going up.',
    trade: [
      { optionType: OptionType.LONG_PUT, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 1 },
    ]
  },
  {
    id: 5,
    name: 'Short Call Ladder',
    type: [StrategyType.Bullish, StrategyType.Volatile],
    tags: [StrategyTag.LimitedLoss, StrategyTag.UnlimitedGain],
    description: 'A bet on volatility 🌊🤪 with bullish 🐂 bias. You sell an ITM call, and purchase an ATM call with another OTM call at a higher strike for the same expiration. You have limited downside and unlimited upside.',
    trade: [
      { optionType: OptionType.SHORT_CALL_QUOTE, priceAt: PriceAt.ITM, order: 0 },
      { optionType: OptionType.LONG_CALL, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.LONG_CALL, priceAt: PriceAt.OTM, order: 1 },
    ]
  },
  {
    id: 6,
    name: 'Long Call',
    type: [StrategyType.Bullish],
    tags: [StrategyTag.LimitedLoss, StrategyTag.UnlimitedGain],
    description: 'A long call gives you the right to buy 100 shares of the underlying stock at a specific strike price. This is a bullish 🐂 bet that profits on the underlying asset going up and outpacing the negative effects of theta and volatility.',
    trade: [
      { optionType: OptionType.LONG_CALL, priceAt: PriceAt.OTM, order: 0 },
    ]
  },
  {
    id: 7,
    name: 'Put Ladder',
    type: [StrategyType.Calm],
    tags: [StrategyTag.LimitedLoss, StrategyTag.LimitedGain],
    description: 'A bet on calm 🐌⛵ with unlimited downside risk 💣. You purchase an ITM put, and then sell an ATM put, while also selling another lower strike OTM put with similiar expiration. You expect volatility to remain constant.',
    trade: [
      { optionType: OptionType.LONG_PUT, priceAt: PriceAt.ITM, order: 0 },
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.ITM, order: 0 },
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 0 },
    ]
  },
  {
    id: 8,
    name: 'Jade Lizard',
    type: [StrategyType.Bullish],
    tags: [StrategyTag.LimitedLoss, StrategyTag.LimitedGain],
    description: 'A slightly bullish direction bet, high implied volatility, selling an OTM put and selling a credit spread.',
    trade: [
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.LONG_PUT, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 1 }
    ]
  },
  {
    id: 9,
    name: 'Long Put',
    type: [StrategyType.Bearish],
    tags: [StrategyTag.LimitedGain, StrategyTag.LimitedGain],
    description: 'A long put gives you the right to sell 100 shares of the underlying stock at a specific price. This is a bearish 🐻 bet that profits on the underlying asset going down and outpacing the negative effects of theta and volatility.',
    trade: [
      { optionType: OptionType.LONG_PUT, priceAt: PriceAt.OTM, order: 0 },
    ]
  },
  {
    id: 10,
    name: 'Short Iron Condor',
    type: [StrategyType.Neutral, StrategyType.Calm],
    tags: [StrategyTag.LimitedGain, StrategyTag.LimitedGain],
    description: 'A bet on calm 🐌⛵. You are neutral of direction but want price/IV to remain the same. You are bearish on volatility.',
    trade: [
      { optionType: OptionType.LONG_CALL, priceAt: PriceAt.OTM, order: 1 },
      { optionType: OptionType.LONG_PUT, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_CALL_QUOTE, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 1 },

    ]
  },
  {
    id: 13,
    name: 'Short Strangle',
    type: [StrategyType.Calm, StrategyType.Neutral],
    tags: [StrategyTag.UnlimitedLoss, StrategyTag.LimitedGain],
    description: 'A bet on calm 🐌⛵. You usually sell OTM puts and calls and are short volatility, expecting things not to move much in either direction.',
    trade: [
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_CALL_QUOTE, priceAt: PriceAt.OTM, order: 1 },
    ]
  },
  {
    id: 14,
    name: 'Short Straddle',
    type: [StrategyType.Calm, StrategyType.Neutral],
    tags: [StrategyTag.UnlimitedLoss, StrategyTag.LimitedGain],
    description: 'A bet on calm 🐌⛵. You sell both calls and puts with the same expiration and strike, expecting a small move in volatility regardless of direction. You keep the premium but open yourself to risk of large movements.',
    trade: [
      { optionType: OptionType.SHORT_PUT_QUOTE, priceAt: PriceAt.OTM, order: 0 },
      { optionType: OptionType.SHORT_CALL_QUOTE, priceAt: PriceAt.OTM, order: 0 },
    ]
  }
]
// filters == 
export const Strategies = (
  { selectedDirectionTypes, selectedExpirationDate, selectedStrategy, setSelectedStrategy }:
    { selectedDirectionTypes: any, selectedExpirationDate: any, selectedStrategy: any, setSelectedStrategy: any }
) => {

  const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    if (selectedExpirationDate != null && selectedDirectionTypes.length > 0) {
      const _selectedDirectionTypesIds = selectedDirectionTypes.map(({ id }) => id);
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
      filteredStrategies.map((strategy, index) => {

        const { name, description, type, tags } = strategy;

        const isSelectedStyle = isSelected(strategy) ? 'border-emerald-700' : 'border-zinc-700'

        return <div onClick={() => setSelectedStrategy(strategy)} key={index} className={`cursor-pointer basis-full sm:basis-1/3 flex-none flex flex-col border  hover:border-emerald-700 mt-4 mb-8 ${isSelectedStyle}`}>
          <div className="grid grid-cols-1 p-6">
            <div className="grid grid-cols-3 place-content-between">
              <div className="col-span-2 text-xl font-bold">
                {name}
                <div>
                  {
                    tags.map((tag, index) => <span key={index} className="text-xs font-light rounded-sm bg-zinc-800 text-zinc-100 p-1 mr-1">{tag}</span>)
                  }
                </div>
              </div>
              <div className="col-span-1">
                <div className="float-right">
                  <ETHIcon />
                </div>
              </div>
            </div>

            <div className="col-span-1 mt-4">
              {/* <ResponsiveContainer>
            </ResponsiveContainer> */}
            </div>

            {/* <div className="col-span-1 grid grid-cols-3 gap-3  mt-6">
              <div className="bg-zinc-800 p-2 pt-1">
                <span className="text-xs font-light text-zinc-100">Net Credit</span>
                <div>
                  <span className="text-base font-semibold text-white">$7.12</span>

                </div>
              </div>
              <div className="bg-zinc-800 p-2 pt-1">
                <span className="text-xs font-light text-zinc-100">Max Loss</span>
              </div>
              <div className="bg-zinc-800 p-2 pt-1">
                <span className="text-xs font-light text-zinc-100">Max Profit</span>
              </div>
            </div> */}

            <div className="col-span-1 mt-6 mb-6">
              <p className="text-xs leading-5 font-normal">{description}</p>
            </div>

          </div>
        </div>
      })
    }
  </>
}