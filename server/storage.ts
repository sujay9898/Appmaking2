import { type Movie, type InsertMovie } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getMovie(id: string): Promise<Movie | undefined>;
  getAllMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  deleteMovie(id: string): Promise<boolean>;
  updateMovie(id: string, updates: Partial<InsertMovie>): Promise<Movie | undefined>;
}

export class MemStorage implements IStorage {
  private movies: Map<string, Movie>;

  constructor() {
    this.movies = new Map();
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
}

export const storage = new MemStorage();
