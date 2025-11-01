import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The 'includeAssets' option is a more direct and reliable way to ensure
      // static assets are precached. We explicitly list all image formats
      // used in the app. The plugin automatically handles JS/CSS files from the build.
      // This approach avoids potential path resolution issues with `globPatterns` in
      // different build environments like Render.com.
      includeAssets: ['assets/*.svg', 'assets/*.jpeg', 'assets/*.png', 'assets/*.webp'],
      workbox: {
        // By using `includeAssets`, we no longer need `globPatterns` or `globIgnores`.
        // The plugin now has full control over building the precache manifest.
        
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