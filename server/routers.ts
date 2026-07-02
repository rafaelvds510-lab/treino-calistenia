import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { workoutsRouter } from "./routers/workouts";
import { authRouter } from "./routers/auth";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  system: systemRouter,
  workouts: workoutsRouter,
  auth: authRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;

