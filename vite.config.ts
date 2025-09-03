import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        "short_name": "Playbox",
        "name": "Place Value Playbox",
        "description": "An interactive and animated application for young children to learn about place value (Ones, Tens, Hundreds) through a fun drag-and-drop experience.",
        "icons": [
          {
            "src": "/assets/icon.svg",
            "type": "image/svg+xml",
            "sizes": "192x192 512x512",
            "purpose": "any maskable"
          }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#38bdf8",
        "background_color": "#e0f2fe"
      }
    })
  ],
})
