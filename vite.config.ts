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
      },
    }),
  ],
});
