import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddToWatchlistModal from "./AddToWatchlistModal";

interface TrendingMovie {
  tmdbId: string;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  overview?: string;
}

interface ClickableMovieCardProps {
  movie: TrendingMovie;
  size?: "small" | "medium";
}

export default function ClickableMovieCard({ movie, size = "medium" }: ClickableMovieCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  const cardClasses = size === "small" ? "w-36" : "w-48";
  const imageClasses = size === "small" ? "aspect-[2/3]" : "aspect-[2/3]";

  return (
    <>
      <div 
        className={`${cardClasses} flex-none cursor-pointer group`}
        onClick={() => setShowAddButton(!showAddButton)}
        onMouseEnter={() => setShowAddButton(true)}
        onMouseLeave={() => setShowAddButton(false)}
      >
        <div className="cred-card bg-[#161616] overflow-hidden hover:scale-[1.05] transition-all duration-400 relative group">
          <img 
            src={movie.posterPath || "https://via.placeholder.com/300x450?text=No+Poster"} 
            alt={movie.title}
            className={`w-full ${imageClasses} object-cover`}
          />
          
          {/* Overlay with Add to Watchlist button */}
          {showAddButton && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/90 via-[#0B0B0B]/50 to-transparent flex items-center justify-center transition-all duration-400 backdrop-blur-sm">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                variant="default"
                className="font-semibold tracking-tight cred-scale-in"
              >
                <Plus size={16} />
                Add to Watchlist
              </Button>
            </div>
          )}
          
          <div className="cred-spacing-sm">
            <h3 className="text-white text-sm font-['Poppins'] font-medium truncate tracking-tight">{movie.title}</h3>
            <p className="text-[#888888] text-xs mt-1 font-['Inter']">{movie.releaseYear}</p>
          </div>
        </div>
      </div>

      <AddToWatchlistModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movie={movie}
      />
    </>
  );
}