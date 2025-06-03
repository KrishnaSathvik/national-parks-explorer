// src/hooks/useEnhancedPWA.js - PWA Hook with Firebase Integration
import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ErrorHandler } from '../utils/ErrorHandler';

export const useEnhancedPWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  // Online/Offline detection with enhanced error handling
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Back online - syncing offline data...');
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Gone offline - enabling offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Installation detection
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('💾 PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Track installation
      trackEvent('pwa_installed', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Enhanced Service Worker registration with Vite PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerEnhancedServiceWorker();
    }
    
    // Initialize Firebase messaging
    initializeFirebaseMessaging();
  }, []);

  const registerEnhancedServiceWorker = async () => {
    try {
      const registration = await ErrorHandler.withRetry(
        () => navigator.serviceWorker.register('/sw.js'),
        3,
        1000,
        { context: 'Service Worker Registration' }
      );
      
      setSwRegistration(registration);
      console.log('🔧 Enhanced Service Worker registered:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New content available, update ready');
            setUpdateAvailable(true);
          }
        });
      });

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 New service worker activated, reloading...');
        window.location.reload();
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Check for waiting service worker
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error, 'Service Worker Registration');
      console.error('❌ Service Worker registration failed:', errorInfo);
    }
  };

  const initializeFirebaseMessaging = async () => {
    try {
      if (!('Notification' in window)) {
        console.warn('⚠️ This browser does not support notifications');
        return;
      }

      const messaging = getMessaging();
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: 'BEl62iUYgUivxIkv69yViEuiBIa40iEawdyiLUFY2iUUYgUivxIkv69yViEuiBIa40iEawdyiLUFY'
        });
        
        setFcmToken(token);
        console.log('🔑 FCM Token:', token);
        
        // Send token to your server
        await sendTokenToServer(token);
        
        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('📱 Foreground message received:', payload);
          
          // Show custom notification or update UI
          showCustomNotification(payload);
        });
      }
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error, 'Firebase Messaging Initialization');
      console.error('❌ Firebase messaging initialization failed:', errorInfo);
    }
  };

  const handleServiceWorkerMessage = (event) => {
    const { type, payload } = event.data || {};
    
    switch (type) {
      case 'NOTIFICATION_DISMISSED':
        console.log('🔕 Notification dismissed:', payload);
        break;
        
      case 'TRIGGER_APP_UPDATE':
        setUpdateAvailable(true);
        break;
        
      case 'VERSION_INFO':
        console.log('ℹ️ App version:', payload);
        break;
        
      case 'CACHE_CLEARED':
        console.log('🗑️ Cache cleared successfully');
        break;
        
      case 'SYNC_COMPLETE':
        console.log('🔄 Offline data synced successfully');
        break;
        
      default:
        console.log('📨 Service worker message:', event.data);
    }
  };

  // Install PWA with enhanced error handling
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ No install prompt available');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      console.log('Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        trackEvent('pwa_install_accepted');
        return true;
      } else {
        trackEvent('pwa_install_dismissed');
      }
      
      return false;
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error, 'PWA Installation');
      console.error('❌ Install failed:', errorInfo);
      return false;
    }
  }, [deferredPrompt]);

  // Update app with enhanced messaging
  const updateApp = useCallback(() => {
    if (!swRegistration?.waiting) {
      console.warn('⚠️ No update available');
      return false;
    }

    // Send message to skip waiting
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    setUpdateAvailable(false);
    
    trackEvent('app_updated', {
      timestamp: new Date().toISOString()
    });
    
    return true;
  }, [swRegistration]);

  // Enhanced offline data management
  const storeOfflineData = useCallback(async (key, data) => {
    try {
      const offlineData = {
        key,
        data,
        timestamp: new Date().toISOString(),
        synced: false,
        retryCount: 0
      };

      // Store in multiple places for reliability
      await Promise.all([
        // Store in localStorage as fallback
        localStorage.setItem(`offline-${key}`, JSON.stringify(offlineData)),
        
        // Store in Cache API for service worker access
        caches.open('offline-data-v1').then(cache => 
          cache.put(
            new Request(`offline-${key}`),
            new Response(JSON.stringify(offlineData))
          )
        )
      ]);

      // Register for background sync if available
      if (swRegistration?.sync) {
        await swRegistration.sync.register('offline-data-sync');
      }

      console.log(`💾 Stored offline data: ${key}`);
      return true;
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error, 'Store Offline Data');
      console.error('❌ Failed to store offline data:', errorInfo);
      return false;
    }
  }, [swRegistration]);

  const syncOfflineData = useCallback(async () => {
    if (!isOnline) return false;

    try {
      const offlineCache = await caches.open('offline-data-v1');
      const requests = await offlineCache.keys();
      
      const syncPromises = requests.map(async (request) => {
        try {
          const response = await offlineCache.match(request);
          const offlineData = await response.json();
          
          if (!offlineData.synced) {
            // Attempt to sync
            await syncSingleOfflineItem(offlineData);
            
            // Mark as synced and update cache
            offlineData.synced = true;
            offlineData.syncedAt = new Date().toISOString();
            
            await offlineCache.put(
              request,
              new Response(JSON.stringify(offlineData))
            );
          }
        } catch (error) {
          console.error('Failed to sync offline item:', error);
        }
      });
      
      await Promise.allSettled(syncPromises);
      console.log('✅ Offline data sync completed');
      return true;
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error, 'Sync Offline Data');
      console.error('❌ Failed to sync offline data:', errorInfo);
      return false;
    }
  }, [isOnline]);

  const syncSingleOfflineItem = async (offlineData) => {
    const { key, data } = offlineData;
    
    // Determine sync endpoint based on key
    let endpoint = '/api/sync';
    let method = 'POST';
    
    if (key.startsWith('trip-')) {
      endpoint = '/api/trips';
    } else if (key.startsWith('analytics-')) {
      endpoint = '/api/analytics';
    }

    await ErrorHandler.withRetry(
      () => fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      3,
      1000,
      { context: `Sync ${key}` }
    );
  };

  // Send FCM token to server
  const sendTokenToServer = async (token) => {
    try {
      await ErrorHandler.withRetry(
        () => fetch('/api/fcm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        }),
        3,
        1000,
        { context: 'Send FCM Token' }
      );
      
      console.log('🔑 FCM token sent to server');
    } catch (error) {
      console.error('❌ Failed to send FCM token to server:', error);
    }
  };

  // Show custom notification for foreground messages
  const showCustomNotification = (payload) => {
    const { notification, data } = payload;
    
    // You can customize this to show in-app notifications
    if (window.showToast) {
      window.showToast(
        notification?.body || 'New notification',
        'info',
        {
          duration: 5000,
          actions: data?.actionUrl ? [{
            label: 'View',
            action: () => window.location.href = data.actionUrl
          }] : undefined
        }
      );
    }
  };

  // Analytics tracking helper
  const trackEvent = (eventName, properties = {}) => {
    try {
      // Send to your analytics service
      if (window.gtag) {
        window.gtag('event', eventName, properties);
      }
      
      // Or send to your custom analytics endpoint
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        })
      }).catch(error => {
        console.warn('Failed to send analytics event:', error);
      });
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  };

  // Get network status
  const getNetworkStatus = useCallback(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      isOnline,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false
    };
  }, [isOnline]);

  // Get app version from service worker
  const getAppVersion = useCallback(async () => {
    if (!swRegistration) return null;
    
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'VERSION_INFO') {
          resolve(event.data);
        }
      };
      
      swRegistration.active?.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }, [swRegistration]);

  return {
    // Status
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    isPWA: isInstalled || window.matchMedia('(display-mode: standalone)').matches,
    notificationPermission,
    fcmToken,
    
    // Actions
    installApp,
    updateApp,
    
    // Data management
    storeOfflineData,
    syncOfflineData,
    
    // Utilities
    getNetworkStatus,
    getAppVersion,
    
    // Advanced
    swRegistration,
    trackEvent
  };
};

export default useEnhancedPWA;