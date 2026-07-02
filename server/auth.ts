/**
 * Authentication utilities for email/password auth
 */

import crypto from "crypto";

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return computedHash === storedHash;
}

/**
 * Generate a secure random token for password reset or remember me
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a remember me token that expires in 30 days
 */
export function generateRememberToken(): { token: string; expiresAt: Date } {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return { token, expiresAt };
}

/**
 * Generate a password reset token that expires in 1 hour
 */
export function generatePasswordResetToken(): { token: string; expiresAt: Date } {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  return { token, expiresAt };
}
