import { type Movie, type InsertMovie, type MovieComment, type InsertMovieComment, type User, type InsertUser, type FeedPost, type InsertFeedPost, type FeedComment, type InsertFeedComment } from "@shared/schema";
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
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Feed posts
  getFeedPost(id: string): Promise<FeedPost | undefined>;
  getAllFeedPosts(): Promise<FeedPost[]>;
  getUserFeedPosts(userId: string): Promise<FeedPost[]>;
  createFeedPost(post: InsertFeedPost): Promise<FeedPost>;
  updateFeedPost(id: string, updates: Partial<InsertFeedPost>): Promise<FeedPost | undefined>;
  deleteFeedPost(id: string): Promise<boolean>;
  
  // Feed comments
  getFeedComment(id: string): Promise<FeedComment | undefined>;
  getPostComments(postId: string): Promise<FeedComment[]>;
  createFeedComment(comment: InsertFeedComment): Promise<FeedComment>;
  deleteFeedComment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private movies: Map<string, Movie>;
  private movieComments: Map<string, MovieComment>;
  private users: Map<string, User>;
  private feedPosts: Map<string, FeedPost>;
  private feedComments: Map<string, FeedComment>;

  constructor() {
    this.movies = new Map();
    this.movieComments = new Map();
    this.users = new Map();
    this.feedPosts = new Map();
    this.feedComments = new Map();
    
    // Create some dummy users for development
    this.createDummyUsers();
  }
  
  private async createDummyUsers() {
    const dummyUsers = [
      {
        username: "moviebuff23",
        email: "moviebuff23@example.com",
        bio: "Movie enthusiast who loves discovering hidden gems and sharing reviews",
        postsCount: 15,
        watchlistCount: 42,
        likesCount: 128
      },
      {
        username: "cinephile_sarah",
        email: "sarah@example.com",
        bio: "Film critic and weekend binge-watcher. Always looking for the next great story",
        postsCount: 23,
        watchlistCount: 67,
        likesCount: 234
      },
      {
        username: "film_critic_joe",
        email: "joe@example.com",
        bio: "Independent film critic focusing on storytelling and cinematography",
        postsCount: 8,
        watchlistCount: 31,
        likesCount: 89
      },
      {
        username: "you",
        email: "you@example.com",
        bio: "Your personal movie journey starts here",
        postsCount: 3,
        watchlistCount: 12,
        likesCount: 25
      }
    ];
    
    for (const userData of dummyUsers) {
      await this.createUser(userData);
    }
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
  
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async createUser(insertUser: InsertUser & { postsCount?: number; watchlistCount?: number; likesCount?: number }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      postsCount: insertUser.postsCount || 0,
      watchlistCount: insertUser.watchlistCount || 0, 
      likesCount: insertUser.likesCount || 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Feed post methods
  async getFeedPost(id: string): Promise<FeedPost | undefined> {
    return this.feedPosts.get(id);
  }
  
  async getAllFeedPosts(): Promise<FeedPost[]> {
    return Array.from(this.feedPosts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }
  
  async getUserFeedPosts(userId: string): Promise<FeedPost[]> {
    const allPosts = await this.getAllFeedPosts();
    return allPosts.filter(post => post.userId === userId);
  }
  
  async createFeedPost(insertPost: InsertFeedPost): Promise<FeedPost> {
    const id = randomUUID();
    const post: FeedPost = {
      id,
      userId: insertPost.userId,
      content: insertPost.content,
      caption: insertPost.caption || null,
      image: insertPost.image || null,
      moviePoster: insertPost.moviePoster || null,
      movieTitle: insertPost.movieTitle || null,
      movieYear: insertPost.movieYear || null,
      movieInfo: insertPost.movieInfo || null,
      likes: 0,
      commentsCount: 0,
      createdAt: new Date()
    };
    this.feedPosts.set(id, post);
    return post;
  }
  
  async updateFeedPost(id: string, updates: Partial<FeedPost>): Promise<FeedPost | undefined> {
    const existingPost = this.feedPosts.get(id);
    if (!existingPost) return undefined;
    
    const updatedPost = { ...existingPost, ...updates };
    this.feedPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteFeedPost(id: string): Promise<boolean> {
    return this.feedPosts.delete(id);
  }
  
  // Feed comment methods
  async getFeedComment(id: string): Promise<FeedComment | undefined> {
    return this.feedComments.get(id);
  }
  
  async getPostComments(postId: string): Promise<FeedComment[]> {
    const allComments = Array.from(this.feedComments.values());
    return allComments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }
  
  async createFeedComment(insertComment: InsertFeedComment): Promise<FeedComment> {
    const id = randomUUID();
    const comment: FeedComment = {
      ...insertComment,
      id,
      createdAt: new Date()
    };
    this.feedComments.set(id, comment);
    
    // Update comment count for the post
    const post = await this.getFeedPost(insertComment.postId);
    if (post) {
      await this.updateFeedPost(post.id, { commentsCount: (post.commentsCount || 0) + 1 });
    }
    
    return comment;
  }
  
  async deleteFeedComment(id: string): Promise<boolean> {
    const comment = await this.getFeedComment(id);
    if (!comment) return false;
    
    const deleted = this.feedComments.delete(id);
    
    // Update comment count for the post
    if (deleted) {
      const post = await this.getFeedPost(comment.postId);
      if (post && post.commentsCount && post.commentsCount > 0) {
        await this.updateFeedPost(post.id, { commentsCount: post.commentsCount - 1 });
      }
    }
    
    return deleted;
  }
}

export const storage = new MemStorage();
