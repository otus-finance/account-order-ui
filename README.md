# Otus Account Order UI

## Running locally

Create your own `.env` file from `.env.example` with your own Infura ID

Fill in the missing keys and run `yarn install` to install the dependencies.

After the successful installation, run `yarn run dev` to spin up the application. `http://localhost:3000`

This is an app bootstrapped according to the [init.tips](https://init.tips) stack, also known as the T3-Stack.

## Adding strategies

`src/strategies.ts` has notes on how to add a new strategy.

## UI Bugs/Tasks for Spread Positions

- Need message when a strategy not available
- Calculate Max Loss after Selecting strikes/size
- Display Spread Positions in Table
- Display TVL in Vault UI + Other Stats
- Display User Liquidity
- Include fee in chart net profit net loss calculation

## UI Bugs/Tasks for Limit Orders

## UI Bugs

- Allowing quote doesnt show user loading
- Allowing quote is requesting max
- Allowing quote doesn't update to open position

## strategy

option type profits

- buy call
  size _ (expiry spot price - strike price - cost) = pnl
  1 _ ($2500 - $2000 - $90) = $410
- buy put
  size _ (strike price - expiry spot price - cost) = pnl
  1 _ ($2000 - $1800 - $100) = $100
- sell call
  (expiry spot price > strike price) ? (strike price - expiry spot price + premium) _ size : premium _ size

- sell put

## bull call debit spread

buy call
(expiry spot price > strike price) ? size _ (expiry spot price - strike price - cost) : -cost _ size
sell call
(expiry spot price > strike price) ? (strike price - expiry spot price + premium) _ size : +premium _ size

MAX_EXPIRY_PRICE = INFINITY
MIN_EXPIRY_PRICE = 0
BUY_CALL_EXPIRY_PRICE = 2000
BUY_CALL_STRIKE_PRICE = 2000
BUY_CALL_COST = 100
SELL_CALL_EXPIRY_PRICE
SELL_CALL_STRIKE_PRICE = 2100
SELL_CALL_PREMIUM = 50

(MAX_EXPIRY_PRICE > BUY_CALL_STRIKE_PRICE) ? MAX_EXPIRY_PRICE - BUY_CALL_STRIKE_PRICE - 100 = INFINITY
(MAX_EXPIRY_PRICE > SELL_CALL_STRIKE_PRICE) ? SELL_CALL_STRIKE_PRICE - MAX_EXPIRY_PRICE + SELL_CALL_PREMIUM = INFINITY + SELL_CALL_PREMIUM
AT MAX_EXPIRY_PRICE PROFIT IS SELL_CALL_PREMIUM

(MIN_EXPIRY_PRICE < BUY_CALL_STRIKE_PRICE) ? BUY_CALL_COST
(MIN_EXPIRY_PRICE < BUY_CALL_STRIKE_PRICE) ? SELL_CALL_PREMIUM

(BUY_CALL_EXPIRY_PRICE < BUY_CALL_STRIKE_PRICE) ? BUY_CALL_COST
(BUY_CALL_EXPIRY_PRICE < SELL_CALL_STRIKE_PRICE) ? PREMIUM
