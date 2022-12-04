// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { z } from "zod";
import { calculate } from "../../pages/api/backtest";
import { trpc } from "../../utils/trpc";
import { TRPCError } from "@trpc/server";

export const appRouter = createRouter()
  .transformer(superjson)
  .mutation("backtest", {
    input: z.object({
      isCall: z.boolean(),
      vaultStrategy: z.object({
        vaultFunds: z.number(),
        collateralPercent: z.number()
      }),
      strikeStrategy: z.object({
        targetDelta: z.number(),
        maxDeltaGap: z.number(),
        optionType: z.number()
      }),
      hedgeStrategy: z.object({
        hedgePercentage: z.number(),
        maxHedgeAttempts: z.number(),
        leverageSize: z.number()
      })
    }),
    async resolve({ input }) {
      const { isCall, vaultStrategy, strikeStrategy, hedgeStrategy } = input;
      console.log({ isCall, strikeStrategy })
      const aprs = await calculate(isCall, vaultStrategy, strikeStrategy, hedgeStrategy);
      console.log({ aprs })
      return { success: true, aprs };
    },
  })
  .mutation("register-user", {
    input: z.object({
      email: z.string()
    }),
    async resolve({ input }) {
      const url = `${process.env.MAILER_LITE_URL}api/subscribers`;
      console.log({ input, url })
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

      console.log({ response });

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