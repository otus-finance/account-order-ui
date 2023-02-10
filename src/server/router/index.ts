// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { formatChartData } from "../../utils/charting";
import { customAlphabet } from 'nanoid'

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const getHash = customAlphabet(characters, 4);

export const appRouter = createRouter()
  .transformer(superjson)
  .query("builder-id", {
    input: z.object({
      hash: z.string()
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.url.findFirst({ where: { hash: input.hash }, include: { trades: true } })
    }
  })
  .mutation("builder-id", {
    input: z.object({
      generatedBy: z?.string(),
      expiry: z.number(),
      board: z.number(),
      asset: z.string(),
      trades: z.array(
        z.object({
          strikeId: z.number(),
          size: z.number(),
          optionType: z.number()
        })
      )
    }),
    async resolve({ input, ctx }) {
      const hash = getHash();

      const url = await ctx.prisma.url.create(
        {
          data: {
            hash: hash,
            generatedBy: input?.generatedBy,
            asset: input.asset,
            expiry: input.expiry,
            board: input.board
          }
        }
      )

      const _trades = input.trades.map(_trade => {
        return {
          strikeId: _trade.strikeId,
          size: _trade.size,
          optionType: _trade.optionType,
          urlId: url.id
        }
      });

      await ctx.prisma.trade.createMany(
        {
          data: _trades
        }
      );

      return hash;

    }
  })
  .query("chart-data", {
    input: z.object({
      asset: z.string(),
      priceOfAsset: z.number(),
      builtTrades: z.array(z.any()),
    }),
    async resolve({ input }) {
      const { asset, priceOfAsset, builtTrades } = input;
      const chartData = formatChartData(asset, priceOfAsset, builtTrades);
      return chartData;
    }
  })
  .query("strategies", {
    async resolve() {
      if (!process.env.STRATEGIES_URL) return;
    },
  })
  .mutation("register-user", {
    input: z.object({
      email: z.string()
    }),
    async resolve({ input }) {
      const url = `${process.env.MAILER_LITE_URL}api/subscribers`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.MAILER_LITE_API}`
        },
        body: JSON.stringify(
          {
            email: input.email
          }
        )
      });

      if (response.status == 422) {
        const json = await response.json();

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: json.message
        })
      }

      return response;
    },
  });


// export type definition of API
export type AppRouter = typeof appRouter;