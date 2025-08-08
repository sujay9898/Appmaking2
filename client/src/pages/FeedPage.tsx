import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, User, ArrowRight, Image } from "lucide-react";
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
  movieYear?: string;
  movieInfo?: string;
  image?: string | null;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (!feedText.trim() && !selectedImage) return;

    const newPost: FeedPost = {
      id: Date.now().toString(),
      username: "you",
      caption: feedText.trim(),
      content: "",
      timestamp: "just now",
      likes: 0,
      comments: 0,
      image: selectedImage
    };

    setPosts([newPost, ...posts]);
    setFeedText("");
    setSelectedImage(null);
    
    toast({
      title: "Post shared!",
      description: "Your post has been added to the feed.",
    });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <div className="min-h-screen bg-[#0B0B0B] pb-24 page-transition">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      
      <div className="pt-24 cred-container cred-section">
        {/* Feed Box */}
        <div className="mb-12 cred-fade-in">
          <h2 className="text-heading font-['Poppins'] font-semibold text-white mb-6 tracking-tight">Feed</h2>
          <div className="relative">
            <Textarea
              value={feedText}
              onChange={(e) => setFeedText(e.target.value)}
              placeholder={placeholders[currentPlaceholder]}
              rows={4}
              className="w-full bg-[#161616] border border-[#2A2A2A] text-white placeholder-[#888888] resize-none focus:border-[#D4AF37] transition-all duration-300 font-['Inter'] text-base p-4"
              style={{borderRadius: '2px'}}
            />
            
            {/* Image Preview */}
            {selectedImage && (
              <div className="mt-2 relative inline-block">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="w-24 h-24 object-cover rounded border border-border"
                />
                <Button
                  onClick={removeImage}
                  size="sm"
                  className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 p-1 h-6 w-6 rounded-full night-button"
                >
                  ×
                </Button>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            <div className="absolute right-4 bottom-4 flex cred-gap-sm">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="icon-sm"
                className="bg-[#161616] border-[#2A2A2A] hover:border-[#D4AF37] hover:bg-[#1A1A1A]"
              >
                <Image size={16} />
              </Button>
              <Button
                onClick={handleSend}
                variant="default"
                size="icon"
                className="font-semibold"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Pick and Flex Section */}
        <div className="mb-12 relative cred-slide-up">
          <h3 className="text-heading font-['Poppins'] font-semibold text-white mb-6 tracking-tight">Pick and Flex</h3>
          
          <div className="relative">
            {isLoadingTrending ? (
              <div className="flex overflow-x-auto pb-4 px-4 space-x-4 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="w-40 aspect-[2/3] bg-secondary rounded-lg animate-pulse flex-none"></div>
                ))}
              </div>
            ) : (
              <>
                <div 
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto pb-6 cred-gap-md scrollbar-hide cred-scrollbar"
                  onScroll={handleScroll}
                >
                  {trendingAll.slice(0, 15).map((movie) => (
                    <div key={movie.tmdbId} className="w-36 flex-none cursor-pointer group">
                      <div className="cred-card overflow-hidden hover:scale-[1.05] transition-all duration-400">
                        <img 
                          src={movie.posterPath || "https://via.placeholder.com/192x288?text=No+Poster"} 
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover transition-transform duration-400 group-hover:scale-[1.05]"
                          style={{borderRadius: '2px'}}
                        />
                        <div className="cred-spacing-sm">
                          <h3 className="text-white text-sm font-['Poppins'] font-medium truncate tracking-tight">{movie.title}</h3>
                          <p className="text-[#888888] text-xs mt-1 font-['Inter']">{movie.releaseYear}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* See More Button - fades in during scroll */}
                <div className={`absolute right-6 top-1/2 transform -translate-y-1/2 transition-all duration-400 ${showSeeMore ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <Button
                    onClick={() => setLocation('/movies')}
                    variant="outline"
                    className="bg-[#161616]/90 border-[#2A2A2A] hover:border-[#D4AF37] backdrop-blur-xl font-semibold tracking-tight"
                  >
                    See More <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-8 cred-slide-up">
          {posts.map((post) => (
            <Card key={post.id} className="cred-card-premium group">
              <CardContent className="cred-spacing-lg">
                {/* Profile and Username */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#00E5FF] flex items-center justify-center mr-4" style={{borderRadius: '2px'}}>
                    <User size={22} className="text-[#0B0B0B]" />
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-semibold text-white text-base tracking-tight">{post.username}</h3>
                    <p className="text-[#888888] text-sm font-['Inter']">{post.timestamp}</p>
                  </div>
                </div>

                {/* Bold Caption */}
                <h4 className="text-white mb-4 text-lg font-['Poppins'] font-medium tracking-tight">{post.caption}</h4>

                {/* Movie Poster and Content */}
                {post.moviePoster ? (
                  <div className="mb-6 cred-surface cred-spacing-md">
                    <div className="flex cred-gap-md">
                      <img 
                        src={post.moviePoster} 
                        alt={post.movieTitle || 'Movie poster'}
                        className="w-20 h-30 object-cover"
                        style={{borderRadius: '2px'}}
                      />
                      {post.movieTitle && (
                        <div className="flex-1 min-w-0">
                          <h5 className="font-['Poppins'] font-semibold text-white text-sm tracking-tight">
                            {post.movieTitle}
                            {post.movieYear && (
                              <span className="text-[#888888] font-normal ml-2 font-['Inter']">({post.movieYear})</span>
                            )}
                          </h5>
                          {post.movieInfo && (
                            <p className="text-[#888888] text-xs mt-2 whitespace-pre-line font-['Inter'] leading-relaxed">{post.movieInfo}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : post.image ? (
                  <div className="mb-6">
                    <img 
                      src={post.image} 
                      alt="Post image" 
                      className="w-full max-w-md"
                      style={{borderRadius: '2px'}}
                    />
                  </div>
                ) : post.content ? (
                  <div className="mb-6">
                    <p className="text-[#B8B8B8] leading-relaxed whitespace-pre-line font-['Inter'] text-base">{post.content}</p>
                  </div>
                ) : null}

                {/* Like and Comment Buttons */}
                <div className="flex cred-gap-md">
                  <Button
                    onClick={() => handleLike(post.id)}
                    variant={likedPosts.has(post.id) ? "default" : "outline"}
                    size="lg"
                    className={`flex-1 py-4 text-base font-semibold font-['Inter'] tracking-tight transition-all duration-400 ${
                      likedPosts.has(post.id)
                        ? "bg-[#FF4757] hover:bg-[#FF3742] text-white shadow-[0_0_20px_rgba(255,71,87,0.3)]"
                        : "bg-transparent border-[#2A2A2A] text-[#888888] hover:border-[#FF4757] hover:text-[#FF4757] hover:bg-[#FF4757]/5"
                    }`}
                  >
                    ❤️ {post.likes}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 py-4 text-base font-semibold bg-transparent border-[#2A2A2A] text-[#888888] hover:border-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all duration-400 font-['Inter'] tracking-tight"
                  >
                    💬 {post.comments}
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