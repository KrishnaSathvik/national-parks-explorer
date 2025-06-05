// ✨ Enhanced ParkDetails.jsx - Advanced UI with Rich Features
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  doc, getDoc, collection, addDoc, query, where,
  getDocs, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShare, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaMoneyBillWave, FaRoute, FaCamera, FaHiking, FaInfoCircle, FaChevronRight, FaArrowLeft, FaEye, FaThumbsUp, FaEdit, FaSave, FaTimes, FaPlus, FaMap, FaUtensils, FaBed, FaMountain, FaLeaf, FaWater, FaSun, FaSnowflake, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaPhoneAlt, FaGlobe, FaDirections } from "react-icons/fa";
import Accordion from "./Accordion";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../components/SkeletonLoader";
import ShareButtons from "../components/ShareButtons";
import FadeInWrapper from "../components/FadeInWrapper";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const NPS_API_KEY = import.meta.env.VITE_NPS_API_KEY;

// Enhanced background themes with more sophisticated gradients
const backgroundThemes = {
  acad: "from-blue-400 via-cyan-400 to-teal-400",
  arch: "from-orange-400 via-red-400 to-pink-400",
  badl: "from-amber-400 via-orange-400 to-red-400",
  bibe: "from-yellow-400 via-amber-400 to-orange-400",
  bisc: "from-teal-400 via-cyan-400 to-blue-400",
  blca: "from-gray-400 via-slate-400 to-gray-500",
  brca: "from-orange-400 via-red-400 to-rose-400",
  cany: "from-red-400 via-orange-400 to-yellow-400",
  care: "from-green-400 via-emerald-400 to-teal-400",
  cave: "from-gray-400 via-yellow-400 to-orange-400",
  chis: "from-blue-400 via-indigo-400 to-purple-400",
  cong: "from-emerald-400 via-green-400 to-lime-400",
  crla: "from-blue-400 via-indigo-400 to-purple-400",
  cuva: "from-green-400 via-teal-400 to-cyan-400",
  dena: "from-blue-400 via-slate-400 to-gray-400",
  drto: "from-cyan-400 via-teal-400 to-blue-400",
  ever: "from-green-400 via-teal-400 to-emerald-400",
  gaar: "from-gray-400 via-blue-400 to-indigo-400",
  gate: "from-blue-400 via-cyan-400 to-teal-400",
  glac: "from-blue-400 via-cyan-400 to-teal-400",
  glba: "from-cyan-400 via-blue-400 to-indigo-400",
  grca: "from-orange-400 via-red-400 to-pink-400",
  grsa: "from-yellow-400 via-amber-400 to-orange-400",
  grsm: "from-green-400 via-emerald-400 to-teal-400",
  gumo: "from-orange-400 via-amber-400 to-yellow-400",
  hale: "from-teal-400 via-green-400 to-emerald-400",
  havo: "from-red-400 via-orange-400 to-black",
  hosp: "from-pink-400 via-purple-400 to-indigo-400",
  indu: "from-blue-400 via-cyan-400 to-teal-400",
  isro: "from-blue-400 via-cyan-400 to-teal-400",
  jotr: "from-yellow-400 via-orange-400 to-red-400",
  katm: "from-amber-400 via-orange-400 to-red-400",
  kefj: "from-blue-400 via-cyan-400 to-white",
  kica: "from-green-400 via-teal-400 to-cyan-400",
  kova: "from-yellow-400 via-amber-400 to-orange-400",
  lacl: "from-blue-400 via-slate-400 to-gray-400",
  lavo: "from-red-400 via-orange-400 to-yellow-400",
  maca: "from-green-400 via-blue-400 to-indigo-400",
  meve: "from-amber-400 via-orange-400 to-red-400",
  mora: "from-blue-400 via-purple-400 to-indigo-400",
  neri: "from-green-400 via-yellow-400 to-orange-400",
  noca: "from-emerald-400 via-teal-400 to-cyan-400",
  olymp: "from-emerald-400 via-green-400 to-teal-400",
  pefo: "from-amber-400 via-orange-400 to-red-400",
  pinn: "from-red-400 via-pink-400 to-purple-400",
  redw: "from-green-400 via-emerald-400 to-teal-400",
  romo: "from-blue-400 via-teal-400 to-cyan-400",
  sagu: "from-yellow-400 via-pink-400 to-purple-400",
  seki: "from-green-400 via-lime-400 to-yellow-400",
  shen: "from-green-400 via-emerald-400 to-teal-400",
  thro: "from-orange-400 via-amber-400 to-yellow-400",
  viis: "from-cyan-400 via-teal-400 to-blue-400",
  voya: "from-blue-400 via-indigo-400 to-purple-400",
  whsa: "from-white via-gray-100 to-gray-200",
  wica: "from-green-400 via-yellow-400 to-amber-400",
  wrst: "from-blue-400 via-cyan-400 to-teal-400",
  yell: "from-yellow-400 via-amber-400 to-orange-400",
  yose: "from-gray-400 via-blue-400 to-indigo-400",
  zion: "from-pink-400 via-red-400 to-orange-400",
  jeff: "from-blue-400 via-indigo-400 to-purple-400",
  npsa: "from-cyan-400 via-blue-400 to-indigo-400",
};

