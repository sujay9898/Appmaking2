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
        <div className="bg-gray-800 overflow-hidden hover:scale-105 transition-transform duration-200 relative" style={{borderRadius: '2px'}}>
          <img 
            src={movie.posterPath || "https://via.placeholder.com/300x450?text=No+Poster"} 
            alt={movie.title}
            className={`w-full ${imageClasses} object-cover`}
          />
          
          {/* Overlay with Add to Watchlist button */}
          {showAddButton && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-opacity duration-200">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 flex items-center gap-2"
              >
                <Plus size={16} />
                Add to Watchlist
              </Button>
            </div>
          )}
          
          <div className="p-3">
            <h3 className="text-white text-sm font-medium truncate">{movie.title}</h3>
            <p className="text-gray-400 text-xs mt-1">{movie.releaseYear}</p>
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