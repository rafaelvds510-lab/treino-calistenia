/**
 * Authentication router - Email/password auth procedures
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../\_core/trpc";
import { hashPassword, verifyPassword, generateRememberToken, generatePasswordResetToken } from "../auth";
import { createSessionCookie, clearRememberToken } from "../session";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import {
  getUserByEmail,
  createUser,
  createUserStats,
  updateUser,
  createPasswordResetToken,
  getPasswordResetToken,
  deletePasswordResetToken,
} from "../db";

export const authRouter = router({
  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(1, "Senha é obrigatória"),
        rememberMe: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const isPasswordValid = verifyPassword(input.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Update last signed in
      await updateUser(user.id, {
        lastSignedIn: new Date(),
      });

      // Create session cookie
      await createSessionCookie(user.id, ctx.res, ctx.req, input.rememberMe);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  /**
   * Sign up with email and password
   */
  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este email já está registrado",
        });
      }

      // Hash password
      const passwordHash = hashPassword(input.password);

      // Create user
      const userId = await createUser({
        email: input.email,
        name: input.name,
        passwordHash,
        loginMethod: "email",
      });

      // Create user stats
      await createUserStats(userId);

      // Create session cookie for new user
      await createSessionCookie(userId, ctx.res, ctx.req, false);

      return {
        success: true,
        user: {
          id: userId,
          email: input.email,
          name: input.name,
        },
      };
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email("Email inválido") }))
    .mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);

      // Always return success to prevent email enumeration
      if (!user) {
        return { success: true };
      }

      const { token, expiresAt } = generatePasswordResetToken();
      await createPasswordResetToken(user.id, token, expiresAt);

      // TODO: Send email with reset link
      // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      // await sendPasswordResetEmail(user.email, resetLink);

      console.log(`[Auth] Password reset token for ${user.email}: ${token}`);

      return { success: true };
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      const resetToken = await getPasswordResetToken(input.token);

      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token inválido ou expirado",
        });
      }

      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        await deletePasswordResetToken(input.token);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token expirado",
        });
      }

      // Hash new password
      const passwordHash = hashPassword(input.newPassword);

      // Update user password
      await updateUser(resetToken.userId, {
        passwordHash,
      });

      // Delete reset token
      await deletePasswordResetToken(input.token);

      return { success: true };
    }),

  /**
   * Change password (requires authentication)
   */
  changePassword: publicProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Você precisa estar autenticado",
        });
      }

      const user = await getUserByEmail(ctx.user.email!);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não encontrado",
        });
      }

      // Verify current password
      const isPasswordValid = verifyPassword(input.currentPassword, user.passwordHash);

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha atual incorreta",
        });
      }

      // Hash new password
      const newPasswordHash = hashPassword(input.newPassword);

      // Update password
      await updateUser(user.id, {
        passwordHash: newPasswordHash,
      });

      // Clear remember token on password change
      await clearRememberToken(user.id);

      return { success: true };
    }),

  /**
   * Get current authenticated user
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      avatarUrl: ctx.user.avatarUrl,
      currentWorkoutId: ctx.user.currentWorkoutId,
    };
  }),

  /**
   * Log out current user
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    // Clear remember token from DB if user is authenticated
    if (ctx.user?.id) {
      try {
        await clearRememberToken(ctx.user.id);
      } catch {
        // Non-critical — proceed with logout even if this fails
      }
    }
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});

