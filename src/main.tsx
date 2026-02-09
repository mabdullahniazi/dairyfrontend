import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initNotifications } from './services/notificationService'

// Initialize notifications when app loads
initNotifications().catch(console.error);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('ServiceWorker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
