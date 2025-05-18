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
  import FadeInWrapper from "../components/FadeInWrapper";
  import SkeletonLoader from "../components/SkeletonLoader";
  import DOMPurify from "dompurify";
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

    // 🧠 Load user, favorites, reviews
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
          const allParks = parksSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const favorites = allParks.filter((p) =>
            userData.favoriteParks?.includes(p.id)
          );
          setFavoriteParks(favorites);
          setParksLoading(false);

          const reviewsRef = collection(db, "reviews");
          const q = query(
            reviewsRef,
            where("author", "==", userData.displayName || currentUser.email)
          );
          const reviewSnap = await getDocs(q);
          setUserReviews(reviewSnap.docs.map((doc) => doc.data()));
        }

        setLoading(false);
      };

      fetchData();
    }, [currentUser]);

    // 🔁 Listen for favorite event changes
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

    // ❌ Remove favorite park
    const handleRemoveFavorite = async (parkId) => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        favoriteParks: arrayRemove(parkId),
      });
      showToast("❌ Removed park from favorites", "success");
    };

    // ❌ Remove favorite event
    const handleRemoveEvent = async (eventId) => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      const event = rawEvents.find((e) => e.id === eventId);
      if (event) {
        await updateDoc(userRef, {
          favoriteEvents: arrayRemove(event),
        });
        showToast("❌ Removed event from favorites", "success");
      }
    };

    // 📅 Safe date parsing
    const parsedEvents = rawEvents.map((event) => {
      const safeStart = event?.start ? new Date(event.start) : null;
      const safeEnd = event?.end ? new Date(event.end) : safeStart;
      return {
        ...event,
        start: safeStart instanceof Date && !isNaN(safeStart) ? safeStart : null,
        end: safeEnd instanceof Date && !isNaN(safeEnd) ? safeEnd : null,
      };
    });

    // 🔐 Login prompt
    if (!currentUser) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-10 font-sans text-center">
          <h1 className="text-2xl font-bold text-pink-600 mb-4">
            Please log in to view your account.
          </h1>
          <Link
            to="/login"
            className="bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600"
          >
            🔐 Go to Login
          </Link>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen px-4 py-8 font-sans bg-gradient-to-br from-white via-pink-50 to-white"
      >
        <div className="mb-4">
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            ← Back to Explore
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold mb-6 text-pink-600">
            👤 My Account
          </h1>

          {/* 🧾 Account Info */}
          <div className="grid gap-4 mb-6">
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>UID:</strong> {currentUser.uid}</p>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Display Name:
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input
                  type="text"
                  value={userDoc?.displayName || ""}
                  onChange={(e) =>
                    setUserDoc((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  className="border px-3 py-2 rounded text-sm w-full sm:max-w-xs"
                  placeholder="Enter your name"
                />
                <button
                  onClick={async () => {
                    const userRef = doc(db, "users", currentUser.uid);
                    await updateDoc(userRef, { displayName: userDoc.displayName });
                    showToast("✅ Display name updated!", "success");
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-5 py-2 rounded-full text-sm shadow transition"
                >
                  ✅ Save Name
                </button>
              </div>
            </div>
          </div>

          {/* 💖 Favorite Parks */}
          <div className="mt-10">
            <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-4 text-gray-700">💖 Favorite Parks</h2>
            {parksLoading ? (
              <SkeletonLoader type="card" count={3} />
            ) : favoriteParks.length === 0 ? (
              <p className="text-gray-500">💤 You haven’t favorited any parks yet.</p>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteParks.map((park, idx) => (
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
                          handleRemoveFavorite(park.id);
                        }}
                        className="absolute top-3 right-3 text-xl text-pink-500 hover:scale-110 transition"
                        title="Remove from favorites"
                      >
                        ❤️
                      </button>
                      <h2 className="text-lg font-semibold text-pink-600 leading-snug break-words">
                        {park.name}
                      </h2>
                      <p className="text-sm text-gray-500">📍 {park.state}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📆 Best Season:{" "}
                        {park.bestSeason && (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            park.bestSeason === "Summer"
                              ? "bg-yellow-100 text-yellow-800"
                              : park.bestSeason === "Winter"
                              ? "bg-blue-100 text-blue-800"
                              : park.bestSeason === "Spring"
                              ? "bg-green-100 text-green-800"
                              : park.bestSeason === "Fall"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {park.bestSeason}
                          </span>
                        )}
                      </p>
                    </div>
                  </FadeInWrapper>
                ))}
              </div>
            )}
          </div>

          {/* 📅 Favorite Events */}
          <div className="mt-10">
            <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-4 text-gray-700">📅 Favorite Events</h2>
            {eventsLoading ? (
              <SkeletonLoader type="box" count={2} />
            ) : parsedEvents.length === 0 ? (
              <p className="text-gray-500">📭 You haven’t saved any events yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8">
                {parsedEvents.map((event, idx) => (
                  <FadeInWrapper key={event.id} delay={idx * 0.05}>
                    <div className="bg-white rounded-xl p-5 sm:p-6 border shadow hover:shadow-lg transition relative">
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
                      <p className="text-sm text-gray-600">📍 {event.park || "Unknown Park"}</p>
                      <p className="text-sm text-gray-600">
                        🗓️ {event.start ? event.start.toDateString() : "Unknown Date"}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        🕒 {event.start
                          ? event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
                          __html: DOMPurify.sanitize(event.description || "No description available."),
                        }}
                      />
                    </div>
                  </FadeInWrapper>
                ))}
              </div>
            )}
          </div>

          {/* 📝 Reviews */}
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
        </div>
        {/* 🔔 Notification Preferences */}
        <div className="mt-10">
          <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-4 text-gray-700">🔔 Notification Preferences</h2>

          <div className="grid gap-4 max-w-lg">
            <PreferenceToggle
              label="Receive Blog Updates"
              field="blogUpdates"
              userId={currentUser.uid}
              currentValue={userDoc?.notificationPrefs?.blogUpdates ?? true}
              onSave={() => showToast("✅ Blog update preference saved!", "success")}
            />
            <PreferenceToggle
              label="Receive Park Alerts"
              field="parkAlerts"
              userId={currentUser.uid}
              currentValue={userDoc?.notificationPrefs?.parkAlerts ?? true}
              onSave={() => showToast("✅ Park alert preference saved!", "success")}
            />
            <PreferenceToggle
              label="Receive Weekly Tips"
              field="weeklyTips"
              userId={currentUser.uid}
              currentValue={userDoc?.notificationPrefs?.weeklyTips ?? true}
              onSave={() => showToast("✅ Weekly tips preference saved!", "success")}
            />
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
          [`notificationPrefs.${field}`]: !checked
        });
        onSave();
      } catch (err) {
        console.error("Failed to update preference", err);
      }
      setSaving(false);
    };

    return (
      <label className="flex items-center gap-4 p-4 border rounded-lg shadow-sm bg-white">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={saving}
          className="h-5 w-5 text-pink-600"
        />
        <span className="text-gray-700 text-sm">{label}</span>
      </label>
    );
  };

  export default UserAccount;
