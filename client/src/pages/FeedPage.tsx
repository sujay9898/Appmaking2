import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import ClickableMovieCard from "@/components/ClickableMovieCard";
import Navigation from "@/components/Navigation";
import AddMovieModal from "@/components/AddMovieModal";
import FooterNavigation from "@/components/FooterNavigation";

interface TrendingMovie {
  tmdbId: string;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  overview?: string;
}

interface FeedPost {
  id: string;
  username: string;
  caption: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  moviePoster?: string | null;
  movieTitle?: string;
}

// Dummy data for posts
const dummyPosts: FeedPost[] = [
  {
    id: "1",
    username: "moviebuff23",
    caption: "Just watched this masterpiece!",
    content: "Inception blew my mind! The layers of dreams within dreams were perfectly executed. Nolan really outdid himself with this one. Anyone else think the ending was ambiguous on purpose?",
    timestamp: "2 hours ago",
    likes: 12,
    comments: 5
  },
  {
    id: "2", 
    username: "cinephile_sarah",
    caption: "Weekend movie recommendation",
    content: "If you haven't seen Parasite yet, you're missing out! The cinematography, the story, the social commentary - everything is perfection. Bong Joon-ho is a genius.",
    timestamp: "4 hours ago",
    likes: 28,
    comments: 9
  },
  {
    id: "3",
    username: "film_critic_joe",
    caption: "Unpopular opinion alert",
    content: "I think Marvel movies are getting repetitive. Don't get me wrong, the action is great, but I miss when superhero movies had more depth like The Dark Knight.",
    timestamp: "6 hours ago", 
    likes: 7,
    comments: 15
  }
];

export default function FeedPage() {
  const [feedText, setFeedText] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>(dummyPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Fetch trending movies & series from TMDB
  const { data: trendingAll = [], isLoading: isLoadingTrending } = useQuery<TrendingMovie[]>({
    queryKey: ["/api/movies/trending-all"],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Cycling placeholder texts
  const placeholders = [
    "What you wanna watch today?",
    "Share your opinion on a movie",
    "Suggest a movie to others"
  ];

  // Cycle placeholder text every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Load saved posts from localStorage and listen for new posts
  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('feedPosts') || '[]');
    if (savedPosts.length > 0) {
      setPosts(prevPosts => [...savedPosts, ...prevPosts]);
      localStorage.removeItem('feedPosts'); // Clear after loading
    }

    // Listen for new feed posts from watchlist additions
    const handleNewFeedPost = (event: CustomEvent) => {
      const newPost = event.detail;
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      toast({
        title: "Added to feed!",
        description: "Your movie has been posted to your feed.",
      });
    };

    window.addEventListener('newFeedPost', handleNewFeedPost as EventListener);
    
    return () => {
      window.removeEventListener('newFeedPost', handleNewFeedPost as EventListener);
    };
  }, [toast]);

  const handleSend = () => {
    if (!feedText.trim()) return;

    const newPost: FeedPost = {
      id: Date.now().toString(),
      username: "you",
      caption: "Shared a thought",
      content: feedText.trim(),
      timestamp: "just now",
      likes: 0,
      comments: 0
    };

    setPosts([newPost, ...posts]);
    setFeedText("");
    
    toast({
      title: "Post shared!",
      description: "Your post has been added to the feed.",
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

    // Update like count
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Handle scroll detection for "See More" button
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft } = container;
    const isScrolling = scrollLeft > 50; // Show after 50px of scroll
    
    setShowSeeMore(isScrolling);
    
    // Auto-hide after scroll stops
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setShowSeeMore(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      
      <div className="pt-20 max-w-4xl mx-auto px-4 py-6">
        {/* Feed Box */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 px-4">feed here</h2>
          <div className="relative px-4">
            <Textarea
              value={feedText}
              onChange={(e) => setFeedText(e.target.value)}
              placeholder={placeholders[currentPlaceholder]}
              rows={3}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-12 text-base resize-none"
            />
            <Button
              onClick={handleSend}
              size="sm"
              className="absolute right-6 bottom-3 bg-blue-600 hover:bg-blue-700 p-2 h-8 w-8"
            >
              <Send size={14} />
            </Button>
          </div>
        </div>

        {/* Pick and Flex Section */}
        <div className="mb-8 relative">
          <h3 className="text-lg font-semibold text-white mb-4 px-4">Pick and Flex</h3>
          
          <div className="relative">
            {isLoadingTrending ? (
              <div className="flex overflow-x-auto pb-4 px-4 space-x-4 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="w-40 aspect-[2/3] bg-gray-700 rounded-lg animate-pulse flex-none"></div>
                ))}
              </div>
            ) : (
              <>
                <div 
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto pb-4 px-4 space-x-4 scrollbar-hide"
                  onScroll={handleScroll}
                >
                  {trendingAll.slice(0, 15).map((movie) => (
                    <div key={movie.tmdbId} className="w-32 flex-none cursor-pointer group">
                      <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200">
                        <img 
                          src={movie.posterPath || "https://via.placeholder.com/192x288?text=No+Poster"} 
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover"
                        />
                        <div className="p-2">
                          <h3 className="text-white text-xs font-medium truncate">{movie.title}</h3>
                          <p className="text-gray-400 text-xs mt-1">{movie.releaseYear}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* See More Button - fades in during scroll */}
                <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-300 ${showSeeMore ? 'opacity-100' : 'opacity-0'}`}>
                  <Button
                    onClick={() => setLocation('/movies')}
                    className="bg-black/80 hover:bg-black/90 text-white border border-gray-600 backdrop-blur-sm px-4 py-2 text-sm font-medium"
                  >
                    See More <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6 px-4">
          {posts.map((post) => (
            <Card key={post.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                {/* Profile and Username */}
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                    <User size={20} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{post.username}</h3>
                    <p className="text-gray-400 text-sm">{post.timestamp}</p>
                  </div>
                </div>

                {/* Bold Caption */}
                <h4 className="font-bold text-white mb-3 text-lg">{post.caption}</h4>

                {/* Movie Poster and Content */}
                <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                  {post.moviePoster && (
                    <div className="flex gap-3 mb-3">
                      <img 
                        src={post.moviePoster} 
                        alt={post.movieTitle || 'Movie poster'}
                        className="w-16 h-24 object-cover rounded"
                      />
                      {post.movieTitle && (
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-white text-sm">{post.movieTitle}</h5>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{post.content}</p>
                </div>

                {/* Like and Comment Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleLike(post.id)}
                    variant="outline"
                    size="lg"
                    className={`flex-1 py-3 text-base font-semibold ${
                      likedPosts.has(post.id)
                        ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                        : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                    }`}
                  >
                    👍 LIKE ({post.likes})
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 py-3 text-base font-semibold bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  >
                    💬 COMMENT ({post.comments})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <AddMovieModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      <FooterNavigation />
    </div>
  );
}