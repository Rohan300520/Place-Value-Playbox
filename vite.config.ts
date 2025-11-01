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
      srcDir: '.', // The root directory where service-worker.js is located.
      filename: 'service-worker.js',
      
      injectManifest: {
        // Redesigned globPatterns for maximum asset inclusion.
        // This is the core fix. The previous pattern may have missed some image files.
        // 'assets/**/*' specifically targets all files in the assets directory,
        // which is where all local images for the app are stored.
        // Also explicitly including the manifest file.
        globPatterns: ['**/*.{js,css,html,webmanifest}', 'assets/**/*'],
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