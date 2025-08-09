import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User, Plus, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import ClickableMovieCard from "@/components/ClickableMovieCard";
import Navigation from "@/components/Navigation";
import AddMovieModal from "@/components/AddMovieModal";
import CreatePostModal from "@/components/CreatePostModal";
import FooterNavigation from "@/components/FooterNavigation";
import UserDashboardOverlay from "@/components/UserDashboardOverlay";
import CommentSheet from "@/components/CommentSheet";
import type { FeedPost } from "@shared/schema";

interface TrendingMovie {
  tmdbId: string;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  overview?: string;
}

interface FeedPostWithExtras extends FeedPost {
  username: string;
  timestamp: string;
  comments: number;
}

// Dummy data for posts
const dummyPosts: FeedPostWithExtras[] = [
  {
    id: "1",
    userId: "dummy1",
    username: "moviebuff23",
    caption: "Just watched this masterpiece!",
    content: "Inception blew my mind! The layers of dreams within dreams were perfectly executed. Nolan really outdid himself with this one. Anyone else think the ending was ambiguous on purpose?",
    timestamp: "2 hours ago",
    likes: 12,
    comments: 5,
    commentsCount: 5,
    image: null,
    moviePoster: null,
    movieTitle: null,
    movieYear: null,
    movieInfo: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "2", 
    userId: "dummy2",
    username: "cinephile_sarah",
    caption: "Weekend movie recommendation",
    content: "If you haven't seen Parasite yet, you're missing out! The cinematography, the story, the social commentary - everything is perfection. Bong Joon-ho is a genius.",
    timestamp: "4 hours ago",
    likes: 28,
    comments: 9,
    commentsCount: 9,
    image: null,
    moviePoster: null,
    movieTitle: null,
    movieYear: null,
    movieInfo: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: "3",
    userId: "dummy3",
    username: "film_critic_joe",
    caption: "Unpopular opinion alert",
    content: "I think Marvel movies are getting repetitive. Don't get me wrong, the action is great, but I miss when superhero movies had more depth like The Dark Knight.",
    timestamp: "6 hours ago", 
    likes: 7,
    comments: 15,
    commentsCount: 15,
    image: null,
    moviePoster: null,
    movieTitle: null,
    movieYear: null,
    movieInfo: null,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
];

export default function FeedPage() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isCreateButtonVisible, setIsCreateButtonVisible] = useState(true);
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

  // Fetch posts from API
  const { data: apiPosts = [], isLoading: isLoadingPosts } = useQuery<FeedPost[]>({
    queryKey: ["/api/posts"],
    select: (data) => data.map(post => ({
      ...post,
      username: post.userId === "user1" ? "you" : `user_${post.userId.slice(0, 8)}`,
      timestamp: new Date(post.createdAt!).toLocaleString(),
      comments: post.commentsCount || 0
    } as FeedPostWithExtras)).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
  });

  // Combine API posts with dummy posts for now, filtering out test content
  const posts: FeedPostWithExtras[] = [...(apiPosts || []), ...dummyPosts].filter(post => 
    !post.content?.includes('6g6gh7hh6u6yh') && 
    !post.caption?.includes('6g6gh7hh6u6yh')
  );



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

  // Listen for new feed posts from watchlist additions
  useEffect(() => {
    const handleNewFeedPost = (event: CustomEvent) => {
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
    // TODO: Add API call to update like count on server
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
              color: '#ffffff',
              marginBottom: '15px', 
              marginLeft: '10px',
              display: 'block',
              visibility: 'visible',
              lineHeight: '1.2'
            }}
          >
            Hi <span style={{ color: '#3c595d', fontStyle: 'italic' }}>Cinephile</span>
          </h2>
        </div>

        {/* Movie Cards */}
        <section className="modern-section">
          <h3 className="text-white mb-4 text-[40px] font-bold">Hi <span className="text-[#3c595d] font-bold italic">Cinephile</span></h3>
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
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="relative group">
                {/* Modern Glass Card */}
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl hover:shadow-4xl transition-all duration-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white/[0.12] hover:to-white/[0.04]">
                  
                  {/* Floating Action Button */}
                  {post.moviePoster && (
                    <button className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group/btn">
                      <Plus size={20} className="text-white group-hover/btn:rotate-90 transition-transform duration-300" />
                    </button>
                  )}

                  {/* Header with Avatar and User Info */}
                  <div className="flex items-center mb-5">
                    <div className="relative">
                      <div 
                        className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        onClick={() => handleProfileClick(post.username)}
                      >
                        <User size={24} className="text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div 
                        className="cursor-pointer group/user"
                        onClick={() => handleProfileClick(post.username)}
                      >
                        <h3 className="font-bold text-white text-base group-hover/user:text-blue-300 transition-colors duration-200">
                          @{post.username}
                        </h3>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {post.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content Caption */}
                  <div className="mb-6">
                    <p className="text-white font-extralight text-[17px]">
                      {post.caption}
                    </p>
                  </div>

                  {/* Media Content */}
                  {post.moviePoster ? (
                    <div className="mb-6 bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="flex gap-4">
                        <div className="relative group/poster">
                          <img 
                            src={post.moviePoster} 
                            alt={post.movieTitle || 'Movie poster'}
                            className="w-20 h-32 object-cover rounded-xl shadow-lg group-hover/poster:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {post.movieTitle && (
                          <div className="flex-1 space-y-3">
                            <div>
                              <h4 className="font-bold text-white text-xl leading-tight">
                                {post.movieTitle}
                                {post.movieYear && (
                                  <span className="text-gray-400 font-normal ml-2 text-lg">({post.movieYear})</span>
                                )}
                              </h4>
                            </div>
                            {post.movieInfo && (
                              <div className="text-gray-400 text-sm space-y-1">
                                {post.movieInfo.split('\n').map((line, index) => (
                                  <p key={index} className="leading-relaxed text-left ml-[0px] mr-[0px] mt-[0px] mb-[0px] pt-[-6px] pb-[-6px]">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : post.image ? (
                    <div className="mb-6 overflow-hidden rounded-2xl">
                      <img 
                        src={post.image} 
                        alt="Post image" 
                        className="w-full max-w-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : post.content ? (
                    <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-5 border border-white/5">
                      {post.content !== "Inception blew my mind! The layers of dreams within dreams were perfectly executed. Nolan really outdid himself with this one. Anyone else think the ending was ambiguous on purpose?" && (
                        <p className="text-gray-200 leading-relaxed text-base">
                          {post.content}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group/like ${
                          likedPosts.has(post.id)
                            ? "bg-red-500/20 text-red-400"
                            : "hover:bg-white/10 text-gray-300 hover:text-red-400"
                        }`}
                      >
                        <svg className={`w-5 h-5 transition-transform duration-200 ${likedPosts.has(post.id) ? 'scale-110' : 'group-hover/like:scale-110'}`} fill={likedPosts.has(post.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-semibold text-sm">{post.likes}</span>
                      </button>

                      <button
                        onClick={() => handleCommentClick(post.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-blue-400 transition-all duration-300 group/comment"
                      >
                        <svg className="w-5 h-5 group-hover/comment:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-semibold text-sm">{post.comments}</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                      
                      <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <AddMovieModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
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
        postCaption={posts.find(p => p.id === selectedPostId)?.caption || undefined}
      />
      <FooterNavigation />
      {/* Floating Create Post Button */}
      <div className={`fixed bottom-28 right-6 z-50 transition-all duration-500 ease-out ${
        isCreateButtonVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-75'
      }`}>
        <button
          onClick={() => setIsCreatePostModalOpen(true)}
          className="group relative w-16 h-16 bg-[#284145] hover:bg-[#334c52] rounded-md shadow-2xl hover:shadow-[#284145]/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
        >
          {/* Animated Background Glow */}
          <div className="absolute inset-0 rounded-md bg-[#284145] opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          
          {/* Icon Container */}
          <div className="relative flex items-center justify-center w-full h-full">
            <Edit3 
              size={24} 
              className="text-white transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-active:scale-90" 
            />
          </div>
          
          {/* Ripple Effect on Click */}
          <div className="absolute inset-0 rounded-md overflow-hidden">
            <div className="absolute inset-0 bg-white/20 rounded-md scale-0 group-active:scale-100 transition-transform duration-200"></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm">
            Write About Movies
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
          </div>
        </button>
      </div>
    </div>
  );
}