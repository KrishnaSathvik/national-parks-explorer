import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',

            // ✅ Let Vite PWA generate the manifest automatically
            // Remove manifestFilename - let it use default behavior

            includeAssets: ['favicon.ico', 'robots.txt'],

            manifest: {
                name: 'National Parks Explorer USA',
                short_name: 'Parks Explorer',
                description: 'Plan your perfect national parks adventure',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#004225',
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

            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.nps\.gov\/.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'nps-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 24 * 60 * 60, // 24 hours
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
                                maxAgeSeconds: 5 * 60, // 5 minutes
                            },
                        },
                    },
                ],
            }
        })
    ],

    build: {
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
        }
    },

    envPrefix: 'VITE_'
});