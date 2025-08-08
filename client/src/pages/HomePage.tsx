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
      <div className="modern-container">
        <h2 className="text-xl font-semibold text-[#ffffff] mb-6">{title}</h2>
        <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide">
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
      <div className="modern-container">
        <h2 className="text-xl font-semibold text-[#ffffff] mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rowMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading || isLoadingTrendingAll) {
    return (
      <div className="min-h-screen bg-[#000000]">
        <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
        <div className="pt-24 modern-container">
          {[1, 2, 3].map(i => (
            <section key={i} className="modern-section">
              <div className="h-8 bg-[#3c595d] rounded-[2px] w-48 mb-6 animate-pulse"></div>
              <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="flex-none w-48 aspect-[2/3] bg-[#3c595d] rounded-[2px] animate-pulse"></div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      
      <div className="pt-24">
        {/* Share About Movies Section */}
        <section className="modern-section">
          <ShareAboutMovies />
        </section>
        
        {/* Always show trending content and genres */}
        <div className="space-y-0">
          <section className="modern-section">
            {/* Hi Cinephile Greeting */}
            <div className="modern-container mb-4">
              <h2 className="text-2xl font-bold italic text-[#ffffff] pb-3 text-left" style={{ fontSize: '1.6em' }}>
                Hi Cinephile
              </h2>
            </div>
            <TrendingMovieRow title="Today Trending Movies & Series" movies={trendingAll} />
          </section>
          <section className="modern-section">
            <GenreSection />
          </section>
          
          {/* Show recently added movies if any */}
          {movies.length > 0 && (
            <section className="modern-section">
              <WatchlistMovieSection title="Recently Added Movies" movies={recentlyAddedMovies} />
            </section>
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
