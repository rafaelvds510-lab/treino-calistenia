/**
 * Unit tests for authentication utilities
 */

import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRememberToken,
  generatePasswordResetToken,
} from "./auth";

describe("Authentication Utilities", () => {
  describe("hashPassword and verifyPassword", () => {
    it("should hash a password and verify it correctly", () => {
      const password = "MySecurePassword123!";
      const hash = hashPassword(password);

      // Hash should be in format: salt:hash
      expect(hash).toContain(":");
      const parts = hash.split(":");
      expect(parts).toHaveLength(2);
      expect(parts[0]).toHaveLength(32); // salt is 16 bytes in hex = 32 chars
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it("should verify correct password", () => {
      const password = "MySecurePassword123!";
      const hash = hashPassword(password);

      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", () => {
      const password = "MySecurePassword123!";
      const wrongPassword = "WrongPassword456!";
      const hash = hashPassword(password);

      const isValid = verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should reject invalid hash format", () => {
      const password = "MySecurePassword123!";
      const invalidHash = "invalidsalt:invalidhash";

      const isValid = verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });

    it("should generate different hashes for same password", () => {
      const password = "MySecurePassword123!";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      // Different hashes due to random salt
      expect(hash1).not.toBe(hash2);

      // Both should verify correctly
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe("generateToken", () => {
    it("should generate a random token", () => {
      const token = generateToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
      // Token should be hex string
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it("should generate different tokens", () => {
      const token1 = generateToken();
      const token2 = generateToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("generateRememberToken", () => {
    it("should generate remember token with expiry", () => {
      const { token, expiresAt } = generateRememberToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(expiresAt).toBeInstanceOf(Date);
    });

    it("should set expiry to 30 days in future", () => {
      const now = new Date();
      const { expiresAt } = generateRememberToken();

      const diffMs = expiresAt.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // Should be approximately 30 days (allow 1 hour margin)
      expect(diffDays).toBeGreaterThan(29.95);
      expect(diffDays).toBeLessThan(30.05);
    });
  });

  describe("generatePasswordResetToken", () => {
    it("should generate password reset token with expiry", () => {
      const { token, expiresAt } = generatePasswordResetToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(expiresAt).toBeInstanceOf(Date);
    });

    it("should set expiry to 1 hour in future", () => {
      const now = new Date();
      const { expiresAt } = generatePasswordResetToken();

      const diffMs = expiresAt.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Should be approximately 1 hour (allow 1 minute margin)
      expect(diffHours).toBeGreaterThan(0.98);
      expect(diffHours).toBeLessThan(1.02);
    });
  });
});
