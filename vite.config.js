// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // ✅ Fixes relative paths for static deployment
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'National Parks Explorer',
        short_name: 'NPE',
        description:
          'A responsive React + Firebase app to explore U.S. national parks, featuring seasonal tips, events, maps, and favorites.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#004225',
        form_factor: 'wide',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/screen1.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow' // ✅ Fixes mobile install UI warning
          },
          {
            src: 'screenshots/screen2.png',
            sizes: '1080x1920',
            type: 'image/png'
            // ✅ No form_factor set = default/fallback
          }
        ]
      }
    })
  ],
  define: {
    global: {} // ✅ Fix for draft-js & fbjs compatibility
  }
});
