// ✨ Enhanced firebase.js - Advanced Firebase Integration System
import {initializeApp} from "firebase/app";
import {connectAuthEmulator, getAuth, GoogleAuthProvider} from "firebase/auth";
import {
  addDoc,
  CACHE_SIZE_UNLIMITED,
  clearIndexedDbPersistence,
  collection,
  connectFirestoreEmulator,
  disableNetwork,
  doc,
  enableIndexedDbPersistence,
  enableNetwork,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import {getMessaging, getToken, isSupported as isMessagingSupported, onMessage} from "firebase/messaging";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  logEvent,
  setUserId,
  setUserProperties
} from "firebase/analytics";
import {getPerformance, trace} from "firebase/performance";
import {connectStorageEmulator, deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";

// Enhanced Firebase configuration with validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    console.error('❌ Missing Firebase configuration fields:', missingFields);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
  }

  console.log('✅ Firebase configuration validated');
  return true;
};

// Validate configuration
validateFirebaseConfig(firebaseConfig);

// Initialize Firebase app with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase app:', error);
  throw error;
}

// Initialize core services with enhanced error handling
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// Enhanced provider configuration
provider.addScope('profile');
provider.addScope('email');
provider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize optional services with feature detection
let messaging = null;
let analytics = null;
let performance = null;

// Enhanced messaging initialization with comprehensive error handling
const initializeMessaging = async () => {
  try {
    // Check if messaging is supported
    const isSupported = await isMessagingSupported();
    if (!isSupported) {
      console.warn('⚠️ Firebase Messaging not supported in this environment');
      return null;
    }

    // Check if we're in a secure context
    if (!window.isSecureContext) {
      console.warn('⚠️ Firebase Messaging requires a secure context (HTTPS)');
      return null;
    }

    // Check if service worker is available
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker not supported - FCM will not work');
      return null;
    }

    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
    return messaging;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Messaging:', error);
    return null;
  }
};

// Enhanced analytics initialization
const initializeAnalytics = async () => {
  try {
    const isSupported = await isAnalyticsSupported();
    if (!isSupported) {
      console.warn('⚠️ Firebase Analytics not supported in this environment');
      return null;
    }

    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
    return analytics;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Analytics:', error);
    return null;
  }
};

// Enhanced performance initialization with proper error handling
const initializePerformance = async () => {
  try {
    // Additional checks for performance monitoring
    if (typeof window === 'undefined') {
      console.warn('⚠️ Firebase Performance requires browser environment');
      return null;
    }

    // Check if we're in a supported environment
    if (!window.location.protocol.startsWith('https') && window.location.hostname !== 'localhost') {
      console.warn('⚠️ Firebase Performance requires HTTPS in production');
      return null;
    }

    performance = getPerformance(app);
    console.log('✅ Firebase Performance initialized');
    return performance;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Performance:', error);
    return null;
  }
};

// Initialize optional services
Promise.all([
  initializeMessaging(),
  initializeAnalytics(),
  initializePerformance()
]).then(() => {
  console.log('🚀 Firebase initialization complete');
}).catch(error => {
  console.error('❌ Firebase services initialization failed:', error);
});

