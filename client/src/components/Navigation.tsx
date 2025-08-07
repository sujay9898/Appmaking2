import { Film, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onAddMovie: () => void;
}

export default function Navigation({ onAddMovie }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Film className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MovieWatch</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Your Personal Watchlist</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onAddMovie}
              className="bg-primary-600 hover:bg-primary-700 text-white"
              data-testid="button-add-movie"
            >
              <Plus className="mr-2" size={16} />
              <span className="hidden sm:inline">Add Movie</span>
            </Button>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Bell size={16} />
              <span className="text-sm hidden md:inline">Reminders active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
