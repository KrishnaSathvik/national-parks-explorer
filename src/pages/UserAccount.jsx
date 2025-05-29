// src/pages/UserAccount.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  collection,
  query,
  where,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import SkeletonLoader from "../components/SkeletonLoader";
import FavoritesView from "../components/FavoritesView";
import { useToast } from "../context/ToastContext";

const UserAccount = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [userDoc, setUserDoc] = useState(null);
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [parksLoading, setParksLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserDoc(userData);

        const parksSnap = await getDocs(collection(db, "parks"));
        const allParks = parksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const favorites = allParks.filter((p) => userData.favoriteParks?.includes(p.id));
        setFavoriteParks(favorites);
        setParksLoading(false);

        const q = query(
          collection(db, "reviews"),
          where("author", "==", userData.displayName || currentUser.email)
        );
        const reviewSnap = await getDocs(q);
        setUserReviews(reviewSnap.docs.map((doc) => doc.data()));
      }
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const unsub = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setRawEvents(docSnap.data().favoriteEvents || []);
        setEventsLoading(false);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const handleRemoveFavorite = async (parkId) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { favoriteParks: arrayRemove(parkId) });
    showToast("❌ Removed park from favorites", "success");
  };

  const handleRemoveEvent = async (eventId) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const event = rawEvents.find((e) => e.id === eventId);
    if (event) {
      await updateDoc(userRef, { favoriteEvents: arrayRemove(event) });
      showToast("❌ Removed event from favorites", "success");
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
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold shadow-inner">
            {currentUser.email?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-pink-600 font-heading">My Account</h1>
        </div>

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
                  const userRef = doc(db, "users", currentUser.uid);
                  await updateDoc(userRef, { displayName: userDoc.displayName });
                  showToast("✅ Display name updated!", "success");
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-4 py-2 rounded-full text-sm shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Replaced favorites display with shared component */}
        <div className="hidden sm:block">
          <FavoritesView
            parks={favoriteParks}
            events={parsedEvents}
            onRemovePark={handleRemoveFavorite}
            onRemoveEvent={handleRemoveEvent}
            parksLoading={parksLoading}
            eventsLoading={eventsLoading}
          />
        </div>

        {userReviews.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-pink-600 mb-4">📝 My Reviews</h2>
            <ul className="space-y-4 text-sm">
              {userReviews.map((review, i) => (
                <li key={i} className="border-b pb-3">
                  <p className="italic text-gray-800">"{review.comment}"</p>
                  <p className="text-yellow-600">⭐ Rating: {review.rating} / 5</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-4 text-gray-700">🔔 Notification Preferences</h2>
          <div className="grid gap-4 max-w-lg">
            <PreferenceToggle label="Receive Blog Updates" field="blogUpdates" userId={currentUser.uid} currentValue={userDoc?.notificationPrefs?.blogUpdates ?? true} onSave={() => showToast("✅ Blog update preference saved!", "success")} />
            <PreferenceToggle label="Receive Park Alerts" field="parkAlerts" userId={currentUser.uid} currentValue={userDoc?.notificationPrefs?.parkAlerts ?? true} onSave={() => showToast("✅ Park alert preference saved!", "success")} />
            <PreferenceToggle label="Receive Weekly Tips" field="weeklyTips" userId={currentUser.uid} currentValue={userDoc?.notificationPrefs?.weeklyTips ?? true} onSave={() => showToast("✅ Weekly tips preference saved!", "success")} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PreferenceToggle = ({ label, field, userId, currentValue, onSave }) => {
  const [checked, setChecked] = useState(currentValue);
  const [saving, setSaving] = useState(false);

  const handleChange = async () => {
    setSaving(true);
    setChecked(!checked);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        [`notificationPrefs.${field}`]: !checked,
      });
      onSave();
    } catch (err) {
      console.error("❌ Failed to update preference:", err);
    }
    setSaving(false);
  };

  return (
    <label className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl shadow hover:shadow-md transition border">
      <div className="text-sm text-gray-700 font-medium">{label}</div>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={handleChange} disabled={saving} className="sr-only" />
        <div className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition ${checked ? "bg-pink-600" : "bg-gray-300"}`}>
          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? "translate-x-4" : "translate-x-0"}`} />
        </div>
      </div>
    </label>
  );
};

export default UserAccount;