// Enhanced Firestore persistence with retry logic
const enableFirestorePersistence = async (retries = 3) => {
  if (typeof window === 'undefined') return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await enableIndexedDbPersistence(db, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        forceOwnership: false
      });
      console.log('✅ Firestore persistence enabled');
      return true;
    } catch (error) {
      console.warn(`⚠️ Firestore persistence attempt ${attempt} failed:`, error.code);

      if (error.code === 'failed-precondition') {
        console.warn('⚠️ Multiple tabs open, persistence disabled');
        return false;
      } else if (error.code === 'unimplemented') {
        console.warn('⚠️ Browser doesn\'t support persistence');
        return false;
      }

      if (attempt === retries) {
        console.error('❌ Failed to enable Firestore persistence after', retries, 'attempts');
        return false;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return false;
};

// Enable persistence
enableFirestorePersistence();

// Enhanced FCM token management with comprehensive error handling
const requestNotificationPermission = async (options = {}) => {
  const {
    retries = 3,
    retryDelay = 2000,
    skipIfDenied = true
  } = options;

  try {
    // Early exit checks
    if (!messaging) {
      console.warn('⚠️ Messaging not initialized');
      return null;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('⚠️ Notifications not supported');
      return null;
    }

    // Check current permission status
    const currentPermission = Notification.permission;
    if (skipIfDenied && currentPermission === 'denied') {
      console.warn('⚠️ Notification permission denied by user');
      return null;
    }

    // Request permission if not granted
    let permission = currentPermission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted:', permission);
      return null;
    }

    // Ensure service worker is ready with retry logic
    let registration = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          break;
        }

        if (attempt < retries) {
          console.log(`🔄 Service worker not ready, retrying... (${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`❌ Service worker error (attempt ${attempt}):`, error);
        if (attempt === retries) throw error;
      }
    }

    if (!registration || !registration.active) {
      throw new Error('Service Worker not ready after multiple attempts');
    }

    console.log('✅ Service Worker ready:', registration.scope);

    // Get FCM token with retry logic
    let token = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (token) {
          break;
        }

        if (attempt < retries) {
          console.log(`🔄 No FCM token received, retrying... (${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`❌ FCM token error (attempt ${attempt}):`, error);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    if (!token) {
      console.warn('⚠️ No FCM token received after multiple attempts');
      return null;
    }

    console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');

    // Store token in Firestore with enhanced error handling
    await saveFCMToken(token);

    // ✅ FIXED: Send welcome notification with error handling (no more 500 error)
    await sendWelcomeNotification(token);

    return token;

  } catch (error) {
    console.error('❌ Error in requestNotificationPermission:', error);

    // Enhanced error reporting
    logAnalyticsEvent('fcm_setup_error', {
      error_code: error.code,
      error_message: error.message,
      permission_status: Notification.permission
    });

    return null;
  }
};

// Enhanced FCM token storage with user context
const saveFCMToken = async (token) => {
  try {
    const user = auth.currentUser;

    if (user) {
      // Save for authenticated user
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          favoriteParks: [],
          favoriteEvents: [],
          createdAt: serverTimestamp()
        });
        console.log('📝 Created user document');
      }

      // Store in user's tokens subcollection for better management
      const tokensRef = collection(db, "users", user.uid, "tokens");
      await addDoc(tokensRef, {
        token,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp(),
        isActive: true
      });

      console.log('💾 FCM token saved to user tokens collection');
    } else {
      // Save for anonymous user with enhanced tracking
      let anonId = localStorage.getItem("anon_id");
      if (!anonId) {
        anonId = crypto.randomUUID();
        localStorage.setItem("anon_id", anonId);
      }

      const anonRef = doc(db, "anonymousTokens", anonId);
      await setDoc(anonRef, {
        token,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp(),
        isActive: true
      });

      console.log('💾 FCM token saved to anonymous tokens:', anonId);
    }
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    throw error;
  }
};

// ✅ FIXED: Welcome notification using local browser notification (no backend call)
const sendWelcomeNotification = async (token) => {
  try {
    // ✅ Show local browser notification instead of calling missing backend
    if (Notification.permission === 'granted') {
      new Notification('🏞️ Welcome to Trip Planner!', {
        body: 'You\'ll receive updates about your favorite parks and trips.',
        icon: '/icons/icon-192x192.png',
        badge: '/favicon.ico',
        tag: 'welcome',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200]
      });

      console.log('✅ Welcome notification shown locally');

      // Log success analytics
      logAnalyticsEvent('welcome_notification_sent', {
        success: true,
        type: 'local_browser_notification',
        timestamp: Date.now()
      });
    } else {
      console.log('ℹ️ Welcome notification skipped - permission not granted');
    }

  } catch (error) {
    console.error('❌ Welcome notification failed:', error);

    // Log failure analytics
    logAnalyticsEvent('welcome_notification_failed', {
      error_message: error.message,
      error_code: error.code || 'unknown',
      type: 'local_browser_notification'
    });

    // Don't throw - welcome notification is not critical
  }
};

// Enhanced foreground message handling with proper null checks
const setupForegroundMessaging = () => {
  if (!messaging) return;

  try {
    onMessage(messaging, (payload) => {
      console.log('🔔 Foreground notification received:', payload);

      try {
        const {notification, data} = payload;

        if (notification) {
          const {title, body, icon, badge, image} = notification;

          // Show enhanced browser notification
          if (Notification.permission === 'granted') {
            const notificationOptions = {
              body,
              icon: icon || '/icons/icon-192x192.png',
              badge: badge || '/favicon.ico',
              image: image,
              tag: data?.type || 'general',
              requireInteraction: false,
              silent: false,
              vibrate: [200, 100, 200],
              data: data,
              actions: data?.actions ? JSON.parse(data.actions) : []
            };

            const notif = new Notification(title, notificationOptions);

            // Handle notification clicks
            notif.onclick = (event) => {
              event.preventDefault();
              window.focus();

              if (data?.url) {
                window.open(data.url, '_blank');
              }

              notif.close();

              // Log interaction
              logAnalyticsEvent('notification_clicked', {
                notification_type: data?.type || 'unknown',
                notification_title: title
              });
            };

            // Auto-close after delay
            setTimeout(() => {
              notif.close();
            }, 8000);
          }

          // Log notification received
          logAnalyticsEvent('notification_received', {
            notification_type: data?.type || 'unknown',
            notification_title: title,
            foreground: true
          });
        }
      } catch (error) {
        console.error('❌ Error handling foreground notification:', error);
      }
    });
  } catch (error) {
    console.error('❌ Error setting up foreground messaging:', error);
  }
};

