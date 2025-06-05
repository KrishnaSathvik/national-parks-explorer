// ✨ Enhanced AuthContext.jsx - Advanced Authentication System
import {createContext, useCallback, useContext, useEffect, useReducer, useState} from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import {auth, db, requestNotificationPermission} from "../firebase";

// Create Auth context
const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Enhanced auth state reducer for better state management
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        currentUser: action.payload.user,
        userRole: action.payload.role,
        userProfile: action.payload.profile,
        loading: false 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_PROFILE':
      return { 
        ...state, 
        userProfile: { ...state.userProfile, ...action.payload } 
      };
    case 'SET_PREFERENCES':
      return { 
        ...state, 
        userPreferences: { ...state.userPreferences, ...action.payload } 
      };
    case 'RESET_STATE':
      return {
        currentUser: null,
        userRole: null,
        userProfile: null,
        userPreferences: null,
        loading: false,
        error: null,
        isEmailVerified: false
      };
    default:
      return state;
  }
};

// Initial auth state
const initialAuthState = {
  currentUser: null,
  userRole: null,
  userProfile: null,
  userPreferences: null,
  loading: true,
  error: null,
  isEmailVerified: false
};

// Enhanced Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Enhanced user data fetcher with retry logic
  const fetchUserData = useCallback(async (user, attempt = 0) => {
    const maxRetries = 3;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Get user document from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      let userProfile = null;
      let userRole = "user";
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userRole = userData.role || "user";
        userProfile = {
          displayName: userData.displayName || user.displayName || "",
          email: userData.email || user.email,
          photoURL: userData.photoURL || user.photoURL || "",
          favoriteParks: userData.favoriteParks || [],
          favoriteEvents: userData.favoriteEvents || [],
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt,
          preferences: userData.preferences || {},
          stats: userData.stats || {
            parksVisited: 0,
            reviewsWritten: 0,
            tripsPlanned: 0
          }
        };
        
        // Update last login time
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          email: user.email // Ensure email is current
        });
      } else {
        // Create new user document for first-time users
        const newUserData = {
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          role: "user",
          favoriteParks: [],
          favoriteEvents: [],
          preferences: {
            notifications: true,
            emailUpdates: true,
            theme: 'light',
            language: 'en'
          },
          stats: {
            parksVisited: 0,
            reviewsWritten: 0,
            tripsPlanned: 0
          }
        };
        
        await setDoc(userRef, newUserData);
        userProfile = { ...newUserData, createdAt: new Date(), lastLoginAt: new Date() };
      }
      
      dispatch({ 
        type: 'SET_USER', 
        payload: { 
          user, 
          role: userRole, 
          profile: userProfile 
        } 
      });
      
      setRetryAttempts(0);
      
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      
      if (attempt < maxRetries && error.code !== 'permission-denied') {
        console.log(`🔄 Retrying user data fetch (${attempt + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchUserData(user, attempt + 1);
        }, Math.pow(2, attempt) * 1000); // Exponential backoff
        setRetryAttempts(attempt + 1);
      } else {
        // Fallback to basic user data
        dispatch({ 
          type: 'SET_USER', 
          payload: { 
            user, 
            role: "user", 
            profile: {
              displayName: user.displayName || "",
              email: user.email,
              photoURL: user.photoURL || "",
              favoriteParks: [],
              favoriteEvents: [],
              preferences: {},
              stats: { parksVisited: 0, reviewsWritten: 0, tripsPlanned: 0 }
            }
          } 
        });
        
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Failed to load complete user profile. Some features may be limited.' 
        });
      }
    }
  }, []);

  // Watch auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user);
        
        // Check email verification status
        if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
          console.warn("⚠️ Email not verified");
        }
      } else {
        dispatch({ type: 'RESET_STATE' });
      }
    });

    return unsubscribe;
  }, [fetchUserData]);

    // ✅ FIX: Enhanced Service Worker and FCM setup
    useEffect(() => {
        const registerServiceWorker = async () => {
            if (!('serviceWorker' in navigator)) {
                console.warn('⚠️ Service Worker not supported');
                return;
            }

            try {
                // Clean up old service workers first
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
              // Only unregister old/incompatible service workers
              if (registration.scope.includes('enhanced-sw') ||
                  registration.scope.includes('sw.js') ||
                  !registration.active) {
              await registration.unregister();
                  console.log('🗑️ Unregistered old service worker:', registration.scope);
            }
          }

          // Register Firebase messaging service worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/',
              updateViaCache: 'none'
          });

          console.log('✅ Firebase Service Worker registered:', registration.scope);

                // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service Worker is ready for FCM');

                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('🔄 New service worker available');
                                // Optionally show update notification to user
                            }
                        });
                    }
                });

            } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
                // Don't throw - app should work without service worker
            }
        };

        registerServiceWorker();
    }, []);

  // Enhanced notification setup for logged-in users
  useEffect(() => {
    const setupNotifications = async () => {
      if (state.currentUser && typeof window !== "undefined" && "Notification" in window) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const token = await requestNotificationPermission();
          
          if (token && state.currentUser) {
            try {
              const userRef = doc(db, "users", state.currentUser.uid);
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

    if (state.currentUser) {
      setupNotifications();
    }
  }, [state.currentUser]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online');
      dispatch({ type: 'CLEAR_ERROR' });
    };
    
    const handleOffline = () => {
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced authentication methods
  const signup = useCallback(async (email, password, displayName = "") => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await signOut(auth);
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Additional authentication methods
  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      throw new Error(error.message);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    if (!state.currentUser) throw new Error('No user logged in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await updateProfile(state.currentUser, {
          displayName: updates.displayName || state.currentUser.displayName,
          photoURL: updates.photoURL || state.currentUser.photoURL
        });
      }
      
      // Update Firestore user document
      const userRef = doc(db, "users", state.currentUser.uid);
      const firestoreUpdates = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, firestoreUpdates);
      
      // Update local state
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentUser]);

  const updateUserPassword = useCallback(async (currentPassword, newPassword) => {
    if (!state.currentUser) throw new Error('No user logged in');
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        state.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(state.currentUser, credential);
      
      // Update password
      await updatePassword(state.currentUser, newPassword);
      
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }, [state.currentUser]);

  const deleteAccount = useCallback(async (password) => {
    if (!state.currentUser) throw new Error('No user logged in');
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        state.currentUser.email,
        password
      );
      await reauthenticateWithCredential(state.currentUser, credential);
      
      // Delete user data from Firestore
      const userRef = doc(db, "users", state.currentUser.uid);
      await deleteDoc(userRef);
      
      // Delete user reviews, trips, etc.
      const collections = ['reviews', 'trips', 'events'];
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('userId', '==', state.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
      
      // Delete Firebase Auth account
      await deleteUser(state.currentUser);
      
      dispatch({ type: 'RESET_STATE' });
      
      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }, [state.currentUser]);

  const updateUserPreferences = useCallback(async (preferences) => {
    if (!state.currentUser) return;
    
    try {
      const userRef = doc(db, "users", state.currentUser.uid);
      await updateDoc(userRef, {
        preferences: { ...state.userProfile?.preferences, ...preferences },
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [state.currentUser, state.userProfile?.preferences]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const refreshUserData = useCallback(async () => {
    if (state.currentUser) {
      await fetchUserData(state.currentUser);
    }
  }, [state.currentUser, fetchUserData]);

  // Context value
  const value = {
    // State
    currentUser: state.currentUser,
    userRole: state.userRole,
    userProfile: state.userProfile,
    userPreferences: state.userPreferences,
    loading: state.loading,
    error: state.error,
    isEmailVerified: state.currentUser?.emailVerified || false,
    connectionStatus,
    retryAttempts,
    
    // Basic auth methods
    signup,
    login,
    logout,
    loginWithGoogle,
    
    // Enhanced methods
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    deleteAccount,
    updateUserPreferences,
    refreshUserData,
    clearError,
    
    // Utility methods
    isAdmin: state.userRole === 'admin',
    isModerator: state.userRole === 'moderator' || state.userRole === 'admin',
    hasRole: (role) => state.userRole === role,
    isOnline: connectionStatus === 'online'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Enhanced hooks for specific use cases
export const useAuthUser = () => {
  const { currentUser, userProfile, loading } = useAuth();
  return { user: currentUser, profile: userProfile, loading };
};

export const useAuthActions = () => {
  const { 
    login, 
    logout, 
    signup, 
    loginWithGoogle, 
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    deleteAccount 
  } = useAuth();
  
  return {
    login,
    logout,
    signup,
    loginWithGoogle,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    deleteAccount
  };
};

export const useAuthState = () => {
  const { 
    currentUser, 
    userRole, 
    loading, 
    error, 
    isEmailVerified,
    connectionStatus 
  } = useAuth();
  
  return {
    isAuthenticated: !!currentUser,
    isAdmin: userRole === 'admin',
    isModerator: userRole === 'moderator' || userRole === 'admin',
    loading,
    error,
    isEmailVerified,
    isOnline: connectionStatus === 'online'
  };
};

export default AuthContext;