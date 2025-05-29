// src/pages/Favorites.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import FavoriteParks from "../components/FavoriteParks";
import FavoriteEvents from "../components/FavoriteEvents";

const Favorites = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return <p className="text-center">Please log in to view your favorites.</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-pink-600">🌟 Your Favorites</h1>
      <FavoriteParks userId={currentUser.uid} />
      <FavoriteEvents userId={currentUser.uid} />
    </div>
  );
};

export default Favorites;
