import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as cookie from "cookie";
import { validateSessionCookie } from "../session";
import { getUserById } from "../db";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const cookies = cookie.parse(opts.req.headers.cookie || "");
    const sessionToken = cookies[COOKIE_NAME];
    if (sessionToken) {
      const sessionData = validateSessionCookie(sessionToken);
      if (sessionData) {
        const dbUser = await getUserById(sessionData.userId);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    console.error("Error parsing session cookie in context", error);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

