# Otus Account Order UI

## Running locally

Create your own `.env` file from `.env.example` with your own Infura ID

Fill in the missing keys and run `yarn install` to install the dependencies.

After the successful installation, run `yarn run dev` to spin up the application. `http://localhost:3000`

This is an app bootstrapped according to the [init.tips](https://init.tips) stack, also known as the T3-Stack.

## Adding strategies

`src/strategies.ts` has notes on how to add a new strategy.

-> Connect Wallet
-> Query subgraph for account order address
-> None
--> Create Margin Account
-> Has
--> Not enough funds for trade
--> Deposit Margin
--> Has enough funds for trade
--> Place order

Account Actions TX

New Account
Deposit
Withdraw

Place Order
Cancel Order

Account Queries
USD Balance (USDC and SUSD)
User Wallet Balance

// useUserAccount

// send multi call tx (arb / op)
https://github.com/mds1/multicall

// build tx
// useContractWrite to send
