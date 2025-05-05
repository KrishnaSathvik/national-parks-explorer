// Favorites.jsx (enhanced with FadeInWrapper)
import React from "react";
import { useNavigate } from "react-router-dom";
import FadeInWrapper from "../components/FadeInWrapper";

const Favorites = ({ parks, favorites, toggleFavorite }) => {
  const navigate = useNavigate();

  if (parks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center font-sans">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to All Parks
        </button>
        <h2 className="text-2xl font-heading font-semibold mb-2">💔 No Favorites Yet</h2>
        <p className="text-gray-500">Click ❤️ on a national park to save it for later!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <button
        onClick={() => navigate("/")}
        className="text-blue-600 hover:underline text-sm mb-6 inline-block"
      >
        ← Back to All Parks
      </button>

      <h1 className="text-3xl font-heading font-bold mb-6">
        💖 Your Favorite National Parks
      </h1>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parks.map((park, idx) => (
          <FadeInWrapper key={park.id} delay={idx * 0.1}>
            <div
              className="border p-4 rounded shadow hover:shadow-md transition cursor-pointer bg-white relative"
              onClick={() => navigate(`/park/${park.id}?page=1`, { state: { from: "favorites" } })}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(park.id);
                }}
                className="absolute top-2 right-2 text-xl text-red-500 hover:scale-110 transition"
                title="Remove from favorites"
              >
                ❤️
              </button>
              <h2 className="text-xl font-heading font-semibold">{park.name}</h2>
              <p className="text-gray-600">{park.state}</p>
              <p className="text-sm text-gray-500 mt-1">
                📆 Best Season: {park.bestSeason || "All year"}
              </p>
            </div>
          </FadeInWrapper>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
