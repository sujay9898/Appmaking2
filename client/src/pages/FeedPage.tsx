import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import FooterNavigation from "@/components/FooterNavigation";
import type { MovieComment, InsertMovieComment } from "@shared/schema";

export default function FeedPage() {
  const [newPost, setNewPost] = useState("");
  const [userName, setUserName] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all comments/posts
  const { data: posts = [], isLoading } = useQuery<MovieComment[]>({
    queryKey: ["/api/comments"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Mutation to create a new post
  const createPostMutation = useMutation({
    mutationFn: async (newComment: InsertMovieComment) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComment),
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      setNewPost("");
      setUserName("");
      setMovieTitle("");
      toast({
        title: "Post shared!",
        description: "Your movie post has been shared successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share your post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !movieTitle.trim() || !newPost.trim()) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to share your post.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      tmdbId: "feed", // Using "feed" to identify feed posts
      movieTitle: movieTitle.trim(),
      userName: userName.trim(),
      comment: newPost.trim(),
    });
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString() + " at " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Navigation onAddMovie={() => {}} />
      
      <div className="pt-20 max-w-4xl mx-auto px-4 py-6">
        {/* Header with back link */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Feed</h1>
          <p className="text-gray-400">Share and discover movie thoughts from the community</p>
        </div>

        {/* Create Post Form */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Share Your Movie Thoughts</h2>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Input
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  placeholder="Movie title"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's your movie thought? Share your opinion, recommendation, or what you want to watch..."
                rows={3}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
              />
              <Button 
                type="submit" 
                disabled={createPostMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createPostMutation.isPending ? (
                  "Sharing..."
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Share Post
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="h-20 bg-gray-700 rounded mb-4"></div>
                      <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center">
                <MessageCircle size={64} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400">Be the first to share your movie thoughts!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{post.userName}</h3>
                      <p className="text-blue-400 font-medium">{post.movieTitle}</p>
                      <p className="text-gray-400 text-sm">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4 text-base">{post.comment}</p>
                  
                  {/* Like and Comment Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 ${
                        likedPosts.has(post.id) 
                          ? "text-red-500 hover:text-red-400" 
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Heart size={16} fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                      Like
                    </Button>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={commentTexts[post.id] || ""}
                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                        placeholder="Add a comment..."
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm h-8"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white h-8 px-2"
                        onClick={() => {
                          // Simple comment display (could be enhanced to save to backend)
                          if (commentTexts[post.id]?.trim()) {
                            toast({
                              title: "Comment added!",
                              description: "Your comment has been noted.",
                            });
                            setCommentTexts(prev => ({ ...prev, [post.id]: "" }));
                          }
                        }}
                      >
                        <MessageCircle size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <FooterNavigation />
    </div>
  );
}