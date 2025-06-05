// src/enhanced-sw.js - Enhanced Service Worker with Firebase Integration
import {cleanupOutdatedCaches, precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {CacheFirst, NetworkFirst, StaleWhileRevalidate} from 'workbox-strategies';
import {Queue as BackgroundSync} from 'workbox-background-sync';
import {ExpirationPlugin} from 'workbox-expiration';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';

// App info
const APP_VERSION = '__APP_VERSION__';
const BUILD_TIME = '__BUILD_TIME__';
const CACHE_PREFIX = 'trip-planner';

console.log(`🚀 Enhanced Service Worker v${APP_VERSION} starting...`);

// Precache and route
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ✅ FIX: Enhanced skip waiting and client claiming with proper checks
const skipWaitingAndClaim = async () => {
    try {
        // Only skip waiting if we're the installing service worker
        if (self.registration && self.registration.installing === self) {
            console.log('⏩ Skipping waiting...');
            await self.skipWaiting();
        }

        // Only claim clients if we're the active service worker
        if (self.registration && self.registration.active === self) {
            console.log('📋 Claiming clients...');
            await self.clients.claim();
        }
    } catch (error) {
        console.error('❌ Error in skip waiting and claim:', error);
    }
};

// Enhanced install event
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(skipWaitingAndClaim());
});

// Enhanced activate event
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(skipWaitingAndClaim());
});

// ================================================================
// FIREBASE INTEGRATION
// ================================================================

// Import Firebase scripts for messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase (use your existing config)
let messaging = null;

try {
    firebase.initializeApp({
        apiKey: "AIzaSyCm1ikSjG9fpuiR5ubi0aPcm4c7mD6L1zg",
        authDomain: "national-parks-explorer-7bc55.firebaseapp.com",
        projectId: "national-parks-explorer-7bc55",
        storageBucket: "national-parks-explorer-7bc55.firebasestorage.app",
        messagingSenderId: "683155277657",
        appId: "1:683155277657:web:edafbd29d36fb7774fee48",
    });

    messaging = firebase.messaging();
    console.log('✅ Firebase initialized in service worker');
} catch (error) {
    console.error('❌ Firebase initialization failed in service worker:', error);
}

// Enhanced background message handling
if (messaging) {
    messaging.onBackgroundMessage((payload) => {
        console.log('📱 Background message received:', payload);

        const notificationTitle = payload.notification?.title || 'Trip Planner';
        const notificationOptions = {
            body: payload.notification?.body || 'You have a new notification',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: payload.data?.tag || 'general',
            data: payload.data || {},
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/icons/icon-72x72.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ],
            requireInteraction: payload.data?.requireInteraction === 'true'
        };

        return self.registration.showNotification(notificationTitle, notificationOptions);
    });
}

// ================================================================
// ENHANCED CACHING STRATEGIES
// ================================================================

// ✅ FIX: Enhanced API strategy with better error handling
const createApiStrategy = () => {
    return new NetworkFirst({
        cacheName: `${CACHE_PREFIX}-api-v1`,
        networkTimeoutSeconds: 10,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
                purgeOnQuotaError: true
            })
        ]
    });
};

const apiStrategy = createApiStrategy();

// Firebase API calls
registerRoute(
  /^https:\/\/.*\.firebaseio\.com\/.*$/,
  apiStrategy
);

registerRoute(
  /^https:\/\/firestore\.googleapis\.com\/.*$/,
  apiStrategy
);

registerRoute(
    /^https:\/\/firebase\.googleapis\.com\/.*$/,
    apiStrategy
);

// Your app's API
registerRoute(
    /^https:\/\/national-parks-explorer.*\.vercel\.app\/api\/.*$/,
    apiStrategy
);

registerRoute(
    /^https:\/\/national-parks-explor-git-.*\.vercel\.app\/api\/.*$/,
  apiStrategy
);

// Static assets with long-term caching
registerRoute(
  /\.(?:js|css)$/,
  new StaleWhileRevalidate({
    cacheName: `${CACHE_PREFIX}-static-v1`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
        new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
            purgeOnQuotaError: true
      })
    ]
  })
);

