import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { X, ImagePlus, Film } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [postType, setPostType] = useState<"image" | "movie">("image");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "user1", // This should come from auth context
      content: "",
      caption: "",
      image: "",
      moviePoster: "",
      movieTitle: "",
      movieYear: "",
      movieInfo: "",
      postType: "image",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const postData = {
        userId: data.userId,
        content: data.content,
        caption: data.caption,
        image: data.image,
        moviePoster: data.moviePoster,
        movieTitle: data.movieTitle,
        movieYear: data.movieYear,
        movieInfo: data.movieInfo,
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
        setImagePreview(result);
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (postType === "image" && !data.image && !data.caption) {
      toast({
        title: "Please add an image or caption",
        description: "Image posts need at least an image or caption",
        variant: "destructive",
      });
      return;
    }

    if (postType === "movie" && !data.movieTitle) {
      toast({
        title: "Please add a movie title",
        description: "Movie posts need at least a title",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setImagePreview(null);
    setPostType("image");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 bg-[#0f1419] border-white/10 text-white">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Text Post Only */}
          <div>
            <Label htmlFor="caption" className="text-gray-300">What's on your mind?</Label>
            <Textarea
              id="caption"
              placeholder="Share your thoughts about movies..."
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