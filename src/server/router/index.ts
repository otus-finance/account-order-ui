// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import { request } from "http";
import { formatChartData } from "../../utils/charting";

export const appRouter = createRouter()
  .transformer(superjson)
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