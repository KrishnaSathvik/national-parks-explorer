// src/pages/Favorites.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { currentUser } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      setUserDoc(userData);

      // Fetch all parks
      const parkSnap = await getDocs(collection(db, "parks"));
      const parks = parkSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const favorites = parks.filter((p) =>
        userData.favoriteParks?.includes(p.id)
      );
      setFavoriteParks(favorites);

      setFavoriteEvents(userData.favoriteEvents || []);
    };
    fetchData();
  }, [currentUser]);

  if (!currentUser)
    return (
      <p className="text-center text-pink-600 py-10">
        Please log in to view your favorites.
      </p>
    );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-pink-600">🌟 Your Favorites</h1>
      <div className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">💖 Favorite Parks</h2>
          {favoriteParks.length === 0 ? (
            <p className="text-gray-500 text-sm">No favorite parks yet.</p>
          ) : (
            <ul className="space-y-3">
              {favoriteParks.map((park) => (
                <li
                  key={park.id}
                  onClick={() =>
                    navigate(`/park/${park.slug}?id=${park.id}`, {
                      state: { from: "favorites" },
                    })
                  }
                  className="p-4 bg-white border rounded-xl shadow hover:shadow-md cursor-pointer transition"
                >
                  <h3 className="text-lg font-medium text-pink-600">{park.name}</h3>
                  <p className="text-sm text-gray-500">📍 {park.state}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">📅 Favorite Events</h2>
          {favoriteEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No favorite events yet.</p>
          ) : (
            <ul className="space-y-3">
              {favoriteEvents.map((event) => (
                <li key={event.id} className="bg-white p-4 rounded-xl shadow border">
                  <h4 className="text-pink-600 font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-600">📍 {event.park}</p>
                  <p className="text-sm text-gray-600">
                    🗓️ {event.start ? new Date(event.start).toDateString() : "No date"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
