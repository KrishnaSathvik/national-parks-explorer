import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
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
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import ParkDetails from "./pages/ParkDetails";
import MapPage from "./pages/MapPage";
import Layout from "./components/Layout";
import CalendarView from "./pages/CalendarView";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [parks, setParks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useAuth();

  // Fetch parks on load
  useEffect(() => {
    const fetchParks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parks"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setParks(data);
      } catch (error) {
        toast.error("Failed to load parks data.");
        console.error("Error fetching parks:", error);
      }
    };

    fetchParks();
  }, []);

  // Fetch favorites based on user state
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

  // Toggle favorite parks
  const toggleFavorite = async (id) => {
    const isFavorite = favorites.includes(id);
    const updatedFavorites = isFavorite
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updatedFavorites);

    if (!currentUser) {
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      toast.info("🔐 Log in to save favorites across devices");
    } else {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        favoriteParks: isFavorite ? arrayRemove(id) : arrayUnion(id),
      });
    }

    toast.success(
      isFavorite ? "❌ Removed from favorites" : "💖 Added to favorites"
    );
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Layout>
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
          draggable
          theme="colored"
        />
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
      </Layout>
    </div>
  );
}

export default App;
