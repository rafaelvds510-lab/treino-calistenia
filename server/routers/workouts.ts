/**
 * Workouts router - Procedures for managing workouts and syncing data
 * Hybird sync support: syncs with database if user is authenticated, else handles stub locally.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { workoutSessions, userStats, workouts } from "../../drizzle/schema";

export const workoutsRouter = router({
  /**
   * List scheduled workouts for the current user
   */
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return [];
    }

    const db = await getDb();
    if (!db) return [];

    const sessions = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, ctx.user.id));

    return sessions.map((s) => ({
      id: String(s.id),
      data: s.sessionDate,
      workoutId: s.workoutId,
      status: s.status as "pendente" | "em_progresso" | "concluído",
      completado_em: s.completedAt ? s.completedAt.toISOString() : undefined,
      durationMinutes: s.durationMinutes || undefined,
    }));
  }),

  /**
   * Schedule a workout session (or sync a new one)
   */
  schedule: publicProcedure
    .input(
      z.object({
        workoutId: z.string(),
        sessionDate: z.string(),
        status: z.enum(["pendente", "em_progresso", "concluído"]).optional().default("pendente"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        return { success: true, id: "temp-" + Date.now() };
      }

      const db = await getDb();
      if (!db) return { success: false, message: "Database not available" };

      const [newSession] = await db
        .insert(workoutSessions)
        .values({
          userId: ctx.user.id,
          workoutId: input.workoutId,
          sessionDate: input.sessionDate,
          status: input.status,
        })
        .returning({ id: workoutSessions.id });

      return { success: true, id: String(newSession.id) };
    }),

  /**
   * Complete a scheduled workout session
   */
  complete: publicProcedure
    .input(
      z.object({
        sessionId: z.string(), // accepting string (as returned from id mapping)
        durationMinutes: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        return { success: true };
      }

      const db = await getDb();
      if (!db) return { success: false, message: "Database not available" };

      const numericId = parseInt(input.sessionId, 10);
      if (isNaN(numericId)) {
        return { success: false, message: "Invalid session ID" };
      }

      // Update workout session to completed
      await db
        .update(workoutSessions)
        .set({
          status: "concluído",
          completedAt: new Date(),
          durationMinutes: input.durationMinutes,
        })
        .where(
          and(
            eq(workoutSessions.id, numericId),
            eq(workoutSessions.userId, ctx.user.id)
          )
        );

      // Fetch or create user stats to update
      const statsList = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, ctx.user.id))
        .limit(1);

      if (statsList.length > 0) {
        const stats = statsList[0];
        const newTotalWorkouts = stats.totalWorkouts + 1;
        const newTrainingTime = stats.totalTrainingTime + input.durationMinutes;

        // Calculate simple streak increment
        let newStreak = stats.currentStreak;
        const todayStr = new Date().toISOString().split("T")[0];
        const lastWorkoutStr = stats.lastWorkoutDate
          ? stats.lastWorkoutDate.toISOString().split("T")[0]
          : null;

        if (lastWorkoutStr !== todayStr) {
          if (lastWorkoutStr) {
            const diffDays = Math.floor(
              (new Date(todayStr).getTime() - new Date(lastWorkoutStr).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (diffDays <= 1) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }
        }

        const newLongestStreak = Math.max(newStreak, stats.longestStreak);

        await db
          .update(userStats)
          .set({
            totalWorkouts: newTotalWorkouts,
            totalTrainingTime: newTrainingTime,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastWorkoutDate: new Date(),
          })
          .where(eq(userStats.userId, ctx.user.id));
      } else {
        // Create new userStats if missing
        await db.insert(userStats).values({
          userId: ctx.user.id,
          totalWorkouts: 1,
          totalTrainingTime: input.durationMinutes,
          currentStreak: 1,
          longestStreak: 1,
          lastWorkoutDate: new Date(),
        });
      }

      return { success: true };
    }),

  /**
   * Get stats for the current user
   */
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return {
        totalWorkouts: 0,
        totalTrainingTime: 0,
        totalExercisesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
      };
    }

    const db = await getDb();
    if (!db) {
      return {
        totalWorkouts: 0,
        totalTrainingTime: 0,
        totalExercisesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
      };
    }

    const statsList = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, ctx.user.id))
      .limit(1);

    if (statsList.length === 0) {
      return {
        totalWorkouts: 0,
        totalTrainingTime: 0,
        totalExercisesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
      };
    }

    const s = statsList[0];
    return {
      totalWorkouts: s.totalWorkouts,
      totalTrainingTime: s.totalTrainingTime,
      totalExercisesCompleted: s.totalExercisesCompleted,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      lastWorkoutDate: s.lastWorkoutDate ? s.lastWorkoutDate.toISOString() : null,
    };
  }),

  /**
   * Get scheduled sessions by date
   */
  getByDate: publicProcedure
    .input(
      z.object({
        sessionDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        return [];
      }

      const db = await getDb();
      if (!db) return [];

      const sessions = await db
        .select()
        .from(workoutSessions)
        .where(
          and(
            eq(workoutSessions.userId, ctx.user.id),
            eq(workoutSessions.sessionDate, input.sessionDate)
          )
        );

      return sessions.map((s) => ({
        id: String(s.id),
        data: s.sessionDate,
        workoutId: s.workoutId,
        status: s.status as "pendente" | "em_progresso" | "concluído",
        completado_em: s.completedAt ? s.completedAt.toISOString() : undefined,
        durationMinutes: s.durationMinutes || undefined,
      }));
    }),

  /**
   * List custom workouts templates for the current user
   */
  listTemplates: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, ctx.user.id));
  }),

  /**
   * Create custom workout template
   */
  createTemplate: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        descrição: z.string().optional().default(""),
        objetivo: z.enum(["resistência", "isometria", "cardio"]),
        gruposMuscularesFoco: z.array(z.string()).default([]),
        exercicios: z.array(z.any()).default([]),
        duraçãoEstimada: z.number().default(30),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [newWorkout] = await db
        .insert(workouts)
        .values({
          userId: ctx.user.id,
          nome: input.nome,
          descrição: input.descrição,
          objetivo: input.objetivo,
          gruposMuscularesFoco: input.gruposMuscularesFoco,
          exercicios: input.exercicios,
          duraçãoEstimada: input.duraçãoEstimada,
          isCustom: true,
        })
        .returning();

      return newWorkout;
    }),

  /**
   * Update custom workout template
   */
  updateTemplate: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1, "Nome é obrigatório"),
        descrição: z.string().optional().default(""),
        objetivo: z.enum(["resistência", "isometria", "cardio"]),
        gruposMuscularesFoco: z.array(z.string()).default([]),
        exercicios: z.array(z.any()).default([]),
        duraçãoEstimada: z.number().default(30),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [updatedWorkout] = await db
        .update(workouts)
        .set({
          nome: input.nome,
          descrição: input.descrição,
          objetivo: input.objetivo,
          gruposMuscularesFoco: input.gruposMuscularesFoco,
          exercicios: input.exercicios,
          duraçãoEstimada: input.duraçãoEstimada,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(workouts.id, input.id),
            eq(workouts.userId, ctx.user.id)
          )
        )
        .returning();

      return updatedWorkout;
    }),

  /**
   * Delete custom workout template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(workouts)
        .where(
          and(
            eq(workouts.id, input.id),
            eq(workouts.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});

