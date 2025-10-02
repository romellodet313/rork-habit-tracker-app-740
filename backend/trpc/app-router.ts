import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { syncHabitsProcedure, getHabitsProcedure } from "./routes/habits/sync/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  habits: createTRPCRouter({
    sync: syncHabitsProcedure,
    get: getHabitsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
