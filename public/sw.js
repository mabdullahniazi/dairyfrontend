// Dev-mode service worker with push notification handlers
// In production, VitePWA's injectManifest replaces this with src/sw.ts (compiled)
// This file only runs in dev mode via Vite's static serving from /public

self.addEventListener('push', (event) => {
  console.log('[SW-DEV] Push received');

  let data = {
    title: '🐄 Livestock Manager',
    body: 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'general',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: data.data,
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW-DEV] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
