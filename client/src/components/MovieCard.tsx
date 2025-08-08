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
      case "Today": return "bg-green-500";
      case "Tomorrow": return "bg-amber-500";
      case "This Week": return "bg-blue-500";
      case "Past": return "bg-gray-500";
      default: return "bg-gray-400";
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
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200" style={{borderRadius: '2px'}} data-testid={`card-movie-${movie.id}`}>
      <div className="relative">
        <img 
          src={movie.posterPath || "https://via.placeholder.com/400x600?text=No+Poster"} 
          alt={`${movie.title} poster`} 
          className="w-full h-64 object-cover"
          data-testid={`img-poster-${movie.id}`}
        />
        
        <div className="absolute top-3 right-3">
          <div className={`${getTimeColor()} text-white px-2 py-1 rounded-full text-xs font-medium`}>
            {getTimeUntilReminder()}
          </div>
        </div>
        
        <div className="absolute top-3 left-3">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-sm h-8 w-8"
            onClick={handleDelete}
            disabled={deleteMovieMutation.isPending}
            data-testid={`button-remove-${movie.id}`}
          >
            <X className="text-gray-600" size={16} />
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2" data-testid={`text-title-${movie.id}`}>
          {movie.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={16} />
            <span data-testid={`text-date-${movie.id}`}>{formatDate(movie.reminderDate)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="text-gray-400" size={16} />
            <span data-testid={`text-time-${movie.id}`}>{formatTime(movie.reminderTime)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Mail className="text-gray-400" size={16} />
            <span className="truncate" data-testid={`text-email-${movie.id}`}>{movie.userEmail}</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium p-0 h-auto"
            data-testid={`button-edit-${movie.id}`}
          >
            <Edit className="mr-1" size={14} />
            Edit Reminder
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-600 transition-colors p-2 h-8 w-8"
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