// Images with cache-first strategy
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-images-v1`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      })
    ]
  })
);

// Fonts caching
registerRoute(
    /^https:\/\/fonts\.googleapis\.com\/.*/i,
    new StaleWhileRevalidate({
        cacheName: `${CACHE_PREFIX}-google-fonts-stylesheets`,
    }),
);

registerRoute(
    /^https:\/\/fonts\.gstatic\.com\/.*/i,
    new CacheFirst({
        cacheName: `${CACHE_PREFIX}-google-fonts-webfonts`,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            }),
        ],
    }),
);

// ================================================================
// OFFLINE FUNCTIONALITY
// ================================================================

// Create offline page
const OFFLINE_PAGE = '/offline.html';
const FALLBACK_IMAGE = '/icons/offline-image.svg';

// ✅ FIX: Enhanced cache installation with error handling
const cacheOfflineAssets = async () => {
    try {
        const cache = await caches.open(`${CACHE_PREFIX}-offline-v1`);

        // Check if files exist before adding to cache
        const filesToCache = [];

        // Try to cache offline page
        try {
            const offlineResponse = await fetch(OFFLINE_PAGE, {cache: 'no-cache'});
            if (offlineResponse.ok) {
                filesToCache.push(OFFLINE_PAGE);
            }
        } catch (error) {
            console.warn('⚠️ Offline page not found, creating fallback');
        }

        // Try to cache fallback image
        try {
            const imageResponse = await fetch(FALLBACK_IMAGE, {cache: 'no-cache'});
            if (imageResponse.ok) {
                filesToCache.push(FALLBACK_IMAGE);
            }
        } catch (error) {
            console.warn('⚠️ Fallback image not found, skipping');
        }

        // Cache files that exist
        if (filesToCache.length > 0) {
            await cache.addAll(filesToCache);
            console.log('✅ Offline files cached:', filesToCache);
        } else {
            console.log('⚠️ No offline assets found to cache');
        }

    } catch (error) {
        console.error('❌ Failed to cache offline files:', error);
    }
};

// Enhanced install event with offline caching
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');

    event.waitUntil(
        Promise.all([
            skipWaitingAndClaim(),
            cacheOfflineAssets()
        ])
  );
});

// Serve offline page for navigation requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
        const response = await new NetworkFirst({
        cacheName: `${CACHE_PREFIX}-pages-v1`,
            networkTimeoutSeconds: 3,
            plugins: [
                new CacheableResponsePlugin({
                    statuses: [0, 200]
                })
            ]
      }).handle({ event });

        return response;
    } catch (error) {
        console.log('📴 Network failed, serving offline page');

        // Try to get cached offline page
        const cachedOffline = await caches.match(OFFLINE_PAGE);
        if (cachedOffline) {
            return cachedOffline;
        }

        // Fallback offline response
        return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Offline - Trip Planner</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .offline { 
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            button {
              background: #4CAF50;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            button:hover { background: #45a049; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>🏞️ Trip Planner</h1>
            <h2>You're offline</h2>
            <p>Please check your internet connection and try again.</p>
            <p>Some features may still be available from cache.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
        </html>
      `, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            }
        });
    }
  }
);

// ================================================================
// BACKGROUND SYNC FOR OFFLINE ACTIONS
// ================================================================

// Background sync for trip data
let tripSyncQueue;
try {
    tripSyncQueue = new BackgroundSync('trip-sync', {
        maxRetentionTime: 24 * 60 // 24 hours
    });
} catch (error) {
    console.warn('⚠️ Background sync not supported:', error);
}

// Register background sync routes
registerRoute(
    ({url}) => url.pathname.includes('/api/trips'),
    async ({event, request}) => {
        if (request.method === 'POST' || request.method === 'PUT') {
      try {
          return await fetch(request.clone());
      } catch (error) {
          console.log('📤 Adding request to background sync queue');

          if (tripSyncQueue) {
              // Store request for background sync
              const cache = await caches.open(`${CACHE_PREFIX}-offline-requests`);
              await cache.put(
                  `${request.url}-${Date.now()}`,
                  new Response(JSON.stringify({
                      url: request.url,
                      method: request.method,
                      headers: Object.fromEntries(request.headers.entries()),
                      body: await request.text()
                  }))
              );

              await tripSyncQueue.replayRequests();
          }

          throw error;
      }
    }
    return apiStrategy.handle({ event });
  },
  'POST'
);

// ================================================================
// ERROR HANDLING AND MONITORING
// ================================================================

// Global error handler
self.addEventListener('error', (event) => {
  console.error('🔥 Service Worker Error:', event.error);
  
  const errorData = {
    type: 'service-worker-error',
      message: event.error?.message || 'Unknown error',
      filename: event.filename || 'unknown',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
    timestamp: new Date().toISOString(),
      version: APP_VERSION,
      userAgent: self.navigator?.userAgent || 'unknown'
  };
  
  storeErrorForReporting(errorData);
});

