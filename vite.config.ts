import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      injectManifest: {
        swSrc: 'service-worker.js',
        swDest: 'sw.js',
        // This more explicit pattern ensures assets from the public/assets directory are reliably captured.
        globPatterns: ['**/*.{js,css,html}', 'assets/*.{svg,png,jpeg,webp}'],
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