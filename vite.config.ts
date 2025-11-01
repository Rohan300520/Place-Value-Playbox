import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The 'generateSW' strategy automatically handles service worker registration.
      // The conflicting 'injectRegister' option has been removed to fix offline loading.
      workbox: {
        // This glob pattern is crucial. It tells Workbox to find and precache
        // ALL specified file types from the build output directory, guaranteeing
        // that all images are available offline upon installation.
        globPatterns: ['**/*.{js,css,html,webmanifest,svg,png,jpg,jpeg,webp}'],
        
        // This option tells Workbox to ignore the revisioning query parameter
        // when comparing URLs for caching. This resolves the "conflicting entries"
        // error caused by the same asset (icon.svg) being included by both the
        // manifest.icons option and the globPatterns.
        ignoreURLParametersMatching: [/__WB_REVISION__/],
        globIgnores: ['**/icon.svg'],
        
        // Runtime caching rules for external assets not included in the precache.
        // This logic was moved from the old service-worker.js file.
        runtimeCaching: [
          {
            // Cache external JS libraries and CSS from CDNs.
            urlPattern: ({url}) => [
              'aistudiocdn.com',
              'cdn.jsdelivr.net',
              'unpkg.com',
              'cdn.tailwindcss.com',
              'fonts.googleapis.com'
            ].includes(url.hostname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Google Fonts files with a cache-first strategy for performance.
            urlPattern: ({url}) => url.hostname === 'fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // This is the definitive fix for the 'ERR_CONNECTION_REFUSED' error.
        // It tells the service worker to serve 'index.html' for any navigation request
        // that doesn't match a precached asset, allowing the SPA to load offline.
        navigateFallback: 'index.html',
        // This denylist prevents the fallback from applying to direct file requests (e.g., /image.png),
        // ensuring that missing assets correctly show a 404 error instead of the app's HTML.
        navigateFallbackDenylist: [/\.[^\/]+$/],
      },
      manifest: {
        name: 'Place Value Playbox',
        short_name: 'Playbox',
        description: 'An interactive educational tool for learning place value.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'assets/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});