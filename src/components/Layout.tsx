import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSync } from '../hooks/useSync';

export function Layout() {
  const { syncing, isOnline, doSync, pendingCount } = useSync();
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/animals/add')) return 'Add Animal';
    if (path.startsWith('/animals/edit')) return 'Edit Animal';
    if (path.match(/^\/animals\/\d+$/)) return 'Animal Details';
    if (path === '/animals') return 'My Animals';
    if (path === '/reports/add') return 'Add Report';
    if (path === '/reports') return 'Reports';
    if (path === '/settings') return 'Settings';
    return 'Livestock Manager';
  };

  return (
    <>
      {/* Farm background */}
      <div className="farm-bg" />

      <div className="relative z-10 h-full overflow-y-auto flex flex-col md:ml-56">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-white text-xs font-semibold text-center py-1.5 px-4 flex items-center justify-center gap-1.5 animate-[slideDown_0.3s_ease-out]">
            <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
            You're offline — data is saved locally
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/40 backdrop-blur-sm  border-b border-white/10">
          <div className="mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl hidden sm:block">🐄</span>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-stone-800 tracking-tight">{getTitle()}</h1>
                <p className="text-[10px] text-stone-800 font-medium hidden sm:block">Livestock Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnline && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              )}
              <button
                onClick={doSync}
                disabled={syncing || !isOnline}
                className={`
                  relative p-2.5 rounded-xl transition-all duration-200 hover:cursor-pointer
                  ${syncing ? 'animate-spin' : ''}
                  ${pendingCount > 0 && isOnline ? 'text-amber-600 hover:bg-amber-50 active:bg-amber-100' : ''}
                  ${pendingCount === 0 && isOnline ? 'text-stone-300 hover:bg-stone-600 active:bg-stone-200' : ''}
                  ${!isOnline ? 'text-stone-300' : ''}
                `}
                title={
                  syncing
                    ? 'Syncing...'
                    : pendingCount > 0
                      ? `${pendingCount} unsynced — tap to sync`
                      : 'All synced ✓'
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                {pendingCount > 0 && !syncing && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-24 md:pb-6">
          <div className="mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation — mobile only */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden glass-card border-t border-white/20 z-30 safe-area-pb">
          <div className="flex items-center justify-around py-2 px-2">
            {[
              { to: '/', label: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
              { to: '/animals', label: 'Animals', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h.01M16 12h.01M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1M7 8.5c.5-.5 1.5-.5 2 0M15 8.5c.5-.5 1.5-.5 2 0" /></svg> },
              { to: '/reports', label: 'Reports', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
              { to: '/settings', label: 'Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg> },
            ].map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 ${isActive
                    ? 'text-amber-700 bg-amber-100/80'
                    : 'text-stone-400 hover:text-stone-600'
                  }`
                }
              >
                {icon}
                <span className="text-[10px] font-semibold">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Desktop Sidebar Nav */}
        <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-white/40 backdrop-blur-sm  border-r border-white/20 z-20">
        <div className="flex flex-col items-left justify-between py-2.5 px-5 w-56 border-b border-white/20">
          <span className="text-2xl font-bold hidden sm:block">Tahir Farm </span>
          <span className="text-md font-bold hidden sm:block">Its Real Milk Farm </span>
        </div>
          <div className="flex flex-col gap-1 px-3 py-4">
            {[
              { to: '/', label: 'Dashboard', emoji: '🏠' },
              { to: '/animals', label: 'My Animals', emoji: '🐄' },
              { to: '/reports', label: 'Reports', emoji: '📋' },
              { to: '/settings', label: 'Settings', emoji: '⚙️' },
            ].map(({ to, label, emoji }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-100 ${isActive
                    ? 'bg-gradient-to-r from-amber-600/80 to-amber-700/80 text-white'
                    : 'text-stone-200 hover:bg-white/40 hover:text-stone-700'
                  }`
                }
              >
                <span className="text-lg">{emoji}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

      </div>
    </>
  );
}
