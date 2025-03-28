import { Link, Outlet, useLocation } from "react-router-dom";
import { Newspaper, Search, Gamepad2, Sparkles } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border/30">
        <nav className="container mx-auto px-0 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 -ml-16">
              <Link
                to="/"
                className="text-lg font-semibold text-primary hover:opacity-80 transition px-2"
              >
                Launch Feed
              </Link>
            </div>
            <ul className="flex items-center gap-1">
              {[
                { path: "/daily-report", icon: Newspaper, label: "Daily" },
                { path: "/top-headlines", icon: Sparkles, label: "Top" },
                { path: "/news-search", icon: Search, label: "Search" },
                { path: "/date-guess-game", icon: Gamepad2, label: "Game" },
              ].map(({ path, icon: Icon, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition ${
                      isActive(path)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