// Enhanced weather icon mapping
const getWeatherIcon = (condition) => {
  const icons = {
    sunny: "☀️",
    clear: "🌤️",
    cloudy: "☁️",
    rain: "🌧️",
    snow: "❄️",
    storm: "⛈️",
    fog: "🌫️",
    wind: "💨"
  };
  
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) return icons.sunny;
  if (conditionLower.includes('cloud')) return icons.cloudy;
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return icons.rain;
  if (conditionLower.includes('snow')) return icons.snow;
  if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return icons.storm;
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return icons.fog;
  if (conditionLower.includes('wind')) return icons.wind;
  return icons.clear;
};

// Enhanced activity icon mapping
const getActivityIcon = (activity) => {
  const activityLower = activity.toLowerCase();
  if (activityLower.includes('hiking')) return <FaHiking />;
  if (activityLower.includes('photo')) return <FaCamera />;
  if (activityLower.includes('water')) return <FaWater />;
  if (activityLower.includes('mountain')) return <FaMountain />;
  if (activityLower.includes('wildlife')) return <FaLeaf />;
  return <FaHiking />;
};

// Enhanced breadcrumb component
const Breadcrumb = ({ park, fromAccount, fromFavorites, currentPage }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button
        onClick={() => navigate("/")}
        className="text-white/80 hover:text-white transition-colors"
      >
        🏠 Home
      </button>
      <FaChevronRight className="text-white/60 text-xs" />
      
      {fromAccount && (
        <>
          <button
            onClick={() => navigate("/account")}
            className="text-white/80 hover:text-white transition-colors"
          >
            👤 Account
          </button>
          <FaChevronRight className="text-white/60 text-xs" />
        </>
      )}
      
      {fromFavorites && (
        <>
          <span className="text-white/80">❤️ Favorites</span>
          <FaChevronRight className="text-white/60 text-xs" />
        </>
      )}
      
      <span className="text-white font-medium">{park?.name || 'Loading...'}</span>
    </div>
  );
};

