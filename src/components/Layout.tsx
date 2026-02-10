import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSync } from '../hooks/useSync';

export function Layout() {
  const { syncing, isOnline, doSync } = useSync();
  const location = useLocation();

  // Get page title from current route
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/animals/add')) return 'Add Animal';
    if (path.startsWith('/animals/edit')) return 'Edit Animal';
    if (path.match(/^\/animals\/\d+$/)) return 'Animal Details';
    if (path === '/animals') return 'My Animals';
    if (path === '/reports/add') return 'Add Report';
    if (path === '/reports') return 'Reports';
    return 'Livestock Manager';
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col max-w-lg mx-auto relative">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold text-center py-1.5 px-4 flex items-center justify-center gap-1.5 animate-[slideDown_0.3s_ease-out]">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          You're offline — data is saved locally
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">{getTitle()}</h1>
          </div>
          <button
            onClick={doSync}
            disabled={syncing || !isOnline}
            className={`
              p-2 rounded-xl transition-all duration-200
              ${syncing ? 'animate-spin' : ''}
              ${isOnline ? 'text-stone-600 hover:bg-stone-100 active:bg-stone-200' : 'text-stone-300'}
            `}
            title={syncing ? 'Syncing...' : 'Sync now'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/90 backdrop-blur-xl border-t border-stone-200/60 z-30 safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-semibold">Home</span>
          </NavLink>

          <NavLink
            to="/animals"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h.01M16 12h.01M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1M7 8.5c.5-.5 1.5-.5 2 0M15 8.5c.5-.5 1.5-.5 2 0" />
            </svg>
            <span className="text-[10px] font-semibold">Animals</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="text-[10px] font-semibold">Reports</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
