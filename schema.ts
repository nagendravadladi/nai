import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  profilePicture: text("profile_picture"),
  dailyQuote: text("daily_quote"),
  portfolioLink: text("portfolio_link"),
  theme: text("theme").default("light"),
  focusModeEnabled: boolean("focus_mode_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studyResources = pgTable("study_resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'youtube', 'note', 'resource'
  title: text("title").notNull(),
  content: text("content"), // URL for youtube/resource, rich text for notes
  thumbnail: text("thumbnail"),
  folder: text("folder"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameName: text("game_name").notNull(),
  score: integer("score").notNull(),
  stars: integer("stars").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const musicPlaylists = pgTable("music_playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  platform: text("platform").notNull(), // 'spotify', 'youtube', 'local'
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gymExercises = pgTable("gym_exercises", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  muscleGroup: text("muscle_group").notNull(),
  exerciseName: text("exercise_name").notNull(),
  status: text("status").notNull(), // 'completed', 'skipped', 'pending'
  date: timestamp("date").defaultNow(),
});

export const healthData = pgTable("health_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'food_scan', 'tip'
  content: text("content").notNull(),
  rating: text("rating"), // 'healthy', 'not_recommended'
  createdAt: timestamp("created_at").defaultNow(),
});

export const entertainmentItems = pgTable("entertainment_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  platform: text("platform").notNull(),
  url: text("url"),
  thumbnail: text("thumbnail"),
  status: text("status").default("watch_later"), // 'watch_later', 'watched'
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  price: text("price"),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  priority: text("priority").default("medium"), // 'high', 'medium', 'low'
  createdAt: timestamp("created_at").defaultNow(),
});

export const financeData = pgTable("finance_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'income', 'expense', 'bill'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  filePath: text("file_path").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiTools = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shortcuts = pgTable("shortcuts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  isPinned: boolean("is_pinned").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const performanceData = pgTable("performance_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  section: text("section").notNull(), // 'study', 'gym', 'focus', etc.
  metric: text("metric").notNull(),
  value: integer("value").notNull(),
  date: timestamp("date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudyResourceSchema = createInsertSchema(studyResources).omit({ id: true, createdAt: true });
export const insertGameScoreSchema = createInsertSchema(gameScores).omit({ id: true, completedAt: true });
export const insertMusicPlaylistSchema = createInsertSchema(musicPlaylists).omit({ id: true, createdAt: true });
export const insertGymExerciseSchema = createInsertSchema(gymExercises).omit({ id: true, createdAt: true });
export const insertHealthDataSchema = createInsertSchema(healthData).omit({ id: true, createdAt: true });
export const insertEntertainmentItemSchema = createInsertSchema(entertainmentItems).omit({ id: true, createdAt: true });
export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({ id: true, createdAt: true });
export const insertFinanceDataSchema = createInsertSchema(financeData).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertAIToolSchema = createInsertSchema(aiTools).omit({ id: true, createdAt: true });
export const insertShortcutSchema = createInsertSchema(shortcuts).omit({ id: true, createdAt: true });
export const insertPerformanceDataSchema = createInsertSchema(performanceData).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type StudyResource = typeof studyResources.$inferSelect;
export type InsertStudyResource = z.infer<typeof insertStudyResourceSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type MusicPlaylist = typeof musicPlaylists.$inferSelect;
export type InsertMusicPlaylist = z.infer<typeof insertMusicPlaylistSchema>;
export type GymExercise = typeof gymExercises.$inferSelect;
export type InsertGymExercise = z.infer<typeof insertGymExerciseSchema>;
export type HealthData = typeof healthData.$inferSelect;
export type InsertHealthData = z.infer<typeof insertHealthDataSchema>;
export type EntertainmentItem = typeof entertainmentItems.$inferSelect;
export type InsertEntertainmentItem = z.infer<typeof insertEntertainmentItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type FinanceData = typeof financeData.$inferSelect;
export type InsertFinanceData = z.infer<typeof insertFinanceDataSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type AITool = typeof aiTools.$inferSelect;
export type InsertAITool = z.infer<typeof insertAIToolSchema>;
export type Shortcut = typeof shortcuts.$inferSelect;
export type InsertShortcut = z.infer<typeof insertShortcutSchema>;
export type PerformanceData = typeof performanceData.$inferSelect;
export type InsertPerformanceData = z.infer<typeof insertPerformanceDataSchema>;
