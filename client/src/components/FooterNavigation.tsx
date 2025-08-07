import { Link, useLocation } from "wouter";
import { FileText, Film, User } from "lucide-react";

export default function FooterNavigation() {
  const [location] = useLocation();

  const navItems = [
    { icon: FileText, label: "Home", path: "/" },
    { icon: Film, label: "Pick Movie", path: "/movies" },
    { icon: Film, label: "Watchlist", path: "/watchlist" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <nav className="flex justify-around items-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all night-button ${
                  location === path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon size={20} />
                <span className="text-caption font-medium">{label}</span>
              </button>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}