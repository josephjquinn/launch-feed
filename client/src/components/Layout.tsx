import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4">
          <ul className="flex gap-4">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/launches" className="hover:text-primary">
                Launches
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
