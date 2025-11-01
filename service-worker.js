// This is an explicit service worker implementation using Workbox.
// It gives us full control over caching strategies for better offline reliability.

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Immediately take control of the page when the service worker activates.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Remove old caches.
cleanupOutdatedCaches();

// Precache all the assets injected by the build process.
// The self.__WB_MANIFEST variable is a placeholder that vite-plugin-pwa will replace.
// This is the correct way to cache all local assets, including images, upon installation.
precacheAndRoute(self.__WB_MANIFEST || []);

// Set up App Shell-style routing. All navigation requests are fulfilled with index.html.
// This is crucial for a Single Page Application (SPA).
// FIX: Use 'index.html' instead of '/index.html' to match the precache manifest entry.
const handler = createHandlerBoundToURL('index.html');
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

// --- Runtime Caching Strategies ---

// Cache CDN assets (React, Three.js, etc.) with a Stale-While-Revalidate strategy.
registerRoute(
  ({url}) => /^https:\/\/(aistudiocdn\.com|cdn\.jsdelivr\.net|unpkg\.com|cdn\.tailwindcss\.com)\/.*/i.test(url.href),
  new StaleWhileRevalidate({
    cacheName: 'cdn-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache opaque responses (for CORS requests)
      }),
    ],
  })
);

// Cache Google Fonts stylesheets with Stale-While-Revalidate.
registerRoute(
  ({url}) => url.hostname === 'fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

// Cache Google Fonts font files with CacheFirst for long-term storage.
registerRoute(
  ({url}) => url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Year
      }),
    ],
  })
);

// A runtime caching rule for images is added here as a robust fallback mechanism.
// It uses a CacheFirst strategy, which is ideal for static assets like images.
// This means that once an image is fetched, it will be served from the cache,
// ensuring it's available offline on subsequent visits. This complements the
// precaching strategy by catching any images that might be missed during the
// initial service worker installation.
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60, // Keep up to 60 images in the cache
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache successful responses and opaque responses
      }),
    ],
  })
);