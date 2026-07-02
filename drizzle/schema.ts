import { integer, pgTable, text, timestamp, varchar, boolean, serial, jsonb } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  /** Email for email/password authentication */
  email: varchar("email", { length: 320 }).unique(),
  /** Hashed password for email/password authentication */
  passwordHash: text("passwordHash"),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  currentWorkoutId: varchar("currentWorkoutId", { length: 64 }),
  weeklySchedule: jsonb("weeklySchedule").$type<Record<number, string>>().default({}).notNull(),
  /** Remember me token for persistent login */
  rememberToken: varchar("rememberToken", { length: 255 }),
  rememberTokenExpiry: timestamp("rememberTokenExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Password reset tokens table
 */
export const passwordResetTokens = pgTable("passwordResetTokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * User stats table for tracking workout progress
 */
export const userStats = pgTable("userStats", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  totalWorkouts: integer("totalWorkouts").default(0).notNull(),
  totalExercisesCompleted: integer("totalExercisesCompleted").default(0).notNull(),
  totalTrainingTime: integer("totalTrainingTime").default(0).notNull(), // in minutes
  currentStreak: integer("currentStreak").default(0).notNull(),
  longestStreak: integer("longestStreak").default(0).notNull(),
  lastWorkoutDate: timestamp("lastWorkoutDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

/**
 * Scheduled workout sessions
 */
export const workoutSessions = pgTable("workoutSessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  workoutId: varchar("workoutId", { length: 64 }).notNull(),
  sessionDate: varchar("sessionDate", { length: 10 }).notNull(), // YYYY-MM-DD
  status: varchar("status", { length: 20 }).default("pendente").notNull(),
  completedAt: timestamp("completedAt"),
  durationMinutes: integer("durationMinutes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = typeof workoutSessions.$inferInsert;

/**
 * Custom Workouts table
 */
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Custom workouts are always owned by a user
  nome: text("nome").notNull(),
  descrição: text("descrição").default(""),
  objetivo: varchar("objetivo", { length: 20 }).notNull(), // 'resistência', 'isometria', 'cardio'
  gruposMuscularesFoco: jsonb("gruposMuscularesFoco").$type<string[]>().default([]).notNull(),
  exercicios: jsonb("exercicios").$type<any[]>().default([]).notNull(), // list of WorkoutExercise
  duraçãoEstimada: integer("duraçãoEstimada").default(30).notNull(), // in minutes
  isCustom: boolean("isCustom").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type WorkoutDb = typeof workouts.$inferSelect;
export type InsertWorkoutDb = typeof workouts.$inferInsert;


// TODO: Add your tables here