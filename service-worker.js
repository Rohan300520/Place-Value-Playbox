// This is an explicit service worker implementation using Workbox.
// It gives us full control over caching strategies for better offline reliability.

// FIX: Replaced bare module specifiers with full CDN URLs from the import map.
// Service workers run in a separate context and cannot read the <script type="importmap">
// in index.html. Providing the full URL allows the service worker to load its
// dependencies and execute correctly.
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'https://aistudiocdn.com/workbox-precaching@^7.3.0';
import { registerRoute, NavigationRoute } from 'https://aistudiocdn.com/workbox-routing@^7.3.0';
import { StaleWhileRevalidate, CacheFirst } from 'https://aistudiocdn.com/workbox-strategies@^7.3.0';
import { ExpirationPlugin } from 'https://aistudiocdn.com/workbox-expiration@^7.3.0';
import { CacheableResponsePlugin } from 'https://aistudiocdn.com/workbox-cacheable-response@^7.3.0';


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

// Cache images with a Cache First strategy to ensure they are available offline.
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // Also cache opaque responses for cross-origin images
      }),
    ],
  })
);