import { Link, Outlet, useLocation } from "react-router-dom";
import { Newspaper, Search, Gamepad2, Sparkles } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const isProd = !import.meta.env.DEV;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: "/daily-report",
      icon: Newspaper,
      label: "Daily",
      alwaysEnabled: true,
    },
    {
      path: "/top-headlines",
      icon: Sparkles,
      label: "Top",
      alwaysEnabled: false,
    },
    {
      path: "/news-search",
      icon: Search,
      label: "Search",
      alwaysEnabled: false,
    },
    {
      path: "/date-guess-game",
      icon: Gamepad2,
      label: "Game",
      alwaysEnabled: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border/30">
        <nav className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-lg font-semibold text-primary hover:opacity-80 transition"
            >
              Launch Feed
            </Link>
            <ul className="flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label, alwaysEnabled }) => {
                const isDisabled = isProd && !alwaysEnabled;
                return (
                  <li key={path}>
                    {isDisabled ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md opacity-50 cursor-not-allowed">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                    ) : (
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
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          {isProd && (
            <div className="mt-2 text-center">
              <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-900 shadow-sm">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Top headlines and search features are not available on
                  production as the API costs money from non localhost routes :(
                </span>
              </div>
            </div>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
