import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClickableMovieCard from "./ClickableMovieCard";

interface Genre {
  id: number;
  name: string;
}

interface TrendingMovie {
  tmdbId: string;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  overview?: string;
}

export default function GenreSection() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  
  // Fetch genres
  const { data: genres = [], isLoading: isLoadingGenres } = useQuery<Genre[]>({
    queryKey: ["/api/movies/genres"],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch movies by selected genre
  const { data: genreMovies = [], isLoading: isLoadingMovies } = useQuery<TrendingMovie[]>({
    queryKey: [`/api/movies/genre/${selectedGenre?.id}`],
    enabled: !!selectedGenre,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Auto-select first genre when genres load
  React.useEffect(() => {
    if (genres.length > 0 && !selectedGenre) {
      setSelectedGenre(genres[0]);
    }
  }, [genres, selectedGenre]);

  if (isLoadingGenres) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="ml-2 text-white">Loading genres...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4 px-4">Browse by Genre</h2>
      
      {/* Genre Pills */}
      <div className="flex overflow-x-auto pb-2 px-4 space-x-2 scrollbar-hide mb-4">
        {genres.map((genre) => (
          <Button
            key={genre.id}
            onClick={() => setSelectedGenre(genre)}
            variant={selectedGenre?.id === genre.id ? "default" : "outline"}
            className={`flex-none px-4 py-2 text-sm whitespace-nowrap transition-colors ${
              selectedGenre?.id === genre.id
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            }`}
          >
            {genre.name}
          </Button>
        ))}
      </div>

      {/* Movies for Selected Genre */}
      {selectedGenre && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3 px-4">
            {selectedGenre.name} Movies
          </h3>
          
          {isLoadingMovies ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
              <span className="ml-2 text-white">Loading movies...</span>
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 px-4 space-x-4 scrollbar-hide">
              {genreMovies.map((movie) => (
                <ClickableMovieCard key={movie.tmdbId} movie={movie} size="medium" />
              ))}
              {genreMovies.length === 0 && (
                <div className="text-center py-8 w-full">
                  <p className="text-gray-400">No movies found for this genre</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}