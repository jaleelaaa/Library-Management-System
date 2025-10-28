// Service Worker - Unregister and clear all caches
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('All caches cleared');
      return self.registration.unregister();
    }).then(() => {
      console.log('Service worker unregistered');
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UNREGISTERED' });
      });
    })
  );
});

// Don't cache anything - pass through all requests
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
