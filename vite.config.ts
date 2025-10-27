import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      devOptions: {
        enabled: true,
      },
      // Switch to an explicit strategy for more control and reliability
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'service-worker.js',
      
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
      injectManifest: {
        // Define what files to precache. The custom service worker will use this manifest.
        globPatterns: ['**/*.{js,ts,tsx,css,html,ico,png,svg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
      },
    }),
  ],
});