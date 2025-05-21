// ✅ Polished ReviewModeration.jsx UI
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewSnap = await getDocs(collection(db, "reviews"));
        const reviewData = reviewSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const deleteReview = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this review?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(reviews.filter((r) => r.id !== id));
      alert("✅ Review deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("❌ Failed to delete review.");
    }
  };

  const filteredReviews = reviews.filter((r) =>
    r.parkId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gradient-to-br from-white via-pink-50 to-pink-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-pink-700 mb-6">🛠 Review Moderation</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by park ID or author..."
        className="mb-6 p-3 border border-gray-300 rounded-full w-full max-w-xl shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-2xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">Park ID</th>
              <th className="p-4">Author</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Comment</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{r.parkId}</td>
                <td className="p-4 text-gray-700">{r.author}</td>
                <td className="p-4 text-yellow-600">{r.rating}⭐</td>
                <td className="p-4 max-w-md break-words text-gray-600">{r.comment}</td>
                <td className="p-4">
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewModeration;