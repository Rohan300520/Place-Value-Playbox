import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      // We are using the 'injectManifest' strategy, which gives us full control
      // over the service worker logic via the 'service-worker.js' file.
      injectManifest: {
        // This points to our custom service worker file in the project root.
        swSrc: 'service-worker.js',
        // This glob pattern is crucial. It ensures ALL assets from the build output
        // are included in the precache manifest, including index.html, JS, CSS, and all images.
        // This fixes both the missing images and the offline connection error.
        globPatterns: ['**/*.{js,css,html,webmanifest,svg,png,jpg,jpeg,webp}'],
        // A generous limit to ensure larger assets like images are cached.
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
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