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
  serverTimestamp
} from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { requestNotificationPermission } from "../firebase";
import { auth, db, messaging } from "../firebase"; // ✅ Ensure messaging is exported

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

    useEffect(() => {
      if (currentUser) {
        requestNotificationPermission();
      }
    }, [currentUser]);

  // 🔔 Auto-enable push notifications on login
  useEffect(() => {
    const enableNotifications = async () => {
      if (
        currentUser &&
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          try {
            const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: registration,
            });

            if (token) {
              await updateDoc(doc(db, "users", currentUser.uid), {
                fcmToken: token,
                tokenUpdatedAt: serverTimestamp(),
              });
              console.log("✅ FCM token saved to Firestore:", token);
            }
          } catch (err) {
            console.error("❌ Error getting FCM token:", err);
          }
        } else {
          console.log("🔕 Notifications permission denied.");
        }
      }
    };

    enableNotifications();
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
      await updateDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName || "",
        createdAt: serverTimestamp(),
        role: "user",
      }).catch(async () => {
        // fallback to setDoc if doc doesn't exist
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName || "",
          createdAt: serverTimestamp(),
          role: "user",
        });
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
