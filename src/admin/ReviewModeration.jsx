import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../context/ToastContext";

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reviews"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      showToast("❌ Failed to fetch reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      showToast("🗑️ Review deleted", "success");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      showToast("❌ Failed to delete review", "error");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-pink-600 mb-6 text-center">
        🗂️ Review Moderation
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">⏳ Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-400">🚫 No reviews available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border rounded-xl p-5 shadow hover:shadow-md transition relative"
            >
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium text-pink-600">{review.user}</span>{" "}
                on <span className="font-semibold">{review.parkName}</span>
              </p>
              <p className="text-gray-800 text-sm mb-4">{review.text}</p>
              <button
                onClick={() => handleDelete(review.id)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
