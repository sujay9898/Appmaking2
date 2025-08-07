import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import AddMovieModal from "@/components/AddMovieModal";
import ClickableMovieCard from "@/components/ClickableMovieCard";
import GenreSection from "@/components/GenreSection";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@shared/schema";

interface TrendingMovie {
  tmdbId: string;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  overview?: string;
}

export default function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  // Fetch trending movies from TMDB
  const { data: trendingMovies = [], isLoading: isLoadingTrending } = useQuery<TrendingMovie[]>({
    queryKey: ["/api/movies/trending"],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Fetch trending movies & series from TMDB
  const { data: trendingAll = [], isLoading: isLoadingTrendingAll } = useQuery<TrendingMovie[]>({
    queryKey: ["/api/movies/trending-all"],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Organize movies into 2 sections
  // Recently added movies from user's watchlist (sorted by creation date)
  const recentlyAddedMovies = [...movies]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 10);
  

  // Component for trending movies from TMDB with clickable cards
  const TrendingMovieRow = ({ title, movies: rowMovies }: { title: string; movies: TrendingMovie[] }) => {
    if (rowMovies.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 px-4">{title}</h2>
        <div className="flex overflow-x-auto pb-4 px-4 space-x-4 scrollbar-hide">
          {rowMovies.map((movie) => (
            <ClickableMovieCard key={movie.tmdbId} movie={movie} size="medium" />
          ))}
        </div>
      </div>
    );
  };

  // Component for user's watchlist movies - now using the full MovieCard component
  const WatchlistMovieSection = ({ title, movies: rowMovies }: { title: string; movies: Movie[] }) => {
    if (rowMovies.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 px-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {rowMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading || isLoadingTrending || isLoadingTrendingAll) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
        <div className="pt-20">
          {[1, 2, 3, 4].map(i => (
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

        {/* Always show trending content and genres */}
        <div className="space-y-8">
          <TrendingMovieRow title="Today Trending Movies" movies={trendingMovies} />
          <TrendingMovieRow title="Today Trending Movies & Series" movies={trendingAll} />
          <GenreSection />
          
          {/* Show watchlist section or empty state */}
          {movies.length === 0 ? (
            <div className="text-center py-16 px-4" data-testid="empty-watchlist">
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
            <WatchlistMovieSection title="Recently Added Movies" movies={recentlyAddedMovies} />
          )}
        </div>
      </div>

      <AddMovieModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
