import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, User, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FeedComment } from "@shared/schema";

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postCaption?: string;
}

interface CommentWithUser extends FeedComment {
  username: string;
  userProfilePicture?: string;
}

export default function CommentSheet({ isOpen, onClose, postId, postCaption }: CommentSheetProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/posts", postId, "comments"],
    enabled: isOpen && !!postId,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  const addCommentMutation = useMutation({
    mutationFn: (commentData: { content: string }) => 
      apiRequest("POST", `/api/posts/${postId}/comments`, {
        content: commentData.content,
        userId: "current-user", // In a real app, this would come from auth
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewComment("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ content: newComment.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const formatTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cred-fade-in">
      <div className="fixed bottom-0 left-0 right-0 bg-[#090708] border-t border-[#1E1C1D] max-h-[80vh] cred-slide-up">
        <div className="sticky top-0 bg-[#090708]/95 backdrop-blur-xl border-b border-[#1E1C1D] p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center cred-gap-sm">
              <MessageCircle size={20} className="text-[#A1A1A1]" />
              <h3 className="text-subheading font-['Poppins'] font-semibold text-[#EAEAEA] tracking-tight">
                Comments
              </h3>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon-sm"
              className="text-[#A1A1A1] hover:text-[#EAEAEA]"
            >
              <X size={18} />
            </Button>
          </div>
          {postCaption && (
            <p className="text-body-sm text-[#A1A1A1] font-['Inter'] mt-2 line-clamp-2">
              "{postCaption}"
            </p>
          )}
        </div>

        <div className="max-h-[50vh] overflow-y-auto cred-scrollbar">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex cred-gap-sm">
                  <div className="w-8 h-8 bg-[#121011] rounded-[2px] animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#121011] rounded-[2px] w-20 animate-pulse"></div>
                    <div className="h-4 bg-[#121011] rounded-[2px] w-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex cred-gap-sm cred-fade-in">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#EAEAEA] to-[#A1A1A1] flex items-center justify-center flex-shrink-0" style={{borderRadius: '2px'}}>
                    {comment.userProfilePicture ? (
                      <img 
                        src={comment.userProfilePicture} 
                        alt={comment.username}
                        className="w-full h-full object-cover"
                        style={{borderRadius: '2px'}}
                      />
                    ) : (
                      <User size={14} className="text-[#090708]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center cred-gap-sm mb-1">
                      <span className="text-body-sm font-['Poppins'] font-medium text-[#EAEAEA] tracking-tight">
                        @{comment.username}
                      </span>
                      <span className="text-caption text-[#7A7A7A] font-['Inter']">
                        {formatTimeAgo(comment.createdAt || '')}
                      </span>
                    </div>
                    <p className="text-body text-[#A1A1A1] font-['Inter'] leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageCircle size={48} className="text-[#A1A1A1] mx-auto mb-4" />
              <h4 className="text-subheading font-['Poppins'] font-medium text-[#EAEAEA] mb-2 tracking-tight">
                No comments yet
              </h4>
              <p className="text-body text-[#A1A1A1] font-['Inter']">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#090708] border-t border-[#1E1C1D] p-4">
          <div className="flex cred-gap-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-[#EAEAEA] to-[#A1A1A1] flex items-center justify-center flex-shrink-0" style={{borderRadius: '2px'}}>
              <User size={14} className="text-[#090708]" />
            </div>
            <div className="flex-1 flex cred-gap-sm">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a comment..."
                rows={2}
                className="flex-1 bg-[#121011] border border-[#1E1C1D] text-[#EAEAEA] placeholder-[#A1A1A1] resize-none focus:border-[#EAEAEA] transition-all duration-200 font-['Inter'] text-sm"
                style={{borderRadius: '2px'}}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
                variant="default"
                size="icon"
                className="self-end"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}