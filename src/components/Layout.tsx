import { Outlet, Link, useLocation } from 'react-router-dom';
import OnlineIndicator from './OnlineIndicator';

export default function Layout() {
  const location = useLocation();
  const isSubPage = location.pathname.includes('/animal/') ||
    location.pathname.includes('/add') ||
    location.pathname.includes('/edit') ||
    location.pathname.includes('/report');

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/animals', label: 'Animals' },
    { path: '/report', label: 'New Report' },
  ];

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
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`menu-item ${isActive(path) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}

          <div className="menu-label">Quick</div>
          <Link to="/animals/add" className="menu-item">Add Animal</Link>
        </nav>

        <div className="sidebar-footer">
          <OnlineIndicator />
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="header">
          <h1 className="header-title">
            {location.pathname === '/' && 'Dashboard'}
            {location.pathname === '/animals' && 'Animals'}
            {location.pathname === '/report' && 'New Report'}
            {location.pathname.includes('/animal/') && 'Details'}
            {location.pathname.includes('/add') && 'Add Animal'}
            {location.pathname.includes('/edit') && 'Edit'}
          </h1>
          <OnlineIndicator />
        </header>

        <div className="content">
          <Outlet />
        </div>

        {/* Mobile Nav */}
        {!isSubPage && (
          <nav className="bottom-nav">
            {navItems.map(({ path, label }) => (
              <Link key={path} to={path} className={isActive(path) ? 'active' : ''}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
