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
        // This glob pattern ensures that all essential app assets, including all image
        // types used across the application (.svg, .png, .jpeg, .webp), are precached.
        // This resolves the issue where images were not available offline after installation.
        globPatterns: ['**/*.{js,css,html,svg,png,jpeg,webp}'],
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