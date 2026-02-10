import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for push notifications
// In dev mode: uses public/sw.js (simple push handlers)
// In production: VitePWA builds src/sw.ts → dist/sw.js (push + Workbox precaching)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const swUrl = import.meta.env.PROD ? '/sw.js' : '/sw.js';
      const reg = await navigator.serviceWorker.register(swUrl, { scope: '/' });
      console.log('✅ SW registered:', reg.scope);

      // Wait for the SW to become active
      if (reg.installing) {
        reg.installing.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') {
            console.log('✅ SW activated');
          }
        });
      }
    } catch (err) {
      console.error('❌ SW registration failed:', err);
    }
  });
}
