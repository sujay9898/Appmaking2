import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Calendar, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMovieSchema } from "@shared/schema";

const formSchema = insertMovieSchema.extend({
  reminderDate: z.string().min(1, "Reminder date is required"),
  reminderTime: z.string().min(1, "Reminder time is required"),
  note: z.string().optional(),
});

interface TrendingMovie {
  tmdbId: string;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  overview?: string;
}

interface AddToWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: TrendingMovie;
}

export default function AddToWatchlistModal({ isOpen, onClose, movie }: AddToWatchlistModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tmdbId: movie.tmdbId,
      title: movie.title,
      posterPath: movie.posterPath,
      releaseYear: movie.releaseYear,
      reminderDate: "",
      reminderTime: "",
      note: "",
    },
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add movie to watchlist",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    addMovieMutation.mutate(data);
    
    // Auto-post to feed when movie is added
    createFeedPost(data);
  };

  const createFeedPost = (data: z.infer<typeof formSchema>) => {
    const feedPost = {
      id: Date.now().toString(),
      username: "you",
      caption: data.note ? `📝 ${data.note}` : "",
      content: "",
      timestamp: "just now",
      likes: 0,
      comments: 0,
      moviePoster: movie.posterPath || null,
      movieTitle: movie.title,
      movieYear: movie.releaseYear,
      movieInfo: `Added to watchlist\nWatching on: ${formatDateTime(data.reminderDate, data.reminderTime)}`
    };
    
    // Store in localStorage to be picked up by FeedPage
    const existingPosts = JSON.parse(localStorage.getItem('feedPosts') || '[]');
    existingPosts.unshift(feedPost);
    localStorage.setItem('feedPosts', JSON.stringify(existingPosts));
    
    // Dispatch custom event to notify FeedPage
    window.dispatchEvent(new CustomEvent('newFeedPost', { detail: feedPost }));
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return dateObj.toLocaleDateString('en-US', options);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar size={20} />
            Set Reminder for {movie.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Movie Preview */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={movie.posterPath || "https://via.placeholder.com/80x120?text=No+Poster"}
              alt={movie.title}
              className="w-16 h-24 object-cover" style={{borderRadius: '2px'}}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{movie.title}</h3>
              <p className="text-sm text-gray-500">{movie.releaseYear}</p>
              {movie.overview && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{movie.overview}</p>
              )}
            </div>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                When would you like to watch this?
              </h3>
              <p className="text-sm text-gray-600">
                We'll send you a reminder at the time you specify.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reminderDate" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar size={14} />
                  Date
                </Label>
                <Input
                  id="reminderDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  placeholder={getTomorrowDate()}
                  {...form.register("reminderDate")}
                  className="mt-1"
                />
                {form.formState.errors.reminderDate && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.reminderDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="reminderTime" className="flex items-center gap-2 text-sm font-medium">
                  <Clock size={14} />
                  Time
                </Label>
                <Input
                  id="reminderTime"
                  type="time"
                  {...form.register("reminderTime")}
                  className="mt-1"
                />
                {form.formState.errors.reminderTime && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.reminderTime.message}</p>
                )}
              </div>
            </div>

            

            <div>
              <Label htmlFor="note" className="flex items-center gap-2 text-sm font-medium">
                📝 Optional note for your feed
              </Label>
              <Textarea
                id="note"
                placeholder="Add a note about why you want to watch this movie..."
                {...form.register("note")}
                className="mt-1 min-h-[80px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This note will appear in your feed post when the movie is added to your watchlist.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMovieMutation.isPending}
                className="flex-1 bg-[#284145] hover:bg-[#334c52] text-white"
              >
                {addMovieMutation.isPending ? "Adding..." : "Add to Watchlist"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}