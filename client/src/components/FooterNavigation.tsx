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
    <footer className="fixed bottom-0 left-0 right-0 bg-[#0B0B0B]/95 backdrop-blur-xl border-t border-[#1A1A1A] z-50">
      <div className="max-w-md mx-auto cred-spacing-sm">
        <nav className="flex justify-around items-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center cred-gap-xs py-3 px-4 transition-all duration-400 font-['Inter'] ${
                  location === path
                    ? "text-[#D4AF37] scale-110"
                    : "text-[#888888] hover:text-[#00E5FF] hover:scale-105"
                }`}
                style={{borderRadius: '2px'}}
              >
                <Icon size={22} className="transition-transform duration-300" />
                <span className="text-xs font-medium tracking-tight">{label}</span>
              </button>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}