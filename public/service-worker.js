const CACHE_NAME = 'place-value-playbox-v3';
const URLS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap'
];

// Install the service worker and precache essential app assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and precaching initial assets');
        return cache.addAll(URLS_TO_PRECACHE);
      })
  );
});

// Serve assets from the cache first, fall back to network, and cache new assets.
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response from the cache
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network, then cache the response
        return fetch(event.request).then(
          networkResponse => {
            
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the new resource for next time
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Service Worker failed to fetch resource:', event.request.url, error);
            // This error will be triggered on subsequent offline visits
            // for resources that were not cached during the first online visit.
            // You can optionally return a fallback response here.
            throw error;
        });
      })
  );
});


// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});