const CACHE_NAME = 'fuzzy-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install Service Worker and cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip caching for hot-reloading (Vite development dev-server files)
  if (
    requestUrl.pathname.includes('@vite') ||
    requestUrl.pathname.includes('hot-update') ||
    event.request.url.startsWith('ws:') ||
    event.request.url.startsWith('wss:')
  ) {
    return;
  }

  // Handle API requests (Network First, don't cache unless necessary)
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline and request is an API request, return a custom offline JSON response
        return new Response(
          JSON.stringify({ error: 'Network disconnected. Please try again when online.', offline: true }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Handle pages and static assets: Cache First, fallback to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache, and fetch in background to update cache (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Ignore network errors in background update
        });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // If valid response, cache it
          if (response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline and it's a page navigation request, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // Return generic offline response or error
          return new Response('Offline mode. Connection lost.', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});
