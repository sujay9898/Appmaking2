import { Clapperboard, Bell } from "lucide-react";

interface NavigationProps {}

export default function Navigation({}: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/95 backdrop-blur-xl cred-fade-in">
      <div className="w-full">
        <div className="flex justify-between items-center h-16 sm:h-20 px-0">
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
          </div>
        </div>
      </div>
    </nav>
  );
}
