// firebase-messaging-sw.js - Enhanced with Error Handling and Performance
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ✅ Enhanced Firebase initialization with error handling
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
    console.log('✅ Firebase Messaging initialized in service worker');
} catch (error) {
    console.error('❌ Failed to initialize Firebase in messaging service worker:', error);
}

// ✅ Enhanced background message handling with comprehensive error handling
if (messaging) {
    messaging.onBackgroundMessage((payload) => {
        console.log('📱 Enhanced background message received:', payload);

        try {
            // Extract notification data with fallbacks
            const notification = payload.notification || {};
            const data = payload.data || {};

            const notificationTitle = notification.title || 'Trip Planner Update';
            const notificationOptions = {
                body: notification.body || 'You have a new notification about your trips',
                icon: notification.icon || '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: data.tag || `notification-${Date.now()}`,
                data: {
                    ...data,
                    timestamp: new Date().toISOString(),
                    clickAction: data.clickAction || '/',
                    originalPayload: JSON.stringify(payload) // Store original for debugging
                },
                actions: [],
                requireInteraction: false,
                silent: false,
                vibrate: [200, 100, 200], // Enhanced vibration pattern
                renotify: true // Allow re-notification with same tag
            };

            // Add custom actions based on notification type
            if (data.type === 'trip-reminder') {
                notificationOptions.actions = [
                    {
                        action: 'view-trip',
                        title: '👁️ View Trip',
                        icon: '/icons/icon-72x72.png'
                    },
                    {
                        action: 'dismiss',
                        title: '✖️ Dismiss'
                    }
                ];
                notificationOptions.requireInteraction = true;
                notificationOptions.tag = `trip-reminder-${data.tripId || 'general'}`;

            } else if (data.type === 'weather-alert') {
                notificationOptions.actions = [
                    {
                        action: 'view-weather',
                        title: '🌤️ Check Weather',
                        icon: '/icons/icon-72x72.png'
                    },
                    {
                        action: 'update-trip',
                        title: '📝 Update Trip'
                    },
                    {
                        action: 'dismiss',
                        title: '✖️ Dismiss'
                    }
                ];
                notificationOptions.requireInteraction = true;
                notificationOptions.tag = `weather-alert-${data.locationId || 'general'}`;

            } else if (data.type === 'app-update') {
                notificationOptions.actions = [
                    {
                        action: 'update-app',
                        title: '🔄 Update App',
                        icon: '/icons/icon-72x72.png'
                    },
                    {
                        action: 'later',
                        title: '⏰ Later'
                    }
                ];
                notificationOptions.requireInteraction = true;
                notificationOptions.tag = 'app-update';

            } else if (data.type === 'park-alert') {
                notificationOptions.actions = [
                    {
                        action: 'view-park',
                        title: '🏞️ View Park',
                        icon: '/icons/icon-72x72.png'
                    },
                    {
                        action: 'add-to-favorites',
                        title: '❤️ Add to Favorites'
                    },
                    {
                        action: 'dismiss',
                        title: '✖️ Dismiss'
                    }
                ];
                notificationOptions.tag = `park-alert-${data.parkId || 'general'}`;

            } else if (data.type === 'social') {
                notificationOptions.actions = [
                    {
                        action: 'view-social',
                        title: '👥 View',
                        icon: '/icons/icon-72x72.png'
                    },
                    {
                        action: 'dismiss',
                        title: '✖️ Dismiss'
                    }
                ];
                notificationOptions.tag = `social-${data.socialId || Date.now()}`;
            }

            // Enhanced notification display with retry logic
            return showNotificationWithRetry(notificationTitle, notificationOptions, 3);

        } catch (error) {
            console.error('❌ Error processing background message:', error);

            // Store error for later reporting
            storeNotificationError(error, payload);

            // Show fallback notification
            return showFallbackNotification('Trip Planner', 'You have a new notification');
        }
    });
} else {
    console.warn('⚠️ Firebase messaging not available for background messages');
}

