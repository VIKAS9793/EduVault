/**
 * EduVault Service Worker
 * Implements offline-first caching strategy with security best practices
 * @version 1.0.0
 */

const CACHE_NAME = 'eduvault-cache-v1';
const RUNTIME_CACHE = 'eduvault-runtime-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/lesson_content/lessons.json',
];

// Security: Whitelist allowed origins for fetch
const ALLOWED_ORIGINS = [
  self.location.origin,
  'https://api.ncert.gov.in',
  'https://diksha.gov.in',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('Cache addAll failed:', err);
        // Graceful degradation - don't fail installation
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch event - offline-first strategy with security checks
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  // Security: Only handle allowed origins
  if (!ALLOWED_ORIGINS.includes(requestUrl.origin)) {
    return;
  }

  // Security: Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response for caching
          const responseToCache = response.clone();

          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              console.error('Cache put failed:', err);
            });
          });

          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/index.html');
        });
    })
  );
});

/**
 * Message event - handle cache updates from client
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
