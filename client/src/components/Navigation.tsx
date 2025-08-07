import { Film, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onAddMovie: () => void;
}

export default function Navigation({ onAddMovie }: NavigationProps) {
  return (
    <nav className="bg-background/90 backdrop-blur-sm border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-destructive p-2 rounded-lg">
              <Film className="text-destructive-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-subheading text-foreground">MovieWatch</h1>
              <p className="text-caption text-muted-foreground hidden sm:block">Your Personal Watchlist</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onAddMovie}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground night-button"
              data-testid="button-add-movie"
            >
              <Plus className="mr-2" size={16} />
              <span className="hidden sm:inline">Add Movie</span>
            </Button>
            
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Bell size={16} />
              <span className="text-body-sm hidden md:inline">Reminders active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
