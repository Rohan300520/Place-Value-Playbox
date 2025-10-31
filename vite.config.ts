import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      // The 'injectManifest' object automatically sets the strategy. The configuration
      // is now corrected to use the modern 'swSrc' and 'swDest' properties.
      injectManifest: {
        // Explicitly define the source service worker file.
        swSrc: 'service-worker.js',
        // Define the output file name. 'sw.js' is used to avoid a file collision
        // with the empty 'public/service-worker.js' during the build process.
        swDest: 'sw.js',
        // This robust pattern ensures all assets, including images from the public directory,
        // are captured in the precache manifest after the build completes.
        globPatterns: ['**/*.{js,css,html,svg,png,jpeg,webp,jpeg}'],
        // Workbox options must be placed inside the injectManifest object.
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024, // 25 MB
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