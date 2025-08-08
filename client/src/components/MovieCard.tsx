import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Mail, X, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Movie } from "@shared/schema";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getTimeUntilReminder = () => {
    const reminderDate = new Date(`${movie.reminderDate} ${movie.reminderTime}`);
    const now = new Date();
    const diffMs = reminderDate.getTime() - now.getTime();
    
    if (diffMs < 0) return "Past";
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return "This Week";
    return "Later";
  };

  const getTimeColor = () => {
    const timeUntil = getTimeUntilReminder();
    switch (timeUntil) {
      case "Today": return "bg-[#3c595d]";
      case "Tomorrow": return "bg-[#4a6b70]";
      case "This Week": return "bg-[#587d83]";
      case "Past": return "bg-[#669096]";
      default: return "bg-[#74a2a9]";
    }
  };

  const deleteMovieMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/movies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Movie removed",
        description: "Movie has been removed from your watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove movie",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to remove this movie from your watchlist?")) {
      deleteMovieMutation.mutate(movie.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="modern-card group cursor-pointer transition-all duration-300 hover:scale-[1.02]" data-testid={`card-movie-${movie.id}`}>
      <div className="relative">
        <img 
          src={movie.posterPath || "https://via.placeholder.com/400x600?text=No+Poster"} 
          alt={`${movie.title} poster`} 
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-[1.05] rounded-[2px]"
          data-testid={`img-poster-${movie.id}`}
        />
        
        <div className="absolute top-3 right-3">
          <div className={`${getTimeColor()} text-white px-3 py-1.5 text-xs font-medium rounded-[2px]`}>
            {getTimeUntilReminder()}
          </div>
        </div>
        
        <div className="absolute top-3 left-3">
          <Button
            variant="outline"
            size="icon-sm"
            className="bg-[#000000]/80 hover:bg-[#DC2626] border-[#3c595d] hover:border-[#DC2626] backdrop-blur-sm"
            onClick={handleDelete}
            disabled={deleteMovieMutation.isPending}
            data-testid={`button-remove-${movie.id}`}
          >
            <X className="text-white group-hover:text-white" size={16} />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-white mb-3 text-lg" data-testid={`text-title-${movie.id}`}>
          {movie.title}
        </h3>
        
        <div className="space-y-3 text-[#e0e0e0]">
          <div className="flex items-center gap-2">
            <Calendar className="text-[#3c595d]" size={16} />
            <span className="text-sm" data-testid={`text-date-${movie.id}`}>{formatDate(movie.reminderDate)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="text-[#3c595d]" size={16} />
            <span className="text-sm" data-testid={`text-time-${movie.id}`}>{formatTime(movie.reminderTime)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="text-[#3c595d]" size={16} />
            <span className="truncate text-sm" data-testid={`text-email-${movie.id}`}>{movie.userEmail}</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="link"
            className="text-[#ffffff] hover:text-[#e0e0e0] text-sm font-medium p-0 h-auto"
            data-testid={`button-edit-${movie.id}`}
          >
            <Edit className="mr-2" size={14} />
            Edit Reminder
          </Button>
          
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[#e0e0e0] hover:text-[#FF4757] hover:bg-[#FF4757]/10 transition-all duration-300"
            onClick={handleDelete}
            disabled={deleteMovieMutation.isPending}
            data-testid={`button-delete-${movie.id}`}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
