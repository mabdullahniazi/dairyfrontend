import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import OnlineIndicator from './OnlineIndicator';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're on a sub-page (not main navigation pages)
  const isSubPage = location.pathname.includes('/add') || 
                    location.pathname.includes('/edit') ||
                    (location.pathname.includes('/animals/') && location.pathname !== '/animals');

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        {isSubPage ? (
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        ) : (
          <div className="header-logo">
            <img src="/icons/icon-192.png" alt="Livestock Manager" />
            <span className="header-title">Livestock</span>
          </div>
        )}
        <OnlineIndicator />
      </header>

      {/* Main Content */}
      <main className="page">
        <Outlet />
      </main>

      {/* Bottom Navigation - hide on sub-pages */}
      {!isSubPage && (
        <nav className="bottom-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </NavLink>
          <NavLink to="/animals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🐄</span>
            <span>Animals</span>
          </NavLink>
          <NavLink to="/report/add" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📝</span>
            <span>Report</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
}
