import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FavoritesView from "../components/FavoritesView";
import SkeletonLoader from "../components/SkeletonLoader";
import useIsMobile from "../hooks/useIsMobile";

const Favorites = () => {
  const { currentUser } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [parksLoading, setParksLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        setUserDoc(userData);

        const parksSnap = await getDocs(collection(db, "parks"));
        const allParks = parksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const favorites = allParks.filter((p) => userData.favoriteParks?.includes(p.id));
        setFavoriteParks(favorites);
        setParksLoading(false);

        const parsedEvents = (userData.favoriteEvents || []).map((event) => {
          const safeStart = event?.start ? new Date(event.start) : null;
          const safeEnd = event?.end ? new Date(event.end) : safeStart;
          return {
            ...event,
            start: safeStart instanceof Date && !isNaN(safeStart) ? safeStart : null,
            end: safeEnd instanceof Date && !isNaN(safeEnd) ? safeEnd : null,
          };
        });
        setFavoriteEvents(parsedEvents);
        setEventsLoading(false);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      }
    };

    fetchData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto px-4 py-10 text-center"
      >
        <h1 className="text-2xl font-bold text-pink-600 mb-4">Please log in to view your favorites.</h1>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white px-4 py-6 sm:py-8"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl max-w-5xl mx-auto p-4 sm:p-6 border border-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-pink-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold shadow-inner">
            {currentUser.email?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 font-heading">My Favorites</h1>
        </div>

        {parksLoading && eventsLoading ? (
          <SkeletonLoader />
        ) : (
          <FavoritesView
            parks={favoriteParks}
            events={favoriteEvents}
            onRemovePark={() => {}}
            onRemoveEvent={() => {}}
            parksLoading={parksLoading}
            eventsLoading={eventsLoading}
            hideRemoveButtons
          />
        )}
      </div>
    </motion.div>
  );
};

export default Favorites;
