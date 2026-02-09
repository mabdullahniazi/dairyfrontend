import { useState, useEffect } from 'react';

export default function OnlineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="status">
      <span className={`status-dot ${online ? 'on' : 'off'}`} />
      <span>{online ? 'Online' : 'Offline'}</span>
    </div>
  );
}