// ✅ FIX: Enhanced unhandled promise rejection handler
self.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;

    // Handle specific error types gracefully
    if (reason?.message?.includes('Only the active worker can claim clients')) {
        console.warn('⚠️ Client claim limitation - this is expected behavior');
        event.preventDefault();
        return;
    }

    if (reason?.message?.includes('Failed to execute \'addAll\' on \'Cache\'')) {
        console.warn('⚠️ Cache operation failed - likely network issue');
        event.preventDefault();
        return;
    }

    if (reason?.message?.includes('NetworkError') || reason?.name === 'TypeError') {
        console.warn('⚠️ Network error in service worker - continuing...');
        event.preventDefault();
        return;
    }

    console.error('🔥 Service Worker Unhandled Promise Rejection:', reason);
  
  const errorData = {
    type: 'service-worker-promise-rejection',
      reason: reason?.toString() || 'Unknown rejection',
      message: reason?.message || 'No message',
      stack: reason?.stack || 'No stack trace',
    timestamp: new Date().toISOString(),
    version: APP_VERSION
  };
  
  storeErrorForReporting(errorData);
});

// Store errors for reporting when online
async function storeErrorForReporting(errorData) {
  try {
    const cache = await caches.open(`${CACHE_PREFIX}-errors-v1`);
    const errorKey = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await cache.put(
      new Request(errorKey),
      new Response(JSON.stringify(errorData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );

      console.log('📊 Error stored for reporting:', errorKey);
  } catch (error) {
    console.error('Failed to store error for reporting:', error);
  }
}

// ================================================================
// NOTIFICATION HANDLING
// ================================================================

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.notification.tag);
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'dismiss') {
      console.log('🚫 Notification dismissed');
    return;
  }
  
  // Determine URL to open
  let urlToOpen = '/';
  
  if (action === 'view' && data.url) {
    urlToOpen = data.url;
  } else if (data.tripId) {
    urlToOpen = `/trips/${data.tripId}`;
  } else if (data.parkId) {
      urlToOpen = `/park/${data.parkId}`;
  } else if (data.type === 'analytics') {
    urlToOpen = '/analytics';
  }
  
  event.waitUntil(
      self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
      }).then((clients) => {
          // Check if app is already open to this URL
          for (const client of clients) {
              if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
                  console.log('📱 Focusing existing window');
                  return client.focus();
              }
          }

          // Check if any app window is open
          for (const client of clients) {
              if (client.url.includes(self.registration.scope) && 'focus' in client) {
                  console.log('🔄 Navigating existing window');
                  client.postMessage({
                      type: 'NAVIGATE',
                      url: urlToOpen
                  });
                  return client.focus();
              }
          }

          // Open new window
          if (self.clients.openWindow) {
              console.log('🆕 Opening new window');
              return self.clients.openWindow(urlToOpen);
          }
      }).catch(error => {
          console.error('❌ Failed to handle notification click:', error);
      })
  );
});

// ================================================================
// APP UPDATE HANDLING
// ================================================================

// Message handling for app updates
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

    console.log('💬 Service Worker received message:', type);

    switch (type) {
    case 'SKIP_WAITING':
        console.log('⏩ Skip waiting requested');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
                type: 'VERSION_INFO',
                version: APP_VERSION,
                buildTime: BUILD_TIME
            });
        }
      break;
      
    case 'CLEAR_CACHE':
      clearAppCache()
          .then(() => {
              console.log('🧹 Cache cleared successfully');
              if (event.ports && event.ports[0]) {
                  event.ports[0].postMessage({type: 'CACHE_CLEARED'});
              }
          })
          .catch((error) => {
              console.error('❌ Cache clear failed:', error);
              if (event.ports && event.ports[0]) {
                  event.ports[0].postMessage({
                      type: 'CACHE_CLEAR_ERROR',
                      error: error.message
                  });
              }
          });
      break;
      
    case 'SYNC_OFFLINE_DATA':
      syncOfflineData()
          .then(() => {
              console.log('🔄 Offline data synced');
              if (event.ports && event.ports[0]) {
                  event.ports[0].postMessage({type: 'SYNC_COMPLETE'});
              }
          })
          .catch((error) => {
              console.error('❌ Offline sync failed:', error);
              if (event.ports && event.ports[0]) {
                  event.ports[0].postMessage({
                      type: 'SYNC_ERROR',
                      error: error.message
                  });
              }
          });
      break;

        case 'PING':
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({type: 'PONG', timestamp: Date.now()});
            }
            break;

        default:
            console.log('❓ Unknown message type:', type);
  }
});

