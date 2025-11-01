import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/*.svg', 'assets/*.jpeg', 'assets/*.png', 'assets/*.webp'],
      workbox: {
        // This is the key fix. It tells Workbox to ignore the revision parameter
        // when matching precached assets. The app requests '/assets/image.png', but
        // Workbox caches '/assets/image.png?__WB_REVISION__=...'. This option
        // allows the service worker to correctly match the request and serve the cached file.
        ignoreURLParametersMatching: [/^__WB_REVISION__$/],
        
        runtimeCaching: [
          {
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
        navigateFallback: 'index.html',
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