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
        // Explicitly include all assets from the 'public' directory (which are copied to 'dist/assets')
        // alongside the standard JS, CSS, and HTML files. This ensures all images
        // are included in the precache manifest, making them available offline immediately after installation.
        globPatterns: ['**/*.{js,css,html}', 'assets/**/*.{svg,png,jpeg,webp,json}'],
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