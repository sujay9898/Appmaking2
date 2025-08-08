import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User, Plus } from "lucide-react";
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
  const [posts, setPosts] = useState<FeedPost[]>(dummyPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const movieScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch trending movies & series from TMDB
  const { data: trendingAll = [], isLoading: isLoadingTrending } = useQuery<TrendingMovie[]>({
    queryKey: ["/api/movies/trending-all"],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });



  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll movie cards
  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setScrollPosition(prev => {
        const container = movieScrollRef.current;
        if (!container) return prev;
        
        const containerWidth = container.scrollWidth / 2; // Since we duplicate the array
        const newPosition = prev + 1;
        
        // Reset to start when we've scrolled through half the content
        return newPosition >= containerWidth ? 0 : newPosition;
      });
    }, 50); // Smooth 50ms intervals

    return () => clearInterval(scrollInterval);
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
        {/* What you wanna watch today? Section */}
        <div className="mb-16 cred-fade-in">
          <div className="text-center py-12">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FFFFFF] via-[#D4AF37] to-[#FFFFFF] bg-clip-text text-transparent font-['Poppins'] tracking-tight leading-none mb-4">
              What you wanna
            </h2>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#D4AF37] via-[#FFFFFF] to-[#D4AF37] bg-clip-text text-transparent font-['Poppins'] tracking-tight leading-none mb-6">
              watch today?
            </h2>
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-16"></div>
              <span className="text-2xl">👀</span>
              <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-16"></div>
            </div>
          </div>
        </div>

        {/* Movie Cards */}
        <div className="mb-12 cred-fade-in">
          <h2 className="font-['Poppins'] font-semibold text-white tracking-tight text-[20px]">What you wanna watch today?</h2>
          <div className="mt-[23px] mb-[23px] min-h-[80px] overflow-hidden bg-[#0a0809] border border-[#2A2A2A]" style={{borderRadius: '2px'}}>
            <div 
              ref={movieScrollRef}
              className="flex gap-4 h-full items-center animate-scroll"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                transition: 'transform 0.5s linear',
                width: 'max-content'
              }}
            >
              {trendingAll.concat(trendingAll).map((movie, index) => (
                <div key={`${movie.tmdbId}-${index}`} className="flex-shrink-0 w-16 h-20 cursor-pointer hover:scale-105 transition-transform duration-200">
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w154${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      style={{borderRadius: '2px'}}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center" style={{borderRadius: '2px'}}>
                      <span className="text-[#888888] text-xs text-center p-1 font-['Inter']">{movie.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-8 cred-slide-up">
          {posts.map((post) => (
            <Card key={post.id} className="cred-card-premium group relative">
              <CardContent className="cred-spacing-md pt-0 cred-spacing-lg text-left mt-[0px] mb-[0px] ml-[-19px] mr-[-19px] pl-[47px] pr-[47px] relative">
                {/* Add to Watchlist Button - Only show for movie posts */}
                {post.moviePoster && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ease-in-out font-['Inter'] tracking-tight border hover:scale-[1.01] active:scale-[0.99] h-9 rounded-[2px] absolute top-4 right-4 px-2 py-1 border-[#2A2A2A] hover:border-[#D4AF37] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-all duration-200 ml-[20px] mr-[20px] mt-[28px] mb-[28px] pt-[4px] pb-[4px] text-right bg-[#1b1e1f] text-[#dfdcd6] font-bold text-[13px]"
                  >
                    <Plus size={12} className="mr-1" />
                    Watchlist
                  </Button>
                )}
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