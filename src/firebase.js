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
export const analytics = getAnalytics(app); // ✅ Fix: export analytics

// ✅ Request Notification Permission + Store FCM Token
export const requestNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
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

    // ✅ Send welcome push via secure Cloud Function
    await fetch("https://us-central1-national-parks-explorer-7bc55.cloudfunctions.net/sendWelcomePush", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

  } catch (err) {
    console.error("❌ Error getting or saving FCM token:", err);
  }
};

// ✅ Live push notification handling
onMessage(messaging, (payload) => {
  console.log("🔔 Foreground Notification Received:", payload);
});
