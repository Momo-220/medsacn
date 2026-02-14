// Service Worker pour notifications push et mode hors ligne
const CACHE_NAME = 'mediscan-v1';
const NOTIFICATION_ICON = '/icons/icon-192x192.png';

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
      ]);
    })
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Stocker les notifications programmées
const scheduledNotifications = new Map();

// Écouter les messages du client pour programmer des notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { reminderId, medicationName, dosage, delay, scheduledTime } = event.data.data;
    
    // Programmer la notification
    const timeoutId = setTimeout(() => {
      self.registration.showNotification('Rappel de médicament', {
        body: `Il est temps de prendre ${medicationName} (${dosage})`,
        icon: NOTIFICATION_ICON,
        badge: NOTIFICATION_ICON,
        tag: `reminder-${reminderId}`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: {
          reminderId,
          medicationName,
          dosage,
        },
        actions: [
          {
            action: 'taken',
            title: '✓ Pris',
          },
          {
            action: 'snooze',
            title: '⏰ Dans 10min',
          },
        ],
      });
      
      scheduledNotifications.delete(reminderId);
    }, delay);
    
    scheduledNotifications.set(reminderId, timeoutId);
  }
});

// Gestion des notifications push (pour notifications serveur)
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Rappel de médicament', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || 'Rappel de médicament',
    body: data.body || 'Il est temps de prendre votre médicament',
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag: data.tag || 'medication-reminder',
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'taken',
        title: '✓ Pris',
      },
      {
        action: 'snooze',
        title: '⏰ Rappeler dans 10min',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'taken') {
    // Ouvrir l'app et marquer comme pris
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus().then((client) => {
            return client.postMessage({
              type: 'MARK_TAKEN',
              reminderId: event.notification.data?.reminderId,
            });
          });
        }
        return clients.openWindow('/');
      })
    );
  } else if (event.action === 'snooze') {
    // Programmer un rappel dans 10 minutes
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].postMessage({
            type: 'SNOOZE_REMINDER',
            reminderId: event.notification.data?.reminderId,
            delay: 10 * 60 * 1000, // 10 minutes
          });
        }
      })
    );
  } else {
    // Ouvrir l'app normalement
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// NOTE: Pour simplifier et éviter les erreurs de logs, on désactive pour l'instant
// le cache offline avancé et la synchronisation en arrière-plan.