// Setup foreground messaging
setupForegroundMessaging();

// Enhanced analytics helper functions
const logAnalyticsEvent = (eventName, parameters = {}) => {
  if (!analytics) return;

  try {
    // Add common parameters
    const enhancedParams = {
      ...parameters,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      page_title: document.title
    };

    logEvent(analytics, eventName, enhancedParams);
    console.log('📊 Analytics event logged:', eventName, enhancedParams);
  } catch (error) {
    console.error('❌ Analytics event failed:', eventName, error);
  }
};

const setAnalyticsUser = (userId, properties = {}) => {
  if (!analytics) return;

  try {
    setUserId(analytics, userId);
    setUserProperties(analytics, {
      ...properties,
      last_login: new Date().toISOString()
    });
    console.log('👤 Analytics user set:', userId);
  } catch (error) {
    console.error('❌ Analytics user setup failed:', error);
  }
};

// Enhanced performance monitoring
const createPerformanceTrace = (traceName) => {
  if (!performance) return null;

  try {
    const traceInstance = trace(performance, traceName);
    console.log('⏱️ Performance trace started:', traceName);
    return traceInstance;
  } catch (error) {
    console.error('❌ Performance trace failed:', traceName, error);
    return null;
  }
};

// Enhanced error boundary for Firebase operations
const handleFirebaseError = (error, operation = 'Firebase operation') => {
  console.error(`❌ ${operation} failed:`, error);

  // Map common Firebase errors to user-friendly messages
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'permission-denied': 'You don\'t have permission to perform this action.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'deadline-exceeded': 'Request timeout. Please check your connection.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'cancelled': 'Operation was cancelled.',
    'invalid-argument': 'Invalid data provided.',
    'failed-precondition': 'Operation cannot be completed in current state.',
    'out-of-range': 'Value is out of acceptable range.',
    'unauthenticated': 'Please sign in to continue.',
    'resource-exhausted': 'Service quota exceeded. Please try again later.',
    'internal': 'Internal server error. Please try again.',
    'data-loss': 'Data loss detected. Please refresh and try again.'
  };

  const userMessage = errorMessages[error.code] || 'An unexpected error occurred. Please try again.';

  // Log to analytics for monitoring
  logAnalyticsEvent('firebase_error', {
    error_code: error.code,
    error_message: error.message,
    operation: operation,
    timestamp: Date.now()
  });

  return {
    code: error.code,
    message: userMessage,
    originalMessage: error.message,
    operation
  };
};

// Development mode helpers
if (import.meta.env.DEV) {
  console.log('🔧 Development mode detected');

  // Connect to emulators if available
  if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    console.log('🔧 Connecting to Firebase emulators...');

    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('✅ Connected to Firebase emulators');
    } catch (error) {
      console.warn('⚠️ Failed to connect to emulators:', error);
    }
  }
}

export {
  app,
  auth,
  provider,
  db,
  storage,
  messaging,
  analytics,
  performance,
  logAnalyticsEvent,
  setAnalyticsUser,
  createPerformanceTrace,
  handleFirebaseError,
  requestNotificationPermission
};

// Cleanup function for app shutdown
const cleanupFirebase = async () => {
  try {
    console.log('🧹 Cleaning up Firebase resources...');

    // Disable network to flush pending writes
    await disableNetwork(db);

    // Clear IndexedDB if needed
    if (import.meta.env.VITE_CLEAR_CACHE_ON_RELOAD === 'true') {
      await clearIndexedDbPersistence(db);
    }

    console.log('✅ Firebase cleanup completed');
  } catch (error) {
    console.error('❌ Firebase cleanup failed:', error);
  }
};

// Register cleanup on page unload
window.addEventListener('beforeunload', cleanupFirebase);

export default app;