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

- Flickering on selecting different strategies

## Covered Calls

## Long Call NFT

## Short and Long Put NFT

- 1800 Strike
- Seller provides liquidity at 1800 Strike gets an NFT
- Buyer buys LP NFT position for $20
- Seller receives $20 + they are owed the Value of the Position or the Base Asset if it crosses Strike
- If it stays above 1800 Seller profits
- If it goes below 1800 Buyer profits

## Vaults Available

- Camelot v3 Management
- Block rebalancing
- Options
- Perps

## Priority

- Build options vault + UI
- One click Delta Hedge on Synthetix Perps for Lyra Positions

## Medium Priority

Can call options too
OtusDegenOptions.sol
User sells options by providing liquidity to v3 concentrated liquidity exchange
If there is a buyer
They then deposit nft to OtusDegenOptions.sol
They collect premium

On expiration OtusDegenSettlement.sol manages settlement

OtusDegenPricer.sol
When somoene adds a new asset

OtusDegenLiquidator.sol
Basically liquidates accounts and charges a fee (sellers on leverage)

## Low Priority

- Create Ranged Markets
- Build v3 Concentrated Liquidity w/ keeper Range Update
- Fixed Ranged Markets
