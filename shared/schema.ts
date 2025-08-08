import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
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

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  postsCount: integer("posts_count").default(0),
  watchlistCount: integer("watchlist_count").default(0),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedPosts = pgTable("feed_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  caption: text("caption"),
  image: text("image"),
  moviePoster: text("movie_poster"),
  movieTitle: text("movie_title"),
  movieYear: text("movie_year"),
  movieInfo: text("movie_info"),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedComments = pgTable("feed_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  bio: true,
  profilePicture: true,
});

export const insertFeedPostSchema = createInsertSchema(feedPosts).pick({
  userId: true,
  content: true,
  caption: true,
  image: true,
  moviePoster: true,
  movieTitle: true,
  movieYear: true,
  movieInfo: true,
});

export const insertFeedCommentSchema = createInsertSchema(feedComments).pick({
  postId: true,
  userId: true,
  content: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFeedPost = z.infer<typeof insertFeedPostSchema>;
export type FeedPost = typeof feedPosts.$inferSelect;
export type InsertFeedComment = z.infer<typeof insertFeedCommentSchema>;
export type FeedComment = typeof feedComments.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertMovieComment = z.infer<typeof insertMovieCommentSchema>;
export type MovieComment = typeof movieComments.$inferSelect;
