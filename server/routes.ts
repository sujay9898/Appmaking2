import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tmdbService } from "./services/tmdb";
import { reminderScheduler } from "./services/reminderScheduler";
import { insertMovieSchema, insertMovieCommentSchema, insertFeedCommentSchema, insertFeedPostSchema } from "@shared/schema";
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
        overview: movie.overview || '',
      }));

      res.json(transformedMovies);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ message: "Failed to fetch trending movies" });
    }
  });

  // Get genres from TMDB
  app.get("/api/movies/genres", async (req, res) => {
    try {
      const genres = await tmdbService.getGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  // Get movies by genre from TMDB
  app.get("/api/movies/genre/:genreId", async (req, res) => {
    try {
      const genreId = parseInt(req.params.genreId);
      const movies = await tmdbService.getMoviesByGenre(genreId);
      
      // Transform the data for frontend
      const transformedMovies = movies.map(movie => ({
        tmdbId: movie.id.toString(),
        title: movie.title,
        posterPath: tmdbService.getImageUrl(movie.poster_path),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
        overview: movie.overview || '',
      }));

      res.json(transformedMovies);
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
      res.status(500).json({ message: "Failed to fetch movies by genre" });
    }
  });

  // Search movies from TMDB
  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }

      const movies = await tmdbService.searchMovies(query);
      
      // Transform the data for frontend
      const transformedMovies = movies.map(movie => ({
        tmdbId: movie.id.toString(),
        title: movie.title,
        posterPath: tmdbService.getImageUrl(movie.poster_path),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
        overview: movie.overview || '',
      }));

      res.json(transformedMovies);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  // Get trending movies & series from TMDB
  app.get("/api/movies/trending-all", async (req, res) => {
    try {
      const content = await tmdbService.getTrendingAll();
      
      // Transform the data for frontend
      const transformedContent = content.map(item => ({
        tmdbId: item.id.toString(),
        title: item.title || (item as any).name, // TV shows use 'name' instead of 'title'
        posterPath: tmdbService.getImageUrl(item.poster_path),
        releaseYear: item.release_date ? new Date(item.release_date).getFullYear().toString() : 
                    (item as any).first_air_date ? new Date((item as any).first_air_date).getFullYear().toString() : '',
        overview: item.overview || '',
      }));

      res.json(transformedContent);
    } catch (error) {
      console.error("Error fetching trending content:", error);
      res.status(500).json({ message: "Failed to fetch trending content" });
    }
  });



  // Add movie to watchlist
  app.post("/api/movies", async (req, res) => {
    try {
      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      
      // Also create a feed post when movie is added to watchlist
      const feedPost = {
        userId: "user1", // Using the same user ID pattern as other posts
        content: "",
        caption: `Added "${movie.title}" to my watchlist! Can't wait to watch this ${movie.releaseYear} movie.`,
        image: "",
        moviePoster: movie.posterPath || "",
        movieTitle: movie.title,
        movieYear: movie.releaseYear,
        movieInfo: `Reminder set for ${movie.reminderDate} at ${movie.reminderTime}`,
      };
      
      await storage.createFeedPost(feedPost);
      
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

  // Movie comments routes
  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getAllMovieComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertMovieCommentSchema.parse(req.body);
      const comment = await storage.createMovieComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      } else {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/comments/:tmdbId", async (req, res) => {
    try {
      const { tmdbId } = req.params;
      const comments = await storage.getMovieComments(tmdbId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching movie comments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's posts and watchlist
      const posts = await storage.getUserFeedPosts(user.id);
      const watchlist = await storage.getAllMovies(); // In a real app, this would be user-specific
      
      res.json({
        user,
        posts: posts.slice(0, 10), // Limit to recent posts
        watchlist: watchlist.slice(0, 12), // Limit to recent watchlist items
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Feed post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllFeedPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertFeedPostSchema.parse(req.body);
      const post = await storage.createFeedPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Feed comments routes
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getPostComments(postId);
      
      // Add username to each comment (simulated - in a real app, this would be a JOIN)
      const commentsWithUsernames = comments.map(comment => ({
        ...comment,
        username: comment.userId === "current-user" ? "you" : `user_${comment.userId.slice(0, 8)}`,
        userProfilePicture: null
      }));
      
      res.json(commentsWithUsernames);
    } catch (error) {
      console.error("Error fetching post comments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const validatedData = insertFeedCommentSchema.parse({ ...req.body, postId });
      const comment = await storage.createFeedComment(validatedData);
      
      // Return comment with username
      const commentWithUsername = {
        ...comment,
        username: comment.userId === "current-user" ? "you" : `user_${comment.userId.slice(0, 8)}`,
        userProfilePicture: null
      };
      
      res.status(201).json(commentWithUsername);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
