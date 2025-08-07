import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, MessageCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MovieComment, InsertMovieComment } from "@shared/schema";

export default function ShareAboutMovies() {
  const [userName, setUserName] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all comments
  const { data: comments = [], isLoading } = useQuery<MovieComment[]>({
    queryKey: ["/api/comments"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Mutation to create a new comment
  const createCommentMutation = useMutation({
    mutationFn: async (newComment: InsertMovieComment) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComment),
      });
      if (!response.ok) {
        throw new Error("Failed to create comment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      setUserName("");
      setMovieTitle("");
      setComment("");
      toast({
        title: "Comment shared!",
        description: "Your movie comment has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share your comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !movieTitle.trim() || !comment.trim()) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to share your comment.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      tmdbId: "general", // Using "general" for free-form movie discussions
      movieTitle: movieTitle.trim(),
      userName: userName.trim(),
      comment: comment.trim(),
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString() + " at " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Share About Movies</h2>
        <p className="text-gray-300">Share your thoughts and discover what others are saying about movies</p>
      </div>

      {/* Comment Form */}
      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle size={20} />
            Share Your Thoughts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName" className="text-gray-300">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="movieTitle" className="text-gray-300">Movie Title</Label>
                <Input
                  id="movieTitle"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  placeholder="What movie are you talking about?"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="comment" className="text-gray-300">Your Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the movie..."
                rows={3}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
              />
            </div>
            <Button 
              type="submit" 
              disabled={createCommentMutation.isPending}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {createCommentMutation.isPending ? (
                "Sharing..."
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Share Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Comments</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
                    <div className="h-16 bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <MessageCircle size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No comments yet. Be the first to share your thoughts about a movie!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{comment.userName}</h4>
                    <p className="text-blue-400 font-medium">{comment.movieTitle}</p>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock size={14} className="mr-1" />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{comment.comment}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}