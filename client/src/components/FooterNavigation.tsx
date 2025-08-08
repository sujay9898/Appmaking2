import { Link, useLocation } from "wouter";
import { Home, Film, PlayCircle, User } from "lucide-react";

export default function FooterNavigation() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Film, label: "Pick Movie", path: "/movies" },
    { icon: PlayCircle, label: "Watchlist", path: "/watchlist" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#000000]/95 backdrop-blur-xl border-t border-[#3c595d] z-50">
      <div className="max-w-md mx-auto p-4">
        <nav className="flex justify-around items-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center gap-1 py-3 px-4 transition-all duration-300 font-['Inter'] rounded-[2px] ${
                  location === path
                    ? "text-[#ffffff] bg-[#3c595d]"
                    : "text-[#e0e0e0] hover:text-[#ffffff] hover:bg-[#3c595d]"
                }`}
              >
                <Icon size={20} className="transition-transform duration-300" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}