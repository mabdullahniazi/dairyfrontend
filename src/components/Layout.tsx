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
    { path: '/report', label: 'Add Report' },
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
              <div className="sidebar-logo-sub">Management</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}

          <div className="nav-section-title">Actions</div>
          <Link to="/animals/add" className="nav-item">
            New Animal
          </Link>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 'auto' }}>
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
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`nav-item ${isActive(path) ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
