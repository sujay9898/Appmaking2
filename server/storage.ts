import { type Movie, type InsertMovie, type MovieComment, type InsertMovieComment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getMovie(id: string): Promise<Movie | undefined>;
  getAllMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  deleteMovie(id: string): Promise<boolean>;
  updateMovie(id: string, updates: Partial<InsertMovie>): Promise<Movie | undefined>;
  
  // Movie comments
  getAllMovieComments(): Promise<MovieComment[]>;
  createMovieComment(comment: InsertMovieComment): Promise<MovieComment>;
  getMovieComments(tmdbId: string): Promise<MovieComment[]>;
}

export class MemStorage implements IStorage {
  private movies: Map<string, Movie>;
  private movieComments: Map<string, MovieComment>;

  constructor() {
    this.movies = new Map();
    this.movieComments = new Map();
  }

  async getMovie(id: string): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).sort((a, b) => 
      new Date(a.reminderDate + ' ' + a.reminderTime).getTime() - 
      new Date(b.reminderDate + ' ' + b.reminderTime).getTime()
    );
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = randomUUID();
    const movie: Movie = { 
      ...insertMovie, 
      id,
      posterPath: insertMovie.posterPath || null,
      releaseYear: insertMovie.releaseYear || null,
      createdAt: new Date()
    };
    this.movies.set(id, movie);
    return movie;
  }

  async deleteMovie(id: string): Promise<boolean> {
    return this.movies.delete(id);
  }

  async updateMovie(id: string, updates: Partial<InsertMovie>): Promise<Movie | undefined> {
    const existingMovie = this.movies.get(id);
    if (!existingMovie) return undefined;

    const updatedMovie = { ...existingMovie, ...updates };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async getAllMovieComments(): Promise<MovieComment[]> {
    return Array.from(this.movieComments.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createMovieComment(insertComment: InsertMovieComment): Promise<MovieComment> {
    const id = randomUUID();
    const comment: MovieComment = { 
      ...insertComment, 
      id,
      createdAt: new Date()
    };
    this.movieComments.set(id, comment);
    return comment;
  }

  async getMovieComments(tmdbId: string): Promise<MovieComment[]> {
    const allComments = await this.getAllMovieComments();
    return allComments.filter(comment => comment.tmdbId === tmdbId);
  }
}

export const storage = new MemStorage();
