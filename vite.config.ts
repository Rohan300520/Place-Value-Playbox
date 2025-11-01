import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Explicitly list all file types to be precached. The default
        // globPatterns value does not include all image formats (like .jpeg or .webp),
        // which was causing them to be missed by the service worker. This
        // comprehensive list ensures all assets are cached for offline use.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,webp,gif}'],
        
        // This is still needed to resolve "conflicting entries" build errors,
        // as the plugin includes these assets through other mechanisms (e.g., from the manifest).
        globIgnores: [
          '**/icon.svg',
          '**/manifest.webmanifest',
        ],
        
        // Runtime caching rules for external assets not included in the precache.
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
        // This is crucial for single-page applications (SPAs).
        // It tells the service worker to serve 'index.html' for any navigation request
        // that doesn't match a precached asset, allowing the app to handle routing.
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