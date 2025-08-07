import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import StatsSection from "@/components/StatsSection";
import Sidebar from "@/components/Sidebar";
import MovieCard from "@/components/MovieCard";
import AddMovieModal from "@/components/AddMovieModal";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@shared/schema";

export default function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    const reminderDate = new Date(`${movie.reminderDate} ${movie.reminderTime}`);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filterType) {
      case "upcoming":
        return reminderDate > now;
      case "this-week":
        return reminderDate > now && reminderDate <= weekFromNow;
      case "past":
        return reminderDate <= now;
      default:
        return true;
    }
  });

  const upcomingReminders = movies.filter(movie => {
    const reminderDate = new Date(`${movie.reminderDate} ${movie.reminderTime}`);
    return reminderDate > new Date();
  }).length;

  const thisWeekReminders = movies.filter(movie => {
    const reminderDate = new Date(`${movie.reminderDate} ${movie.reminderTime}`);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return reminderDate > now && reminderDate <= weekFromNow;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsSection 
          totalMovies={movies.length}
          upcomingReminders={upcomingReminders}
          thisWeekCount={thisWeekReminders}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar 
            filterType={filterType}
            onFilterChange={setFilterType}
          />
          
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Watchlist</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search movies..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-movies"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>

            {filteredMovies.length === 0 ? (
              <div className="text-center py-16" data-testid="empty-state">
                <div className="bg-gray-100 mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4">
                  <Film className="text-3xl text-gray-400" size={48} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {movies.length === 0 ? "No movies in your watchlist" : "No movies match your search"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {movies.length === 0 
                    ? "Start building your watchlist by adding your first movie!" 
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                {movies.length === 0 && (
                  <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700"
                    data-testid="button-add-first-movie"
                  >
                    Add Your First Movie
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="movie-grid">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMovieModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
