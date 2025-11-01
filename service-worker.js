// This service worker uses the 'injectManifest' strategy for full control.

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// --- Lifecycle Events ---
// Ensure the new service worker takes control immediately.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// --- Caching Strategy ---

// 1. Precaching:
// All local application assets (JS, CSS, HTML, and images) are precached upon installation.
// The manifest of files to cache is injected by VitePWA into self.__WB_MANIFEST.
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Navigation Fallback (for SPAs):
// This is the crucial part for offline functionality. It ensures that when the user opens the PWA
// without an internet connection, the service worker serves the app's main HTML file, preventing connection errors.
const spaFallback = new NavigationRoute(
    createHandlerBoundToURL('index.html'),
    {
        // This denylist prevents the fallback from applying to URLs that look like file paths
        // (e.g., /image.png), so missing assets don't incorrectly get the index.html content.
        denylist: [/\.[^\/]+$/],
    }
);
registerRoute(spaFallback);


// 3. Runtime Caching:
// These rules handle requests for resources that are not part of the initial precache, like CDNs.

// External assets (CDNs for JS/CSS, Google Fonts CSS)
registerRoute(
  ({url}) => [
    'aistudiocdn.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'cdn.tailwindcss.com',
    'fonts.googleapis.com'
  ].includes(url.hostname),
  new StaleWhileRevalidate({
    cacheName: 'external-assets-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 Days
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Font files (from fonts.gstatic.com)
registerRoute(
  ({url}) => url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }), // 1 Year
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Image Fallback Caching (Safety net for any images NOT in the precache)
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-fallback-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 Days
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);