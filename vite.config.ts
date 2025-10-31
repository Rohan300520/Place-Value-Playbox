import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      // Fix: Removed the explicit 'strategy' property. The presence of the 'injectManifest'
      // object below is sufficient to enable the 'injectManifest' strategy.
      srcDir: '.', // The root directory where service-worker.js is located.
      filename: 'service-worker.js',
      
      injectManifest: {
        // A robust glob pattern to ensure all essential assets are precached for offline use.
        // This includes HTML, JS, CSS, and all common image formats.
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