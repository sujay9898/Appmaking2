import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tmdbId: text("tmdb_id").notNull(),
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  releaseYear: text("release_year"),
  reminderDate: text("reminder_date").notNull(),
  reminderTime: text("reminder_time").notNull(),
  userEmail: text("user_email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMovieSchema = createInsertSchema(movies).pick({
  tmdbId: true,
  title: true,
  posterPath: true,
  releaseYear: true,
  reminderDate: true,
  reminderTime: true,
  userEmail: true,
});

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;
