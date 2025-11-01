import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      // Switched to 'generateSW' strategy by providing a 'workbox' config.
      // This is simpler and more robust for standard PWA caching.
      workbox: {
        // This glob pattern ensures ALL assets from the build output are precached,
        // which is the definitive fix for the missing images.
        globPatterns: ['**/*.{js,css,html,webmanifest,svg,png,jpg,jpeg,webp}'],
        
        // The maximum file size to precache.
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024, // 25 MB

        // These rules handle caching for external resources like fonts and CDNs.
        runtimeCaching: [
          // Rule for Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Rule for Google Fonts font files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                maxEntries: 30,
              },
            },
          },
          // Rule for other external CDN assets
          {
            urlPattern: ({url}) => [
              'aistudiocdn.com',
              'cdn.jsdelivr.net',
              'unpkg.com',
              'cdn.tailwindcss.com',
            ].includes(url.hostname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            }
          },
          // Fallback rule for images (serves as a safety net)
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-fallback-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
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