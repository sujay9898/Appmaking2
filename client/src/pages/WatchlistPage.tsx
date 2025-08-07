import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Trash2, ArrowLeft, Film } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import FooterNavigation from "@/components/FooterNavigation";
import type { Movie } from "@shared/schema";

export default function WatchlistPage() {
  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
    staleTime: 1000 * 60 * 5,
  });

  const formatReminderDate = (date: Date | string | null) => {
    if (!date) return "No reminder set";
    const d = new Date(date);
    return d.toLocaleDateString() + " at " + d.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Navigation onAddMovie={() => {}} />
      
      <div className="pt-20 max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">Movies you've saved to watch later</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="aspect-[2/3] bg-gray-700 rounded mb-4"></div>
                    <div className="h-5 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Film size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
              <p className="text-gray-400 mb-6">Start adding movies you want to watch!</p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Browse Movies
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <Card key={movie.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-4">
                  <div className="aspect-[2/3] mb-4 overflow-hidden rounded-lg">
                    {movie.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <Film size={48} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
                    {movie.title}
                  </h3>
                  
                  {movie.releaseYear && (
                    <p className="text-gray-400 text-sm mb-3">{movie.releaseYear}</p>
                  )}

                  {movie.reminderDate && (
                    <div className="flex items-center gap-2 text-blue-400 text-sm mb-3">
                      <Clock size={14} />
                      <span>Reminder: {formatReminderDate(movie.reminderDate)}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-gray-400 hover:text-white"
                    >
                      <Calendar size={16} className="mr-2" />
                      Edit Reminder
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <FooterNavigation />
    </div>
  );
}