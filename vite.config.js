import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
    base: './',
    plugins: [
        react(),
        VitePWA({
            strategies: 'generateSW',
            registerType: 'autoUpdate',
            injectRegister: 'auto',

            includeAssets: ['favicon.ico', 'robots.txt'],

            // ✅ FIX: Change to match Vercel config
            manifestFilename: 'manifest.webmanifest',

            workbox: {
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
                    '**/*.map',
                    '**/firebase-messaging-sw.js'
                ],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.nps\.gov\/.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'nps-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 24 * 60 * 60,
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'firestore-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 5 * 60,
                            },
                        },
                    },
                ],
            },

            manifest: {
                name: 'National Parks Trip Planner',
                short_name: 'Trip Planner',
                description: 'Plan your perfect national parks adventure',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#ec4899',
                orientation: 'portrait-primary',

                icons: [
                    {
                        src: '/favicon.ico',
                        sizes: '16x16 32x32',
                        type: 'image/x-icon'
                    },
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],

                screenshots: [
                    {
                        src: '/screenshots/screen1.png',
                        sizes: '375x812',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Mobile app interface'
                    },
                    {
                        src: '/screenshots/screen2.png',
                        sizes: '375x812',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'App features showcase'
                    }
                ],

                shortcuts: [
                    {
                        name: 'Explore Parks',
                        short_name: 'Explore',
                        description: 'Browse national parks',
                        url: '/',
                        icons: [{
                            src: '/icons/icon-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        }]
                    }
                ]
            },

            devOptions: {
                enabled: process.env.NODE_ENV === 'development',
                type: 'module',
                navigateFallback: 'index.html'
            }
        })
    ],

    define: {
        global: 'globalThis',
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
    },

    build: {
        sourcemap: true,
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    firebase: [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                        'firebase/messaging'
                    ]
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: process.env.NODE_ENV === 'production'
            }
        }
    },

    server: {
        port: 3000,
        host: true,
        open: false,
        cors: true
    },

    preview: {
        port: 4173,
        host: true,
        open: false
    },

    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/messaging'
        ]
    },

    css: {
        devSourcemap: true
    },

    envPrefix: 'VITE_',

    esbuild: {
        logOverride: {
            'this-is-undefined-in-esm': 'silent'
        }
    }
});