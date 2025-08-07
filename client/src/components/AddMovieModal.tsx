import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMovieSchema } from "@shared/schema";

const formSchema = insertMovieSchema.extend({
  reminderDate: z.string().min(1, "Reminder date is required"),
  reminderTime: z.string().min(1, "Reminder time is required"),
  userEmail: z.string().email("Valid email is required"),
});

interface SearchResult {
  tmdbId: string;
  title: string;
  posterPath: string | null;
  releaseYear: string;
}

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMovieModal({ isOpen, onClose }: AddMovieModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tmdbId: "",
      title: "",
      posterPath: "",
      releaseYear: "",
      reminderDate: "",
      reminderTime: "",
      userEmail: "",
    },
  });

  // Search movies from TMDB
  const { data: searchResults = [], isLoading: isSearching } = useQuery<SearchResult[]>({
    queryKey: [`/api/movies/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length > 2,
  });

  const addMovieMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/movies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Movie added!",
        description: "Movie has been added to your watchlist",
      });
      onClose();
      form.reset();
      setSelectedMovie(null);
      setSearchQuery("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add movie to watchlist",
        variant: "destructive",
      });
    },
  });

  const handleMovieSelect = (movie: SearchResult) => {
    setSelectedMovie(movie);
    setSearchQuery(movie.title);
    setShowResults(false);
    
    form.setValue("tmdbId", movie.tmdbId);
    form.setValue("title", movie.title);
    form.setValue("posterPath", movie.posterPath || "");
    form.setValue("releaseYear", movie.releaseYear);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!selectedMovie) {
      toast({
        title: "Please select a movie",
        description: "Search and select a movie from the results",
        variant: "destructive",
      });
      return;
    }
    addMovieMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedMovie(null);
    setSearchQuery("");
    setShowResults(false);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="modal-add-movie">
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Movie Search */}
          <div className="relative">
            <Label htmlFor="movieSearch">Movie Name</Label>
            <div className="relative mt-2">
              <Input
                id="movieSearch"
                type="text"
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                  if (!e.target.value) {
                    setSelectedMovie(null);
                    form.setValue("tmdbId", "");
                    form.setValue("title", "");
                    form.setValue("posterPath", "");
                    form.setValue("releaseYear", "");
                  }
                }}
                onFocus={() => setShowResults(true)}
                className="pr-10"
                data-testid="input-movie-search"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            
            {/* Search Results */}
            {showResults && searchQuery.length > 2 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto" data-testid="search-results">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-gray-500">No movies found</div>
                ) : (
                  searchResults.map((movie) => (
                    <div
                      key={movie.tmdbId}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center space-x-3 last:border-b-0"
                      onClick={() => handleMovieSelect(movie)}
                      data-testid={`search-result-${movie.tmdbId}`}
                    >
                      <img 
                        src={movie.posterPath || "https://via.placeholder.com/48x72?text=No+Poster"} 
                        alt={movie.title} 
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{movie.title}</p>
                        <p className="text-sm text-gray-600">{movie.releaseYear}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Movie Preview */}
          {selectedMovie && (
            <div className="bg-gray-50 rounded-lg p-4" data-testid="selected-movie-preview">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedMovie.posterPath || "https://via.placeholder.com/64x96?text=No+Poster"} 
                  alt={selectedMovie.title} 
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedMovie.title}</h4>
                  <p className="text-sm text-gray-600">{selectedMovie.releaseYear}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reminder Date */}
          <div>
            <Label htmlFor="reminderDate">Reminder Date</Label>
            <Input
              id="reminderDate"
              type="date"
              min={today}
              {...form.register("reminderDate")}
              className="mt-2"
              data-testid="input-reminder-date"
            />
            {form.formState.errors.reminderDate && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.reminderDate.message}</p>
            )}
          </div>

          {/* Reminder Time */}
          <div>
            <Label htmlFor="reminderTime">Reminder Time</Label>
            <Input
              id="reminderTime"
              type="time"
              {...form.register("reminderTime")}
              className="mt-2"
              data-testid="input-reminder-time"
            />
            {form.formState.errors.reminderTime && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.reminderTime.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email for Reminders</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...form.register("userEmail")}
              className="mt-2"
              data-testid="input-email"
            />
            {form.formState.errors.userEmail && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.userEmail.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              disabled={addMovieMutation.isPending || !selectedMovie}
              data-testid="button-add-to-watchlist"
            >
              {addMovieMutation.isPending ? "Adding..." : "Add to Watchlist"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
