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
  import useIsMobile from "../hooks/useIsMobile";
  import FadeInWrapper from "../components/FadeInWrapper";
  import {
    FaUser,
    FaHeart,
    FaCalendarAlt,
    FaBell,
    FaCog,
    FaChartBar,
    FaRoute,
    FaMapMarkerAlt,
    FaDollarSign,
    FaTrophy,
    FaEdit,
    FaTrash,
    FaEye,
    FaStar,
    FaFire,
    FaCrown,
    FaMedal,
    FaGlobe,
    FaCamera,
    FaPlus,
    FaArrowLeft,
    FaShieldAlt,
    FaBookmark,
    FaCompass,
    FaGem
  } from "react-icons/fa";

  const UserAccount = () => {
    const [currentUser] = useAuthState(auth);
    const [userDoc, setUserDoc] = useState(null);
    const [favoriteParks, setFavoriteParks] = useState([]);
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [parksLoading, setParksLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const { showToast } = useToast();
    const isMobile = useIsMobile();

    // Enhanced user stats calculation
    const [userStats, setUserStats] = useState({
      totalFavorites: 0,
      totalReviews: 0,
      totalEvents: 0,
      memberSince: null,
      adventureLevel: 'Explorer',
      achievements: []
    });

    useEffect(() => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const unsubscribe = onSnapshot(userRef, async (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserDoc(userData);

          // Fetch parks
          const parksSnap = await getDocs(collection(db, "parks"));
          const allParks = parksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const favorites = userData.favoriteParks?.map((id) => allParks.find((p) => p.id === id)).filter(Boolean);
          setFavoriteParks(favorites);
          setParksLoading(false);

          // Parse events
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

          // Fetch reviews
          const q = query(
            collection(db, "reviews"),
            where("author", "==", userData.displayName || currentUser.email)
          );

          const reviewSnap = await getDocs(q);
          const reviews = reviewSnap.docs.map((doc) => doc.data());
          console.log("Review data structure:", reviews[0]); // Check the first review
          setUserReviews(reviews);

          // Calculate enhanced stats
          calculateUserStats(userData, favorites, parsedEvents, reviews);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [currentUser]);

    const calculateUserStats = (userData, favorites, events, reviews) => {
      const memberSince = userData.createdAt?.toDate() || new Date();
      const daysSinceMember = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24));
      
      // Calculate adventure level
      const totalActivity = favorites.length + reviews.length + events.length;
      let adventureLevel = 'Explorer';
      let levelIcon = '🧭';
      
      if (totalActivity >= 50) {
        adventureLevel = 'Legend';
        levelIcon = '👑';
      } else if (totalActivity >= 30) {
        adventureLevel = 'Master';
        levelIcon = '🏆';
      } else if (totalActivity >= 15) {
        adventureLevel = 'Expert';
        levelIcon = '⭐';
      } else if (totalActivity >= 5) {
        adventureLevel = 'Adventurer';
        levelIcon = '🎒';
      }

      // Calculate achievements
      const achievements = [];
      if (favorites.length >= 10) achievements.push({ title: 'Park Collector', icon: '🏞️', description: '10+ favorite parks' });
      if (reviews.length >= 5) achievements.push({ title: 'Reviewer', icon: '📝', description: '5+ reviews written' });
      if (events.length >= 3) achievements.push({ title: 'Event Enthusiast', icon: '🎪', description: '3+ events saved' });
      if (daysSinceMember >= 365) achievements.push({ title: 'Veteran Explorer', icon: '🎖️', description: '1+ year member' });
      if (reviews.some(r => r.rating >= 5)) achievements.push({ title: 'Five Star', icon: '⭐', description: 'Gave 5-star review' });

      setUserStats({
        totalFavorites: favorites.length,
        totalReviews: reviews.length,
        totalEvents: events.length,
        memberSince,
        adventureLevel,
        levelIcon,
        achievements,
        totalActivity
      });
    };

    const handleRemoveFavorite = async (parkId) => {
      if (!currentUser) return;
      await updateDoc(doc(db, "users", currentUser.uid), {
        favoriteParks: arrayRemove(parkId),
      });
      showToast("❌ Removed park from favorites", "success");
    };

    const handleRemoveEvent = async (eventIndex) => {
      const event = favoriteEvents[eventIndex];
      if (event) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          favoriteEvents: arrayRemove(event),
        });
        showToast("❌ Removed event from favorites", "success");
      }
    };

    const handleDisplayNameUpdate = async () => {
      if (!userDoc?.displayName?.trim()) {
        showToast("Please enter a valid name", "error");
        return;
      }
      
      await updateDoc(doc(db, "users", currentUser.uid), { 
        displayName: userDoc.displayName.trim() 
      });
      showToast("✅ Display name updated!", "success");
    };

    const PreferenceToggle = ({ label, field, description }) => {
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
        <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{label}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        </div>
      );
    };

    const tabs = [
      { id: 'overview', title: 'Overview', icon: FaChartBar, description: 'Your adventure dashboard' },
      { id: 'favorites', title: 'Favorites', icon: FaHeart, description: 'Saved parks & events' },
      { id: 'reviews', title: 'Reviews', icon: FaStar, description: 'Your park reviews' },
      { id: 'achievements', title: 'Achievements', icon: FaTrophy, description: 'Your badges & milestones' },
      { id: 'settings', title: 'Settings', icon: FaCog, description: 'Account preferences' }
    ];

    if (!currentUser) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white">
              <div className="text-6xl mb-6">🔐</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Required</h1>
              <p className="text-gray-600 mb-8">Please log in to view your adventure profile and manage your account.</p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaShieldAlt />
                Go to Login
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
            
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-6 md:p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
              
              <div className="relative z-10">
                <FadeInWrapper delay={0.1}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="bg-white/20 backdrop-blur-sm w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold border-2 border-white/30">
                          {currentUser.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                          {userStats.levelIcon}
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
                          {userDoc?.displayName || 'Adventure Seeker'}
                        </h1>
                        <div className="flex items-center gap-2 text-sm md:text-base text-purple-100">
                          <span className="bg-white/20 px-3 py-1 rounded-full">
                            {userStats.adventureLevel}
                          </span>
                          <span>•</span>
                          <span>{userStats.totalActivity} total activities</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                    >
                      <FaArrowLeft />
                      <span className="hidden md:inline">Back to Explore</span>
                      <span className="md:hidden">Back</span>
                    </Link>
                  </div>
                </FadeInWrapper>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex min-w-max">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 font-medium transition-all duration-300 min-w-max ${
                          isActive
                            ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                            : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                      >
                        <Icon className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <div className="text-left">
                          <div className="font-semibold text-sm md:text-base">{tab.title}</div>
                          <div className="text-xs text-gray-500 hidden lg:block">{tab.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6 md:space-y-8">
                  {/* Stats Cards */}
                  <FadeInWrapper delay={0.2}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {[
                        { 
                          label: 'Favorite Parks', 
                          value: userStats.totalFavorites, 
                          icon: FaHeart, 
                          color: 'from-red-500 to-pink-500',
                          description: 'Parks you love'
                        },
                        { 
                          label: 'Reviews Written', 
                          value: userStats.totalReviews, 
                          icon: FaStar, 
                          color: 'from-yellow-500 to-orange-500',
                          description: 'Your contributions'
                        },
                        { 
                          label: 'Events Saved', 
                          value: userStats.totalEvents, 
                          icon: FaCalendarAlt, 
                          color: 'from-blue-500 to-cyan-500',
                          description: 'Upcoming adventures'
                        },
                        { 
                          label: 'Achievements', 
                          value: userStats.achievements.length, 
                          icon: FaTrophy, 
                          color: 'from-purple-500 to-indigo-500',
                          description: 'Badges earned'
                        }
                      ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <FadeInWrapper key={stat.label} delay={index * 0.1}>
                            <div className={`group bg-gradient-to-br ${stat.color} p-4 md:p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
                              <div className="flex items-center justify-between mb-2">
                                <Icon className="text-2xl md:text-3xl opacity-80" />
                                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                  Live
                                </div>
                              </div>
                              <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                              <div className="text-white/90 font-medium text-sm md:text-base">{stat.label}</div>
                              <div className="text-white/70 text-xs mt-1">{stat.description}</div>
                            </div>
                          </FadeInWrapper>
                        );
                      })}
                    </div>
                  </FadeInWrapper>

                  {/* Adventure Level Progress */}
                  <FadeInWrapper delay={0.3}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">{userStats.levelIcon}</span>
                        Adventure Level: {userStats.adventureLevel}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span>Progress to next level</span>
                          <span className="font-medium">{userStats.totalActivity}/50 activities</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((userStats.totalActivity / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          {['Explorer', 'Adventurer', 'Expert', 'Master', 'Legend'].map((level, index) => (
                            <div 
                              key={level}
                              className={`text-center p-2 rounded-lg ${
                                userStats.adventureLevel === level 
                                  ? 'bg-pink-100 text-pink-700 font-bold' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {level}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FadeInWrapper>

                  {/* Recent Activity */}
                  <FadeInWrapper delay={0.4}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCompass className="text-blue-500" />
                        Recent Activity
                      </h3>
                      
                      <div className="space-y-3">
                        {userStats.totalActivity === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-3">🌟</div>
                            <h4 className="font-semibold text-gray-600 mb-2">Start Your Adventure!</h4>
                            <p className="text-gray-500 text-sm">Explore parks, write reviews, and save events to see your activity here.</p>
                          </div>
                        ) : (
                          <>
                            {favoriteParks.slice(0, 3).map((park) => (
                              <div key={park.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                <FaHeart className="text-red-500" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">Added {park.name} to favorites</span>
                                </div>
                              </div>
                            ))}
                            {userReviews.slice(0, 2).map((review, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                <FaStar className="text-yellow-500" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">Reviewed {review.parkName}</span>
                                  <div className="text-xs text-gray-500">⭐ {review.rating} stars</div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </FadeInWrapper>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="space-y-6 md:space-y-8">
                  {/* Favorite Parks */}
                  <FadeInWrapper delay={0.2}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaHeart className="text-red-500" />
                        Favorite Parks ({favoriteParks.length})
                      </h3>
                      
                      {parksLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1,2,3].map(i => (
                            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48"></div>
                          ))}
                        </div>
                      ) : favoriteParks.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">💖</div>
                          <h4 className="text-lg font-semibold text-gray-600 mb-2">No favorite parks yet</h4>
                          <p className="text-gray-500 mb-6">Start exploring and save parks you love!</p>
                          <Link 
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-red-600 transition font-medium"
                          >
                            <FaCompass />
                            Explore Parks
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {favoriteParks.map((park) => (
                            <div key={park.id} className="group bg-gradient-to-br from-gray-50 to-red-50 rounded-xl border border-red-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                                    {park.name}
                                  </h4>
                                  <button
                                    onClick={() => handleRemoveFavorite(park.id)}
                                    className="text-red-400 hover:text-red-600 transition"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                                <div className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-red-500" />
                                  {park.state}
                                </div>
                                <div className="flex gap-2">
                                  <Link
                                    to={`/park/${park.slug}`}
                                    className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition text-sm font-medium text-center"
                                  >
                                    View Park
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FadeInWrapper>

                  {/* Favorite Events */}
                  <FadeInWrapper delay={0.3}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-500" />
                        Saved Events ({favoriteEvents.length})
                      </h3>
                      
                      {eventsLoading ? (
                        <div className="space-y-4">
                          {[1,2,3].map(i => (
                            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-20"></div>
                          ))}
                        </div>
                      ) : favoriteEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-3">📅</div>
                          <h4 className="font-semibold text-gray-600 mb-2">No saved events</h4>
                          <p className="text-gray-500">Discover and save upcoming park events!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {favoriteEvents.map((event, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-blue-800">{event.title || "Event"}</h4>
                                  <div className="text-sm text-blue-600">
                                    {event.start ? event.start.toLocaleDateString() : "Date TBD"}
                                  </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveEvent(index)}  // Changed from event.id to index
                                    className="text-blue-400 hover:text-blue-600 transition p-2"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FadeInWrapper>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                  <FadeInWrapper delay={0.2}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        My Reviews ({userReviews.length})
                      </h3>

                      {userReviews.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">⭐</div>
                            <h4 className="text-lg font-semibold text-gray-600 mb-2">No reviews written yet</h4>
                            <p className="text-gray-500 mb-6">Share your park experiences with the community!</p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition font-medium"
                            >
                              <FaStar />
                              Explore & Review Parks
                            </Link>
                          </div>
                      ) : (
                          <div className="space-y-6">
                            {userReviews.map((review, index) => (
                                <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-bold text-yellow-800 text-lg">
                                      {review.parkName || review.park || review.location || "Unknown Park"}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }, (_, i) => (
                                          <FaStar
                                              key={i}
                                              className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                                          />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 mb-3 leading-relaxed">{review.text}</p>
                                  <div className="text-xs text-yellow-600 flex items-center gap-2">
                                    <FaCalendarAlt />
                                    {review.createdAt?.toDate?.()?.toLocaleDateString() ||
                                    review.timestamp?.toDate?.()?.toLocaleDateString() ||
                                    review.date?.seconds ? new Date(review.date.seconds * 1000).toLocaleDateString() :
                                        review.date?.toDate?.()?.toLocaleDateString() ||
                                        "Unknown date"}
                                  </div>
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                  </FadeInWrapper>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-6 md:space-y-8">
                  <FadeInWrapper delay={0.2}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" />
                        Your Achievements ({userStats.achievements.length})
                      </h3>
                      
                      {userStats.achievements.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🏆</div>
                          <h4 className="text-lg font-semibold text-gray-600 mb-2">No achievements yet</h4>
                          <p className="text-gray-500 mb-6">Start exploring to unlock badges and achievements!</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                              <div className="text-2xl mb-2">🏞️</div>
                              <div className="text-sm font-medium text-gray-700">Park Collector</div>
                              <div className="text-xs text-gray-500">Save 10 favorite parks</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                              <div className="text-2xl mb-2">📝</div>
                              <div className="text-sm font-medium text-gray-700">Reviewer</div>
                              <div className="text-xs text-gray-500">Write 5 park reviews</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userStats.achievements.map((achievement, index) => (
                            <FadeInWrapper key={achievement.title} delay={index * 0.1}>
                              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200 text-center transform hover:scale-105 transition-all duration-300">
                                <div className="text-4xl mb-4">{achievement.icon}</div>
                                <h4 className="font-bold text-yellow-800 mb-2">{achievement.title}</h4>
                                <p className="text-sm text-yellow-700">{achievement.description}</p>
                              </div>
                            </FadeInWrapper>
                          ))}
                        </div>
                      )}
                    </div>
                  </FadeInWrapper>

                  {/* Progress towards next achievements */}
                  <FadeInWrapper delay={0.3}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaGem className="text-purple-500" />
                        Progress Tracker
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700">🏞️ Park Collector</span>
                            <span className="text-sm text-gray-600">{userStats.totalFavorites}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((userStats.totalFavorites / 10) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700">📝 Reviewer</span>
                            <span className="text-sm text-gray-600">{userStats.totalReviews}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((userStats.totalReviews / 5) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700">🎪 Event Enthusiast</span>
                            <span className="text-sm text-gray-600">{userStats.totalEvents}/3</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((userStats.totalEvents / 3) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeInWrapper>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6 md:space-y-8">
                  {/* Profile Settings */}
                  <FadeInWrapper delay={0.2}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        Profile Information
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-600 text-sm">
                              {currentUser.email}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-600 text-sm font-mono">
                              {currentUser.uid.substring(0, 8)}...
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Your unique identifier</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={userDoc?.displayName || ""}
                              onChange={(e) => setUserDoc((prev) => ({ ...prev, displayName: e.target.value }))}
                              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                              placeholder="Enter your display name"
                            />
                            <button
                              onClick={handleDisplayNameUpdate}
                              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-medium shadow-lg hover:shadow-xl"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeInWrapper>

                  {/* Notification Preferences */}
                  <FadeInWrapper delay={0.3}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaBell className="text-yellow-500" />
                        Notification Preferences
                      </h3>
                      
                      <div className="space-y-4">
                        <PreferenceToggle 
                          label="Blog Updates" 
                          field="blogUpdates"
                          description="Get notified about new blog posts and park stories"
                        />
                        <PreferenceToggle 
                          label="Park Alerts" 
                          field="parkAlerts"
                          description="Receive alerts about park closures and important updates"
                        />
                        <PreferenceToggle 
                          label="Weekly Tips" 
                          field="weeklyTips"
                          description="Get weekly tips and recommendations for park visits"
                        />
                        <PreferenceToggle 
                          label="Event Reminders" 
                          field="eventReminders"
                          description="Reminders about upcoming events you've saved"
                        />
                      </div>
                    </div>
                  </FadeInWrapper>

                  {/* Account Statistics */}
                  <FadeInWrapper delay={0.4}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaChartBar className="text-green-500" />
                        Account Statistics
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Member Since</span>
                            <span className="text-sm text-gray-600">
                              {userStats.memberSince?.toLocaleDateString() || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Adventure Level</span>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              {userStats.levelIcon} {userStats.adventureLevel}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Total Activities</span>
                            <span className="text-sm text-gray-600">{userStats.totalActivity}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Achievements Earned</span>
                            <span className="text-sm text-gray-600">{userStats.achievements.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeInWrapper>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default UserAccount;