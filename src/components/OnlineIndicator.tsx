import { useState, useEffect } from 'react';

export default function OnlineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="status-indicator">
      <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}
