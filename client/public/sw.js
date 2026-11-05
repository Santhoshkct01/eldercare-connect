// Service worker for ElderCare Connect background notifications
self.addEventListener('push', (event) => {
  let data = {
    title: '💊 Medicine Reminder',
    body: 'It is time to take your scheduled dose.',
    icon: '/icon-192.png',
    data: { link: '/elder/medicines' },
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: data.data || { link: '/elder/medicines' },
    actions: [
      { action: 'view', title: 'View Medicine' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.link) || '/elder/medicines';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/elder/medicines') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
