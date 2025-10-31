import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      
      srcDir: '.', // The root directory where service-worker.js is located.
      filename: 'service-worker.js',
      
      // Explicitly include public/ assets in precache (e.g., assets/icon.svg and any images in public/assets/).
      // Globs are relative to public/. This ensures they're added to __WB_MANIFEST even if not imported.
      includeAssets: ['**/*.{ico,png,jpg,jpeg,jpg,svg,gif,webp,avif}'], // Add common image formats; adjust paths if images are nested (e.g., 'assets/**/*.{png,jpg}').
      
      injectManifest: {
        // Expand to catch more static formats (added 'jpg', 'gif', 'avif' for completeness).
        // Use "**/*" to precache *everything* in dist/ for fully offline (but exclude large videos/audio via !patterns if needed).
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,jpeg,gif,webp,avif}'],
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024, // 40 MB
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