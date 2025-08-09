import { Clapperboard, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onAddMovie: () => void;
}

export default function Navigation({ onAddMovie }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/95 backdrop-blur-xl cred-fade-in">
      <div className="w-full">
        <div className="flex justify-between items-center h-16 sm:h-20 px-0">
          <div className="flex-1"></div>
          <div className="bg-[#3c595d] p-2 sm:p-3 rounded-[2px] shadow-lg border border-[#3c595d]">
            <Clapperboard className="text-[#ffffff]" size={18} />
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
            <Button 
              onClick={onAddMovie}
              variant="default"
              size="sm"
              className="font-semibold tracking-tight"
              data-testid="button-add-movie"
            >
              <Search size={16} className="mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add</span>
            </Button>
            
            <div className="flex items-center gap-1 sm:gap-2 text-[#e0e0e0] hover:text-[#ffffff] transition-colors duration-200">
              <Bell size={14} className="sm:size-4" />
              <span className="text-xs sm:text-sm hidden sm:inline font-['Inter']">Active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
