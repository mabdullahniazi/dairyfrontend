import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initNotifications } from './services/notificationService'

// Initialize notifications when app loads
initNotifications().catch(console.error);

// Service worker is automatically registered by vite-plugin-pwa in production build
// No manual registration needed - the plugin injects it

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
