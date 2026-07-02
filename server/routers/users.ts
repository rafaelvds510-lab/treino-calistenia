import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { updateUser } from "../db";

export const usersRouter = router({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        avatarUrl: z.string().optional(),
        currentWorkoutId: z.string().optional(),
        weeklySchedule: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await updateUser(ctx.user.id, {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
          ...(input.currentWorkoutId !== undefined && { currentWorkoutId: input.currentWorkoutId }),
          ...(input.weeklySchedule !== undefined && { weeklySchedule: input.weeklySchedule }),
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao atualizar perfil",
          cause: error,
        });
      }
    }),
});
