import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").unique(),
  replitUserId: text("replit_user_id").unique(),
  email: text("email"),
  username: text("username").notNull().unique(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameState: jsonb("game_state").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  username: text("username").notNull(),
  totalEarned: text("total_earned").notNull().default("0"),
  totalTripsCompleted: integer("total_trips_completed").notNull().default(0),
  totalCustomersServed: integer("total_customers_served").notNull().default(0),
  prestigeLevel: integer("prestige_level").notNull().default(0),
  timeMachineCount: integer("time_machine_count").notNull().default(1),
  unlockedDestinationsCount: integer("unlocked_destinations_count").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  userId: true,
  username: true,
  totalEarned: true,
  totalTripsCompleted: true,
  totalCustomersServed: true,
  prestigeLevel: true,
  timeMachineCount: true,
  unlockedDestinationsCount: true,
});

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  googleId: true,
  replitUserId: true,
  email: true,
  username: true,
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).pick({
  userId: true,
  gameState: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