// Clear app cache
async function clearAppCache() {
    try {
        const cacheNames = await caches.keys();
        const appCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));

        console.log('🧹 Clearing caches:', appCaches);

        const deletePromises = appCaches.map(cacheName => caches.delete(cacheName));
        await Promise.all(deletePromises);

        console.log('✅ All app caches cleared');
        return true;
    } catch (error) {
        console.error('❌ Failed to clear caches:', error);
        throw error;
    }
}

// Sync offline data
async function syncOfflineData() {
  try {
      console.log('🔄 Starting offline data sync...');

      // Get offline data from cache
      const offlineCache = await caches.open(`${CACHE_PREFIX}-offline-requests`);
    const requests = await offlineCache.keys();

      if (requests.length === 0) {
          console.log('📭 No offline requests to sync');
          return;
      }

      console.log(`📤 Syncing ${requests.length} offline requests`);

      let syncedCount = 0;
      let failedCount = 0;

      for (const request of requests) {
      try {
        const response = await offlineCache.match(request);
        const data = await response.json();
        
        // Replay the request
          const syncResponse = await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        });

          if (syncResponse.ok) {
              // Remove from offline cache after successful sync
              await offlineCache.delete(request);
              syncedCount++;
              console.log('✅ Synced offline request:', data.url);
          } else {
              failedCount++;
              console.warn('⚠️ Sync failed for request:', data.url, syncResponse.status);
          }
        
      } catch (error) {
          failedCount++;
          console.error('❌ Failed to sync offline request:', error);
      }
    }

      console.log(`📊 Sync complete: ${syncedCount} successful, ${failedCount} failed`);

  } catch (error) {
      console.error('❌ Failed to sync offline data:', error);
    throw error;
  }
}

// ================================================================
// PERIODIC SYNC (if supported)
// ================================================================

if ('periodicsync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        console.log('⏰ Periodic sync triggered:', event.tag);

        if (event.tag === 'trip-data-sync') {
            event.waitUntil(syncOfflineData());
        }
    });
} else {
    console.warn('⚠️ Periodic background sync not supported');
}

// ================================================================
// CLEANUP AND OPTIMIZATION
// ================================================================

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
    console.log('🧹 Service Worker activated, cleaning up...');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete caches that don't match current prefix or are very old
                        if (!cacheName.startsWith(CACHE_PREFIX) ||
                            cacheName.includes('v0') ||
                            cacheName.includes('old')) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Clean up old error logs (keep only recent ones)
            cleanupErrorLogs(),

            // Claim clients
            skipWaitingAndClaim()
        ])
    );
});

// Clean up old error logs
async function cleanupErrorLogs() {
    try {
        const errorCache = await caches.open(`${CACHE_PREFIX}-errors-v1`);
        const errorRequests = await errorCache.keys();

        // Keep only errors from last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        for (const request of errorRequests) {
            const timestamp = request.url.match(/error-(\d+)-/);
            if (timestamp && parseInt(timestamp[1]) < sevenDaysAgo) {
                await errorCache.delete(request);
            }
        }

        console.log('🧹 Error logs cleaned up');
    } catch (error) {
        console.warn('⚠️ Failed to clean error logs:', error);
    }
}

// ================================================================
// PERFORMANCE MONITORING
// ================================================================

// Monitor service worker performance
const performanceMetrics = {
    startTime: Date.now(),
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    errors: 0
};

// Track cache performance
const originalCacheMatch = caches.match;
caches.match = function (...args) {
    return originalCacheMatch.apply(this, args).then(response => {
        if (response) {
            performanceMetrics.cacheHits++;
        } else {
            performanceMetrics.cacheMisses++;
        }
        return response;
    });
};

// Log performance metrics periodically
setInterval(() => {
    const uptime = Date.now() - performanceMetrics.startTime;
    console.log('📊 Service Worker Performance:', {
        uptime: `${Math.floor(uptime / 1000)}s`,
        cacheHitRate: `${Math.round((performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) * 100) || 0}%`,
        ...performanceMetrics
    });
}, 5 * 60 * 1000); // Every 5 minutes

console.log(`✅ Enhanced Service Worker v${APP_VERSION} initialized successfully`);
console.log(`🕐 Build time: ${BUILD_TIME}`);
console.log(`🎯 Scope: ${self.registration?.scope || 'unknown'}`);