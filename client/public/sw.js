// ClassMate PWA Service Worker
// Strictly caches ONLY static application shell assets.
// NEVER caches authentication, attendance APIs, private student data, or Socket.IO traffic.

const CACHE_NAME = 'classmate-shell-v1';

const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

// Install Event: Precache static app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL_ASSETS);
    })
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key.startsWith('classmate-')) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// Fetch Event: Intelligent routing
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. NON-GET requests: Bypass cache directly
  if (req.method !== 'GET') {
    return;
  }

  // 2. CRITICAL SECURITY RULE: NEVER cache API endpoints or WebSocket traffic
  // This preserves GPS location requests, private records, authentication, and live radar updates
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('socket.io') ||
    url.protocol.startsWith('ws')
  ) {
    return; // Pass through to network directly
  }

  // 3. SPA Navigation requests: Network-first, fallback to cached shell /index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 4. Static assets (JS, CSS, Images, Fonts): Cache-first with network fallback
  if (
    url.pathname.startsWith('/assets') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(req).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });
          return response;
        });
      })
    );
  }
});
