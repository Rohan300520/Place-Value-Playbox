// This service worker has been redesigned for robustness and clarity.

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
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
// All local application assets (JS, CSS, HTML, and importantly, all images in the /assets folder)
// are precached upon installation. This is the primary strategy for ensuring offline availability.
// The manifest of files to cache is injected by VitePWA.
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Navigation Fallback (for SPAs):
// Any navigation request that doesn't match a precached asset will fall back to the main 'index.html' file.
// This allows the React Router to handle all application routes.
const spaFallback = new NavigationRoute(
    ({ event }) => {
        const { precacheController } = self.__WB_CONTROLLERS;
        // Use 'index.html' without a leading slash to match the typical precache manifest entry.
        const precachedUrl = precacheController.getCacheKeyForURL('index.html');
        return precacheController.matchPrecache(precachedUrl);
    },
    {
        // Do not redirect for URLs that look like file paths.
        // This prevents the SW from serving index.html for a missing image, for example.
        denylist: [/\.[^\/]+$/],
    }
);
registerRoute(spaFallback);


// 3. Runtime Caching:
// These rules handle requests for resources that are not part of the initial precache.

// External assets (CDNs for JS/CSS, Google Fonts CSS)
// Strategy: Stale-While-Revalidate. Serve from cache for speed, update in background.
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
// Strategy: Cache-First. Fonts are static and rarely change.
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

// Image Fallback Caching
// This is a safety net for any images NOT included in the precache (e.g., from a different path or external source).
// Precaching is the primary method for this app's local images.
// Strategy: Cache-First. Images are static assets. Once cached, they are served from cache.
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