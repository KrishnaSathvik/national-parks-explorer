import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],

        // ✅ FIX: Use injectManifest strategy for custom service worker
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'enhanced-sw.js',

        // ✅ FIX: Generate manifest.webmanifest instead of manifest.json
      manifestFilename: 'manifest.webmanifest',

        // ✅ FIX: Disable workbox when using injectManifest
        // When using injectManifest, workbox config is ignored as we handle it in our SW

        // Enhanced manifest
      manifest: {
        id: '/',
        name: 'National Parks Trip Planner',
        short_name: 'Trip Planner',
        description: 'Plan your perfect national parks adventure with AI-powered route optimization and analytics',
        start_url: '/',
          scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
          theme_color: '#ec4899',
        orientation: 'portrait-primary',
        categories: ['travel', 'lifestyle', 'productivity'],

          // ✅ FIX: Enhanced icons with proper purpose attributes
        icons: [
          {
              src: '/icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png',
              purpose: 'any'
          },
            {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'any'
            },
            {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
              src: '/icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png',
              purpose: 'any'
          },
            {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],

          // ✅ FIX: Optional screenshots (only include if files exist)
        screenshots: [
          {
              src: '/screenshots/mobile-home.png',
              sizes: '375x812',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Mobile home screen with parks grid'
          },
            {
                src: '/screenshots/mobile-details.png',
                sizes: '375x812',
            type: 'image/png',
            form_factor: 'narrow',
                label: 'Park details and trip planning'
          },
          {
              src: '/screenshots/desktop-dashboard.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
              label: 'Desktop trip planning dashboard'
          }
        ],

          // ✅ FIX: Enhanced shortcuts with existing routes
        shortcuts: [
          {
              name: 'Trip Planner',
              short_name: 'Plan Trip',
            description: 'Start planning a new trip',
              url: '/trip-planner',
              icons: [{
                  src: '/icons/icon-192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
              }]
          },
            {
                name: 'Favorites',
                short_name: 'Favorites',
                description: 'View your favorite parks',
                url: '/favorites',
                icons: [{
                    src: '/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                }]
            },
            {
                name: 'Map View',
                short_name: 'Map',
                description: 'Explore parks on the map',
                url: '/map',
                icons: [{
                    src: '/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                }]
          },
          {
              name: 'Calendar',
              short_name: 'Calendar',
              description: 'View park events and seasons',
              url: '/calendar',
              icons: [{
                  src: '/icons/icon-192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
              }]
          }
        ],

          // ✅ FIX: Add file handlers for PWA
          file_handlers: [
              {
                  action: "/",
                  accept: {
                      "application/json": [".json"],
                      "text/plain": [".txt", ".md"]
                  }
              }
          ],

          // ✅ FIX: Add protocol handlers
          protocol_handlers: [
              {
                  protocol: "web+nationalparks",
                  url: "/?handler=%s"
              }
          ],

          // ✅ FIX: Add share target for better integration
          share_target: {
              action: "/",
              method: "GET",
              params: {
                  title: "title",
                  text: "text",
                  url: "url"
              }
          }
      },

        // ✅ FIX: Enhanced development options
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
          type: 'module',
          navigateFallback: 'index.html'
      },

        // ✅ FIX: Better workbox integration for injectManifest
        injectManifest: {
            globPatterns: [
                '**/*.{js,css,html,ico,png,svg,json,woff2}',
                'icons/*.png',
                'screenshots/*.png'
            ],
            globIgnores: [
                '**/node_modules/**/*',
                '**/dist/**/*',
                '**/.git/**/*',
                '**/coverage/**/*',
                '**/.nyc_output/**/*',
                '**/*.map',
                '**/firebase-messaging-sw.js' // Exclude to avoid conflicts
            ],
            // ✅ FIX: Increase maximum file size for large assets
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

            // ✅ FIX: Define what gets injected into the manifest
            manifestTransforms: [
                (manifestEntries) => {
                    // Filter out any entries that shouldn't be precached
                    const manifest = manifestEntries.filter((entry) => {
                        // Exclude large images from precaching
                        if (entry.url.includes('/screenshots/') && entry.size > 1024 * 1024) {
                            return false;
                        }
                        return true;
                    });

                    return {manifest};
                }
            ]
      }
    })
  ],

    // ✅ FIX: Enhanced define options with better error handling
  define: {
      global: 'globalThis',
      // Environment variables for service worker
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),

      // ✅ FIX: Firebase environment variables
      __FIREBASE_CONFIG__: JSON.stringify({
          apiKey: process.env.VITE_FIREBASE_API_KEY,
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.VITE_FIREBASE_APP_ID,
          measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
      })
  },

    // ✅ FIX: Enhanced build options with optimizations
  build: {
      sourcemap: true,
      target: 'es2015', // Better browser compatibility

      // ✅ FIX: Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
            // Core React chunks
            vendor: ['react', 'react-dom', 'react-router-dom'],

            // Firebase services
            firebase: [
                'firebase/app',
                'firebase/auth',
                'firebase/firestore',
                'firebase/messaging',
                'firebase/analytics',
                'firebase/performance'
            ],

            // UI libraries
            ui: ['recharts', 'framer-motion'],

            // Utilities
            utils: ['lodash', 'fuse.js', 'date-fns']
        },

          // ✅ FIX: Optimize chunk naming
          chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId
                  ? chunkInfo.facadeModuleId.split('/').pop().replace('.js', '')
                  : 'chunk';
              return `assets/${facadeModuleId}-[hash].js`;
          },

          // ✅ FIX: Optimize asset naming
          assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];

              if (/\.(css)$/.test(assetInfo.name)) {
                  return `assets/css/[name]-[hash].${ext}`;
              }

              if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                  return `assets/images/[name]-[hash].${ext}`;
              }

              if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                  return `assets/fonts/[name]-[hash].${ext}`;
              }

              return `assets/[name]-[hash].${ext}`;
          }
      }
    },

      // ✅ FIX: Optimize build performance
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // Inline small assets

      // ✅ FIX: Minify options
      minify: 'terser',
      terserOptions: {
          compress: {
              drop_console: process.env.NODE_ENV === 'production',
              drop_debugger: process.env.NODE_ENV === 'production'
          }
      }
  },

    // ✅ FIX: Enhanced server options for development
    server: {
        port: 3000,
        host: true,
        open: false,
        cors: true,

        // ✅ FIX: Proxy configuration for API calls during development
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false
            }
        }
    },

    // ✅ FIX: Preview server configuration
    preview: {
        port: 4173,
        host: true,
        open: false
    },

    // ✅ FIX: Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/messaging'
        ],
        exclude: [
            'firebase/analytics',
            'firebase/performance'
        ]
    },

    // ✅ FIX: Enhanced CSS processing
    css: {
        devSourcemap: true,
        postcss: {
            plugins: [
                // Add autoprefixer for better browser compatibility
                // require('autoprefixer'),
            ]
        }
    },

    // ✅ FIX: Environment configuration
    envPrefix: 'VITE_',

    // ✅ FIX: Better error handling in development
    esbuild: {
        logOverride: {
            'this-is-undefined-in-esm': 'silent'
        }
  }
});