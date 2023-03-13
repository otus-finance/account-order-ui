import React, { useCallback, useState } from "react";
import { useBuilderContext } from "../../../../context/BuilderContext";
import { fromBigNumber, toBN } from "../../../../utils/formatters/numbers";
import { MAX_BN, ZERO_BN } from "../../../../constants/bn";

import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";

import {
  useAccount,
  useNetwork,
  usePrepareSendTransaction,
  useSigner,
} from "wagmi";

import useTransaction from "../../../../hooks/Transaction";
import { Spinner } from "../../../UI/Components/Spinner";
import { useLyraAccountContext } from "../../../../context/LyraAccountContext";
import { LyraStrike } from "../../../../queries/lyra/useLyra";
import { PopulatedTransaction } from "ethers";
import { WalletConnect } from "../Common/WalletConnect";

// through lyra
export const TradeMarket = () => {
  const { selectedChain, lyra, strikes } = useBuilderContext();

  const { address, isConnected } = useAccount();

  const { chain } = useNetwork();

  const { openConnectModal } = useConnectModal();

  const { openChainModal } = useChainModal();
  const { isLoading, quoteAsset, tradeInit, fetchMarketQuoteBalance } =
    useLyraAccountContext();

  const [isLoadingTx, setLoadingTx] = useState(false);

  const execute = useTransaction(lyra?.provider || null, chain || null);

  const handleApproveQuote = useCallback(async () => {
    if (!tradeInit) {
      console.warn("No trade available");
      return null;
    }

    if (!address) {
      console.warn("No user address");
      return null;
    }

    setLoadingTx(true);

    const tx = await tradeInit.approveQuote(address, MAX_BN);

    await execute(tx, {
      onComplete: async () => {
        fetchMarketQuoteBalance();
        setLoadingTx(false);
        // logEvent(LogEvent.TradeApproveSuccess, {
        //   isBase: false,
        // })
      },
      onError: async () => {
        setLoadingTx(false);
      },
    });
  }, [fetchMarketQuoteBalance, execute, address, tradeInit]);

  const signer = useSigner();
  // signer.s

  const handleExecuteMultiTrade = useCallback(async () => {
    if (!lyra) {
      // console.warn('No lyra instance availalbe');
      return null;
    }

    if (!address) {
      // console.warn('No user address');
      return null;
    }

    setLoadingTx(true);

    const trades = await Promise.all(
      strikes.map(async (strike: LyraStrike) => {
        const {
          market,
          quote: { isCall, isBuy, size },
        } = strike;

        let _tradeOptions = {
          iterations: 3,
          setToCollateral: ZERO_BN,
          setToFullCollateral: false,
        };

        if (!isBuy) {
          if (isCall) {
            const _collateral =
              fromBigNumber(size) * fromBigNumber(strike.strikePrice) * 2.5;
            _tradeOptions = {
              ..._tradeOptions,
              setToCollateral: toBN(_collateral.toString()),
            };
          } else {
            _tradeOptions = { ..._tradeOptions, setToFullCollateral: true };
          }
        }

        const _trade = await lyra.trade(
          address,
          market,
          strike.id,
          isCall,
          isBuy,
          size,
          0.1 / 100,
          _tradeOptions
        );
        return _trade;
      })
    );

    const txs = trades.map((trade) => {
      return trade.tx;
    });

    try {
      await Promise.all(
        txs.map(async (tx: PopulatedTransaction) => {
          await execute(tx, {});
        })
      );
      setLoadingTx(false);
    } catch (error) {
      setLoadingTx(false);
    }
  }, [strikes, lyra, address, execute]);

  return (
    <>
      {/* button for connectin wallet 
        executing trade through otus account 
        executing trade through lyra  */}
      <div className="col-span-1 px-4">
        <div className="p-4 border border-zinc-800">
          <p className="text-zinc-200 text-xs">Trade using Lyra SDK</p>
        </div>
        {/* wallet action buttons */}
        <div className="py-6">
          {/* is loading */}
          {isLoading && (
            <div
              onClick={() => console.warn("Add funds")}
              className="cursor-disabled border-2 border-zinc-800 hover:border-emerald-800 bg-zinc-800 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
            >
              <Spinner />
            </div>
          )}

          {/* insufficient balance */}
          {isConnected &&
            chain?.id === selectedChain?.id &&
            quoteAsset &&
            quoteAsset.balance.isZero() && (
              <div
                onClick={() => console.warn("Add funds")}
                className="cursor-disabled border-2 border-zinc-800 hover:border-emerald-800 bg-zinc-800 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
              >
                Insufficient Balance
              </div>
            )}

          {/* wallet connected / correct chain / quote asset not approved */}
          {isConnected &&
            chain?.id === selectedChain?.id &&
            quoteAsset &&
            quoteAsset.tradeAllowance.isZero() &&
            !quoteAsset.balance.isZero() && (
              <div
                onClick={() => handleApproveQuote()}
                className="cursor-pointer border-2 border-zinc-800 hover:bg-emerald-600 bg-zinc-900 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
              >
                Approve Quote
              </div>
            )}

          {/* wallet connected / correct chain / quote asset approved */}
          {isConnected &&
            chain?.id === selectedChain?.id &&
            quoteAsset &&
            !quoteAsset.tradeAllowance.isZero() &&
            !quoteAsset.balance.isZero() && (
              <div
                onClick={() => handleExecuteMultiTrade()}
                className="cursor-pointer border-2 border-emerald-600 hover:bg-emerald-600 bg-zinc-900 p-2 py-3 col-span-3 text-sm font-normal text-white text-center rounded-full"
              >
                {isLoadingTx ? <Spinner /> : "Execute Trade"}
              </div>
            )}

          {/* wallet connected but wrong chain */}
          {isConnected && chain?.id != selectedChain?.id && (
            <div
              onClick={openChainModal}
              className="cursor-pointer border-2 border-zinc-700 hover:border-emerald-600 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full"
            >
              Wrong network
            </div>
          )}

          {/* wallet not connected */}
          {!isLoading && !isConnected && openConnectModal && <WalletConnect />}
        </div>
      </div>
    </>
  );
};
