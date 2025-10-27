import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      // Use the 'injectManifest' strategy for full control over the service worker.
      // FIX: Changed 'strategies' to 'strategy' and moved injectManifest options to the top level.
      strategy: 'injectManifest',
      srcDir: '.', // The root directory where service-worker.js is located.
      filename: 'service-worker.js',
      
      // Assets to be included in the service worker's precache manifest.
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
            src: 'assets/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      // Specifies which files in the build output directory should be precached.
      // This pattern targets all essential built assets for offline functionality.
      globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,webp}'],
      // Set a reasonable file size limit for precaching.
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
    }),
  ],
});