    // Enhanced ParkDetails.jsx
    import React, { useEffect, useState } from "react";
    import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
    import {
      doc, getDoc, collection, addDoc, query, where,
      getDocs, serverTimestamp
    } from "firebase/firestore";
    import { db } from "../firebase";
    import { FaStar, FaRegStar } from "react-icons/fa";
    import Accordion from "./Accordion";
    import { motion } from "framer-motion";


    const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    const NPS_API_KEY = import.meta.env.VITE_NPS_API_KEY;


    const backgroundThemes = {
      acad: "bg-gradient-to-r from-blue-100 to-green-100",
      arch: "bg-gradient-to-r from-yellow-100 to-orange-100",
      badl: "bg-gradient-to-r from-red-100 to-yellow-200",
      bibe: "bg-gradient-to-r from-yellow-200 to-amber-300",
                bisc: "bg-gradient-to-r from-teal-100 to-blue-200",
              blca: "bg-gradient-to-r from-gray-200 to-gray-400",
              brca: "bg-gradient-to-r from-orange-100 to-red-200",
              cany: "bg-gradient-to-r from-red-100 to-yellow-100",
              care: "bg-gradient-to-r from-green-100 to-lime-100",
              cave: "bg-gradient-to-r from-gray-100 to-yellow-100",
              chis: "bg-gradient-to-r from-blue-100 to-indigo-100",
              cong: "bg-gradient-to-r from-emerald-100 to-lime-200",
              crla: "bg-gradient-to-r from-blue-200 to-indigo-200",
              cuva: "bg-gradient-to-r from-green-100 to-sky-100",
              dena: "bg-gradient-to-r from-blue-100 to-slate-200",
              drto: "bg-gradient-to-r from-cyan-100 to-teal-200",
              ever: "bg-gradient-to-r from-green-100 to-teal-100",
              gaar: "bg-gradient-to-r from-gray-300 to-blue-100",
              gate: "bg-gradient-to-r from-sky-100 to-blue-100",
              glac: "bg-gradient-to-r from-cool-gray-100 to-blue-200",
              glba: "bg-gradient-to-r from-sky-100 to-emerald-100",
              grca: "bg-gradient-to-r from-orange-100 to-red-100",
              grsa: "bg-gradient-to-r from-yellow-100 to-sand-200",
              grsm: "bg-gradient-to-r from-green-100 to-yellow-100",
              gumo: "bg-gradient-to-r from-orange-200 to-amber-200",
              hale: "bg-gradient-to-r from-teal-100 to-green-200",
              havo: "bg-gradient-to-r from-red-200 to-black",
              hosp: "bg-gradient-to-r from-pink-100 to-purple-100",
              indu: "bg-gradient-to-r from-blue-100 to-sky-200",
              isro: "bg-gradient-to-r from-blue-100 to-cyan-100",
              jotr: "bg-gradient-to-r from-yellow-100 to-orange-200",
              katm: "bg-gradient-to-r from-brown-200 to-gray-200",
              kefj: "bg-gradient-to-r from-blue-100 to-white",
              kica: "bg-gradient-to-r from-green-100 to-teal-100",
              kova: "bg-gradient-to-r from-gold-200 to-blue-100",
              lacl: "bg-gradient-to-r from-blue-200 to-slate-300",
              lavo: "bg-gradient-to-r from-red-100 to-yellow-100",
              maca: "bg-gradient-to-r from-green-100 to-blue-100",
              meve: "bg-gradient-to-r from-tan-100 to-red-200",
              mora: "bg-gradient-to-r from-blue-100 to-purple-100",
              neri: "bg-gradient-to-r from-green-100 to-orange-100",
              noca: "bg-gradient-to-r from-emerald-100 to-teal-100",
              olymp: "bg-gradient-to-r from-emerald-100 to-blue-100",
              pefo: "bg-gradient-to-r from-brown-100 to-orange-100",
              pinn: "bg-gradient-to-r from-red-100 to-yellow-200",
              redw: "bg-gradient-to-r from-green-100 to-emerald-200",
              romo: "bg-gradient-to-r from-blue-100 to-teal-200",
              sagu: "bg-gradient-to-r from-yellow-100 to-pink-100",
              seki: "bg-gradient-to-r from-lime-100 to-amber-100",
              shen: "bg-gradient-to-r from-green-200 to-yellow-200",
              thro: "bg-gradient-to-r from-orange-100 to-brown-100",
              viis: "bg-gradient-to-r from-cyan-100 to-teal-200",
              voya: "bg-gradient-to-r from-sky-100 to-indigo-100",
              whsa: "bg-gradient-to-r from-white to-sand-100",
              wica: "bg-gradient-to-r from-green-100 to-gold-100",
              wrst: "bg-gradient-to-r from-blue-100 to-ice-200",
              yell: "bg-gradient-to-r from-gold-100 to-orange-100",
              yose: "bg-gradient-to-r from-gray-100 to-blue-200",
              zion: "bg-gradient-to-r from-pink-100 to-red-200",
              jeff: "bg-gradient-to-r from-sky-100 to-indigo-100",
              npsa: "bg-gradient-to-r from-cyan-100 to-sky-200",
      
    };

    const ParkDetails = () => {
      const [park, setPark] = useState(null);
      const { id } = useParams();
      const [searchParams] = useSearchParams();
      const location = useLocation();
      const from = location.state?.from;
      const page = searchParams.get("page") || 1;

      const [weather, setWeather] = useState([]);
      const [alerts, setAlerts] = useState([]);
      const [reviews, setReviews] = useState([]);
      const [newReview, setNewReview] = useState({ author: "", comment: "", rating: "" });
      const [hoverRating, setHoverRating] = useState(0);
      const [editingIndex, setEditingIndex] = useState(null);
      const [editComment, setEditComment] = useState("");
      const [successMessage, setSuccessMessage] = useState("");
      const [fadeOut, setFadeOut] = useState(false);

      const averageRating = reviews.length
        ? (
            reviews.reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0) / reviews.length
          ).toFixed(1)
        : null;

      useEffect(() => {
        const fetchPark = async () => {
          const snap = await getDoc(doc(db, "parks", id));
          if (snap.exists()) setPark(snap.data());
        };
        fetchPark();
      }, [id]);

      useEffect(() => {
        const fetchReviews = async () => {
          const q = query(collection(db, "reviews"), where("parkId", "==", id));
          const snapshot = await getDocs(q);
          setReviews(snapshot.docs.map((doc) => doc.data()));
        };
        fetchReviews();
      }, [id]);

      useEffect(() => {
        if (!park?.name) return;
        const fetchWeather = async () => {
          const res = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${park.coordinates}&days=7`
          );
          const data = await res.json();
          setWeather(data.forecast?.forecastday || []);
        };
        fetchWeather();
      }, [park]);

      useEffect(() => {
        if (!park?.parkCode) return;
        const fetchAlerts = async () => {
          const res = await fetch(
            `https://developer.nps.gov/api/v1/alerts?parkCode=${park.parkCode}&api_key=${NPS_API_KEY}`
          );
          const data = await res.json();
          setAlerts(data.data || []);
        };
        fetchAlerts();
      }, [park]);

      const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.author || !newReview.comment || !newReview.rating) return;

        await addDoc(collection(db, "reviews"), {
          ...newReview,
          rating: parseInt(newReview.rating),
          parkId: id,
          timestamp: serverTimestamp(),
          likes: 0,
        });

        setSuccessMessage("✅ Review submitted successfully!");
        setFadeOut(false);
        setTimeout(() => setFadeOut(true), 3000);
        setTimeout(() => setSuccessMessage(""), 4000);
        setNewReview({ author: "", comment: "", rating: "" });

        const q = query(collection(db, "reviews"), where("parkId", "==", id));
        const snapshot = await getDocs(q);
        setReviews(snapshot.docs.map((doc) => doc.data()));
      };

      const handleLike = async (index) => {
        const likedKey = `liked-${id}-${index}`;
        if (localStorage.getItem(likedKey)) return;

        const q = query(collection(db, "reviews"), where("parkId", "==", id));
        const snapshot = await getDocs(q);
        const docRef = snapshot.docs[index].ref;
        const currentLikes = snapshot.docs[index].data().likes || 0;

        await docRef.update({ likes: currentLikes + 1 });
        localStorage.setItem(likedKey, "true");

        const updatedSnapshot = await getDocs(q);
        setReviews(updatedSnapshot.docs.map((doc) => doc.data()));
      };

      const saveEditedReview = async (index) => {
        const q = query(collection(db, "reviews"), where("parkId", "==", id));
        const snapshot = await getDocs(q);
        const docRef = snapshot.docs[index].ref;
        await docRef.update({ comment: editComment });

        const updatedSnapshot = await getDocs(q);
        setReviews(updatedSnapshot.docs.map((doc) => doc.data()));
        setEditingIndex(null);
        setEditComment("");
      };

      if (!park) return <div className="p-6">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`max-w-6xl mx-auto px-4 py-6 ${
        backgroundThemes[park.parkCode] || "bg-white"
      }`}
    >
      <div className="sticky top-0 z-10 bg-white py-2">
        <Link
          to={from === "favorites" ? "/favorites" : `/?page=${page}`}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-xl shadow-xl transition-all"
      >
        {/* Park Name and Info */}
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-gray-900">{park.name}</h1>
        <p className="text-gray-600">{park.state}</p>
        <p className="text-sm">📍 {park.coordinates}</p>
        <p className="text-sm mb-4">🗓️ Best Season: {park.bestSeason}</p>

        {/* Weather */}
        {weather.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-50 p-4 rounded mb-6"
          >
            <h2 className="text-lg font-bold mb-2">🌤️ 3-Day Weather Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {weather.map((day) => (
                <div key={day.date} className="bg-white border p-3 rounded shadow">
                  <p className="font-semibold text-center">{day.date}</p>
                  <img src={day.day.condition.icon} alt="" className="mx-auto" />
                  <p className="text-center">{day.day.condition.text}</p>
                  <p>High: {day.day.maxtemp_f}°F</p>
                  <p>Low: {day.day.mintemp_f}°F</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Best Time */}
        {park.bestTimeToVisit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-xl font-bold">📅 Best Time to Visit</h2>
            <ul className="list-disc ml-6 text-gray-700">
              {Object.entries(park.bestTimeToVisit).map(([season, desc]) => (
                <li key={season}>
                  <strong className="capitalize">{season}:</strong> {desc}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Travel Tips */}
        {park.travelTips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <Accordion title="✈️ Travel Tips">
              {/* Insert travel tips content here */}
            </Accordion>
          </motion.div>
        )}

        {/* Places, Foods, Hotels */}
        {["placesToVisit", "nearbyFoods", "hotelsAndCampgrounds"].map((key, i) =>
          park[key]?.length > 0 ? (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="mb-6"
            >
              <h2 className="text-xl font-bold mb-4">
                {key === "placesToVisit"
                  ? "🏞️ Top Places to Visit"
                  : key === "nearbyFoods"
                  ? "🍽️ Nearby Food Spots"
                  : "🛌 Hotels & Campgrounds"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {park[key].map((item, idx) => (
                  <div
                    key={idx}
                    className="border rounded shadow p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        item.name + " " + park.name
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      View on Map
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null
        )}

        {/* User Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-6"
        >
          <Accordion title="📝 User Reviews">
                    <div className="text-sm">
              {averageRating && (
                <div className="text-yellow-600 font-semibold mb-2 flex items-center gap-2">
                  <span className="flex items-center">
                    {[...Array(5)].map((_, i) =>
                      i < Math.round(averageRating) ? <FaStar key={i} /> : <FaRegStar key={i} />
                    )}
                  </span>
                  <span className="text-sm text-gray-700">Average Rating: {averageRating} / 5</span>
                </div>
              )}
              {/* Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newReview.author}
                  onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Your Comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm h-20"
                />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {star <= (hoverRating || newReview.rating) ? (
                        <FaStar className="text-yellow-500" />
                      ) : (
                        <FaRegStar className="text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!newReview.author || !newReview.comment || !newReview.rating}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  Submit Review
                </button>
              </form>

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r, idx) => (
                    <li key={idx} className="bg-gray-50 border p-3 rounded">
                      <p className="font-semibold text-gray-800 flex justify-between items-center">
                        {r.author}
                        <span className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) =>
                            i < r.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                          )}
                        </span>
                      </p>
                      {editingIndex === idx ? (
                        <>
                          <textarea
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                          />
                          <button
                            className="text-green-600 text-xs mt-1"
                            onClick={() => saveEditedReview(idx)}
                          >
                            💾 Save
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="italic text-sm">"{r.comment}"</p>
                          {r.author === newReview.author && (
                            <button
                              onClick={() => {
                                setEditingIndex(idx);
                                setEditComment(r.comment);
                              }}
                              className="text-blue-600 text-xs mt-1 hover:underline"
                            >
                              ✏️ Edit
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleLike(idx)}
                        className="text-blue-600 text-xs mt-1 hover:underline block"
                      >
                        👍 Like ({r.likes || 0})
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {r.timestamp?.seconds
                          ? new Date(r.timestamp.seconds * 1000).toLocaleString()
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              </div>
          </Accordion>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
export default ParkDetails;
