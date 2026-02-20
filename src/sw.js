// NUR Prayer App — Service Worker v3
// This allows Workbox to inject the list of files to cache
self.__WB_MANIFEST;
const CACHE = 'nur-v3';
const PRECACHE = ['/', '/index.html'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Don't intercept Aladhan API or Quran API calls
    if (e.request.url.includes('aladhan.com') || e.request.url.includes('alquran.cloud')) return;
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});

// Called by App via postMessage
self.addEventListener('message', e => {
    if (e.data?.type !== 'SHOW_NOTIFICATION') return;
    const { title, body, tag, icon } = e.data;
    e.waitUntil(
        self.registration.showNotification(title, {
            body,
            tag,
            icon: icon || '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            vibrate: [200, 100, 200, 100, 400],
            requireInteraction: true,
            actions: [
                { action: 'praying', title: '🤲 I Am Praying' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        })
    );
});

// Notification click → open app
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            if (list.length) return list[0].focus();
            return clients.openWindow('/');
        })
    );
});