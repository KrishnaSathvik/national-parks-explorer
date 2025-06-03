import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { requestNotificationPermission } from "../firebase";
import { auth, db } from "../firebase";

// Create Auth context
const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // ✅ Get user role
          const userSnap = await getDoc(doc(db, "users", user.uid));
          setUserRole(userSnap.exists() ? userSnap.data().role || "user" : "user");
        } catch (error) {
          console.error("❌ Error fetching user role:", error);
          setUserRole("user");
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ Register Service Worker on app load
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          console.log('✅ Service Worker registered:', registration);
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service Worker is ready');
          
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  // 🔔 Enhanced notification setup for logged-in users
  useEffect(() => {
    const setupNotifications = async () => {
      if (currentUser && typeof window !== "undefined" && "Notification" in window) {
        try {
          // Small delay to ensure service worker is fully ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const token = await requestNotificationPermission();
          
          if (token) {
            // Update user document with FCM token
            try {
              const userRef = doc(db, "users", currentUser.uid);
              await updateDoc(userRef, {
                fcmToken: token,
                tokenUpdatedAt: serverTimestamp(),
              });
              console.log("✅ FCM token saved to user document");
            } catch (updateError) {
              console.error("❌ Error updating user with FCM token:", updateError);
            }
          }
        } catch (err) {
          console.error("❌ Error setting up notifications:", err);
        }
      }
    };

    if (currentUser) {
      setupNotifications();
    }
  }, [currentUser]);

  // Auth methods
  const signup = useCallback(
    (email, password) => createUserWithEmailAndPassword(auth, email, password),
    []
  );
  
  const login = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email, password),
    []
  );
  
  const logout = useCallback(() => signOut(auth), []);
  
  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const userRef = doc(db, "users", result.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName || "",
        createdAt: serverTimestamp(),
        role: "user",
        favoriteParks: [],
        favoriteEvents: [],
      });
    } else {
      // Update existing user
      await updateDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName || "",
        lastLoginAt: serverTimestamp(),
      });
    }

    return result;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        signup,
        login,
        logout,
        loginWithGoogle,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};