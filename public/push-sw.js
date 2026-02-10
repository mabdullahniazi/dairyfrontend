// Push notification handlers — imported by Workbox-generated SW via importScripts
// This file lives in /public and is included in the generated service worker

self.addEventListener('push', function(event) {
  console.log('[SW] Push event received');

  var data = {
    title: '🐄 Livestock Manager',
    body: 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'general',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      var payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || data.body;
      data.icon = payload.icon || data.icon;
      data.badge = payload.badge || data.badge;
      data.tag = payload.tag || data.tag;
      data.data = payload.data || data.data;
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
      data: data.data
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked');
  event.notification.close();

  var urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== -1) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
