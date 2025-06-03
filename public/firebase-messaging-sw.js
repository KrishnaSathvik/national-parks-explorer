// firebase-messaging-sw.js - Enhanced with Error Handling
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase with your existing config
firebase.initializeApp({
  apiKey: "AIzaSyCm1ikSjG9fpuiR5ubi0aPcm4c7mD6L1zg",
  authDomain: "national-parks-explorer-7bc55.firebaseapp.com",
  projectId: "national-parks-explorer-7bc55",
  storageBucket: "national-parks-explorer-7bc55.firebasestorage.app",
  messagingSenderId: "683155277657",
  appId: "1:683155277657:web:edafbd29d36fb7774fee48",
});

const messaging = firebase.messaging();

// Enhanced background message handling with error handling
messaging.onBackgroundMessage((payload) => {
  console.log('📱 Enhanced background message received:', payload);
  
  try {
    // Extract notification data with fallbacks
    const notification = payload.notification || {};
    const data = payload.data || {};
    
    const notificationTitle = notification.title || 'Trip Planner Update';
    const notificationOptions = {
      body: notification.body || 'You have a new notification about your trips',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || `notification-${Date.now()}`,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        clickAction: data.clickAction || '/'
      },
      actions: [],
      requireInteraction: false,
      silent: false
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
    }

    // Show notification with error handling
    return self.registration.showNotification(notificationTitle, notificationOptions)
      .catch((error) => {
        console.error('❌ Failed to show notification:', error);
        
        // Fallback: show basic notification
        return self.registration.showNotification('Trip Planner', {
          body: 'You have a new notification (simplified due to error)',
          icon: '/icons/icon-192x192.png',
          tag: 'fallback-notification'
        });
      });
      
  } catch (error) {
    console.error('❌ Error processing background message:', error);
    
    // Store error for later reporting
    storeNotificationError(error, payload);
    
    // Show fallback notification
    return self.registration.showNotification('Trip Planner', {
      body: 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      tag: 'error-fallback'
    });
  }
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag, event.action);
  
  event.notification.close();
  
  try {
    const data = event.notification.data || {};
    const action = event.action;
    
    let urlToOpen = '/';
    
    // Handle different actions
    switch (action) {
      case 'view-trip':
        urlToOpen = data.tripId ? `/trips/${data.tripId}` : '/trips';
        break;
        
      case 'view-weather':
        urlToOpen = data.tripId ? `/trips/${data.tripId}/weather` : '/weather';
        break;
        
      case 'update-trip':
        urlToOpen = data.tripId ? `/trips/${data.tripId}/edit` : '/trips';
        break;
        
      case 'update-app':
        // Trigger app update
        handleAppUpdate();
        return;
        
      case 'dismiss':
      case 'later':
        return;
        
      default:
        // Default click action
        urlToOpen = data.clickAction || '/';
    }
    
    // Open or focus the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          // Check if app is already open
          for (const client of clients) {
            if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if app is not open
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
        .catch((error) => {
          console.error('❌ Failed to handle notification click:', error);
        })
    );
    
  } catch (error) {
    console.error('❌ Error handling notification click:', error);
    
    // Fallback: just open the app
    if (self.clients.openWindow) {
      self.clients.openWindow('/');
    }
  }
});

// Handle app update action
function handleAppUpdate() {
  // Send message to main app to trigger update
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'TRIGGER_APP_UPDATE',
        timestamp: new Date().toISOString()
      });
    });
  });
}

// Store notification errors for later analysis
function storeNotificationError(error, payload) {
  try {
    const errorData = {
      type: 'notification-error',
      error: error.message || error.toString(),
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
      userAgent: self.navigator.userAgent
    };
    
    // Store in cache for later retrieval
    caches.open('error-reports-v1').then((cache) => {
      const errorKey = `notification-error-${Date.now()}`;
      cache.put(
        new Request(errorKey),
        new Response(JSON.stringify(errorData), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  } catch (storeError) {
    console.error('❌ Failed to store notification error:', storeError);
  }
}

// Notification close handler
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);
  
  // Track notification dismissal for analytics
  const data = event.notification.data || {};
  
  // Send analytics event (if implemented)
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_DISMISSED',
        tag: event.notification.tag,
        data: data,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// Error handling for messaging
self.addEventListener('error', (event) => {
  console.error('🔥 Firebase Messaging SW Error:', event.error);
  
  storeNotificationError(event.error, {
    type: 'service-worker-error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription changed');
  
  event.waitUntil(
    // Re-subscribe user
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa40iEawdyiLUFY2iUUYgUivxIkv69yViEuiBIa40iEawdyiLUFY'
    }).then((subscription) => {
      // Send new subscription to server
      return fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    }).catch((error) => {
      console.error('❌ Failed to re-subscribe:', error);
    })
  );
});

console.log('✅ Enhanced Firebase Messaging Service Worker initialized');