// ✅ Enhanced notification display with retry logic
async function showNotificationWithRetry(title, options, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const notification = await self.registration.showNotification(title, options);
            console.log(`✅ Notification shown successfully (attempt ${attempt})`);
            return notification;
        } catch (error) {
            console.error(`❌ Failed to show notification (attempt ${attempt}):`, error);

            if (attempt === maxRetries) {
                // Final attempt with simplified options
                try {
                    return await showFallbackNotification(title, options.body || 'New notification');
                } catch (fallbackError) {
                    console.error('❌ Even fallback notification failed:', fallbackError);
                    throw fallbackError;
                }
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// ✅ Fallback notification with minimal options
async function showFallbackNotification(title, body) {
    try {
        return await self.registration.showNotification(title, {
            body: body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: `fallback-${Date.now()}`,
            requireInteraction: false,
            silent: false
    });
    } catch (error) {
        console.error('❌ Fallback notification also failed:', error);
        throw error;
  }
}

// ✅ Enhanced notification click handler with comprehensive actions
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.notification.tag, 'Action:', event.action);
  
  event.notification.close();
  
  try {
    const data = event.notification.data || {};
    const action = event.action;

      // Track notification interaction
      trackNotificationInteraction(event.notification.tag, action, data);

      let urlToOpen = '/';
      let shouldOpenWindow = true;
    
    // Handle different actions
    switch (action) {
      case 'view-trip':
          urlToOpen = data.tripId ? `/trip-planner?trip=${data.tripId}` : '/trip-planner';
        break;
        
      case 'view-weather':
          urlToOpen = data.tripId ? `/trip-planner?trip=${data.tripId}&tab=weather` : '/seasonal';
        break;
        
      case 'update-trip':
          urlToOpen = data.tripId ? `/trip-planner?trip=${data.tripId}&edit=true` : '/trip-planner';
          break;

        case 'view-park':
            urlToOpen = data.parkId ? `/park/${data.parkId}` : '/';
            break;

        case 'add-to-favorites':
            // Handle adding to favorites
            handleAddToFavorites(data.parkId);
            shouldOpenWindow = false;
            break;

        case 'view-social':
            urlToOpen = data.socialUrl || '/account';
        break;
        
      case 'update-app':
        // Trigger app update
        handleAppUpdate();
          shouldOpenWindow = false;
          break;
        
      case 'dismiss':
      case 'later':
          console.log('🚫 Notification dismissed by user action');
          shouldOpenWindow = false;
          break;
        
      default:
          // Default click action (no action button clicked)
        urlToOpen = data.clickAction || '/';

          // Special handling for different notification types
          if (data.type === 'trip-reminder' && data.tripId) {
              urlToOpen = `/trip-planner?trip=${data.tripId}`;
          } else if (data.type === 'weather-alert' && data.locationId) {
              urlToOpen = `/seasonal?location=${data.locationId}`;
          } else if (data.type === 'park-alert' && data.parkId) {
              urlToOpen = `/park/${data.parkId}`;
          }
    }

      if (shouldOpenWindow) {
          // Open or focus the app
          event.waitUntil(
              openOrFocusApp(urlToOpen, data)
          );
      }
    
  } catch (error) {
    console.error('❌ Error handling notification click:', error);
    
    // Fallback: just open the app
      event.waitUntil(
          openOrFocusApp('/', {})
      );
  }
});

// ✅ Enhanced app opening/focusing logic
async function openOrFocusApp(urlToOpen, data = {}) {
    try {
        const clients = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });

        const baseUrl = urlToOpen.split('?')[0];

        // Check if app is already open to this specific URL
        for (const client of clients) {
            if (client.url.includes(baseUrl) && 'focus' in client) {
                console.log('📱 Focusing existing window with matching URL');
                await client.focus();

                // Send navigation message if URL has parameters
                if (urlToOpen.includes('?')) {
                    client.postMessage({
                        type: 'NAVIGATE_TO',
                        url: urlToOpen,
                        data: data,
                        timestamp: new Date().toISOString()
                    });
                }

                return client;
            }
        }

        // Check if any app window is open
        for (const client of clients) {
            if (client.url.includes(self.registration.scope) && 'focus' in client) {
                console.log('🔄 Navigating existing window to new URL');
                await client.focus();

                // Send navigation message
                client.postMessage({
                    type: 'NAVIGATE_TO',
                    url: urlToOpen,
                    data: data,
                    timestamp: new Date().toISOString()
                });

                return client;
            }
        }

        // Open new window if no app window is open
    if (self.clients.openWindow) {
        console.log('🆕 Opening new window:', urlToOpen);
        return await self.clients.openWindow(urlToOpen);
    }

    } catch (error) {
        console.error('❌ Failed to open/focus app:', error);
        throw error;
    }
}

// ✅ Handle adding park to favorites from notification
async function handleAddToFavorites(parkId) {
    if (!parkId) {
        console.warn('⚠️ No park ID provided for favorites');
        return;
  }

    try {
        // Send message to all open clients to add to favorites
        const clients = await self.clients.matchAll({type: 'window'});

        const message = {
            type: 'ADD_TO_FAVORITES',
            parkId: parkId,
            source: 'notification',
            timestamp: new Date().toISOString()
        };

        clients.forEach(client => {
            client.postMessage(message);
        });

        // Show confirmation notification
        await showFallbackNotification(
            '❤️ Added to Favorites!',
            'The park has been added to your favorites list.'
        );

        console.log('✅ Park added to favorites:', parkId);

    } catch (error) {
        console.error('❌ Failed to add park to favorites:', error);
    }
}

