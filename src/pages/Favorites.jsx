import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, getDoc, getDocs, collection, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from 'lodash';
import Fuse from 'fuse.js';
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaRoute,
  FaEye,
  FaShare,
  FaTrash,
  FaSearch,
  FaTimes,
  FaFilter,
  FaChevronRight,
  FaHome,
  FaUser,
  FaBookOpen,
  FaNewspaper,
  FaMoneyBillWave,
  FaTree,
  FaMountain,
  FaCamera,
  FaFire,
  FaStar,
  FaRegStar,
  FaGlobe,
  FaCalendarCheck,
  FaBookmark,
  FaRegBookmark,
  FaPlus,
  FaSortAmountDown,
  FaThLarge,
  FaList,
  FaMap
} from "react-icons/fa";

import useIsMobile from "../hooks/useIsMobile";
import FadeInWrapper from "../components/FadeInWrapper";
import SkeletonLoader from "../components/SkeletonLoader";

// Enhanced breadcrumb component
const Breadcrumb = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  return (
      <div className={`flex items-center gap-2 mb-6 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        <button
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
        >
          <FaHome className="text-xs" />
          Home
        </button>
        <FaChevronRight className="text-white/60 text-xs" />
        <span className="text-white font-medium">❤️ My Favorites</span>
      </div>
  );
};

// Enhanced stat card component
const StatCard = ({ icon, label, value, color, delay = 0, onClick, subtitle, trend }) => {
  const { isMobile } = useIsMobile();

  return (
      <FadeInWrapper delay={delay}>
        <motion.div
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`bg-gradient-to-br ${color} p-4 rounded-2xl text-white shadow-lg transform transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} relative overflow-hidden`}
        >
          {/* Background decoration */}
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-white/10 rounded-full blur-md"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className={isMobile ? "text-xl" : "text-2xl md:text-3xl"}>{icon}</div>
              {trend && (
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{trend > 0 ? '📈' : trend < 0 ? '📉' : '➖'}</span>
                    {trend !== 0 && Math.abs(trend)}
                  </div>
              )}
            </div>
            <div className={`font-bold mb-1 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}>{value}</div>
            <div className={`text-white/90 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{label}</div>
            {subtitle && (
                <div className="text-white/70 text-xs mt-1">{subtitle}</div>
            )}
          </div>
        </motion.div>
      </FadeInWrapper>
  );
};

// User profile header component
const UserProfileHeader = ({ currentUser, stats, userDoc }) => {
  const { isMobile } = useIsMobile();

  const getUserInitials = (user) => {
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  const getJoinDate = () => {
    if (userDoc?.createdAt) {
      return new Date(userDoc.createdAt.seconds * 1000).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
    return 'Recently';
  };

  return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
          >
            <div className={`bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg ${isMobile ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl'}`}>
              {getUserInitials(currentUser)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          </motion.div>

          <div>
            <h2 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
              {currentUser.displayName || 'Explorer'}
            </h2>
            <p className="text-white/80 text-sm">
              Member since {getJoinDate()}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <FaMapMarkerAlt />
                <span>{stats.favoriteParks} parks saved</span>
              </div>
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <FaCalendarAlt />
                <span>{stats.favoriteEvents} events saved</span>
              </div>
            </div>
          </div>
        </div>

        {!isMobile && (
            <div className="flex gap-2">
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200"
                  title="Share your favorites"
              >
                <FaShare />
              </motion.button>
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200"
                  title="Plan a trip"
              >
                <FaRoute />
              </motion.button>
            </div>
        )}
      </div>
  );
};

// Quick actions component
const QuickActions = ({ onActionClick, stats, currentUser }) => {
  const { isMobile } = useIsMobile();

  const actions = [
    {
      id: 'plan-trip',
      icon: '🎯',
      title: 'Plan Trip',
      description: 'From your favorites',
      color: 'from-blue-500 to-cyan-500',
      action: () => onActionClick('plan-trip'),
      disabled: stats.favoriteParks === 0
    },
    {
      id: 'discover-more',
      icon: '🔍',
      title: 'Discover More',
      description: 'Find new favorites',
      color: 'from-green-500 to-emerald-500',
      action: () => onActionClick('discover')
    },
    {
      id: 'share-list',
      icon: '📤',
      title: 'Share List',
      description: 'With friends',
      color: 'from-purple-500 to-pink-500',
      action: () => onActionClick('share'),
      disabled: stats.favoriteParks === 0
    },
  ];

  return (
      <FadeInWrapper delay={0.2}>
        <div className="mb-6">
          <div className={`grid gap-4 w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} max-w-4xl mx-auto`}>
            {actions.map((action, index) => (
                <FadeInWrapper key={action.id} delay={index * 0.1}>
                  <button
                      onClick={action.action}
                      disabled={action.disabled}
                      className={`group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 w-full flex flex-col items-center justify-center ${isMobile ? 'min-h-[120px]' : 'min-h-[140px]'} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-3 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className={`font-semibold text-gray-800 ${isMobile ? 'text-base' : 'text-base md:text-lg'} mb-2`}>
                      {action.title}
                    </div>
                    <div className={`text-gray-600 text-center ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
                      {action.description}
                    </div>
                  </button>
                </FadeInWrapper>
            ))}
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Enhanced search and filters component
const EnhancedSearch = ({
                          search,
                          onSearchChange,
                          viewMode,
                          setViewMode,
                          sortBy,
                          setSortBy,
                          filterBy,
                          setFilterBy,
                          searchResults,
                          showSearchDropdown,
                          setShowSearchDropdown,
                          showAdvancedFilters,
                          setShowAdvancedFilters
                        }) => {
  const { isMobile } = useIsMobile();

  return (
      <FadeInWrapper delay={0.3}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 md:p-3 rounded-xl text-white">
                  <FaSearch className={isMobile ? "text-lg" : "text-xl"} />
                </div>
                <div>
                  <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Manage Favorites
                  </h3>
                  <p className="text-gray-600 text-sm">Search and organize your collection</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isMobile && (
                    <>
                      <button
                          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                          title={viewMode === 'grid' ? 'List view' : 'Grid view'}
                      >
                        {viewMode === 'grid' ? <FaList /> : <FaThLarge />}
                      </button>
                    </>
                )}

                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                        showAdvancedFilters
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <FaFilter />
                  {!isMobile && <span>Filters</span>}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <input
                  type="text"
                  placeholder="Search your favorites..."
                  value={search}
                  onChange={onSearchChange}
                  onFocus={() => setShowSearchDropdown(search.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  className="w-full p-3 pl-10 pr-10 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
                  style={{ fontSize: '16px' }}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {search && (
                  <button
                      onClick={() => {
                        onSearchChange({ target: { value: '' } });
                        setShowSearchDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaTimes />
                  </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-64 overflow-y-auto">
                  <div className="text-sm font-medium text-gray-700 mb-2">Search Results</div>
                  {searchResults.slice(0, isMobile ? 3 : 5).map((item, index) => (
                      <div
                          key={item.id}
                          className="w-full p-2 text-left hover:bg-white rounded-lg transition flex items-center gap-3 mb-2 last:mb-0 cursor-pointer"
                      >
                        <div className="text-lg">
                          {item.type === 'park' ? '🏞️' : '📅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">{item.name || item.title}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {item.type === 'park' ? item.state : item.park}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {/* Quick Filters */}
            <div className="space-y-3">
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🎯 Sort By</label>
                  <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white"
                      style={{ fontSize: '16px' }}
                  >
                    <option value="recently-added">Recently Added</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="most-visited">Most Visited</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📂 Filter By</label>
                  <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white"
                      style={{ fontSize: '16px' }}
                  >
                    <option value="all">All Favorites</option>
                    <option value="parks">Parks Only</option>
                    <option value="events">Events Only</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🏞️ Park Features</label>
                        <div className="flex flex-wrap gap-2">
                          {['Mountain Views', 'Waterfalls', 'Wildlife', 'Hiking Trails', 'Photography'].map(feature => (
                              <button
                                  key={feature}
                                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-pink-100 hover:text-pink-600 transition"
                              >
                                {feature}
                              </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">📅 Event Types</label>
                        <div className="flex flex-wrap gap-2">
                          {['Guided Tours', 'Wildlife Programs', 'Stargazing', 'Photography', 'Cultural Events'].map(type => (
                              <button
                                  key={type}
                                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-blue-100 hover:text-blue-600 transition"
                              >
                                {type}
                              </button>
                          ))}
                        </div>
                      </div>

                      <button
                          onClick={() => {
                            setSortBy('recently-added');
                            setFilterBy('all');
                            onSearchChange({ target: { value: '' } });
                          }}
                          className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Enhanced park card component
const EnhancedParkCard = ({ park, onRemove, onView, onPlanTrip, index, viewMode = 'grid' }) => {
  const { isMobile } = useIsMobile();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getActivityIcons = (park) => {
    const icons = [];
    const desc = park.description?.toLowerCase() || '';
    const highlight = park.highlight?.toLowerCase() || '';

    if (desc.includes('hiking') || highlight.includes('trail')) icons.push('🥾');
    if (desc.includes('wildlife') || highlight.includes('wildlife')) icons.push('🦌');
    if (desc.includes('water') || highlight.includes('lake') || highlight.includes('river')) icons.push('🌊');
    if (desc.includes('mountain') || highlight.includes('peak')) icons.push('⛰️');

    return icons.slice(0, 3);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (showConfirmDelete) {
      onRemove(park.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  if (viewMode === 'list') {
    return (
        <FadeInWrapper delay={index * 0.05}>
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: isMobile ? 1 : 1.01 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 mb-3"
          >
            <div className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-300 rounded-xl flex items-center justify-center text-2xl">
                🏞️
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                  {park.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaMapMarkerAlt className="text-pink-500 text-sm" />
                  <span className="text-sm">{park.state}</span>
                </div>
                <div className="flex gap-1">
                  {getActivityIcons(park).map((icon, i) => (
                      <span key={i} className="text-lg">{icon}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                    onClick={() => onView(park)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="View details"
                >
                  <FaEye />
                </button>
                <button
                    onClick={() => onPlanTrip(park)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                    title="Plan trip"
                >
                  <FaRoute />
                </button>
                <button
                    onClick={handleRemove}
                    className={`p-2 rounded-lg transition ${
                        showConfirmDelete
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    title={showConfirmDelete ? 'Click to confirm' : 'Remove from favorites'}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </motion.div>
        </FadeInWrapper>
    );
  }

  return (
      <FadeInWrapper delay={index * 0.1}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
        >
          {/* Image Section */}
          <div className="relative h-48 bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center">
            <div className="text-5xl">🏞️</div>

            {/* Remove Button */}
            <button
                onClick={handleRemove}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                    showConfirmDelete
                        ? "bg-red-500 text-white"
                        : "bg-white/80 text-red-600 hover:bg-white opacity-0 group-hover:opacity-100"
                }`}
                title={showConfirmDelete ? 'Click to confirm removal' : 'Remove from favorites'}
            >
              <FaTrash className="text-sm" />
            </button>

            {/* Activity Icons */}
            <div className="absolute bottom-3 left-3 flex gap-1">
              {getActivityIcons(park).map((icon, i) => (
                  <div key={i} className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-sm">
                    {icon}
                  </div>
              ))}
            </div>

            {/* Entry Fee Badge */}
            <div className="absolute bottom-3 right-3 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {park.entryFee && park.entryFee > 0 ? `$${park.entryFee}` : 'Free'}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Park Name */}
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
              {park.name}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <FaMapMarkerAlt className="text-pink-500 text-sm" />
              <span className="text-sm">{park.state}</span>
            </div>

            {/* Highlight */}
            {park.highlight && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700 line-clamp-2 italic">
                    "{park.highlight}"
                  </p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Established</div>
                <div className="text-sm font-bold text-gray-800">
                  {park.established || 'Historic'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-600">Best Season</div>
                <div className="text-sm font-bold text-gray-800">
                  {park.bestSeason || 'Year-round'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                  onClick={() => onView(park)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
              >
                <FaEye />
                View
              </button>
              <button
                  onClick={() => onPlanTrip(park)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
              >
                <FaRoute />
                Plan
              </button>
            </div>
          </div>
        </motion.div>
      </FadeInWrapper>
  );
};
// Enhanced event card component
const EnhancedEventCard = ({ event, onRemove, onView, index, viewMode = 'grid' }) => {
  const { isMobile } = useIsMobile();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formatEventTime = (date) => {
    if (!date) return 'Time TBA';
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatEventDate = (date) => {
    if (!date) return 'Date TBA';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventIcon = () => {
    const title = event.title?.toLowerCase() || '';
    if (title.includes('wildlife')) return '🦌';
    if (title.includes('star') || title.includes('night')) return '🌟';
    if (title.includes('hike') || title.includes('trail')) return '🥾';
    if (title.includes('photo')) return '📸';
    return '📅';
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (showConfirmDelete) {
      onRemove(event);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  if (viewMode === 'list') {
    return (
        <FadeInWrapper delay={index * 0.05}>
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: isMobile ? 1 : 1.01 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 mb-3"
          >
            <div className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-xl flex items-center justify-center text-2xl">
                {getEventIcon()}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaMapMarkerAlt className="text-blue-500 text-sm" />
                  <span className="text-sm">{event.park}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt />
                    <span>{formatEventDate(event.start)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>{formatEventTime(event.start)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                    onClick={() => onView(event)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="View details"
                >
                  <FaEye />
                </button>
                {event.url && (
                    <button
                        onClick={() => window.open(event.url, '_blank')}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                        title="Official link"
                    >
                      <FaGlobe />
                    </button>
                )}
                <button
                    onClick={handleRemove}
                    className={`p-2 rounded-lg transition ${
                        showConfirmDelete
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    title={showConfirmDelete ? 'Click to confirm' : 'Remove from favorites'}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </motion.div>
        </FadeInWrapper>
    );
  }

  return (
      <FadeInWrapper delay={index * 0.1}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: isMobile ? 1 : 1.02, y: isMobile ? 0 : -5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
        >
          {/* Event Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{getEventIcon()}</div>
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                  Event
                </div>
              </div>

              <button
                  onClick={handleRemove}
                  className={`p-2 rounded-full transition-all duration-200 ${
                      showConfirmDelete
                          ? "bg-red-500 text-white"
                          : "bg-white/20 hover:bg-white/30 opacity-0 group-hover:opacity-100"
                  }`}
                  title={showConfirmDelete ? 'Click to confirm removal' : 'Remove from favorites'}
              >
                <FaTrash className="text-sm" />
              </button>
            </div>

            <h3 className={`font-bold mb-2 leading-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {event.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-white/90">
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt />
                <span>{event.park}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock />
                <span>{formatEventTime(event.start)}</span>
              </div>
            </div>
          </div>

          {/* Event Content */}
          <div className="p-4">
            {/* Date and Time Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <div className="text-sm font-semibold text-blue-600">
                  {formatEventDate(event.start)}
                </div>
                <div className="text-xs text-blue-500">
                  {formatEventTime(event.start)}
                </div>
              </div>

              {event.capacity && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUsers className="text-sm" />
                    <span className="text-sm">{event.capacity} max</span>
                  </div>
              )}
            </div>

            {/* Event Description */}
            {event.description && (
                <div className={`text-gray-700 leading-relaxed mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  <p className="line-clamp-2">
                    {event.description.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description}
                  </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                  onClick={() => onView(event)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
              >
                <FaEye />
                {isMobile ? 'View' : 'View Details'}
              </button>

              {event.url && (
                  <button
                      onClick={() => window.open(event.url, '_blank')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FaGlobe />
                    {isMobile ? 'Visit' : 'Official Link'}
                  </button>
              )}
            </div>
          </div>
        </motion.div>
      </FadeInWrapper>
  );
};
// Empty state component
const EmptyState = ({ type, onActionClick }) => {
  const { isMobile } = useIsMobile();

  return (
      <FadeInWrapper delay={0.2}>
        <div className="text-center py-20">
          <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
          >
            <div className="text-8xl mb-6">
              {type === 'parks' ? '🏞️' : type === 'events' ? '📅' : '💝'}
            </div>
            <h3 className={`font-bold text-gray-600 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {type === 'parks' && 'No Favorite Parks Yet'}
              {type === 'events' && 'No Favorite Events Yet'}
              {type === 'search' && 'No Results Found'}
              {type === 'all' && 'No Favorites Yet'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {type === 'parks' && 'Start exploring and save your favorite national parks to see them here.'}
              {type === 'events' && 'Save events you\'re interested in to quickly find them later.'}
              {type === 'search' && 'Try adjusting your search terms or filters.'}
              {type === 'all' && 'Start building your collection of favorite parks and events!'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                  onClick={() => onActionClick('discover')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                🔍 Discover Parks
              </button>

              <button
                  onClick={() => onActionClick('events')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                📅 Browse Events
              </button>
            </div>
          </motion.div>
        </div>
      </FadeInWrapper>
  );
};

// Main Enhanced Favorites Component
const EnhancedMobileFavorites = () => {
  // State management
  const [userDoc, setUserDoc] = useState(null);
  const [favoriteParks, setFavoriteParks] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [parksLoading, setParksLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recently-added');
  const [filterBy, setFilterBy] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'parks', 'events'

  // Hooks
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // Fuzzy Search Setup for combined search
  const allFavorites = useMemo(() => [
    ...favoriteParks.map(park => ({ ...park, type: 'park' })),
    ...favoriteEvents.map(event => ({ ...event, type: 'event' }))
  ], [favoriteParks, favoriteEvents]);

  const fuse = useMemo(() => new Fuse(allFavorites, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'title', weight: 0.4 },
      { name: 'state', weight: 0.3 },
      { name: 'park', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'highlight', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2
  }), [allFavorites]);

  // Debounced Search
  const debouncedSearch = useMemo(
      () => debounce((searchValue) => {
        if (searchValue.length < 2) {
          setSearchResults([]);
          return;
        }

        const results = fuse.search(searchValue)
            .slice(0, 8)
            .map(result => result.item);

        setSearchResults(results);
      }, 300),
      [fuse]
  );

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    setShowSearchDropdown(value.length > 0);

    if (value.length >= 2) {
      debouncedSearch(value);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      favoriteParks: favoriteParks.length,
      favoriteEvents: favoriteEvents.length,
      totalFavorites: favoriteParks.length + favoriteEvents.length,
      recentlyAdded: 5, // Could be calculated based on timestamps
      statesVisited: new Set(favoriteParks.map(p => p.state)).size
    };
  }, [favoriteParks, favoriteEvents]);

  // Event handlers
  const handleQuickAction = (action) => {
    switch(action) {
      case 'plan-trip':
        navigate('/trip-planner', {
          state: {
            preloadedTrip: {
              title: 'My Favorite Parks Trip',
              parks: favoriteParks.slice(0, 5).map(park => ({
                parkId: park.id,
                parkName: park.name,
                state: park.state,
                coordinates: park.coordinates
              }))
            }
          }
        });
        showToast('🎯 Planning trip with your favorites!', 'success');
        break;
      case 'discover':
        navigate('/');
        break;
      case 'events':
        navigate('/calendar');
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: 'My Favorite National Parks',
            text: `Check out my ${stats.favoriteParks} favorite national parks!`,
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          showToast('📋 Link copied to clipboard!', 'success');
        }
        break;
      default:
        break;
    }
  };

  const handleRemovePark = async (parkId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        favoriteParks: arrayRemove(parkId)
      });

      setFavoriteParks(prev => prev.filter(p => p.id !== parkId));
      showToast('💔 Park removed from favorites', 'info');
    } catch (error) {
      console.error('Error removing park:', error);
      showToast('❌ Failed to remove park', 'error');
    }
  };

  const handleRemoveEvent = async (event) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const formattedEvent = {
        ...event,
        start: event.start?.toISOString() || null,
        end: event.end?.toISOString() || null,
      };

      await updateDoc(userRef, {
        favoriteEvents: arrayRemove(formattedEvent)
      });

      setFavoriteEvents(prev => prev.filter(e => e.id !== event.id));
      showToast('💔 Event removed from favorites', 'info');
    } catch (error) {
      console.error('Error removing event:', error);
      showToast('❌ Failed to remove event', 'error');
    }
  };

  const handleViewPark = (park) => {
    navigate(`/park/${park.slug}`, {
      state: { from: 'favorites' }
    });
  };

  const handlePlanTrip = (park) => {
    navigate('/trip-planner', {
      state: {
        preloadedTrip: {
          title: `Trip to ${park.name}`,
          parks: [{
            parkId: park.id,
            parkName: park.name,
            state: park.state,
            coordinates: park.coordinates
          }]
        }
      }
    });
    showToast(`🎯 Planning trip to ${park.name}!`, 'success');
  };

  const handleViewEvent = (event) => {
    if (event.url) {
      window.open(event.url, '_blank');
    } else {
      showToast('📅 Event details coming soon!', 'info');
    }
  };

  // Filter and sort favorites
  const filteredFavorites = useMemo(() => {
    let filtered = [];

    // Apply tab filter
    switch (activeTab) {
      case 'parks':
        filtered = favoriteParks.map(park => ({ ...park, type: 'park' }));
        break;
      case 'events':
        filtered = favoriteEvents.map(event => ({ ...event, type: 'event' }));
        break;
      default:
        filtered = allFavorites;
    }

    // Apply search filter
    if (search.length >= 2) {
      const searchResults = fuse.search(search).map(result => result.item);
      filtered = searchResults.filter(item => {
        if (activeTab === 'parks') return item.type === 'park';
        if (activeTab === 'events') return item.type === 'event';
        return true;
      });
    }

    // Apply additional filters
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'parks':
          filtered = filtered.filter(item => item.type === 'park');
          break;
        case 'events':
          filtered = filtered.filter(item => item.type === 'event');
          break;
        case 'recent':
          // Filter items added in last 30 days (would need timestamps)
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
        break;
      case 'most-visited':
        // Would need visit count data
        break;
      case 'rating':
        // Would need rating data
        break;
        // 'recently-added' is default order
    }

    return filtered;
  }, [activeTab, favoriteParks, favoriteEvents, allFavorites, search, fuse, filterBy, sortBy]);

  // Fetch user data
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        setUserDoc(userData);

        // Fetch favorite parks
        const parksSnap = await getDocs(collection(db, "parks"));
        const allParks = parksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const favorites = allParks.filter((p) => userData.favoriteParks?.includes(p.id));
        setFavoriteParks(favorites);
        setParksLoading(false);

        // Parse favorite events
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
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
        showToast("❌ Failed to load favorites", "error");
      }
    };

    fetchData();
  }, [currentUser, showToast]);

  // Navigation links
  const renderNavigationLinks = () => (
      <div className={`flex flex-wrap justify-center gap-2 text-sm font-medium mb-6 ${isMobile ? 'px-2' : ''}`}>
        <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaHome /> Home
        </Link>

        <Link
            to="/calendar"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaCalendarAlt /> Events
        </Link>

        <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaNewspaper /> Blog
        </Link>

        <Link
            to="/account"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaUser /> Account
        </Link>
      </div>
  );

  // Hero section
  const renderHeroSection = () => (
      <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-4 md:p-6 text-white overflow-hidden rounded-2xl mb-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>

        <div className="relative z-10">
          <Breadcrumb />
          <FadeInWrapper delay={0.1}>
            <div>
              <UserProfileHeader
                  currentUser={currentUser}
                  stats={stats}
                  userDoc={userDoc}
              />
              <div className="mt-6">
                <h1 className={`font-extrabold mb-4 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-5xl'}`}>
                  ❤️ My Favorites Collection
                </h1>
                <p className={`text-purple-100 ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                  Your personal collection of {stats.totalFavorites} favorite parks and events across {stats.statesVisited} states.
                </p>
              </div>
            </div>
          </FadeInWrapper>
        </div>
      </div>
  );

  // Auth check
  if (!currentUser) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
              <div className="text-6xl mb-4">🔒</div>
              <h1 className={`font-bold text-gray-800 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Please Sign In
              </h1>
              <p className="text-gray-600 mb-6">You need to be logged in to view your favorites.</p>
              <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
              >
                <FaUser /> Sign In
              </Link>
            </motion.div>
          </div>
        </div>
    );
  }

  // Loading state
  if (parksLoading || eventsLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl w-1/3"></div>
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                  {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                  ))}
                </div>
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

            {/* Hero Section */}
            <div className="p-4 md:p-6">
              {renderHeroSection()}

              {/* Navigation Links */}
              {renderNavigationLinks()}

              {/* Quick Actions */}
              <QuickActions
                  onActionClick={handleQuickAction}
                  stats={stats}
                  currentUser={currentUser}
              />
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-6">

              {/* Stats Cards */}
              <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                <StatCard
                    icon="🏞️"
                    label="Favorite Parks"
                    value={stats.favoriteParks}
                    color="from-green-500 to-emerald-500"
                    delay={0.1}
                    onClick={() => setActiveTab('parks')}
                    subtitle="Across the nation"
                />
                <StatCard
                    icon="📅"
                    label="Favorite Events"
                    value={stats.favoriteEvents}
                    color="from-blue-500 to-cyan-500"
                    delay={0.2}
                    onClick={() => setActiveTab('events')}
                    subtitle="Saved for later"
                />
                <StatCard
                    icon="🗺️"
                    label="States Visited"
                    value={stats.statesVisited}
                    color="from-orange-500 to-red-500"
                    delay={0.3}
                    subtitle="Coverage map"
                />
                <StatCard
                    icon="💝"
                    label="Total Favorites"
                    value={stats.totalFavorites}
                    color="from-purple-500 to-pink-500"
                    delay={0.4}
                    subtitle="Your collection"
                    trend={5}
                />
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { id: 'all', label: 'All Favorites', icon: '💝' },
                  { id: 'parks', label: 'Parks', icon: '🏞️' },
                  { id: 'events', label: 'Events', icon: '📅' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {tab.id === 'parks' ? stats.favoriteParks :
                        tab.id === 'events' ? stats.favoriteEvents : stats.totalFavorites}
                  </span>
                    </button>
                ))}
              </div>

              {/* Enhanced Search and Filters */}
              <EnhancedSearch
                  search={search}
                  onSearchChange={handleSearchChange}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filterBy={filterBy}
                  setFilterBy={setFilterBy}
                  searchResults={searchResults}
                  showSearchDropdown={showSearchDropdown}
                  setShowSearchDropdown={setShowSearchDropdown}
                  showAdvancedFilters={showAdvancedFilters}
                  setShowAdvancedFilters={setShowAdvancedFilters}
              />

              {/* Content Area */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    {activeTab === 'all' && '💝 All Favorites'}
                    {activeTab === 'parks' && '🏞️ Favorite Parks'}
                    {activeTab === 'events' && '📅 Favorite Events'}
                  </h2>
                  <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredFavorites.length} items
                  </div>
                </div>

                {/* Empty States */}
                {filteredFavorites.length === 0 ? (
                    search.length >= 2 ? (
                        <EmptyState type="search" onActionClick={handleQuickAction} />
                    ) : activeTab === 'parks' && stats.favoriteParks === 0 ? (
                        <EmptyState type="parks" onActionClick={handleQuickAction} />
                    ) : activeTab === 'events' && stats.favoriteEvents === 0 ? (
                        <EmptyState type="events" onActionClick={handleQuickAction} />
                    ) : stats.totalFavorites === 0 ? (
                        <EmptyState type="all" onActionClick={handleQuickAction} />
                    ) : null
                ) : (
                    /* Favorites Grid/List */
                    <div className={
                      viewMode === 'list'
                          ? 'space-y-3'
                          : `grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`
                    }>
                      {filteredFavorites.map((item, index) =>
                          item.type === 'park' ? (
                              <EnhancedParkCard
                                  key={`park-${item.id}`}
                                  park={item}
                                  onRemove={handleRemovePark}
                                  onView={handleViewPark}
                                  onPlanTrip={handlePlanTrip}
                                  index={index}
                                  viewMode={viewMode}
                              />
                          ) : (
                              <EnhancedEventCard
                                  key={`event-${item.id || index}`}
                                  event={item}
                                  onRemove={handleRemoveEvent}
                                  onView={handleViewEvent}
                                  index={index}
                                  viewMode={viewMode}
                              />
                          )
                      )}
                    </div>
                )}
              </div>

              {/* Mobile Action Buttons */}
              {isMobile && stats.totalFavorites > 0 && (
                  <FadeInWrapper delay={0.8}>
                    <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                      <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuickAction('plan-trip')}
                          className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center"
                          disabled={stats.favoriteParks === 0}
                      >
                        <FaRoute className="text-xl" />
                      </motion.button>

                      <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuickAction('share')}
                          className="w-12 h-12 bg-white text-gray-600 rounded-full shadow-lg flex items-center justify-center border border-gray-200"
                      >
                        <FaShare />
                      </motion.button>
                    </div>
                  </FadeInWrapper>
              )}

              {/* Related Actions - Desktop Only */}
              {!isMobile && (
                  <FadeInWrapper delay={0.9}>
                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200 mt-8">
                      <h3 className="font-bold text-gray-800 mb-6 text-xl">
                        Quick Actions
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <button
                            onClick={() => handleQuickAction('discover')}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-pink-300 group w-full text-left"
                        >
                          <FaArrowLeft className="text-pink-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-gray-800 text-base">
                              Discover More Parks
                            </div>
                            <div className="text-sm text-gray-600">Explore new destinations</div>
                          </div>
                        </button>

                        <button
                            onClick={() => handleQuickAction('plan-trip')}
                            disabled={stats.favoriteParks === 0}
                            className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group w-full text-left ${stats.favoriteParks === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FaRoute className="text-blue-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-gray-800 text-base">
                              Plan Your Trip
                            </div>
                            <div className="text-sm text-gray-600">Using your favorites</div>
                          </div>
                        </button>

                        <button
                            onClick={() => navigate('/calendar')}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-green-300 group w-full text-left"
                        >
                          <FaCalendarAlt className="text-green-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-gray-800 text-base">
                              Browse Events
                            </div>
                            <div className="text-sm text-gray-600">Find new experiences</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </FadeInWrapper>
              )}

            </div>
          </div>
        </div>
      </div>
  );
};

export default EnhancedMobileFavorites;