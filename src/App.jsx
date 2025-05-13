// App.jsx with Firestore-based favorite park syncing and toast notifications
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
  arrayRemove
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

  useEffect(() => {
    const fetchParks = async () => {
      const snapshot = await getDocs(collection(db, "parks"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setParks(data);
    };

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

    fetchParks();
    fetchFavorites();
  }, [currentUser]);

  const toggleFavorite = async (id) => {
    const isFav = favorites.includes(id);
    const updated = isFav
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);

    if (!currentUser) {
      localStorage.setItem("favorites", JSON.stringify(updated));
      toast.info("🔒 Log in to save favorites across devices");
    } else {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        favoriteParks: isFav ? arrayRemove(id) : arrayUnion(id),
      });
    }

    toast.success(
      isFav ? "❌ Removed from favorites" : "💖 Added to favorites"
    );
  };

  return (
    <Layout>
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
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
  );
}

export default App;