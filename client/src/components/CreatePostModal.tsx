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
  postType: z.enum(["text", "image", "movie"]),
  imageFile: z.any().optional(),
});

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [postType, setPostType] = useState<"text" | "image" | "movie">("text");
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
      postType: "text",
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
    if (postType === "text" && !data.content && !data.caption) {
      toast({
        title: "Please add some content",
        description: "Your post needs either a caption or content",
        variant: "destructive",
      });
      return;
    }
    
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
    setPostType("text");
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
          {/* Post Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={postType === "text" ? "default" : "outline"}
              onClick={() => setPostType("text")}
              className={`flex-1 ${postType === "text" ? "bg-[#284145] text-white" : "border-white/20 text-gray-300 hover:bg-white/10"}`}
            >
              Text
            </Button>
            <Button
              type="button"
              variant={postType === "image" ? "default" : "outline"}
              onClick={() => setPostType("image")}
              className={`flex-1 ${postType === "image" ? "bg-[#284145] text-white" : "border-white/20 text-gray-300 hover:bg-white/10"}`}
            >
              <ImagePlus size={16} className="mr-2" />
              Image
            </Button>
            <Button
              type="button"
              variant={postType === "movie" ? "default" : "outline"}
              onClick={() => setPostType("movie")}
              className={`flex-1 ${postType === "movie" ? "bg-[#284145] text-white" : "border-white/20 text-gray-300 hover:bg-white/10"}`}
            >
              <Film size={16} className="mr-2" />
              Movie
            </Button>
          </div>

          {/* Caption (common for all types) */}
          <div>
            <Label htmlFor="caption" className="text-gray-300">Caption</Label>
            <Textarea
              id="caption"
              placeholder="What's on your mind?"
              {...form.register("caption")}
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400 resize-none min-h-[100px]"
            />
          </div>

          {/* Text Post Content */}
          {postType === "text" && (
            <div>
              <Label htmlFor="content" className="text-gray-300">Content</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts..."
                {...form.register("content")}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400 resize-none min-h-[120px]"
              />
            </div>
          )}

          {/* Image Upload */}
          {postType === "image" && (
            <div>
              <Label htmlFor="image" className="text-gray-300">Upload Image</Label>
              <div className="mt-2">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-28 max-w-full object-cover rounded" />
                  ) : (
                    <>
                      <ImagePlus size={32} className="text-gray-400 mb-2" />
                      <span className="text-gray-400">Click to upload image</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Movie Fields */}
          {postType === "movie" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="movieTitle" className="text-gray-300">Movie Title</Label>
                <Input
                  id="movieTitle"
                  placeholder="Enter movie title"
                  {...form.register("movieTitle")}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="movieYear" className="text-gray-300">Release Year</Label>
                <Input
                  id="movieYear"
                  placeholder="2024"
                  {...form.register("movieYear")}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="moviePoster" className="text-gray-300">Poster URL (optional)</Label>
                <Input
                  id="moviePoster"
                  placeholder="https://image.url"
                  {...form.register("moviePoster")}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="movieInfo" className="text-gray-300">Movie Info</Label>
                <Textarea
                  id="movieInfo"
                  placeholder="Added to watchlist&#10;Watching on: [Date]"
                  {...form.register("movieInfo")}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-400 resize-none min-h-[80px]"
                />
              </div>
            </div>
          )}

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