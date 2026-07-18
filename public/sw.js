// Killer Service Worker to clear stale PWA registrations on localhost:3000
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      console.log('Stale service worker successfully unregistered.');
    })
  );
});
