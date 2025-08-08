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
import UserDashboardOverlay from "@/components/UserDashboardOverlay";
import CommentSheet from "@/components/CommentSheet";

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
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
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

  const handleProfileClick = (username: string) => {
    setSelectedUsername(username);
    setIsUserDashboardOpen(true);
  };

  const handleCommentClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsCommentSheetOpen(true);
  };

  const closeUserDashboard = () => {
    setIsUserDashboardOpen(false);
    setSelectedUsername(null);
  };

  const closeCommentSheet = () => {
    setIsCommentSheetOpen(false);
    setSelectedPostId(null);
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
    <div className="min-h-screen bg-[#090708] pb-24 page-transition">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      <div className="cred-container cred-section pt-[49px] pb-[49px] text-[18px] font-normal">
        {/* Feed Box */}
        <div className="mb-12 cred-fade-in">
          <h2 className="text-heading font-['Poppins'] font-semibold text-white tracking-tight">Feed</h2>
          <div className="relative">
            <Textarea
              value={feedText}
              onChange={(e) => setFeedText(e.target.value)}
              placeholder={placeholders[currentPlaceholder]}
              rows={4}
              className="flex min-h-[80px] rounded-md py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-[#0a0809] border border-[#2A2A2A] text-white placeholder-[#888888] resize-none focus:border-[#D4AF37] transition-all duration-300 font-['Inter'] text-base px-4 mb-[60px] pl-[16px] pr-[16px] pt-[8px] pb-[8px]"
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
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200 ease-in-out font-['Inter'] tracking-tight border text-[#A1A1A1] hover:text-[#EAEAEA] hover:scale-[1.01] active:scale-[0.99] font-medium h-9 w-9 rounded-[2px] bg-[#161616] border-[#2A2A2A] hover:border-[#D4AF37] hover:bg-[#1A1A1A] ml-[0px] mr-[0px] mt-[4px] mb-[4px] pt-[6px] pb-[6px] pl-[15px] pr-[15px]"
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

        {/* Feed Posts */}
        <div className="space-y-8 cred-slide-up">
          {posts.map((post) => (
            <Card key={post.id} className="cred-card-premium group">
              <CardContent className="cred-spacing-md pt-0 cred-spacing-lg text-left mt-[0px] mb-[0px] ml-[-19px] mr-[-19px] pl-[47px] pr-[47px]">
                {/* Profile and Username */}
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-[#EAEAEA] to-[#A1A1A1] flex items-center justify-center mr-4 cursor-pointer hover:scale-[1.05] transition-transform duration-200" 
                    style={{borderRadius: '2px'}}
                    onClick={() => handleProfileClick(post.username)}
                  >
                    <User size={22} className="text-[#090708]" />
                  </div>
                  <div className="cursor-pointer" onClick={() => handleProfileClick(post.username)}>
                    <h3 className="font-['Poppins'] font-semibold text-[#EAEAEA] text-base tracking-tight hover:text-[#FFFFFF] transition-colors duration-200">@{post.username}</h3>
                    <p className="text-[#A1A1A1] text-sm font-['Inter']">{post.timestamp}</p>
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
                        ? "bg-[#DC2626] hover:bg-[#B91C1C] text-[#EAEAEA] shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                        : "bg-transparent border-[#1E1C1D] text-[#A1A1A1] hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-[#DC2626]/5"
                    }`}
                  >
                    ❤️ {post.likes}
                  </Button>
                  <Button
                    onClick={() => handleCommentClick(post.id)}
                    variant="outline"
                    size="lg"
                    className="flex-1 py-4 text-base font-semibold bg-transparent border-[#1E1C1D] text-[#A1A1A1] hover:border-[#EAEAEA] hover:text-[#EAEAEA] hover:bg-[#121011] transition-all duration-400 font-['Inter'] tracking-tight"
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
      <UserDashboardOverlay
        isOpen={isUserDashboardOpen}
        onClose={closeUserDashboard}
        username={selectedUsername || ""}
      />
      <CommentSheet
        isOpen={isCommentSheetOpen}
        onClose={closeCommentSheet}
        postId={selectedPostId || ""}
        postCaption={posts.find(p => p.id === selectedPostId)?.caption}
      />
      <FooterNavigation />
    </div>
  );
}