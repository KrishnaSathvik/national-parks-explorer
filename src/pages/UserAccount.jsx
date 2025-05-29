import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  arrayRemove,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import useIsMobile from "../hooks/useIsMobile"; // 📱 custom hook
import FavoritesView from "../components/FavoritesView";

const UserAccount = () => {
  const [currentUser] = useAuthState(auth);
  const [userDoc, setUserDoc] = useState(null);
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parksLoading, setParksLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const { showToast } = useToast();
  const isMobile = useIsMobile(); // detect viewport

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserDoc(userData);

        const parksSnap = await getDocs(collection(db, "parks"));
        const allParks = parksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const favorites = userData.favoriteParks
          ?.map(id => allParks.find(p => p.id === id))
          .filter(Boolean);
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

        const q = query(
          collection(db, "reviews"),
          where("author", "==", userData.displayName || currentUser.email)
        );
        const reviewSnap = await getDocs(q);
        setUserReviews(reviewSnap.docs.map((doc) => doc.data()));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRemoveFavorite = async (parkId) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "users", currentUser.uid), {
      favoriteParks: arrayRemove(parkId),
    });
    showToast("❌ Removed park from favorites", "success");
  };

  const handleRemoveEvent = async (eventId) => {
    const event = favoriteEvents.find((e) => e.id === eventId);
    if (event) {
      await updateDoc(doc(db, "users", currentUser.uid), {
        favoriteEvents: arrayRemove(event),
      });
      showToast("❌ Removed event from favorites", "success");
    }
  };

  const PreferenceToggle = ({ label, field }) => {
    const [checked, setChecked] = useState(userDoc?.notificationPrefs?.[field] ?? true);
    const [saving, setSaving] = useState(false);

    const handleChange = async () => {
      setSaving(true);
      await updateDoc(doc(db, "users", currentUser.uid), {
        [`notificationPrefs.${field}`]: !checked,
      });
      setChecked(!checked);
      showToast(`✅ ${label} preference updated`, "success");
      setSaving(false);
    };

    return (
      <label className="flex justify-between items-center p-4 bg-white rounded-lg shadow border text-sm font-medium text-gray-700">
        {label}
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={saving}
          className="w-5 h-5 text-pink-600"
        />
      </label>
    );
  };

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto px-4 py-10 text-center"
      >
        <h1 className="text-2xl font-bold text-pink-600 mb-4">Please log in to view your account.</h1>
        <Link to="/login" className="bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600">
          🔐 Go to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white px-4 py-8"
    >
      <div className="mb-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to Explore
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-xl max-w-7xl mx-auto border border-white">
        {/* Account Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold shadow-inner">
            {currentUser.email?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-pink-600 font-heading">My Account</h1>
        </div>

        {/* Email & Name */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="text-gray-700 text-sm">
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>UID:</strong> {currentUser.uid}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Display Name:</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={userDoc?.displayName || ""}
                onChange={(e) => setUserDoc((prev) => ({ ...prev, displayName: e.target.value }))}
                className="border px-3 py-2 rounded text-sm w-full sm:max-w-xs shadow-sm"
                placeholder="Enter your name"
              />
              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", currentUser.uid), { displayName: userDoc.displayName });
                  showToast("✅ Display name updated!", "success");
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-4 py-2 rounded-full text-sm shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Only show FavoritesView on desktop */}
        {!isMobile && (
          <FavoritesView
            parks={favoriteParks}
            events={favoriteEvents}
            onRemovePark={handleRemoveFavorite}
            onRemoveEvent={handleRemoveEvent}
            parksLoading={parksLoading}
            eventsLoading={eventsLoading}
          />
        )}

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">📝 My Reviews</h2>
          {userReviews.length === 0 ? (
            <p className="text-gray-400">No reviews posted yet.</p>
          ) : (
            <ul className="space-y-3">
              {userReviews.map((review, index) => (
                <li key={index} className="bg-white p-4 rounded-lg shadow border">
                  <h3 className="font-semibold text-pink-600">{review.parkName || "Unnamed Park"}</h3>
                  <p className="text-gray-700 mt-1">{review.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ⭐ {review.rating} ·{" "}
                    {review.date?.seconds
                      ? new Date(review.date.seconds * 1000).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔔 Notification Preferences</h2>
          <div className="grid gap-4 max-w-lg">
            <PreferenceToggle label="Receive Blog Updates" field="blogUpdates" />
            <PreferenceToggle label="Receive Park Alerts" field="parkAlerts" />
            <PreferenceToggle label="Receive Weekly Tips" field="weeklyTips" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserAccount;
