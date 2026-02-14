import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSync } from '../hooks/useSync';
import { LayoutDashboard, Settings, FileText, PawPrint, Home, RefreshCw } from 'lucide-react';

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
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
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
              { to: '/', label: 'Home', icon: <Home className="w-6 h-6" /> },
              { to: '/animals', label: 'Animals', icon: <PawPrint className="w-6 h-6" /> },
              { to: '/reports', label: 'Reports', icon: <FileText className="w-6 h-6" /> },
              { to: '/settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> },
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
              { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
              { to: '/animals', label: 'My Animals', icon: <PawPrint className="w-5 h-5" /> },
              { to: '/reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
              { to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
            ].map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-100 ${isActive
                    ? 'bg-gradient-to-r from-sky-600/80 to-sky-700/80 text-white'
                    : 'text-stone-800 hover:bg-white/40 hover:text-stone-700'
                  }`
                }
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

      </div>
    </>
  );
}
