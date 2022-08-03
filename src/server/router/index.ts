// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { z } from "zod";
import { prisma } from "../db/client";

export const appRouter = createRouter()
  .transformer(superjson)
  .mutation("register-user", {
    input: z.object({
      email: z.string()
    }),
    async resolve({ input }) {
      const emailInDb = await prisma.user.create({
        data: {
          email: input.email,
        },
      });
      return { success: true, emailInDb };
    },
  });


// export type definition of API
export type AppRouter = typeof appRouter;