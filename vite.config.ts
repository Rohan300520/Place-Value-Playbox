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
      includeAssets: ['assets/place-value-box-model.png', 'assets/*.svg', 'assets/*.jpeg', 'assets/*.webp'],
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
            src: 'assets/logo.svg', // Point to an existing icon
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
        // Precache all assets in the build output
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,webp}'],
        runtimeCaching: [
          {
            // This rule is crucial for dev mode PWA to work offline.
            // It caches requests to the local dev server.
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'local-dev-assets',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache CDN assets
            urlPattern: /^https:\/\/(aistudiocdn\.com|cdn\.jsdelivr\.net|unpkg\.com|cdn\.tailwindcss\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
    }),
  ],
});
