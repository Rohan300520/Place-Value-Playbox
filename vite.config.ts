import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline', // Use a more robust registration strategy
      devOptions: {
        enabled: true,
      },
      // Explicitly include assets from the public folder in the precache manifest.
      includeAssets: ['assets/place-value-box-model.png', 'assets/*.svg', 'assets/*.jpeg', 'assets/*.webp', '404.html'],
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
            src: 'assets/icon.svg', // Corrected path to the icon
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true, // Immediately activate new service worker
        clientsClaim: true, // Take control of the page immediately
        navigateFallback: '/index.html', // Serve the app shell for offline navigation
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // Cache larger files
        // Precache all assets in the build output, including source files for the no-build setup
        globPatterns: ['**/*.{js,ts,tsx,css,html,ico,png,svg,jpeg,webp}'],
        runtimeCaching: [
          {
            // This rule is crucial for dev mode PWA to work offline.
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'local-dev-assets',
              expiration: {
                maxEntries: 200,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache CDN assets with a more robust strategy
            urlPattern: /^https:\/\/(aistudiocdn\.com|cdn\.jsdelivr\.net|unpkg\.com|cdn\.tailwindcss\.com)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts stylesheets with StaleWhileRevalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Google Fonts font files with CacheFirst
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ]
      },
    }),
  ],
});