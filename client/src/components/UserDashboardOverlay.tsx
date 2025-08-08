import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, User, Heart, Calendar, Film } from "lucide-react";
import type { User as UserType, FeedPost, Movie } from "@shared/schema";

interface UserDashboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

interface UserData {
  user: UserType;
  posts: FeedPost[];
  watchlist: Movie[];
}

export default function UserDashboardOverlay({ isOpen, onClose, username }: UserDashboardOverlayProps) {
  const { data: userData, isLoading } = useQuery<UserData>({
    queryKey: ["/api/users", username],
    enabled: isOpen && !!username,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (!isOpen) return null;

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm cred-fade-in">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#090708] border-l border-[#1E1C1D] cred-slide-up overflow-y-auto cred-scrollbar">
        <div className="sticky top-0 bg-[#090708]/95 backdrop-blur-xl border-b border-[#1E1C1D] p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-subheading font-['Poppins'] font-semibold text-[#EAEAEA] tracking-tight">
              Profile
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-[#A1A1A1] hover:text-[#EAEAEA]"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-6">
            {/* Profile Header Skeleton */}
            <div className="text-center">
              <div className="w-24 h-24 bg-[#121011] rounded-[2px] mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-[#121011] rounded-[2px] w-32 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-[#121011] rounded-[2px] w-48 mx-auto animate-pulse"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center p-4 bg-[#121011] rounded-[2px] animate-pulse">
                  <div className="h-6 bg-[#090708] rounded-[2px] mb-2"></div>
                  <div className="h-4 bg-[#090708] rounded-[2px]"></div>
                </div>
              ))}
            </div>
          </div>
        ) : userData ? (
          <div className="p-6 space-y-8">
            {/* User Banner */}
            <div className="text-center cred-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-[#EAEAEA] to-[#A1A1A1] flex items-center justify-center mx-auto mb-4 shadow-lg" style={{borderRadius: '2px'}}>
                {userData.user.profilePicture ? (
                  <img 
                    src={userData.user.profilePicture} 
                    alt={userData.user.username}
                    className="w-full h-full object-cover"
                    style={{borderRadius: '2px'}}
                  />
                ) : (
                  <User size={32} className="text-[#090708]" />
                )}
              </div>
              <h3 className="text-heading font-['Poppins'] font-semibold text-[#EAEAEA] mb-2 tracking-tight">
                @{userData.user.username}
              </h3>
              {userData.user.bio && (
                <p className="text-body text-[#A1A1A1] font-['Inter'] leading-relaxed max-w-xs mx-auto">
                  {userData.user.bio}
                </p>
              )}
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4 cred-slide-up">
              <Card className="cred-card text-center">
                <CardContent className="cred-spacing-md">
                  <div className="text-heading font-['Poppins'] font-semibold text-[#EAEAEA] mb-1">
                    {userData.user.postsCount}
                  </div>
                  <div className="text-body-sm text-[#A1A1A1] font-['Inter']">Watchlist</div>
                </CardContent>
              </Card>
              <Card className="cred-card text-center">
                <CardContent className="cred-spacing-md">
                  <div className="text-heading font-['Poppins'] font-semibold text-[#EAEAEA] mb-1">
                    {userData.user.watchlistCount}
                  </div>
                  <div className="text-body-sm text-[#A1A1A1] font-['Inter']">Seen</div>
                </CardContent>
              </Card>
              <Card className="cred-card text-center">
                <CardContent className="cred-spacing-md">
                  <div className="text-heading font-['Poppins'] font-semibold text-[#EAEAEA] mb-1">
                    {userData.user.likesCount}
                  </div>
                  <div className="text-body-sm text-[#A1A1A1] font-['Inter']">Post</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Watchlist */}
            {userData.watchlist.length > 0 && (
              <div className="cred-slide-up" style={{animationDelay: '0.1s'}}>
                <h4 className="text-subheading font-['Poppins'] font-semibold text-[#EAEAEA] mb-4 tracking-tight">
                  Recent Watchlist
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {userData.watchlist.slice(0, 6).map((movie) => (
                    <div key={movie.id} className="aspect-[2/3] group cursor-pointer">
                      {movie.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                          style={{borderRadius: '2px'}}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#121011] flex items-center justify-center group-hover:scale-[1.05] transition-transform duration-300" style={{borderRadius: '2px'}}>
                          <Film size={24} className="text-[#A1A1A1]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            {userData.posts.length > 0 && (
              <div className="cred-slide-up" style={{animationDelay: '0.2s'}}>
                <h4 className="text-subheading font-['Poppins'] font-semibold text-[#EAEAEA] mb-4 tracking-tight">
                  Recent Posts
                </h4>
                <div className="space-y-4">
                  {userData.posts.slice(0, 3).map((post) => (
                    <Card key={post.id} className="cred-card">
                      <CardContent className="cred-spacing-md">
                        {post.caption && (
                          <h5 className="font-['Poppins'] font-medium text-[#EAEAEA] text-sm mb-2 tracking-tight">
                            {post.caption}
                          </h5>
                        )}
                        {post.content && (
                          <p className="text-body-sm text-[#A1A1A1] font-['Inter'] line-clamp-2 mb-2">
                            {post.content}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-caption text-[#7A7A7A] font-['Inter']">
                          <span>{formatDate(post.createdAt || '')}</span>
                          <div className="flex items-center cred-gap-sm">
                            <span className="flex items-center cred-gap-xs">
                              <Heart size={12} />
                              {post.likes}
                            </span>
                            <span className="flex items-center cred-gap-xs">
                              💬 {post.commentsCount}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Content States */}
            {userData.posts.length === 0 && userData.watchlist.length === 0 && (
              <Card className="cred-card text-center cred-fade-in">
                <CardContent className="cred-spacing-2xl">
                  <User size={48} className="text-[#A1A1A1] mx-auto mb-4" />
                  <h4 className="text-subheading font-['Poppins'] font-medium text-[#EAEAEA] mb-2 tracking-tight">
                    New User
                  </h4>
                  <p className="text-body text-[#A1A1A1] font-['Inter']">
                    No posts or watchlist items yet
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="p-6">
            <Card className="cred-card text-center">
              <CardContent className="cred-spacing-2xl">
                <User size={48} className="text-[#A1A1A1] mx-auto mb-4" />
                <h4 className="text-subheading font-['Poppins'] font-medium text-[#EAEAEA] mb-2 tracking-tight">
                  User Not Found
                </h4>
                <p className="text-body text-[#A1A1A1] font-['Inter']">
                  This user doesn't exist
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}