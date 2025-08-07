import { Link, useLocation } from "wouter";
import { Home, FileText, Film, User } from "lucide-react";

export default function FooterNavigation() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Feed", path: "/feed" },
    { icon: Film, label: "Watchlist", path: "/watchlist" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <nav className="flex justify-around items-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                  location === path
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}