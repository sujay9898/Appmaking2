import { Clapperboard, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onAddMovie: () => void;
}

export default function Navigation({ onAddMovie }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#090708]/95 backdrop-blur-xl border-b border-[#1E1C1D] cred-fade-in">
      <div className="cred-container">
        <div className="flex justify-between items-center h-20 ml-[-13px] mr-[-13px] mt-[0px] mb-[0px] pl-[23px] pr-[23px]">
          <div></div>
          <div className="bg-[#121011] p-3 rounded-[2px] shadow-lg border border-[#1E1C1D]">
            <Clapperboard className="text-[#EAEAEA]" size={22} />
          </div>
          
          <div className="flex items-center cred-gap-md">
            <Button 
              onClick={onAddMovie}
              variant="default"
              size="lg"
              className="font-semibold tracking-tight"
              data-testid="button-add-movie"
            >
              <Search size={18} className="mr-2" />
              <span className="hidden sm:inline">Add Movie</span>
            </Button>
            
            <div className="flex items-center cred-gap-sm text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200">
              <Bell size={18} />
              <span className="text-body-sm hidden md:inline font-['Inter']">Reminders active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