// ✅ Handle app update action
async function handleAppUpdate() {
    try {
        // Send message to main app to trigger update
        const clients = await self.clients.matchAll({type: 'window'});

        const message = {
            type: 'TRIGGER_APP_UPDATE',
            timestamp: new Date().toISOString(),
            source: 'notification'
        };

        if (clients.length > 0) {
            // Send to existing clients
            clients.forEach(client => {
                client.postMessage(message);
      });

            console.log('📤 Update message sent to existing clients');
        } else {
            // No clients open, store update request
            await storeUpdateRequest();

            // Show notification that app will update when opened
            await showFallbackNotification(
                '🔄 Update Ready',
                'The app will update when you next open it.'
            );
        }

    } catch (error) {
        console.error('❌ Failed to handle app update:', error);
    }
}

// ✅ Store update request for later processing
async function storeUpdateRequest() {
    try {
        const cache = await caches.open('app-updates-v1');
        const updateRequest = {
            type: 'pending-update',
            timestamp: new Date().toISOString(),
            triggered: 'notification'
        };

        await cache.put(
            new Request('pending-update'),
            new Response(JSON.stringify(updateRequest), {
                headers: {'Content-Type': 'application/json'}
            })
        );

        console.log('💾 Update request stored for later processing');
    } catch (error) {
        console.error('❌ Failed to store update request:', error);
    }
}

// ✅ Track notification interactions for analytics
function trackNotificationInteraction(tag, action, data) {
    try {
        const interactionData = {
            type: 'notification-interaction',
            tag: tag,
            action: action || 'click',
            notificationType: data.type || 'unknown',
            timestamp: new Date().toISOString(),
            userAgent: self.navigator.userAgent
        };

        // Store interaction data for analytics
        caches.open('analytics-v1').then(cache => {
            const key = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            cache.put(
                new Request(key),
                new Response(JSON.stringify(interactionData), {
                    headers: {'Content-Type': 'application/json'}
                })
            );
        });

        console.log('📊 Notification interaction tracked:', action, tag);
    } catch (error) {
        console.error('❌ Failed to track notification interaction:', error);
    }
}

// ✅ Enhanced error storage with categorization
function storeNotificationError(error, payload) {
  try {
    const errorData = {
      type: 'notification-error',
      error: error.message || error.toString(),
        stack: error.stack || 'No stack trace',
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
        userAgent: self.navigator.userAgent,
        errorType: error.name || 'Unknown',
        severity: determineSeverity(error)
    };
    
    // Store in cache for later retrieval
      caches.open('error-reports-v1').then(cache => {
          const errorKey = `notification-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      cache.put(
        new Request(errorKey),
        new Response(JSON.stringify(errorData), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

      console.log('📝 Notification error stored for analysis');
  } catch (storeError) {
    console.error('❌ Failed to store notification error:', storeError);
  }
}

// ✅ Determine error severity
function determineSeverity(error) {
    const message = error.message || error.toString();

    if (message.includes('permission') || message.includes('denied')) {
        return 'low';
    } else if (message.includes('network') || message.includes('fetch')) {
        return 'medium';
    } else if (message.includes('quota') || message.includes('storage')) {
        return 'high';
    }

    return 'medium';
}

// ✅ Enhanced notification close handler
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);

    try {
        // Track notification dismissal for analytics
        const data = event.notification.data || {};

        trackNotificationInteraction(event.notification.tag, 'close', data);

        // Send analytics event to app if open
        self.clients.matchAll({type: 'window'}).then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'NOTIFICATION_DISMISSED',
                    tag: event.notification.tag,
                    data: data,
                    timestamp: new Date().toISOString()
                });
            });
        });
    } catch (error) {
        console.error('❌ Error handling notification close:', error);
    }
});

// ✅ Enhanced error handling for messaging service worker
self.addEventListener('error', (event) => {
  console.error('🔥 Firebase Messaging SW Error:', event.error);
  
  storeNotificationError(event.error, {
    type: 'service-worker-error',
      filename: event.filename || 'unknown',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      source: 'firebase-messaging-sw'
  });
});

// ✅ Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('🔥 Unhandled promise rejection in messaging SW:', event.reason);

    storeNotificationError(event.reason, {
        type: 'promise-rejection',
        source: 'firebase-messaging-sw'
  });
});

// ✅ Handle push subscription changes with better error handling
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription changed');
  
  event.waitUntil(
      (async () => {
          try {
              // Get current VAPID key from environment or config
              const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40iEawdyiLUFY2iUUYgUivxIkv69yViEuiBIa40iEawdyiLUFY'; // Replace with your actual VAPID key

              // Re-subscribe user
              const subscription = await self.registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: vapidKey
              });

              console.log('✅ New push subscription created');

              // Send new subscription to server
              const response = await fetch('/api/push-subscription', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      subscription: subscription,
                      timestamp: new Date().toISOString(),
                      reason: 'subscription-change'
                  })
              });

              if (!response.ok) {
                  throw new Error(`Server returned ${response.status}: ${response.statusText}`);
              }

              console.log('✅ New subscription sent to server');

              // Notify app about subscription change
              const clients = await self.clients.matchAll({type: 'window'});
              clients.forEach(client => {
                  client.postMessage({
                      type: 'PUSH_SUBSCRIPTION_CHANGED',
                      subscription: subscription,
                      timestamp: new Date().toISOString()
                  });
              });

          } catch (error) {
              console.error('❌ Failed to handle subscription change:', error);

              // Store error for later analysis
              storeNotificationError(error, {
                  type: 'subscription-change-error',
                  source: 'pushsubscriptionchange'
              });

              // Try to inform user about the issue
              try {
                  await showFallbackNotification(
                      '⚠️ Notification Issue',
                      'There was a problem with notifications. Please check app settings.'
                  );
              } catch (notifError) {
                  console.error('❌ Could not show error notification:', notifError);
              }
          }
      })()
  );
});

// ✅ Periodic cleanup of stored data
setInterval(() => {
    cleanupStoredData();
}, 60 * 60 * 1000); // Every hour

async function cleanupStoredData() {
    try {
        const cacheNames = ['error-reports-v1', 'analytics-v1', 'app-updates-v1'];
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const cutoff = Date.now() - maxAge;

        for (const cacheName of cacheNames) {
            try {
                const cache = await caches.open(cacheName);
                const requests = await cache.keys();

                for (const request of requests) {
                    // Extract timestamp from request URL if possible
                    const timestampMatch = request.url.match(/(\d{13})/);
                    if (timestampMatch) {
                        const timestamp = parseInt(timestampMatch[1]);
                        if (timestamp < cutoff) {
                            await cache.delete(request);
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Failed to cleanup cache ${cacheName}:`, error);
            }
        }

        console.log('🧹 Periodic cleanup completed');
    } catch (error) {
        console.error('❌ Failed to perform cleanup:', error);
    }
}

