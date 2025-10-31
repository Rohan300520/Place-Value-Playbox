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
      strategy: 'injectManifest',
      srcDir: '.', // The root directory where service-worker.js is located.
      filename: 'service-worker.js',
      
      injectManifest: {
        // This updated glob pattern is more explicit to ensure all assets, especially
        // those from the 'public/assets' directory, are included in the precache manifest.
        // The first part captures the core app shell files, and the second part
        // captures all assets within the assets directory, resolving the offline issue.
        globPatterns: ['**/*.{js,css,html}', 'assets/**/*.*'],
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
      maximumFileSizeToCacheInBytes: 25 * 1024 * 1024, // 25 MB
    }),
  ],
});
