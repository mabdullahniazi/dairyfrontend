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
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/animals', icon: '🐄', label: 'Animals' },
    { path: '/report', icon: '📝', label: 'Add Report' },
  ];

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/icons/icon-192.png" alt="Logo" />
            <div>
              <div className="sidebar-logo-text">Livestock</div>
              <div className="sidebar-logo-sub">Management System</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map(({ path, icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}

          <div className="nav-section-title">Quick Actions</div>
          <Link to="/animals/add" className="nav-item">
            <span className="nav-icon">➕</span>
            Add Animal
          </Link>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <OnlineIndicator />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1 className="header-title">
            {location.pathname === '/' && 'Dashboard'}
            {location.pathname === '/animals' && 'Animals'}
            {location.pathname === '/report' && 'Add Report'}
            {location.pathname.includes('/animal/') && 'Animal Details'}
            {location.pathname.includes('/add') && 'Add Animal'}
            {location.pathname.includes('/edit') && 'Edit Animal'}
          </h1>
          <div className="header-actions">
            <OnlineIndicator />
          </div>
        </header>

        <div className="page">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        {!isSubPage && (
          <nav className="bottom-nav">
            {navItems.map(({ path, icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`nav-item ${isActive(path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
