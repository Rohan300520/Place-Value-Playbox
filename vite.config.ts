import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      // Fix: Replaced the 'strategy' property with the 'injectManifest' object
      // to align with modern vite-plugin-pwa configuration and resolve the TypeScript error.
      injectManifest: {
        swSrc: 'service-worker.js',
      },
      
      // By removing the explicit 'injectManifest.globPatterns', we allow the plugin
      // to use its default behavior, which is to precache all assets in the output directory.
      // This is more reliable for ensuring all images are included.
      
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
