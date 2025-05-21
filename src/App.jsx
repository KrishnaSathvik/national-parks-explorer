import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { messaging } from './firebase';
import { onMessage } from 'firebase/messaging';
import InstallButton from './components/InstallButton';
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import PrivateRoute from "./components/PrivateRoute";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import Layout from "./components/Layout";
import { requestNotificationPermission } from './firebase';

// ✅ Lazy-loaded pages for performance
const Home = lazy(() => import("./pages/Home"));
const ParkDetails = lazy(() => import("./pages/ParkDetails"));
const MapPage = lazy(() => import("./pages/MapPage"));
const CalendarView = lazy(() => import("./pages/CalendarView"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const UserAccount = lazy(() => import("./pages/UserAccount"));

// ✅ Admin lazy-loaded
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminRoute = lazy(() => import("./admin/AdminRoute"));
const AdminPage = lazy(() => import("./admin/AdminPage"));
const AdminBlogEditor = lazy(() => import("./admin/AdminBlogEditor"));
const EditBlog = lazy(() => import("./admin/EditBlog"));

function App() {
  const [parks, setParks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parks"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setParks(data);
      } catch (error) {
        showToast("Failed to load parks data", "error");
        console.error("Error fetching parks:", error);
      }
    };
    fetchParks();
  }, []);

    useEffect(() => {
      const handleOffline = () => {
        showToast('⚠️ You are offline. Some features may not work.', 'warning');
      };
      const handleOnline = () => {
        showToast('✅ Back online!', 'success');
      };

      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);

      return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      };
    }, []);

    useEffect(() => {
      const unsubscribe = onMessage(messaging, (payload) => {
        if (payload?.notification) {
          const { title, body } = payload.notification;
          showToast(`🔔 ${title}: ${body}`, 'info');
        }
      });
      return () => unsubscribe();
    }, []);


  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) {
        const localFavs = JSON.parse(localStorage.getItem("favorites")) || [];
        setFavorites(localFavs);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setFavorites(docSnap.data().favoriteParks || []);
        } else {
          console.log("Creating user document for:", currentUser.email);
          await setDoc(userRef, { favoriteParks: [], favoriteEvents: [] });
          setFavorites([]);
        }
      } catch (err) {
        console.error("🔥 Firestore permission error:", err);
      }
    };
    fetchFavorites();
  }, [currentUser]);

  const toggleFavorite = async (id) => {
    const isFavorite = favorites.includes(id);
    const updatedFavorites = isFavorite
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updatedFavorites);

    if (!currentUser) {
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showToast("🔐 Log in to save favorites across devices", "info");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        favoriteParks: isFavorite ? arrayRemove(id) : arrayUnion(id),
      });

      showToast(
        isFavorite ? "❌ Removed from favorites" : "💖 Added to favorites",
        isFavorite ? "info" : "success"
      );
    } catch (err) {
      console.error("Error updating favorites:", err);
      showToast("❌ Failed to update favorites", "error");
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <ScrollToTop />
      <Layout>
        <div className="main-scroll">
          <Suspense fallback={<div className="p-6 text-gray-500">Loading...</div>}>
            <Routes>
              {/* ✅ Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ✅ Protected Routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home parks={parks} favorites={favorites} toggleFavorite={toggleFavorite} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/park/:slug"
                element={
                  <PrivateRoute>
                    <ParkDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <PrivateRoute>
                    <MapPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <CalendarView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <PrivateRoute>
                    <UserAccount />
                  </PrivateRoute>
                }
              />

              {/* ✅ Admin Protected */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/blog-editor"
                element={
                  <AdminRoute>
                    <AdminBlogEditor />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/editor"
                element={
                  <AdminRoute>
                    <AdminBlogEditor />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/edit-blog/:id"
                element={
                  <AdminRoute>
                    <EditBlog />
                  </AdminRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </Layout>
      {/* 📲 Install */}
              <InstallButton />
      <ScrollToTopButton />
    </div>
  );
}

export default App;
