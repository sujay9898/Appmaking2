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

export const movieComments = pgTable("movie_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tmdbId: text("tmdb_id").notNull(),
  movieTitle: text("movie_title").notNull(),
  userName: text("user_name").notNull(),
  comment: text("comment").notNull(),
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

export const insertMovieCommentSchema = createInsertSchema(movieComments).pick({
  tmdbId: true,
  movieTitle: true,
  userName: true,
  comment: true,
});

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertMovieComment = z.infer<typeof insertMovieCommentSchema>;
export type MovieComment = typeof movieComments.$inferSelect;
