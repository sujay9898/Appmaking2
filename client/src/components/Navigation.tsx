import { Clapperboard, Bell, Menu } from "lucide-react";

interface NavigationProps {}

export default function Navigation({}: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/95 backdrop-blur-xl cred-fade-in">
      <div className="w-full">
        <div className="flex justify-between items-center h-16 sm:h-20 px-4">
          <div className="flex items-center">
            <div className="bg-[#3c595d] p-2 sm:p-3 rounded-[2px] shadow-lg border border-[#3c595d]">
              <Menu className="text-[#ffffff]" size={18} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[#3c595d] p-2 sm:p-3 rounded-[2px] shadow-lg border border-[#3c595d]">
              <Clapperboard className="text-[#ffffff]" size={18} />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
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
