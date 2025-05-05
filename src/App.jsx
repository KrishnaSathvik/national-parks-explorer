import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import ParkDetails from "./pages/ParkDetails";
import MapPage from "./pages/MapPage";
import Layout from "./components/Layout"; // ⬅️ use your global layout wrapper
import CalendarView from "./pages/CalendarView";

function App() {
  const [parks, setParks] = useState([]);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );

  useEffect(() => {
    const fetchParks = async () => {
      const snapshot = await getDocs(collection(db, "parks"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setParks(data);
    };
    fetchParks();
  }, []);

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <Layout> {/* ✅ Now all pages inherit fonts, layout, etc */}
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
        <Route path="/park/:id" element={<ParkDetails />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Routes>
    </Layout>
  );
}

export default App;
