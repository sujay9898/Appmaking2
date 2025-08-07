import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tmdbService } from "./services/tmdb";
import { reminderScheduler } from "./services/reminderScheduler";
import { insertMovieSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the reminder scheduler
  reminderScheduler.start();

  // Get all movies in watchlist
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get trending movies from TMDB
  app.get("/api/movies/trending", async (req, res) => {
    try {
      const movies = await tmdbService.getTrendingMovies();
      
      // Transform the data for frontend
      const transformedMovies = movies.map(movie => ({
        tmdbId: movie.id.toString(),
        title: movie.title,
        posterPath: tmdbService.getImageUrl(movie.poster_path),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
      }));

      res.json(transformedMovies);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ message: "Failed to fetch trending movies" });
    }
  });

  // Search movies using TMDB API
  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const movies = await tmdbService.searchMovies(query);
      
      // Transform the data for frontend
      const transformedMovies = movies.map(movie => ({
        tmdbId: movie.id.toString(),
        title: movie.title,
        posterPath: tmdbService.getImageUrl(movie.poster_path),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
      }));

      res.json(transformedMovies);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  // Add movie to watchlist
  app.post("/api/movies", async (req, res) => {
    try {
      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      res.status(201).json(movie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete movie from watchlist
  app.delete("/api/movies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMovie(id);
      
      if (!success) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update movie reminder
  app.patch("/api/movies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedMovie = await storage.updateMovie(id, updates);
      
      if (!updatedMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.json(updatedMovie);
    } catch (error) {
      console.error("Error updating movie:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
