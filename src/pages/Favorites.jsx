// src/pages/Favorites.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import FavoritesView from "../components/FavoritesView";

const Favorites = () => {
  const { currentUser } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) return;
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserDoc(snap.data());
      }
      setLoading(false);
    };
    fetchUser();
  }, [currentUser]);

  if (!currentUser) {
    return <p className="text-center py-8 text-gray-600">Please log in to view your favorites.</p>;
  }

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-pink-600">🌟 Your Favorites</h1>
      <FavoritesView
        parks={userDoc?.favoriteParks || []}
        events={userDoc?.favoriteEvents || []}
        parksLoading={loading}
        eventsLoading={loading}
      />
    </div>
  );
};

export default Favorites;
