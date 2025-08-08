import { Clapperboard, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onAddMovie: () => void;
}

export default function Navigation({ onAddMovie }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-[#1A1A1A] cred-fade-in">
      <div className="cred-container">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cred-gap-sm">
            <div className="bg-gradient-to-br from-[#D4AF37] to-[#00E5FF] p-3 rounded-[2px] shadow-lg">
              <Clapperboard className="text-[#0B0B0B]" size={22} />
            </div>
            <div>
              <h1 className="text-subheading font-['Poppins'] font-semibold text-white tracking-tight">MovieWatch</h1>
              <p className="text-caption text-[#888888] hidden sm:block font-['Inter']">Your Personal Watchlist</p>
            </div>
          </div>
          
          <div className="flex items-center cred-gap-md">
            <Button 
              onClick={onAddMovie}
              variant="default"
              size="lg"
              className="font-semibold tracking-tight"
              data-testid="button-add-movie"
            >
              <Plus size={18} className="mr-2" />
              <span className="hidden sm:inline">Add Movie</span>
            </Button>
            
            <div className="flex items-center cred-gap-sm text-[#888888] hover:text-[#D4AF37] transition-colors duration-300">
              <Bell size={18} />
              <span className="text-body-sm hidden md:inline font-['Inter']">Reminders active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