// ✅ Message handling from main app
self.addEventListener('message', (event) => {
    const {type, data} = event.data || {};

    switch (type) {
        case 'CHECK_PENDING_UPDATES':
            checkPendingUpdates().then(result => {
                event.ports[0]?.postMessage({
                    type: 'PENDING_UPDATES_RESULT',
                    hasPendingUpdates: result
                });
            });
            break;

        case 'CLEAR_NOTIFICATIONS':
            clearAllNotifications();
            break;

        case 'GET_NOTIFICATION_STATS':
            getNotificationStats().then(stats => {
                event.ports[0]?.postMessage({
                    type: 'NOTIFICATION_STATS',
                    stats: stats
                });
            });
            break;
    }
});

// ✅ Check for pending updates
async function checkPendingUpdates() {
    try {
        const cache = await caches.open('app-updates-v1');
        const response = await cache.match('pending-update');
        return !!response;
    } catch (error) {
        console.error('❌ Failed to check pending updates:', error);
        return false;
    }
}

// ✅ Clear all notifications
async function clearAllNotifications() {
    try {
        const notifications = await self.registration.getNotifications();
        notifications.forEach(notification => notification.close());
        console.log(`🧹 Cleared ${notifications.length} notifications`);
    } catch (error) {
        console.error('❌ Failed to clear notifications:', error);
    }
}

// ✅ Get notification statistics
async function getNotificationStats() {
    try {
        const cache = await caches.open('analytics-v1');
        const requests = await cache.keys();

        const stats = {
            totalInteractions: 0,
            clickCount: 0,
            dismissCount: 0,
            byType: {}
        };

        for (const request of requests) {
            try {
                const response = await cache.match(request);
                const data = await response.json();

                if (data.type === 'notification-interaction') {
                    stats.totalInteractions++;

                    if (data.action === 'click') {
                        stats.clickCount++;
                    } else if (data.action === 'close') {
                        stats.dismissCount++;
                    }

                    const notifType = data.notificationType || 'unknown';
                    stats.byType[notifType] = (stats.byType[notifType] || 0) + 1;
                }
            } catch (error) {
                // Skip invalid entries
            }
        }

        return stats;
    } catch (error) {
        console.error('❌ Failed to get notification stats:', error);
        return null;
    }
}

console.log('✅ Enhanced Firebase Messaging Service Worker initialized with comprehensive features');
console.log('🔔 Notification types supported: trip-reminder, weather-alert, app-update, park-alert, social');
console.log('⚡ Features: retry logic, analytics tracking, error handling, cleanup, interaction handling');