// Favorites.jsx (final fix for real-time sync, date parsing, and remove bug)
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
  const [rawEvents, setRawEvents] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRawEvents(data.favoriteEvents || []);
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

  const noParkFavorites = parks.length === 0;
  const noEventFavorites = parsedEvents.length === 0;
  console.log("🔍 Raw Favorite Events from Firestore:", rawEvents);
  console.log("🧪 Parsed Events:", parsedEvents);

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
        
          {parsedEvents.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">📅 Favorite Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedEvents.map((event, idx) => (
                  <FadeInWrapper key={event.id} delay={idx * 0.05}>
                    <div className="bg-white rounded shadow p-4 border border-blue-100 hover:border-blue-300 relative">
                      <h3 className="text-lg font-semibold text-blue-700 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600">📍 {event.park || "Unknown Park"}</p>
                      <p className="text-sm text-gray-600">
                        🗓️ {event.start ? event.start.toDateString() : "Unknown Date"}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        🕒 {event.start ? event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Unknown Time"}
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
                        onClick={() => handleRemoveEvent(event.id)}
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
