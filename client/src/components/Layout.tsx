import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Rocket, Newspaper, Search, Brain, Gamepad2 } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <header className="border-b bg-card">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Launch Feed</span>
            </div>
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive("/")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/launches"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive("/launches")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Rocket className="h-4 w-4" />
                  <span>Launches</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/daily-report"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive("/daily-report")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Newspaper className="h-4 w-4" />
                  <span>Daily Report</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/news-search"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive("/news-search")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>News Search</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/semantic-search"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive("/semantic-search")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span>Semantic Search</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/date-guess-game"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive("/date-guess-game")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Date Game</span>
                </Link>
              </li>
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
