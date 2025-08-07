import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import AddMovieModal from "@/components/AddMovieModal";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@shared/schema";

export default function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  // Organize movies into 2 sections
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Today trending movies - show movies with upcoming reminders (next 7 days) or recently added
  const trendingMovies = movies.filter(movie => {
    const reminderDate = new Date(movie.reminderDate);
    return reminderDate >= now && reminderDate <= nextWeek;
  }).slice(0, 10);
  
  // If no upcoming movies, show the most recently added ones as trending
  const finalTrendingMovies = trendingMovies.length > 0 
    ? trendingMovies 
    : movies.slice(0, Math.min(6, movies.length));
  
  // Recently added movies (sorted by creation date)
  const recentlyAddedMovies = [...movies]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 10);

  const MovieRow = ({ title, movies: rowMovies }: { title: string; movies: Movie[] }) => {
    if (rowMovies.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 px-4">{title}</h2>
        <div className="flex overflow-x-auto pb-4 px-4 space-x-4 scrollbar-hide">
          {rowMovies.map((movie) => (
            <div key={movie.id} className="flex-none w-48">
              <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200">
                <img 
                  src={movie.posterPath || "https://via.placeholder.com/300x450?text=No+Poster"} 
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium truncate">{movie.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">{movie.releaseYear}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
        <div className="pt-20">
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-8 px-4">
              <div className="h-6 bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="flex-none w-48 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      
      <div className="pt-20">
        {/* Hero Section */}
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Your Personal Watchlist
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Never miss a movie you want to watch
          </p>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-state">
            <div className="bg-gray-800 mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4">
              <Film className="text-3xl text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No movies in your watchlist
            </h3>
            <p className="text-gray-400 mb-6">
              Start building your watchlist by adding your first movie!
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              data-testid="button-add-first-movie"
            >
              Add Your First Movie
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <MovieRow title="Today Trending Movies" movies={finalTrendingMovies} />
            <MovieRow title="Recently Added Movies" movies={recentlyAddedMovies} />
          </div>
        )}
      </div>

      <AddMovieModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
