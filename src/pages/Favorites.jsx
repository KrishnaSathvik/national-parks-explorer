import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import FavoritesView from "../components/FavoritesView";

const Favorites = () => {
  const { currentUser } = useAuth();
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // Fetch all parks from Firestore
        const parksSnap = await getDocs(collection(db, "parks"));
        const allParks = parksSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Match user favorites
        const matchedParks = allParks.filter((p) =>
          userData.favoriteParks?.includes(p.id)
        );

        setFavoriteParks(matchedParks);
        setFavoriteEvents(userData.favoriteEvents || []);
      }

      setLoading(false);
    };

    fetchFavorites();
  }, [currentUser]);

  if (!currentUser) {
    return <p className="text-center py-8 text-gray-600">Please log in to view your favorites.</p>;
  }

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-pink-600">🌟 Your Favorites</h1>
      <FavoritesView
        parks={favoriteParks}
        events={favoriteEvents}
        parksLoading={loading}
        eventsLoading={loading}
      />
    </div>
  );
};

export default Favorites;
