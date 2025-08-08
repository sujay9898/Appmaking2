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
    <div className="min-h-screen bg-[#000000] pb-24">
      <Navigation onAddMovie={() => setIsAddModalOpen(true)} />
      <div className="modern-container pt-20 pb-20">
        {/* Hi Cinephile Heading */}
        <div className="w-full" style={{ padding: '20px 0' }}>
          <h2 
            style={{ 
              fontSize: '1.8em', 
              fontWeight: 'bold',
              fontStyle: 'italic',
              color: '#ffffff',
              marginBottom: '15px', 
              marginLeft: '10px',
              display: 'block',
              visibility: 'visible',
              lineHeight: '1.2'
            }}
          >
            Hi Cinephile
          </h2>
        </div>

        {/* Movie Cards */}
        <section className="modern-section">
          <h3 className="text-lg font-semibold text-white mb-4">Trending Movies</h3>
          <div className="overflow-hidden bg-[#3c595d] border border-[#3c595d] rounded-[2px] p-4">
            <div 
              ref={movieScrollRef}
              className="flex gap-4 items-center animate-scroll"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                transition: 'transform 0.5s linear',
                width: 'max-content'
              }}
            >
              {trendingAll.concat(trendingAll).map((movie, index) => (
                <div key={`${movie.tmdbId}-${index}`} className="flex-shrink-0 w-24 h-36 cursor-pointer hover:scale-105 transition-transform duration-300">
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w154${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-full object-cover rounded-[2px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#000000] flex items-center justify-center rounded-[2px]">
                      <span className="text-[#e0e0e0] text-xs text-center p-2">{movie.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feed Posts */}
        <section className="modern-section">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Posts</h3>
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="modern-card bg-[#3c595d]">
                <CardContent className="p-6">
                {/* Add to Watchlist Button - Only show for movie posts */}
                {post.moviePoster && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 bg-[#000000] hover:bg-[#000000] border-[#ffffff] hover:border-[#ffffff] text-[#ffffff]"
                  >
                    <Plus size={12} className="mr-1" />
                    Watchlist
                  </Button>
                )}
                {/* Profile and Username */}
                <div className="flex items-center mb-4">
                  <div 
                    className="w-10 h-10 bg-[#000000] flex items-center justify-center mr-4 cursor-pointer hover:bg-[#ffffff] hover:text-[#000000] transition-all duration-300 rounded-[2px]"
                    onClick={() => handleProfileClick(post.username)}
                  >
                    <User size={18} className="text-[#ffffff]" />
                  </div>
                  <div className="cursor-pointer" onClick={() => handleProfileClick(post.username)}>
                    <h3 className="font-semibold text-[#ffffff] text-sm hover:text-[#e0e0e0] transition-colors duration-200">@{post.username}</h3>
                    <p className="text-[#e0e0e0] text-xs">{post.timestamp}</p>
                  </div>
                </div>

                {/* Bold Caption */}
                <h4 className="text-white mb-4 text-base font-medium">{post.caption}</h4>

                {/* Movie Poster and Content */}
                {post.moviePoster ? (
                  <div className="mb-6 cred-surface cred-spacing-md">
                    <div className="flex cred-gap-md">
                      <img 
                        src={post.moviePoster} 
                        alt={post.movieTitle || 'Movie poster'}
                        className="w-16 h-24 sm:w-20 sm:h-30 object-cover"
                        style={{borderRadius: '2px'}}
                      />
                      {post.movieTitle && (
                        <div className="flex-1 min-w-0">
                          <h5 className="font-['Poppins'] font-semibold text-white text-xs sm:text-sm tracking-tight">
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
                    <p className="text-[#B8B8B8] whitespace-pre-line font-['Inter'] text-sm sm:text-base text-justify">{post.content}</p>
                  </div>
                ) : null}

                {/* Like and Comment Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleLike(post.id)}
                    variant={likedPosts.has(post.id) ? "default" : "outline"}
                    size="lg"
                    className={`flex-1 py-3 text-sm font-semibold transition-all duration-300 ${
                      likedPosts.has(post.id)
                        ? "bg-[#DC2626] hover:bg-[#B91C1C] text-[#ffffff]"
                        : "bg-transparent border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000]"
                    }`}
                  >
                    ❤️ {post.likes}
                  </Button>
                  <Button
                    onClick={() => handleCommentClick(post.id)}
                    variant="outline"
                    size="lg"
                    className="flex-1 py-3 text-sm font-semibold bg-transparent border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000] transition-all duration-300"
                  >
                    💬 {post.comments}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </section>
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