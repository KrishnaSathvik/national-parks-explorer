// src/enhanced-sw.js - Enhanced Service Worker with Firebase Integration
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// App info
const APP_VERSION = '__APP_VERSION__';
const BUILD_TIME = '__BUILD_TIME__';
const CACHE_PREFIX = 'trip-planner';

console.log(`🚀 Enhanced Service Worker v${APP_VERSION} starting...`);

// Precache and route
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Skip waiting and claim clients immediately
self.skipWaiting();
self.clients.claim();

// ================================================================
// FIREBASE INTEGRATION
// ================================================================

// Import Firebase scripts for messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase (use your existing config)
firebase.initializeApp({
  apiKey: "AIzaSyCm1ikSjG9fpuiR5ubi0aPcm4c7mD6L1zg",
  authDomain: "national-parks-explorer-7bc55.firebaseapp.com",
  projectId: "national-parks-explorer-7bc55",
  storageBucket: "national-parks-explorer-7bc55.firebasestorage.app",
  messagingSenderId: "683155277657",
  appId: "1:683155277657:web:edafbd29d36fb7774fee48",
});

const messaging = firebase.messaging();

// Enhanced background message handling
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

// ================================================================
// ENHANCED CACHING STRATEGIES
// ================================================================

// API calls with background sync and error handling
const apiStrategy = new NetworkFirst({
  cacheName: `${CACHE_PREFIX}-api-v1`,
  networkTimeoutSeconds: 10,
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200]
    }),
    new BackgroundSync('api-sync', {
      maxRetentionTime: 24 * 60 // 24 hours
    })
  ]
});

// Firebase API calls
registerRoute(
  /^https:\/\/.*\.firebaseio\.com\/.*$/,
  apiStrategy
);

registerRoute(
  /^https:\/\/firestore\.googleapis\.com\/.*$/,
  apiStrategy
);

// Your app's API
registerRoute(
  /^https:\/\/national-parks-explorer\.vercel\.app\/api\/.*$/,
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

// ================================================================
// OFFLINE FUNCTIONALITY
// ================================================================

// Create offline page
const OFFLINE_PAGE = '/offline.html';
const FALLBACK_IMAGE = '/icons/offline-image.svg';

// Cache offline page during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(`${CACHE_PREFIX}-offline-v1`)
      .then((cache) => cache.addAll([OFFLINE_PAGE, FALLBACK_IMAGE]))
  );
});

// Serve offline page for navigation requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await new NetworkFirst({
        cacheName: `${CACHE_PREFIX}-pages-v1`,
        networkTimeoutSeconds: 3
      }).handle({ event });
    } catch (error) {
      return caches.match(OFFLINE_PAGE);
    }
  }
);

// ================================================================
// BACKGROUND SYNC FOR OFFLINE ACTIONS
// ================================================================

// Background sync for trip data
const tripSyncQueue = new BackgroundSync('trip-sync', {
  maxRetentionTime: 24 * 60 // 24 hours
});

// Register background sync routes
registerRoute(
  /\/api\/trips/,
  async ({ event }) => {
    if (event.request.method === 'POST' || event.request.method === 'PUT') {
      try {
        return await fetch(event.request.clone());
      } catch (error) {
        // Add to background sync queue
        await tripSyncQueue.replayRequests();
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
  
  // Send error to analytics (if implemented)
  const errorData = {
    type: 'service-worker-error',
    message: event.error?.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString(),
    version: APP_VERSION
  };
  
  // Store error for later reporting
  storeErrorForReporting(errorData);
});

// Unhandled promise rejection
self.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Service Worker Unhandled Promise Rejection:', event.reason);
  
  const errorData = {
    type: 'service-worker-promise-rejection',
    reason: event.reason?.toString(),
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
  } catch (error) {
    console.error('Failed to store error for reporting:', error);
  }
}

// ================================================================
// NOTIFICATION HANDLING
// ================================================================

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'dismiss') {
    return;
  }
  
  // Determine URL to open
  let urlToOpen = '/';
  
  if (action === 'view' && data.url) {
    urlToOpen = data.url;
  } else if (data.tripId) {
    urlToOpen = `/trips/${data.tripId}`;
  } else if (data.type === 'analytics') {
    urlToOpen = '/analytics';
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ================================================================
// APP UPDATE HANDLING
// ================================================================

// Message handling for app updates
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION_INFO',
        version: APP_VERSION,
        buildTime: BUILD_TIME
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAppCache()
        .then(() => event.ports[0].postMessage({ type: 'CACHE_CLEARED' }))
        .catch((error) => event.ports[0].postMessage({ type: 'CACHE_CLEAR_ERROR', error: error.message }));
      break;
      
    case 'SYNC_OFFLINE_DATA':
      syncOfflineData()
        .then(() => event.ports[0].postMessage({ type: 'SYNC_COMPLETE' }))
        .catch((error) => event.ports[0].postMessage({ type: 'SYNC_ERROR', error: error.message }));
      break;
  }
});

// Clear app cache
async function clearAppCache() {
  const cacheNames = await caches.keys();
  const appCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));
  
  return Promise.all(
    appCaches.map(cacheName => caches.delete(cacheName))
  );
}

// Sync offline data
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB or cache
    const offlineCache = await caches.open(`${CACHE_PREFIX}-offline-data-v1`);
    const requests = await offlineCache.keys();
    
    for (const request of requests) {
      try {
        const response = await offlineCache.match(request);
        const data = await response.json();
        
        // Replay the request
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        });
        
        // Remove from offline cache after successful sync
        await offlineCache.delete(request);
        
      } catch (error) {
        console.error('Failed to sync offline request:', error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline data:', error);
    throw error;
  }
}

// ================================================================
// PERIODIC SYNC (if supported)
// ================================================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'trip-data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

console.log(`✅ Enhanced Service Worker v${APP_VERSION} initialized successfully`);