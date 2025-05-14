// src/pages/Favorites.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import FadeInWrapper from "../components/FadeInWrapper";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";

const Favorites = ({ parks, favorites, toggleFavorite }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [rawEvents, setRawEvents] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setRawEvents(docSnap.data().favoriteEvents || []);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleRemoveEvent = async (eventId) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const updated = rawEvents.find((e) => e.id === eventId);
    if (updated) {
      await updateDoc(userRef, {
        favoriteEvents: arrayRemove(updated),
      });
      toast.success("❌ Removed event from favorites");
    }
  };

  const parsedEvents = rawEvents.map((event) => {
    const safeStart = event?.start ? new Date(event.start) : null;
    const safeEnd = event?.end ? new Date(event.end) : safeStart;
    return {
      ...event,
      start: safeStart instanceof Date && !isNaN(safeStart) ? safeStart : null,
      end: safeEnd instanceof Date && !isNaN(safeEnd) ? safeEnd : null,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-sans">
      <button
        onClick={() => navigate("/")}
        className="text-pink-600 hover:underline text-sm mb-6 inline-block"
      >
        ← Back to All Parks
      </button>

      <h1 className="text-3xl font-bold text-center text-pink-600 mb-10">
        💖 Your Favorites
      </h1>

      {/* Empty State for Parks */}
      {parks.length === 0 && (
        <div className="text-center text-gray-500 mb-10">
          <p>💤 You haven’t favorited any parks yet.</p>
        </div>
      )}

      {/* Favorite Parks */}
      {parks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            🏞️ Favorite Parks
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parks.map((park, idx) => (
              <FadeInWrapper key={park.id} delay={idx * 0.1}>
                <div
                  className="bg-white p-5 rounded-xl border shadow hover:shadow-md transition cursor-pointer relative"
                  onClick={() =>
                    navigate(`/park/${park.id}?page=1`, {
                      state: { from: "favorites" },
                    })
                  }
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(park.id);
                      toast.info("❌ Removed park from favorites");
                    }}
                    className="absolute top-3 right-3 text-xl text-pink-500 hover:scale-110 transition"
                    title="Remove from favorites"
                  >
                    ❤️
                  </button>
                  <h2 className="text-lg font-semibold text-pink-600 truncate">
                    {park.name}
                  </h2>
                  <p className="text-sm text-gray-500">📍 {park.state}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    📆 Best Season:{" "}
                    {park.bestSeason && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${
                          park.bestSeason === "Summer"
                            ? "bg-yellow-100 text-yellow-800"
                            : park.bestSeason === "Winter"
                            ? "bg-blue-100 text-blue-800"
                            : park.bestSeason === "Spring"
                            ? "bg-green-100 text-green-800"
                            : park.bestSeason === "Fall"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {park.bestSeason}
                      </span>
                    )}
                  </p>
                </div>
              </FadeInWrapper>
            ))}
          </div>
        </section>
      )}

      {/* Empty State for Events */}
      {parsedEvents.length === 0 && (
        <div className="text-center text-gray-500 mb-10">
          <p>📭 You haven’t saved any events yet.</p>
        </div>
      )}

      {/* Favorite Events */}
      {parsedEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            📅 Favorite Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parsedEvents.map((event, idx) => (
              <FadeInWrapper key={event.id} delay={idx * 0.05}>
                <div className="bg-white rounded-xl p-5 border shadow hover:shadow-lg transition relative">
                  <button
                    onClick={() => handleRemoveEvent(event.id)}
                    className="absolute top-3 right-3 text-sm text-red-500 hover:underline"
                    title="Remove from favorites"
                  >
                    ❌ Remove
                  </button>
                  <h3 className="text-lg font-semibold text-pink-600 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    📍 {event.park || "Unknown Park"}
                  </p>
                  <p className="text-sm text-gray-600">
                    🗓️ {event.start ? event.start.toDateString() : "Unknown Date"}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    🕒{" "}
                    {event.start
                      ? event.start.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Unknown Time"}
                  </p>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm underline block mb-2"
                    >
                      🔗 Official Event Link
                    </a>
                  )}
                  <div
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        event.description || "No description available."
                      ),
                    }}
                  />
                </div>
              </FadeInWrapper>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Favorites;
