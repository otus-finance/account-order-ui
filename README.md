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

- Bug on graph not updating correctly when changing size
- Toast Handling
- Bug on strikes table updating same strike id (sell vs buy)

## Updates needed in subgraph

## Market Order TX - UI States

- Wallet Connect
- Approve Quote
- Open Position

## Spread Positions

- Spread

## Display Spread Open Position Numbers

- Potential Profit?
- Max Cost

- Max Loss Post
