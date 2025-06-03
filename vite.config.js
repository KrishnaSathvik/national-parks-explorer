import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      // Add our enhanced service worker
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'enhanced-sw.js',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          // API calls with error handling
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'firebase-sync',
                options: {
                  maxRetentionTime: 24 * 60 // 24 hours
                }
              }
            }
          },
          // Your existing app API
          {
            urlPattern: /^https:\/\/national-parks-explorer\.vercel\.app\/api\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Static assets with better caching
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          // Google Fonts (your existing config)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          }
        ]
      },
      // Enhanced manifest
      manifest: {
        id: '/',
        name: 'National Parks Trip Planner',
        short_name: 'Trip Planner',
        description: 'Plan your perfect national parks adventure with AI-powered route optimization and analytics',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ec4899', // Updated to match your app theme
        orientation: 'portrait-primary',
        categories: ['travel', 'lifestyle', 'productivity'],
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          // Add more icon sizes for better compatibility
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/screen1.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile trip planning interface'
          },
          {
            src: 'screenshots/screen2.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop analytics dashboard'
          }
        ],
        // Add shortcuts for quick actions
        shortcuts: [
          {
            name: 'New Trip',
            short_name: 'New Trip',
            description: 'Start planning a new trip',
            url: '/trips/new',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Analytics',
            short_name: 'Analytics',
            description: 'View travel insights',
            url: '/analytics',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      // Development options
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        type: 'module'
      }
    })
  ],
  define: {
    global: {},
    // Add environment variables for error handling
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  // Enhanced build options
  build: {
    sourcemap: true, // For better error debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['recharts'],
          utils: ['lodash', 'fuse.js']
        }
      }
    }
  }
});