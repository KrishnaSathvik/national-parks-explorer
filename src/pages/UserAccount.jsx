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

const UserAccount = () => {
  const [currentUser] = useAuthState(auth);
  const [userDoc, setUserDoc] = useState(null);
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parksLoading, setParksLoading] = useState(true);
  const { showToast } = useToast();

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
          .filter(Boolean); // Remove undefined (i.e., parkId not found)

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
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRemoveFavorite = async (parkId) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      favoriteParks: arrayRemove(parkId),
    });
    showToast("❌ Removed park from favorites", "success");
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
      <div className="max-w-4xl mx-auto font-sans">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">👤 My Account</h1>

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">📌 Favorite Parks</h2>
          {parksLoading ? (
            <p className="text-gray-500">Loading favorites...</p>
          ) : favoriteParks.length === 0 ? (
            <p className="text-gray-400">You haven't added any favorite parks yet.</p>
          ) : (
            <ul className="space-y-3">
              {favoriteParks.map((park) => (
                <li
                  key={park.id}
                  className="bg-white shadow p-4 rounded-lg border border-pink-100 flex justify-between items-center"
                >
                  <Link
                    to={`/park/${park.slug}`}
                    className="text-pink-600 hover:underline font-medium"
                  >
                    {park.name}
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(park.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ❌ Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">📝 My Reviews</h2>
          {userReviews.length === 0 ? (
            <p className="text-gray-400">No reviews posted yet.</p>
          ) : (
            <ul className="space-y-3">
              {userReviews.map((review, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded-lg shadow border border-pink-100"
                >
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
      </div>
    </motion.div>
  );
};

export default UserAccount;
