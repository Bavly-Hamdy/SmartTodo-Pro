// Basic service worker for SmartTodo Pro
const CACHE_NAME = 'smarttodo-pro-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache resources that exist
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(() => {
            console.log(`Failed to cache: ${url}`);
          }))
        );
      })
      .catch((error) => {
        console.error('Service worker install failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Firebase and external requests
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic') ||
      event.request.url.includes('localhost:3000/ws')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Try to fetch from network, but don't fail if it doesn't work
        return fetch(event.request).catch(() => {
          // Return a basic response if fetch fails
          if (event.request.destination === 'document') {
            return new Response(
              '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          return new Response('Offline', { status: 503 });
        });
      })
      .catch((error) => {
        console.error('Service worker fetch error:', error);
        // Return a basic offline response
        return new Response('Service Unavailable', { status: 503 });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).catch((error) => {
      console.error('Service worker activate error:', error);
    })
  );
});

// Handle errors globally
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service worker unhandled rejection:', event.reason);
}); 