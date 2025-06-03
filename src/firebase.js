import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  collection
} from "firebase/firestore";
import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";
import {
  getAnalytics,
  logEvent
} from "firebase/analytics";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// ✅ Initialize core services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export const analytics = getAnalytics(app);

// ✅ Enhanced FCM Token Request with Service Worker Check
export const requestNotificationPermission = async () => {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn("⚠️ Service Worker not supported");
      return;
    }

    // Check if service worker is ready
    const registration = await navigator.serviceWorker.ready;
    if (!registration || !registration.active) {
      console.warn("⚠️ Service Worker not active yet, retrying...");
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 2000));
      const retryRegistration = await navigator.serviceWorker.ready;
      if (!retryRegistration || !retryRegistration.active) {
        throw new Error("Service Worker not ready after retry");
      }
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("⚠️ Notification permission denied");
      return;
    }

    // Get FCM token with service worker registration
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      console.warn("⚠️ No FCM token received. Permission may not be granted.");
      return;
    }

    console.log("✅ Got FCM Token:", token);

    const user = auth.currentUser;

    if (user) {
      // ✅ Store under logged-in user
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          favoriteParks: [],
          favoriteEvents: [],
          createdAt: serverTimestamp()
        });
        console.log("🆕 Created user document");
      }

      const tokensRef = collection(db, "users", user.uid, "tokens");
      await addDoc(tokensRef, {
        token,
        createdAt: serverTimestamp()
      });

      console.log("📦 Token saved to users/{uid}/tokens");
    } else {
      // ✅ Anonymous token storage
      let anonId = localStorage.getItem("anon_id");
      if (!anonId) {
        anonId = crypto.randomUUID();
        localStorage.setItem("anon_id", anonId);
      }

      const anonRef = doc(db, "anonymousTokens", anonId);
      await setDoc(anonRef, {
        token,
        createdAt: serverTimestamp()
      });

      console.log("📦 Token saved to anonymousTokens/", anonId);
    }

    // ✅ Send welcome push via secure Cloud Function with retry
    try {
      const response = await fetch("https://us-central1-national-parks-explorer-7bc55.cloudfunctions.net/sendWelcomePush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log("✅ Welcome push sent successfully");
    } catch (fetchError) {
      console.error("❌ Welcome push failed:", fetchError.message);
      // Don't throw here - token is still saved successfully
    }

    return token;

  } catch (err) {
    console.error("❌ Error getting or saving FCM token:", err);
    return null;
  }
};

// ✅ Live push notification handling with error handling
onMessage(messaging, (payload) => {
  console.log("🔔 Foreground Notification Received:", payload);
  
  try {
    if (payload?.notification) {
      const { title, body } = payload.notification;
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png'
        });
      }
    }
  } catch (notificationError) {
    console.error("❌ Error showing foreground notification:", notificationError);
  }
});