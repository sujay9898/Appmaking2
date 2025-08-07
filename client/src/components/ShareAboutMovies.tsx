import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function ShareAboutMovies() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  const prompts = [
    "What you wanna watch today?",
    "Share your opinion on a movie",
    "Suggest a movie to others"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [prompts.length]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-black text-white">Feed it</h1>
      </div>

      {/* Minimal Input Box */}
      <Card className="bg-gray-800 border-gray-700 border-opacity-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 bg-gray-700 border border-gray-600 rounded-sm px-3 py-2 min-h-[40px] flex items-center">
              <span className="text-gray-400 text-sm transition-opacity duration-300">
                {prompts[currentPromptIndex]}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}