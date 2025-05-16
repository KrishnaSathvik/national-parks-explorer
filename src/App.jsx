import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import UserAccount from "./pages/UserAccount"; // Add this at the top
import { db } from "./firebase";
import ScrollToTopButton from "./components/ScrollToTopButton";
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
import { useToast } from "./context/ToastContext"; // ✅ import custom toast hook

import Layout from "./components/Layout";
import Home from "./pages/Home";
import ParkDetails from "./pages/ParkDetails";
import MapPage from "./pages/MapPage";
import CalendarView from "./pages/CalendarView";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// NEW Admin Imports
import AdminLogin from "./admin/AdminLogin";
import AdminRoute from "./admin/AdminRoute";
import AdminPage from "./admin/AdminPage";
import "react-quill/dist/quill.snow.css";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost"; // We’ll create this next
import AdminBlogEditor from "./admin/AdminBlogEditor";
import EditBlog from "./admin/EditBlog";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import About from "./pages/About"; // Adjust path if your About.jsx is in a different folder





function App() {
  const [parks, setParks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useAuth();
  const { showToast } = useToast(); // ✅ custom toast handler

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

// inside App.jsx

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

  const userRef = doc(db, "users", currentUser.uid);
  try {
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
    <ScrollToTop /> {/* Smooth scroll on route change */}

    <Layout>
      <div className="main-scroll overflow-y-auto h-screen">
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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/admin/edit-blog/:id" element={<EditBlog />} />
          <Route path="/about" element={<About />} />
          <Route path="/account" element={<UserAccount />} />
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
        </Routes>
      </div>
    </Layout>

    <ScrollToTopButton /> {/* Floating back-to-top button */}
  </div>
);
}

export default App;
