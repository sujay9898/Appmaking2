import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ClickableMovieCard from "@/components/ClickableMovieCard";
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

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">Filmycup</h1>
        </div>

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
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 px-4">Pick and Flex</h3>
          
          {/* Compact Trending List */}
          <div className="px-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Today Trending Movies & Series</h4>
            {isLoadingTrending ? (
              <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="w-24 aspect-[2/3] bg-gray-700 rounded-md animate-pulse flex-none"></div>
                ))}
              </div>
            ) : (
              <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
                {trendingAll.slice(0, 10).map((movie) => (
                  <div key={movie.tmdbId} className="w-24 flex-none">
                    <div className="bg-gray-800 rounded-md overflow-hidden hover:scale-105 transition-transform duration-200">
                      <img 
                        src={movie.posterPath || "https://via.placeholder.com/150x225?text=No+Poster"} 
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate" title={movie.title}>{movie.title}</p>
                  </div>
                ))}
              </div>
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

                {/* Post Content */}
                <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 leading-relaxed">{post.content}</p>
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
      
      <FooterNavigation />
    </div>
  );
}