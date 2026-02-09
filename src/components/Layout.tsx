import { Outlet, Link, useLocation } from "react-router-dom";
import OnlineIndicator from "./OnlineIndicator";

// Simple inline SVG icons — no library needed
const icons = {
  dashboard: (
    <svg className="menu-icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-2a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  animals: (
    <svg className="menu-icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  report: (
    <svg className="menu-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  addAnimal: (
    <svg className="menu-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export default function Layout() {
  const location = useLocation();
  const isSubPage =
    location.pathname.includes("/animals/") ||
    location.pathname.includes("/add") ||
    location.pathname.includes("/edit") ||
    location.pathname.includes("/report");

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: icons.dashboard },
    { path: "/animals", label: "Animals", icon: icons.animals },
    { path: "/report", label: "New Report", icon: icons.report },
  ];

  const getPageTitle = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname === "/animals") return "Animals";
    if (location.pathname === "/report") return "New Report";
    if (location.pathname.includes("/animals/add")) return "Add Animal";
    if (location.pathname.includes("/animals/edit")) return "Edit Animal";
    if (location.pathname.includes("/animals/")) return "Animal Details";
    return "";
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-name">Livestock</div>
          <div className="brand-sub">Farm Manager</div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-label">Menu</div>
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`menu-item ${isActive(path) ? "active" : ""}`}
            >
              {icon}
              {label}
            </Link>
          ))}

          <div className="menu-label">Quick</div>
          <Link
            to="/animals/add"
            className={`menu-item ${location.pathname === "/animals/add" ? "active" : ""}`}
          >
            {icons.addAnimal}
            Add Animal
          </Link>
        </nav>

        <div className="sidebar-footer">
          <OnlineIndicator />
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="header">
          <h1 className="header-title">{getPageTitle()}</h1>
          <OnlineIndicator />
        </header>

        <div className="content">
          <Outlet />
        </div>

        {/* Mobile Nav */}
        {!isSubPage && (
          <nav className="bottom-nav">
            {navItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={isActive(path) ? "active" : ""}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
