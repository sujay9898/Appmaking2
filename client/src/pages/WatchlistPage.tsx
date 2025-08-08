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
    <div className="min-h-screen bg-[#0B0B0B] pb-24 page-transition">
      <Navigation onAddMovie={() => {}} />
      
      <div className="pt-24 cred-container cred-section">
        <div className="mb-12 cred-fade-in">
          <Link href="/">
            <Button variant="link" className="text-[#888888] hover:text-[#D4AF37] mb-6 font-['Inter'] tracking-tight">
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-display font-['Poppins'] font-bold text-white mb-3 tracking-tight">My Watchlist</h1>
          <p className="text-body-lg text-[#888888] font-['Inter']">Movies you've saved to watch later</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cred-gap-lg">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="cred-card">
                <CardContent className="cred-spacing-md">
                  <div className="animate-pulse">
                    <div className="aspect-[2/3] bg-[#161616] mb-4" style={{borderRadius: '2px'}}></div>
                    <div className="h-5 bg-[#161616] mb-2" style={{borderRadius: '2px'}}></div>
                    <div className="h-4 bg-[#161616] w-2/3" style={{borderRadius: '2px'}}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <Card className="cred-card text-center cred-fade-in">
            <CardContent className="cred-spacing-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#00E5FF] mx-auto mb-6 flex items-center justify-center" style={{borderRadius: '2px'}}>
                <Film size={40} className="text-[#0B0B0B]" />
              </div>
              <h3 className="text-subheading font-['Poppins'] font-semibold text-white mb-3 tracking-tight">Your watchlist is empty</h3>
              <p className="text-body text-[#888888] mb-8 font-['Inter']">Start adding movies you want to watch!</p>
              <Link href="/">
                <Button variant="default" size="lg" className="font-semibold tracking-tight">
                  Browse Movies
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cred-gap-lg cred-slide-up">
            {movies.map((movie) => (
              <Card key={movie.id} className="cred-card group cursor-pointer hover:scale-[1.02] transition-all duration-400">
                <CardContent className="cred-spacing-md">
                  <div className="aspect-[2/3] mb-4 overflow-hidden" style={{borderRadius: '2px'}}>
                    {movie.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.05]"
                        style={{borderRadius: '2px'}}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#161616] flex items-center justify-center" style={{borderRadius: '2px'}}>
                        <Film size={48} className="text-[#888888]" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-['Poppins'] font-semibold text-white text-lg mb-2 line-clamp-2 tracking-tight">
                    {movie.title}
                  </h3>
                  
                  {movie.releaseYear && (
                    <p className="text-[#888888] text-sm mb-3 font-['Inter']">{movie.releaseYear}</p>
                  )}

                  {movie.reminderDate && (
                    <div className="flex items-center cred-gap-sm text-[#00E5FF] text-sm mb-4">
                      <Clock size={14} />
                      <span className="font-['Inter']">Reminder: {formatReminderDate(movie.reminderDate)}</span>
                    </div>
                  )}

                  <div className="flex cred-gap-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[#888888] hover:text-[#D4AF37] hover:border-[#D4AF37] font-['Inter'] tracking-tight"
                    >
                      <Calendar size={16} className="mr-2" />
                      Edit Reminder
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="text-[#888888] hover:text-[#FF4757] hover:border-[#FF4757] hover:bg-[#FF4757]/5"
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