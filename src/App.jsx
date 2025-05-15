import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
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
import { useToast } from "./context/ToastContext"; // ✅ import custom toast hook

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import ParkDetails from "./pages/ParkDetails";
import MapPage from "./pages/MapPage";
import CalendarView from "./pages/CalendarView";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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

      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setFavorites(docSnap.data().favoriteParks || []);
      } else {
        await setDoc(userRef, { favoriteParks: [], favoriteEvents: [] });
        setFavorites([]);
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
    <ScrollToTop /> {/* ⬅️ This should be outside Layout to work reliably */}
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
          <Route
            path="/favorites"
            element={
              <Favorites
                parks={parks.filter((p) => favorites.includes(p.id))}
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
        </Routes>
      </div>
    </Layout>
  </div>
);
}

export default App;
