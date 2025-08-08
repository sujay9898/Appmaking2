import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import AddMovieModal from "@/components/AddMovieModal";
import ClickableMovieCard from "@/components/ClickableMovieCard";
import GenreSection from "@/components/GenreSection";
import FooterNavigation from "@/components/FooterNavigation";
import ShareAboutMovies from "@/components/ShareAboutMovies";
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
      <div className="mb-12">
        <div className="cred-container">
          <h2 className="text-heading font-['Poppins'] font-semibold text-[#EAEAEA] mb-6 tracking-tight">{title}</h2>
        </div>
        <div className="flex overflow-x-auto pb-6 px-6 cred-gap-md scrollbar-hide cred-scrollbar">
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
      <div className="mb-12">
        <div className="cred-container">
          <h2 className="text-heading font-['Poppins'] font-semibold text-[#EAEAEA] mb-8 tracking-tight">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cred-gap-lg">
            {rowMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || isLoadingTrendingAll) {
    return (
      <div className="min-h-screen bg-[#090708] page-transition">
        <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
        <div className="pt-24 cred-container">
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-12">
              <div className="h-8 bg-[#121011] rounded-[2px] w-48 mb-6 animate-pulse"></div>
              <div className="flex cred-gap-md overflow-x-auto scrollbar-hide">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="flex-none w-48 aspect-[2/3] bg-[#121011] rounded-[2px] animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090708] pb-24 page-transition">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      
      <div className="pt-24">
        {/* Share About Movies Section */}
        <div className="cred-fade-in">
          <ShareAboutMovies />
        </div>
        
        {/* Always show trending content and genres */}
        <div className="cred-section space-y-12">
          <div className="cred-slide-up">
            <TrendingMovieRow title="Today Trending Movies & Series" movies={trendingAll} />
          </div>
          <div className="cred-slide-up" style={{animationDelay: '0.2s'}}>
            <GenreSection />
          </div>
          
          {/* Show recently added movies if any */}
          {movies.length > 0 && (
            <div className="cred-slide-up" style={{animationDelay: '0.4s'}}>
              <WatchlistMovieSection title="Recently Added Movies" movies={recentlyAddedMovies} />
            </div>
          )}
        </div>
      </div>

      <AddMovieModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      <FooterNavigation />
    </div>
  );
}
