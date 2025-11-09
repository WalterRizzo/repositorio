// Service Worker para notificaciones push
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(clients.claim());
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Push recibido:', event);
  
  const data = event.data ? event.data.json() : {
    title: 'ExpenseFlow',
    body: 'Nueva notificación',
    icon: '/icon-192.png'
  };

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'expense-notification',
    requireInteraction: true,
    data: data.data,
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ver Gastos'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/expenses')
    );
  }
});
