// ✅ Polished ParkDetails.jsx (Airbnb-style layout, rich UI)
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
import SkeletonLoader from "../components/SkeletonLoader";
import ShareButtons from "../components/ShareButtons";

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
  
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const parkId = searchParams.get("id");
  const location = useLocation();
  const from = location.state?.from;
  const page = searchParams.get("page") || 1;
  const [park, setPark] = useState(null);
  const [weather, setWeather] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ author: "", comment: "", rating: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;


  useEffect(() => {
    if (!park) return;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Place",
      name: park.name,
      address: {
        "@type": "PostalAddress",
        addressCountry: "USA",
        addressRegion: park.state,
      },
      description: park.highlight || "",
      url: `https://www.nationalparksexplorerusa.com/park/${park.slug}`,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerText = JSON.stringify(jsonLd);
    script.id = "park-structured-data";
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("park-structured-data");
      if (existing) document.head.removeChild(existing);
    };
  }, [park]);

  useEffect(() => {
    const fetchPark = async () => {
      const q = query(collection(db, "parks"), where("slug", "==", slug));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setPark(snapshot.docs[0].data());
      } else {
        setNotFound(true); // Optional error handling
      }
    };

    fetchPark();
  }, [slug]);

  useEffect(() => {
    if (!parkId) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      const q = query(collection(db, "reviews"), where("parkId", "==", parkId));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map((doc) => doc.data()));
      setReviewsLoading(false);
    };
    fetchReviews();
  }, [parkId]);

  useEffect(() => {
    if (!park?.name) return;
    const fetchWeather = async () => {
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${park.coordinates}&days=3`);
      const data = await res.json();
      setWeather(data.forecast?.forecastday || []);
    };
    fetchWeather();
  }, [park]);

  useEffect(() => {
    if (!park?.parkCode) return;
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true);
        const res = await fetch(
          `https://developer.nps.gov/api/v1/alerts?parkCode=${park.parkCode}&api_key=${NPS_API_KEY}`
        );
        const data = await res.json();
        setAlerts(data.data || []);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchAlerts();
  }, [park]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment || !newReview.rating) return;
    await addDoc(collection(db, "reviews"), {
      ...newReview,
      rating: parseInt(newReview.rating),
      parkId: parkId,
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
    const likedKey = `liked-${parkId}-${index}`;
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

  if (!park) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SkeletonLoader type="line" count={3} />
        <SkeletonLoader type="box" count={2} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`min-h-screen px-4 py-8 font-sans ${backgroundThemes[park?.parkCode?.toLowerCase()] || "bg-white"}`}
    >
      <div className="max-w-5xl mx-auto">
        <Link
          to={from === "favorites" ? "/favorites" : `/?page=${page}`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to parks
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-800 leading-snug break-words">
              {park.name}
            </h1>
            <ShareButtons title={park.name} />
          </div>

          <p className="text-sm text-gray-500">📍 {park.state} — {park.coordinates}</p>
          <p className="mt-1 inline-block bg-pink-100 text-pink-700 text-xs font-medium px-3 py-1 rounded-full">
            🗓️ Best Season: {park.bestSeason}
          </p>

          {/* Alerts */}
          {alertsLoading ? (
            <SkeletonLoader type="line" count={2} />
          ) : alerts.length > 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mt-6 text-sm">
              <h3 className="font-semibold text-yellow-700 mb-1">⚠️ Park Alerts</h3>
              <ul className="list-disc ml-5 text-yellow-800">
                {alerts.map((alert, i) => (
                  <li key={i}>{alert.title}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weather */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">🌦️ 3-Day Weather Forecast</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {weather.length > 0 ? weather.map((day) => (
                <div key={day.date} className="bg-gray-50 p-4 rounded-xl shadow">
                  <p className="font-medium text-center">{day.date}</p>
                  <img src={day.day.condition.icon} alt="" className="mx-auto" />
                  <p className="text-center">{day.day.condition.text}</p>
                  <p className="text-center">H: {day.day.maxtemp_f}°F</p>
                  <p className="text-center">L: {day.day.mintemp_f}°F</p>
                </div>
              )) : <SkeletonLoader type="card" count={3} />}
            </div>
          </div>
          {/* Best Time To Visit */}
          {park.bestTimeToVisit && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">📅 Best Time to Visit</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                {Object.entries(park.bestTimeToVisit).map(([season, desc]) => (
                  <li key={season}>
                    <strong className="capitalize">{season}:</strong> {desc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Travel Tips */}
          {park.travelTips && (
            <div className="mt-8">
              <Accordion title="✈️ Travel Tips">
                <p className="text-gray-700 text-sm leading-relaxed">{park.travelTips}</p>
              </Accordion>
            </div>
          )}

          {/* Dynamic Lists (Places, Food, Hotels) */}
          {["placesToVisit", "nearbyFoods", "hotelsAndCampgrounds"].map((key) =>
            park[key]?.length > 0 ? (
              <div key={key} className="mt-8">
                <h2 className="text-xl font-semibold mb-3">
                  {key === "placesToVisit"
                    ? "🏞️ Places to Visit"
                    : key === "nearbyFoods"
                    ? "🍽️ Food Spots"
                    : "🛌 Hotels & Campgrounds"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {park[key].map((item, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg shadow hover:bg-gray-100 transition">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          item.name + " " + park.name
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        View on Map
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}

          {/* User Reviews */}
          <div className="mt-10">
            <Accordion title="📝 User Reviews">
              {averageRating && (
                <div className="flex items-center gap-2 text-yellow-600 mb-2">
                  {[...Array(5)].map((_, i) =>
                    i < Math.round(averageRating) ? <FaStar key={i} /> : <FaRegStar key={i} />
                  )}
                  <span className="text-sm text-gray-700">Avg Rating: {averageRating} / 5</span>
                </div>
              )}

              {/* Review Form */}
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
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded text-sm"
                >
                  Submit Review
                </button>
              </form>

              {/* Review List */}
              {reviewsLoading ? (
                <SkeletonLoader type="line" count={3} />
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {reviews.map((r, i) => (
                    <li key={i} className="bg-white p-3 rounded shadow">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800">{r.author}</p>
                        <span className="flex text-yellow-500">
                          {[...Array(5)].map((_, j) =>
                            j < r.rating ? <FaStar key={j} /> : <FaRegStar key={j} />
                          )}
                        </span>
                      </div>
                      {editingIndex === i ? (
                        <>
                          <textarea
                            className="w-full border rounded px-2 py-1"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                          />
                          <button
                            className="text-green-600 text-xs mt-1"
                            onClick={() => saveEditedReview(i)}
                          >
                            💾 Save
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="italic text-sm mt-1">"{r.comment}"</p>
                          {r.author === newReview.author && (
                            <button
                              onClick={() => {
                                setEditingIndex(i);
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
                        onClick={() => handleLike(i)}
                        className="text-blue-600 text-xs mt-1 hover:underline"
                      >
                        👍 Like ({r.likes || 0})
                      </button>
                      <p className="text-xs text-gray-400">
                        {r.timestamp?.seconds
                          ? new Date(r.timestamp.seconds * 1000).toLocaleString()
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Accordion>
            </div>
          </div>
        </div>
    </motion.div>
  );
};

export default ParkDetails;
