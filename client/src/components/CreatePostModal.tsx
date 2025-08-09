import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Film } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFeedPostSchema } from "@shared/schema";

const formSchema = insertFeedPostSchema.extend({
  postType: z.enum(["image", "movie"]),
  imageFile: z.any().optional(),
});

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  

  const form = useForm({
    defaultValues: {
      caption: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const postData = {
        userId: "user1",
        content: data.caption,
        caption: data.caption,
        image: "",
        moviePoster: "",
        movieTitle: "",
        movieYear: "",
        movieInfo: "",
      };
      return await apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created!",
        description: "Your post has been added to the feed",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Image upload functionality can be implemented later
        console.log("Image uploaded:", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    if (!data.caption.trim()) {
      toast({
        title: "Please write about movies",
        description: "Share your thoughts, reviews, or recommendations about movies",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 bg-[#0f1419] border-white/10 text-white">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-[#284145]" />
            Write About Movies
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Text Area */}
          <div>
            <Label htmlFor="caption" className="text-gray-300">Write about movies</Label>
            <Textarea
              id="caption"
              placeholder="Share your thoughts about your favorite movies, recent watches, or movie recommendations..."
              {...form.register("caption")}
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400 resize-none min-h-[120px]"
            />
          </div>

          

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#284145] hover:bg-[#334c52] text-white"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}