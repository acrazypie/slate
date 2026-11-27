// Service worker: shows reminder notifications and opens the calendar on tap.

self.addEventListener('push', (event) => {
  let data = { title: 'Slate', body: '', tag: undefined, url: '/dashboard' };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // No readable payload: show the default text.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/dashboard' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
