import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { X, Search, Film } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFeedPostSchema } from "@shared/schema";

const formSchema = insertFeedPostSchema.extend({
  postType: z.enum(["image", "movie"]),
  imageFile: z.any().optional(),
});

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Movie search query
  const { data: searchResults } = useQuery({
    queryKey: ["/api/movies/search", movieSearchQuery],
    queryFn: async () => {
      if (!movieSearchQuery.trim()) return [];
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(movieSearchQuery)}`);
      return response.json();
    },
    enabled: movieSearchQuery.length > 2,
  });

  const form = useForm({
    defaultValues: {
      caption: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const postData = {
        userId: "user1",
        content: data.caption,
        caption: data.caption,
        image: "",
        moviePoster: selectedMovie?.posterPath || "",
        movieTitle: selectedMovie?.title || "",
        movieYear: selectedMovie?.releaseYear || "",
        movieInfo: selectedMovie ? `Thoughts about: ${selectedMovie.title}` : "",
      };
      return await apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created!",
        description: "Your post has been added to the feed",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    if (!data.caption.trim()) {
      toast({
        title: "Please add your thoughts",
        description: "Share what's on your mind",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setMovieSearchQuery("");
    setSelectedMovie(null);
    setShowMovieSearch(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 bg-[#0f1419] border-white/10 text-white">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Text Area */}
          <div>
            <Label htmlFor="caption" className="text-gray-300">What's on your mind?</Label>
            <Textarea
              id="caption"
              placeholder="Share your thoughts about movies..."
              {...form.register("caption")}
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400 resize-none min-h-[120px]"
            />
          </div>

          {/* Optional Movie Search */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-300 text-sm">Add a movie (optional)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMovieSearch(!showMovieSearch)}
                className="text-xs text-gray-400 hover:text-white"
              >
                <Film size={14} className="mr-1" />
                {showMovieSearch ? "Hide" : "Search Movies"}
              </Button>
            </div>

            {showMovieSearch && (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={movieSearchQuery}
                    onChange={(e) => setMovieSearchQuery(e.target.value)}
                    placeholder="Search for a movie..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Selected Movie Display */}
                {selectedMovie && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <img
                      src={selectedMovie.posterPath || "https://via.placeholder.com/40x60?text=No+Poster"}
                      alt={selectedMovie.title}
                      className="w-10 h-15 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{selectedMovie.title}</p>
                      <p className="text-gray-400 text-xs">{selectedMovie.releaseYear}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMovie(null)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )}

                {/* Search Results */}
                {searchResults && searchResults.length > 0 && !selectedMovie && (
                  <div className="max-h-40 overflow-y-auto space-y-2 border border-white/10 rounded-lg">
                    {searchResults.slice(0, 5).map((movie: any) => (
                      <button
                        key={movie.tmdbId}
                        type="button"
                        onClick={() => {
                          setSelectedMovie(movie);
                          setMovieSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/10 transition-colors text-left"
                      >
                        <img
                          src={movie.posterPath || "https://via.placeholder.com/32x48?text=No+Poster"}
                          alt={movie.title}
                          className="w-8 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-white text-sm">{movie.title}</p>
                          <p className="text-gray-400 text-xs">{movie.releaseYear}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#284145] hover:bg-[#334c52] text-white"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}