// Enhanced stats card component with better data
const StatCard = ({ icon, label, value, color, delay = 0, subtitle }) => (
    <FadeInWrapper delay={delay}>
      <motion.div
          whileHover={{ scale: 1.05 }}
          className={`bg-gradient-to-br ${color} p-4 md:p-6 rounded-2xl text-white shadow-lg transform transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl md:text-3xl">{icon}</div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
            Live
          </div>
        </div>
        <div className="text-xl md:text-2xl font-bold mb-1">{value}</div>
        <div className="text-white/90 font-medium text-sm">{label}</div>
        {subtitle && (
            <div className="text-white/70 text-xs mt-1">{subtitle}</div>
        )}
      </motion.div>
    </FadeInWrapper>
);

// Helper functions for formatting data
const formatParkSize = (size) => {
  if (!size) return 'Size varies';
  if (typeof size === 'number') {
    if (size > 1000000) return `${(size / 1000000).toFixed(1)}M acres`;
    if (size > 1000) return `${(size / 1000).toFixed(1)}k acres`;
    return `${size} acres`;
  }
  return size;
};

const formatVisitorCount = (visitors) => {
  if (!visitors) return 'Popular destination';
  if (typeof visitors === 'number') {
    if (visitors > 1000000) return `${(visitors / 1000000).toFixed(1)}M`;
    if (visitors > 1000) return `${(visitors / 1000).toFixed(0)}k`;
    return visitors.toLocaleString();
  }
  return visitors;
};

const formatEstablishedYear = (established) => {
  if (!established) return 'Historic';
  if (typeof established === 'number') {
    const currentYear = new Date().getFullYear();
    const age = currentYear - established;
    return `${established} (${age} years)`;
  }
  return established;
};

// Updated Quick Stats section for ParkDetails
const renderQuickStats = (park, averageRating, reviews) => {
  return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
            icon="🏛️"
            label="Established"
            value={formatEstablishedYear(park.established)}
            subtitle="Years of conservation"
            color="from-blue-500 to-indigo-500"
            delay={0.1}
        />
        <StatCard
            icon="📏"
            label="Park Size"
            value={formatParkSize(park.size)}
            subtitle="Protected area"
            color="from-green-500 to-emerald-500"
            delay={0.2}
        />
        <StatCard
            icon="👥"
            label="Annual Visitors"
            value={formatVisitorCount(park.annualVisitors)}
            subtitle="People visit yearly"
            color="from-purple-500 to-pink-500"
            delay={0.3}
        />
        <StatCard
            icon="⭐"
            label="Average Rating"
            value={averageRating ? `${averageRating}/5` : 'No reviews'}
            subtitle={`${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
            color="from-yellow-500 to-orange-500"
            delay={0.4}
        />
      </div>
  );
};

// Enhanced park information section
const EnhancedParkInfo = ({ park }) => {
  const parkFacts = [
    {
      icon: '🗓️',
      label: 'Established',
      value: formatEstablishedYear(park.established),
      color: 'text-blue-600'
    },
    {
      icon: '📐',
      label: 'Total Area',
      value: formatParkSize(park.size),
      color: 'text-green-600'
    },
    {
      icon: '👥',
      label: 'Annual Visitors',
      value: formatVisitorCount(park.annualVisitors),
      color: 'text-purple-600'
    },
    {
      icon: '🌡️',
      label: 'Climate',
      value: park.climate || 'Varies by season',
      color: 'text-orange-600'
    },
    {
      icon: '🚗',
      label: 'Nearest City',
      value: park.nearestCity || 'Multiple access points',
      color: 'text-cyan-600'
    },
    {
      icon: '⏰',
      label: 'Operating Hours',
      value: park.hours || '24 hours (typical)',
      color: 'text-indigo-600'
    }
  ];

  return (
      <FadeInWrapper delay={0.5}>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 rounded-2xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📊 Park Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkFacts.map((fact, index) => (
                <FadeInWrapper key={fact.label} delay={index * 0.1}>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{fact.icon}</span>
                      <span className={`font-semibold ${fact.color}`}>{fact.label}</span>
                    </div>
                    <div className="text-gray-800 font-medium">{fact.value}</div>
                  </div>
                </FadeInWrapper>
            ))}
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Enhanced weather card component
const WeatherCard = ({ day, index }) => (
  <FadeInWrapper delay={index * 0.1}>
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="group bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
    >
      <div className="text-center">
        <p className="font-semibold text-gray-800 mb-3">
          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
        
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
          {getWeatherIcon(day.day.condition.text)}
        </div>
        
        <p className="text-gray-700 text-sm mb-3 font-medium">{day.day.condition.text}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">High</span>
            <span className="font-bold text-red-500">{day.day.maxtemp_f}°F</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Low</span>
            <span className="font-bold text-blue-500">{day.day.mintemp_f}°F</span>
          </div>
          {day.day.daily_chance_of_rain > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Rain</span>
              <span className="font-medium text-cyan-500">{day.day.daily_chance_of_rain}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </FadeInWrapper>
);

// Enhanced review card component
const ReviewCard = ({ review, index, isEditing, editComment, onEdit, onSave, onCancel, onLike, parkId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const likedKey = `liked-${parkId}-${index}`;
    setIsLiked(localStorage.getItem(likedKey) === 'true');
  }, [parkId, index]);

  const handleLike = () => {
    if (isLiked) return;
    onLike(index);
    setIsLiked(true);
  };

  return (
    <FadeInWrapper delay={index * 0.1}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-r from-white to-gray-50 p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {review.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800">{review.author}</p>
              <p className="text-xs text-gray-500">
                {review.timestamp?.seconds
                  ? new Date(review.timestamp.seconds * 1000).toLocaleDateString()
                  : 'Recently'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, j) =>
              j < review.rating ? (
                <FaStar key={j} className="text-yellow-500" />
              ) : (
                <FaRegStar key={j} className="text-gray-300" />
              )
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="w-full border-2 border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
              value={editComment}
              onChange={(e) => onEdit(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
              >
                <FaSave /> Save
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 leading-relaxed mb-4 italic">"{review.comment}"</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition ${
                    isLiked
                      ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                  }`}
                >
                  <FaThumbsUp className={isLiked ? 'text-blue-500' : ''} />
                  {review.likes || 0}
                </button>
                
                {currentUser && review.author === currentUser.displayName && (
                  <button
                    onClick={() => onEdit(review.comment)}
                    className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm hover:bg-yellow-200 transition"
                  >
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
              
              <div className="text-xs text-gray-400">
                {review.timestamp?.seconds
                  ? new Date(review.timestamp.seconds * 1000).toLocaleString()
                  : ''}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </FadeInWrapper>
  );
};

// Enhanced activity section
const ActivitySection = ({ title, icon, items, park }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!items || items.length === 0) return null;

  return (
    <FadeInWrapper delay={0.3}>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className="text-gray-600 text-sm">{items.length} option{items.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaChevronDown className="text-gray-400" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100"
            >
              <div className="p-6 space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-pink-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            item.name + " " + park.name
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-200 transition"
                        >
                          <FaMap /> Map
                        </a>
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium hover:bg-green-200 transition"
                          >
                            <FaPhoneAlt /> Call
                          </a>
                        )}
                        {item.website && (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium hover:bg-purple-200 transition"
                          >
                            <FaGlobe /> Site
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    {item.price && (
                      <div className="mt-2 flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-500" />
                        <span className="text-sm font-medium text-green-600">{item.price}</span>
                      </div>
                    )}
                    {item.hours && (
                      <div className="mt-2 flex items-center gap-2">
                        <FaClock className="text-blue-500" />
                        <span className="text-sm text-gray-600">{item.hours}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeInWrapper>
  );
};

// Main ParkDetails component
const ParkDetails = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const parkId = searchParams.get("id");
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const fromAccount = location.state?.from === "account" || location.state?.from === "favorites";
  const fromFavorites = location.state?.from === "favorites";
  const currentPage = searchParams.get("page") || 1;
  
  // State management
  const [park, setPark] = useState(null);
  const [weather, setWeather] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ author: "", comment: "", rating: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  // SEO and structured data
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

  // Fetch park data
  useEffect(() => {
    const fetchPark = async () => {
      try {
        const q = query(collection(db, "parks"), where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const parkData = snapshot.docs[0].data();
          setPark(parkData);
          
          // Check if favorited
          if (currentUser) {
            const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.uid}`) || '[]');
            setIsFavorite(favorites.includes(snapshot.docs[0].id));
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching park:', error);
        setNotFound(true);
      }
    };

    fetchPark();
  }, [slug, currentUser]);

  // Fetch reviews
  useEffect(() => {
    if (!parkId) return;
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const q = query(collection(db, "reviews"), where("parkId", "==", parkId));
        const snapshot = await getDocs(q);
        const reviewsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [parkId]);

  // Fetch weather
  useEffect(() => {
    if (!park?.coordinates) return;
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${park.coordinates}&days=5`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data.forecast?.forecastday || []);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };
    fetchWeather();
  }, [park]);

  // Fetch alerts
  useEffect(() => {
    if (!park?.parkCode) return;
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true);
        const res = await fetch(
          `https://developer.nps.gov/api/v1/alerts?parkCode=${park.parkCode}&api_key=${NPS_API_KEY}`
        );
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchAlerts();
  }, [park]);

  // Event handlers
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.author || !newReview.comment || !newReview.rating) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        ...newReview,
        rating: parseInt(newReview.rating),
        parkId: parkId,
        timestamp: serverTimestamp(),
        likes: 0,
      });

      showToast("✅ Review submitted successfully!", "success");
      setNewReview({ author: "", comment: "", rating: "" });

      // Refresh reviews
      const q = query(collection(db, "reviews"), where("parkId", "==", parkId));
      const snapshot = await getDocs(q);
      const reviewsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast("❌ Failed to submit review", "error");
    }
  };

  const handleLike = async (index) => {
    const likedKey = `liked-${parkId}-${index}`;
    if (localStorage.getItem(likedKey)) return;
    
    try {
      // Update like count logic here
      localStorage.setItem(likedKey, "true");
      showToast("👍 Thanks for the like!", "success");
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleFavorite = () => {
    if (!currentUser) {
      showToast("Please sign in to save favorites", "error");
      return;
    }

    const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.uid}`) || '[]');
    const parkDocId = parkId; // Assuming parkId is the document ID
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter(id => id !== parkDocId);
      localStorage.setItem(`favorites_${currentUser.uid}`, JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      showToast("💔 Removed from favorites", "info");
    } else {
      const updatedFavorites = [...favorites, parkDocId];
      localStorage.setItem(`favorites_${currentUser.uid}`, JSON.stringify(updatedFavorites));
      setIsFavorite(true);
      showToast("❤️ Added to favorites!", "success");
    }
  };

  const startEditReview = (index, comment) => {
    setEditingIndex(index);
    setEditComment(comment);
  };

  const saveEditedReview = async () => {
    try {
      // Save logic would go here
      setEditingIndex(null);
      setEditComment("");
      showToast("✅ Review updated!", "success");
    } catch (error) {
      console.error('Error updating review:', error);
      showToast("❌ Failed to update review", "error");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditComment("");
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏞️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Park Not Found</h1>
          <p className="text-gray-600 mb-6">The park you're looking for doesn't exist or has been moved.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
          >
            <FaArrowLeft /> Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  if (!park) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl w-1/3"></div>
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const gradientClass = backgroundThemes[park?.parkCode?.toLowerCase()] || "from-blue-400 to-purple-400";
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          
          {/* Dynamic Hero Section */}
          <div className={`relative bg-gradient-to-r ${gradientClass} p-6 md:p-8 text-white overflow-hidden`}>
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
            
            <div className="relative z-10">
              {/* Breadcrumb */}
              <Breadcrumb 
                park={park}
                fromAccount={fromAccount}
                fromFavorites={fromFavorites}
                currentPage={currentPage}
              />
              
              <FadeInWrapper delay={0.1}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold mb-4 leading-tight">
                          {park.name}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                            <FaMapMarkerAlt />
                            <span className="font-medium">{park.state}</span>
                          </div>
                          
                          {park.bestSeason && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                              <span>
                                {park.bestSeason === 'Spring' && '🌸'}
                                {park.bestSeason === 'Summer' && '🌞'}
                                {park.bestSeason === 'Fall' && '🍂'}
                                {park.bestSeason === 'Winter' && '❄️'}
                              </span>
                              <span className="font-medium">Best: {park.bestSeason}</span>
                            </div>
                          )}
                          
                          {park.entryFee && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                              <FaMoneyBillWave />
                              <span className="font-medium">
                                {park.entryFee > 0 ? `${park.entryFee}` : 'Free'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {park.highlight && (
                          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-4xl">
                            {park.highlight}
                          </p>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex flex-col gap-3 ml-6">
                        {currentUser && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleFavorite}
                            className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                              isFavorite 
                                ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30' 
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            {isFavorite ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
                          </motion.button>
                        )}
                        
                        <ShareButtons title={park.name} />
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate('/trip-planner', { 
                            state: { 
                              preloadedTrip: {
                                title: `Trip to ${park.name}`,
                                parks: [{
                                  parkId: parkId,
                                  parkName: park.name,
                                  state: park.state,
                                  coordinates: park.coordinates
                                }]
                              }
                            }
                          })}
                          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200"
                          title="Plan a trip to this park"
                        >
                          <FaRoute className="text-xl" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInWrapper>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                icon="🏞️" 
                label="National Park"
                value="Established"
                color="from-green-500 to-emerald-500"
                delay={0.1}
              />
              <StatCard 
                icon="⭐" 
                label="Average Rating"
                value={averageRating ? `${averageRating}/5` : 'No reviews'}
                color="from-yellow-500 to-orange-500"
                delay={0.2}
              />
              <StatCard 
                icon="💬" 
                label="Total Reviews"
                value={reviews.length}
                color="from-blue-500 to-cyan-500"
                delay={0.3}
              />
              <StatCard 
                icon="🎯" 
                label="Best Season"
                value={park.bestSeason || 'Year-round'}
                color="from-purple-500 to-pink-500"
                delay={0.4}
              />
            </div>

            {/* Alerts Section */}
            {alertsLoading ? (
              <SkeletonLoader type="line" count={2} />
            ) : alerts.length > 0 && (
              <FadeInWrapper delay={0.5}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-500 p-6 rounded-2xl shadow-lg"
                >
                  <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                    ⚠️ Important Park Alerts
                  </h3>
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map((alert, i) => (
                      <div key={i} className="bg-white/50 p-4 rounded-xl">
                        <h4 className="font-semibold text-yellow-800 mb-2">{alert.title}</h4>
                        <p className="text-yellow-700 text-sm">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeInWrapper>
            )}

            {/* Weather Forecast */}
            <div>
              <FadeInWrapper delay={0.6}>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  🌦️ Weather Forecast
                  <span className="text-sm font-normal text-gray-500">Next 5 days</span>
                </h2>
              </FadeInWrapper>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {weather.length > 0 ? weather.map((day, index) => (
                  <WeatherCard key={day.date} day={day} index={index} />
                )) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48"></div>
                  ))
                )}
              </div>
            </div>

            {/* Best Time To Visit */}
            {park.bestTimeToVisit && (
              <FadeInWrapper delay={0.7}>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 md:p-8 rounded-2xl border border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    📅 Best Time to Visit
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(park.bestTimeToVisit).map(([season, desc]) => (
                      <div key={season} className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">
                            {season.toLowerCase() === 'spring' && '🌸'}
                            {season.toLowerCase() === 'summer' && '🌞'}
                            {season.toLowerCase() === 'fall' && '🍂'}
                            {season.toLowerCase() === 'winter' && '❄️'}
                          </span>
                          <h3 className="font-bold text-gray-800 capitalize">{season}</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {/* Travel Tips */}
            {park.travelTips && (
              <FadeInWrapper delay={0.8}>
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 md:p-8 rounded-2xl border border-green-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    ✈️ Essential Travel Tips
                  </h2>
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{park.travelTips}</p>
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {/* Activity Sections */}
            <div className="space-y-6">
              <ActivitySection
                title="Places to Visit"
                icon="🏞️"
                items={park.placesToVisit}
                park={park}
              />
              
              <ActivitySection
                title="Food & Dining"
                icon="🍽️"
                items={park.nearbyFoods}
                park={park}
              />
              
              <ActivitySection
                title="Hotels & Campgrounds"
                icon="🛌"
                items={park.hotelsAndCampgrounds}
                park={park}
              />
            </div>

            {/* Enhanced Reviews Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 md:p-8 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                    📝 Visitor Reviews
                  </h2>
                  {averageRating && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) =>
                          i < Math.round(averageRating) ? 
                            <FaStar key={i} className="text-yellow-500" /> : 
                            <FaRegStar key={i} className="text-gray-300" />
                        )}
                      </div>
                      <span className="text-lg font-semibold text-gray-700">
                        {averageRating} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Form */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl mb-8 border border-white/20">
                <h3 className="font-bold text-gray-800 mb-4">Share Your Experience</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReview.author}
                      onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
                      required
                    />
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            {star <= (hoverRating || newReview.rating) ? (
                              <FaStar className="text-yellow-500 text-xl" />
                            ) : (
                              <FaRegStar className="text-gray-300 text-xl" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <textarea
                    placeholder="Share your experience at this beautiful park..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all h-32 resize-none"
                    required
                  />
                  
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Submit Review
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-32"></div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💭</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedReviews.map((review, index) => (
                    <ReviewCard
                      key={review.id || index}
                      review={review}
                      index={index}
                      isEditing={editingIndex === index}
                      editComment={editComment}
                      onEdit={setEditComment}
                      onSave={saveEditedReview}
                      onCancel={cancelEdit}
                      onLike={handleLike}
                      parkId={parkId}
                    />
                  ))}
                  
                  {reviews.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
                      >
                        {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Related Actions */}
            <FadeInWrapper delay={1.0}>
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Explore More</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-pink-300 group"
                  >
                    <FaArrowLeft className="text-pink-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-gray-800">Back to Explorer</div>
                      <div className="text-sm text-gray-600">Discover more parks</div>
                    </div>
                  </Link>
                  
                  <Link
                    to="/seasonal"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group"
                  >
                    <FaCalendarAlt className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-gray-800">Seasonal Guide</div>
                      <div className="text-sm text-gray-600">Best times to visit</div>
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => navigate('/trip-planner')}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-purple-300 group"
                  >
                    <FaRoute className="text-purple-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-gray-800">Plan Your Trip</div>
                      <div className="text-sm text-gray-600">Create custom itinerary</div>
                    </div>
                  </button>
                </div>
              </div>
            </FadeInWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkDetails;