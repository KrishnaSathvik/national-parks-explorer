import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
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
              <Route
                path="/"
                element={
                  <Home
                    parks={parks}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                  />
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/park/:id" element={<ParkDetails />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/about" element={<About />} />
              <Route path="/account" element={<UserAccount />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/admin/login" element={<AdminLogin />} />
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
      <ScrollToTopButton />
    </div>
  );
}

export default App;
