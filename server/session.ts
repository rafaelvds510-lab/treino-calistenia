/**
 * Session management utilities for email/password authentication
 */

import { Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { generateToken } from "./auth";
import { updateUser, getUserById } from "./db";

export interface SessionData {
  userId: number;
  email: string;
  name?: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Create a session cookie for email/password login
 */
export async function createSessionCookie(
  userId: number,
  res: Response,
  req: any,
  rememberMe: boolean = false
): Promise<void> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Session expires in 24 hours (or 30 days if remember me)
  const expiresIn = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const now = Date.now();
  const expiresAt = now + expiresIn;

  const sessionData: SessionData = {
    userId: user.id,
    email: user.email || "",
    name: user.name || undefined,
    issuedAt: now,
    expiresAt,
  };

  // Store session data in cookie (in production, use session store like Redis)
  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: expiresIn,
  });

  // If remember me is enabled, also store remember token in database
  if (rememberMe) {
    const rememberToken = generateToken();
    const rememberExpiresAt = new Date(expiresAt);
    await updateUser(userId, {
      rememberToken,
      rememberTokenExpiry: rememberExpiresAt,
    });
  }
}

/**
 * Validate session cookie
 */
export function validateSessionCookie(sessionToken: string): SessionData | null {
  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, "base64").toString("utf-8")
    ) as SessionData;

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }

    return sessionData;
  } catch (error) {
    return null;
  }
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(res: Response, req: any): void {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
}

/**
 * Validate remember token
 */
export async function validateRememberToken(
  userId: number,
  rememberToken: string
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || !user.rememberToken || !user.rememberTokenExpiry) {
    return false;
  }

  // Check if token matches and hasn't expired
  if (
    user.rememberToken === rememberToken &&
    user.rememberTokenExpiry > new Date()
  ) {
    return true;
  }

  return false;
}

/**
 * Clear remember token
 */
export async function clearRememberToken(userId: number): Promise<void> {
  await updateUser(userId, {
    rememberToken: null,
    rememberTokenExpiry: null,
  });
}
