// Favorites.jsx (with real-time Firestore sync for favorite events)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import FadeInWrapper from "../components/FadeInWrapper";
import DOMPurify from "dompurify";

const Favorites = ({ parks, favorites, toggleFavorite }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [favoriteEvents, setFavoriteEvents] = useState([]);

  // ✅ Real-time sync with Firestore
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavoriteEvents(data.favoriteEvents || []);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [currentUser]);

  const handleRemoveEvent = async (event) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      favoriteEvents: arrayRemove(event),
    });
  };

  const noParkFavorites = parks.length === 0;
  const noEventFavorites = favoriteEvents.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <button
        onClick={() => navigate("/")}
        className="text-blue-600 hover:underline text-sm mb-6 inline-block"
      >
        ← Back to All Parks
      </button>

      <h1 className="text-3xl font-heading font-bold mb-6">
        💖 Your Favorites (Parks & Events)
      </h1>

      {noParkFavorites && noEventFavorites ? (
        <div className="text-center">
          <h2 className="text-2xl font-heading font-semibold mb-2">💔 No Favorites Yet</h2>
          <p className="text-gray-500">Save parks or events to see them here.</p>
        </div>
      ) : (
        <>
          {/* Favorite Parks */}
          {parks.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">🏞️ Favorite Parks</h2>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
            </>
          )}

          {/* Favorite Events */}
          {favoriteEvents.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">📅 Favorite Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteEvents.map((event, idx) => (
                  <FadeInWrapper key={event.id} delay={idx * 0.05}>
                    <div className="bg-white rounded shadow p-4 border border-blue-100 hover:border-blue-300 relative">
                      <h3 className="text-lg font-semibold text-blue-700 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600">📍 {event.park}</p>
                      <p className="text-sm text-gray-600">🗓️ {new Date(event.start).toDateString()}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        🕒 {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {event.url && (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm underline"
                        >
                          🔗 Official Event Link
                        </a>
                      )}
                      <div
                        className="text-gray-700 text-sm mt-2"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(event.description || "No description available."),
                        }}
                      />
                      <button
                        onClick={() => handleRemoveEvent(event)}
                        className="absolute top-2 right-2 text-red-500 text-sm underline hover:text-red-700"
                      >
                        ❌ Remove
                      </button>
                    </div>
                  </FadeInWrapper>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
