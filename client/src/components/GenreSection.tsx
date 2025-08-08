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
      <div className="mb-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
          <span className="ml-3 text-[#B8B8B8] font-['Inter'] text-sm">Loading genres...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="cred-container">
        <h2 className="text-heading font-['Poppins'] font-semibold text-white mb-6 tracking-tight">Browse by Genre</h2>
      </div>
      
      {/* Genre Pills */}
      <div className="flex overflow-x-auto pb-4 px-6 cred-gap-sm scrollbar-hide cred-scrollbar mb-6">
        {genres.map((genre) => (
          <Button
            key={genre.id}
            onClick={() => setSelectedGenre(genre)}
            variant={selectedGenre?.id === genre.id ? "default" : "outline"}
            size="sm"
            className={`flex-none whitespace-nowrap font-semibold tracking-tight font-['Inter'] transition-all duration-400 ${
              selectedGenre?.id === genre.id
                ? "shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105"
                : "hover:scale-105"
            }`}
          >
            {genre.name}
          </Button>
        ))}
      </div>

      {/* Movies for Selected Genre */}
      {selectedGenre && (
        <div>
          <div className="cred-container">
            <h3 className="text-subheading font-['Poppins'] font-medium text-white mb-4 tracking-tight">
              {selectedGenre.name} Movies
            </h3>
          </div>
          
          {isLoadingMovies ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
              <span className="ml-3 text-[#B8B8B8] font-['Inter'] text-sm">Loading movies...</span>
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-6 px-6 cred-gap-md scrollbar-hide cred-scrollbar">
              {genreMovies.map((movie) => (
                <ClickableMovieCard key={movie.tmdbId} movie={movie} size="medium" />
              ))}
              {genreMovies.length === 0 && (
                <div className="text-center py-12 w-full">
                  <p className="text-[#888888] font-['Inter']">No movies found for this genre</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}