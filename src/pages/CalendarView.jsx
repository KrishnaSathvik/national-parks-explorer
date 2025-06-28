import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from 'lodash';
import Fuse from 'fuse.js';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaStar,
  FaEye,
  FaRoute,
  FaHome,
  FaGlobe,
  FaCalendarCheck,
  FaBookmark,
  FaRegBookmark,
  FaThumbsUp,
  FaCamera,
  FaWeatherSun,
  FaMountain,
  FaTree,
  FaBinoculars,
  FaFire
} from "react-icons/fa";

import useIsMobile from "../hooks/useIsMobile";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FadeInWrapper from "../components/FadeInWrapper";
import { TripCardSkeleton, TripPlannerPageSkeleton } from "../components/shared/ui/LoadingStates";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Event category configuration with icons and colors
const EVENT_CATEGORIES = {
  'Guided Tours': { icon: '🚶‍♂️', color: 'from-blue-500 to-cyan-500' },
  'Wildlife Programs': { icon: '🦌', color: 'from-green-500 to-emerald-500' },
  'Stargazing': { icon: '🌟', color: 'from-purple-500 to-indigo-500' },
  'Photography': { icon: '📸', color: 'from-pink-500 to-rose-500' },
  'Hiking': { icon: '🥾', color: 'from-orange-500 to-red-500' },
  'Cultural Events': { icon: '🎭', color: 'from-yellow-500 to-amber-500' },
  'Junior Ranger': { icon: '👶', color: 'from-teal-500 to-cyan-500' },
  'Workshops': { icon: '🔧', color: 'from-gray-500 to-slate-500' },
  'Seasonal': { icon: '🍂', color: 'from-amber-500 to-orange-500' },
  'Other': { icon: '📅', color: 'from-gray-400 to-gray-500' }
};

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
        <span className="text-white font-medium">📅 Events Calendar</span>
      </div>
  );
};

// Enhanced stat card component
const StatCard = ({ icon, label, value, color, delay = 0, onClick, subtitle }) => {
  const { isMobile } = useIsMobile();

  return (
      <FadeInWrapper delay={delay}>
        <motion.div
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`bg-gradient-to-br ${color} p-4 rounded-2xl text-white shadow-lg transform transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={isMobile ? "text-xl" : "text-2xl md:text-3xl"}>{icon}</div>
            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
              Live
            </div>
          </div>
          <div className={`font-bold mb-1 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}>{value}</div>
          <div className={`text-white/90 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{label}</div>
          {subtitle && (
              <div className="text-white/70 text-xs mt-1">{subtitle}</div>
          )}
        </motion.div>
      </FadeInWrapper>
  );
};

// Quick action buttons component
const QuickActions = ({ onActionClick, currentUser, savedEventsCount }) => {
  const { isMobile } = useIsMobile();

  const actions = [
    {
      id: 'today-events',
      icon: '📅',
      title: 'Today\'s Events',
      description: 'See what\'s happening',
      color: 'from-blue-500 to-cyan-500',
      action: () => onActionClick('today')
    },
    {
      id: 'trending',
      icon: '🔥',
      title: 'Trending Events',
      description: 'Popular this week',
      color: 'from-orange-500 to-red-500',
      action: () => onActionClick('trending')
    },
    {
      id: 'saved-events',
      icon: '💾',
      title: 'My Events',
      description: `${savedEventsCount} saved`,
      color: 'from-purple-500 to-pink-500',
      action: () => onActionClick('saved'),
      requiresAuth: true
    },
  ];

  return (
      <FadeInWrapper delay={0.2}>
        <div className="mb-6">
          <div className={`grid gap-4 w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} max-w-4xl mx-auto`}>
            {actions.map((action, index) => {
              if (action.requiresAuth && !currentUser) return null;

              return (
                  <FadeInWrapper key={action.id} delay={index * 0.1}>
                    <button
                        onClick={action.action}
                        className={`group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 w-full flex flex-col items-center justify-center ${isMobile ? 'min-h-[120px]' : 'min-h-[140px]'}`}
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
              );
            })}
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Enhanced search and filters component
const EnhancedSearch = ({
                          search,
                          onSearchChange,
                          selectedDate,
                          setSelectedDate,
                          selectedPark,
                          setSelectedPark,
                          selectedCategory,
                          setSelectedCategory,
                          showAdvancedFilters,
                          setShowAdvancedFilters,
                          parks,
                          categories,
                          searchResults,
                          showSearchDropdown,
                          setShowSearchDropdown
                        }) => {
  const { isMobile } = useIsMobile();

  return (
      <FadeInWrapper delay={0.3}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 md:p-3 rounded-xl text-white">
                  <FaSearch className={isMobile ? "text-lg" : "text-xl"} />
                </div>
                <div>
                  <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Find Events
                  </h3>
                  <p className="text-gray-600 text-sm">Discover amazing experiences</p>
                </div>
              </div>

              {!isMobile && (
                  <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                          showAdvancedFilters
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <FaFilter />
                    <span className="hidden md:inline">Filters</span>
                  </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={onSearchChange}
                  onFocus={() => setShowSearchDropdown(search.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  className="w-full p-3 pl-10 pr-10 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
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
                  <div className="text-sm font-medium text-gray-700 mb-2">Quick Results</div>
                  {searchResults.slice(0, isMobile ? 3 : 5).map(event => (
                      <div
                          key={event.id}
                          className="w-full p-2 text-left hover:bg-white rounded-lg transition flex items-center gap-3 mb-2 last:mb-0 cursor-pointer"
                      >
                        <div className="text-lg">
                          {EVENT_CATEGORIES[event.category]?.icon || '📅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">{event.title}</div>
                          <div className="text-sm text-gray-600 truncate">{event.park}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(event.start).toLocaleDateString()}
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {/* Quick Filters */}
            <div className="space-y-3">
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
                  <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                      style={{ fontSize: '16px' }}
                      minDate={new Date()}
                  />
                </div>

                {isMobile && (
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition ${
                            showAdvancedFilters
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <FaFilter />
                      More Filters
                    </button>
                )}
              </div>

              {/* Park Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🏞️ Park</label>
                <select
                    value={selectedPark}
                    onChange={(e) => setSelectedPark(e.target.value)}
                    className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                    style={{ fontSize: '16px' }}
                >
                  {parks.map((park) => (
                      <option key={park} value={park}>{park}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter Chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                      <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                              selectedCategory === category
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        <span>{EVENT_CATEGORIES[category]?.icon || '📅'}</span>
                        {category}
                      </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🕒 Time of Day</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Morning', 'Afternoon', 'Evening'].map(time => (
                              <button
                                  key={time}
                                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-blue-100 hover:text-blue-600 transition"
                              >
                                {time}
                              </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">👥 Group Size</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Solo', 'Small Group', 'Large Group'].map(size => (
                              <button
                                  key={size}
                                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-blue-100 hover:text-blue-600 transition"
                              >
                                {size}
                              </button>
                          ))}
                        </div>
                      </div>

                      <button
                          onClick={() => {
                            setSelectedPark('All');
                            setSelectedCategory('All');
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

// Enhanced event card component
const EnhancedEventCard = ({ event, isSaved, onToggleSave, currentUser, index }) => {
  const { isMobile } = useIsMobile();
  const category = EVENT_CATEGORIES[event.category] || EVENT_CATEGORIES['Other'];

  const getEventTypeIcon = (event) => {
    const title = event.title?.toLowerCase() || '';
    if (title.includes('hiking') || title.includes('trail')) return '🥾';
    if (title.includes('wildlife') || title.includes('animal')) return '🦌';
    if (title.includes('star') || title.includes('night')) return '🌟';
    if (title.includes('photo')) return '📸';
    if (title.includes('cultural') || title.includes('history')) return '🎭';
    return category.icon;
  };

  const formatEventTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
      <FadeInWrapper delay={index * 0.1}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: isMobile ? 1 : 1.02, y: isMobile ? 0 : -5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          {/* Event Header */}
          <div className={`bg-gradient-to-r ${category.color} p-4 text-white relative`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{getEventTypeIcon(event)}</div>
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                  {event.category || 'Event'}
                </div>
              </div>

              {currentUser && (
                  <button
                      onClick={() => onToggleSave(event)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200"
                  >
                    {isSaved ?
                        <FaBookmark className="text-yellow-300" /> :
                        <FaRegBookmark className="text-white" />
                    }
                  </button>
              )}
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
            <div
                className={`text-gray-700 leading-relaxed mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                      event.description?.substring(0, isMobile ? 150 : 200) +
                      (event.description?.length > (isMobile ? 150 : 200) ? '...' : '') ||
                      "Join us for this exciting park event!"
                  )
                }}
            />

            {/* Event Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {event.difficulty && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                {event.difficulty}
              </span>
              )}
              {event.duration && (
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                {event.duration}
              </span>
              )}
              {event.fee && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
                ${event.fee}
              </span>
              )}
              {!event.fee && (
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                Free
              </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2">
                <FaEye />
                {isMobile ? 'View' : 'View Details'}
              </button>

              {event.url && (
                  <button
                      onClick={() => window.open(event.url, '_blank')}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
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

// Enhanced heatmap component
const InteractiveHeatmap = ({ monthlyHeatmap, selectedDate, setSelectedDate, events }) => {
  const { isMobile } = useIsMobile();
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
      <FadeInWrapper delay={0.4}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              📊 Event Calendar
            </h3>
            <div className="flex items-center gap-2">
              <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaChevronLeft />
              </button>
              <span className={`font-semibold text-gray-700 min-w-[140px] text-center ${isMobile ? 'text-sm' : 'text-base'}`}>
              {monthName}
            </span>
              <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`text-center font-medium text-gray-600 py-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {day}
                </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const iso = date.toLocaleDateString("en-CA");
              const data = monthlyHeatmap[iso];
              const count = data?.count || 0;
              const isSelected = selectedDate.toLocaleDateString("en-CA") === iso;
              const isToday = new Date().toLocaleDateString("en-CA") === iso;

              const getIntensity = (count) => {
                if (count >= 10) return 'bg-red-500 text-white';
                if (count >= 5) return 'bg-orange-400 text-white';
                if (count >= 3) return 'bg-yellow-400 text-gray-800';
                if (count > 0) return 'bg-blue-200 text-blue-800';
                return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
              };

              return (
                  <motion.button
                      key={day}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(date)}
                      className={`
                  aspect-square rounded-lg transition-all duration-200 flex flex-col items-center justify-center relative
                  ${getIntensity(count)}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  ${isToday ? 'ring-2 ring-green-500 ring-offset-1' : ''}
                  ${isMobile ? 'text-xs' : 'text-sm'}
                `}
                  >
                    <span className="font-semibold">{day}</span>
                    {count > 0 && (
                        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium`}>
                    {count}
                  </span>
                    )}
                    {isToday && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <div className="w-3 h-3 bg-red-500 rounded"></div>
              </div>
              <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>More</span>
            </div>
            <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {events.length} total events
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Loading component
const LoadingComponent = () => {
  const { isMobile } = useIsMobile();

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-2xl w-1/3"></div>
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
};

// Main Enhanced Calendar View Component
const EnhancedCalendarView = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPark, setSelectedPark] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [activeView, setActiveView] = useState('all'); // 'all', 'today', 'trending', 'saved'

  // Hooks
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { isMobile } = useIsMobile();

  // Fuzzy Search Setup
  const fuse = useMemo(() => new Fuse(events, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'park', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'category', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2
  }), [events]);

  // Debounced Search
  const debouncedSearch = useMemo(
      () => debounce((searchValue) => {
        if (searchValue.length < 2) {
          setSearchResults([]);
          return;
        }

        const results = fuse.search(searchValue)
            .slice(0, 8)
            .map(result => ({
              ...result.item,
              relevanceScore: Math.round((1 - result.score) * 100)
            }));

        setSearchResults(results);
      }, 300),
      [fuse]
  );

  // Event handlers
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

  const handleQuickAction = (action) => {
    switch(action) {
      case 'today':
        setSelectedDate(new Date());
        setActiveView('today');
        showToast('📅 Showing today\'s events!', 'info');
        break;
      case 'trending':
        setActiveView('trending');
        showToast('🔥 Showing trending events!', 'info');
        break;
      case 'saved':
        setActiveView('saved');
        showToast('💾 Showing your saved events!', 'info');
        break;
      default:
        setActiveView('all');
        break;
    }
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const snapshot = await getDoc(doc(db, "cache", "events"));
        if (snapshot.exists()) {
          const { updatedAt, events: rawEvents } = snapshot.data();
          setLastUpdated(updatedAt);

          // Add sample categories and enhanced data to events
          const enhancedEvents = rawEvents.map((e, index) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end || e.start),
            category: e.category || Object.keys(EVENT_CATEGORIES)[index % Object.keys(EVENT_CATEGORIES).length],
            capacity: e.capacity || Math.floor(Math.random() * 50) + 10,
            difficulty: e.difficulty || ['Easy', 'Moderate', 'Challenging'][Math.floor(Math.random() * 3)],
            duration: e.duration || ['1 hour', '2 hours', '3 hours', 'Half day', 'Full day'][Math.floor(Math.random() * 5)],
            fee: e.fee || (Math.random() > 0.6 ? Math.floor(Math.random() * 25) + 5 : null)
          }));

          setEvents(enhancedEvents.sort((a, b) => a.start - b.start));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        showToast("❌ Failed to load events", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [showToast]);

  // Fetch user's saved events
  useEffect(() => {
    if (!currentUser) return;
    const fetchUserEvents = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) {
          setSavedEventIds(docSnap.data().favoriteEvents?.map(e => e.id) || []);
        }
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    };
    fetchUserEvents();
  }, [currentUser]);

  // Toggle event save
  const toggleEventSave = async (event) => {
    if (!currentUser) {
      showToast("🔐 Please log in to save events", "info");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const formattedEvent = {
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      };

      const alreadySaved = savedEventIds.includes(event.id);
      await updateDoc(userRef, {
        favoriteEvents: alreadySaved
            ? arrayRemove(formattedEvent)
            : arrayUnion(formattedEvent),
      });

      setSavedEventIds((prev) =>
          alreadySaved
              ? prev.filter((id) => id !== event.id)
              : [...prev, event.id]
      );

      showToast(
          alreadySaved ? "💔 Removed from saved events" : "❤️ Event saved!",
          alreadySaved ? "info" : "success"
      );
    } catch (error) {
      console.error('Error toggling event save:', error);
      showToast("❌ Failed to update saved events", "error");
    }
  };

  // Computed values
  const uniqueParks = useMemo(() => ["All", ...Array.from(new Set(events.map(e => e.park)))], [events]);
  const uniqueCategories = useMemo(() => ["All", ...Array.from(new Set(events.map(e => e.category)))], [events]);

  const monthlyHeatmap = useMemo(() => {
    return events.reduce((acc, e) => {
      const iso = e.start.toLocaleDateString("en-CA");
      acc[iso] = acc[iso] || { count: 0, parks: new Set() };
      acc[iso].count += 1;
      acc[iso].parks.add(e.park);
      return acc;
    }, {});
  }, [events]);

  // Filter events based on current view and filters
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (search.length >= 2) {
      const searchResults = fuse.search(search).map(result => result.item);
      filtered = searchResults;
    }

    // Apply date filter
    const selectedISO = selectedDate.toLocaleDateString("en-CA");

    switch (activeView) {
      case 'today':
        const todayISO = new Date().toLocaleDateString("en-CA");
        filtered = filtered.filter(e => e.start.toLocaleDateString("en-CA") === todayISO);
        break;
      case 'trending':
        // Show events with higher attendance or recent events
        filtered = filtered.filter(e => e.start >= new Date()).slice(0, 20);
        break;
      case 'saved':
        filtered = filtered.filter(e => savedEventIds.includes(e.id));
        break;
      default:
        filtered = filtered.filter(e => e.start.toLocaleDateString("en-CA") === selectedISO);
    }

    // Apply park filter
    if (selectedPark !== "All") {
      filtered = filtered.filter(e => e.park === selectedPark);
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    return filtered;
  }, [events, search, selectedDate, selectedPark, selectedCategory, activeView, savedEventIds, fuse]);

  // Get trending events (most popular or recent)
  const trendingEvents = useMemo(() => {
    return events
        .filter(e => e.start >= new Date())
        .sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
        .slice(0, 5);
  }, [events]);

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
            to="/blog"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaRoute /> Blog
        </Link>

        <Link
            to="/about"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaUsers /> About
        </Link>

        {currentUser && (
            <Link
                to="/account"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaCalendarCheck /> Account
            </Link>
        )}
      </div>
  );

  // Hero section
  const renderHeroSection = () => (
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-4 md:p-6 text-white overflow-hidden rounded-2xl mb-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>

        <div className="relative z-10">
          <Breadcrumb />
          <FadeInWrapper delay={0.1}>
            <div>
              <h1 className={`font-extrabold mb-4 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-5xl'}`}>
                📅 National Park Events
              </h1>
              <p className={`text-blue-100 ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                Discover amazing experiences and events happening at {uniqueParks.length - 1} national parks.
              </p>
              {lastUpdated && (
                  <p className="text-blue-200 text-sm mt-2">
                    🔄 Last updated: {new Date(lastUpdated).toLocaleDateString()}
                  </p>
              )}
            </div>
          </FadeInWrapper>
        </div>
      </div>
  );

  if (loading) {
    return <LoadingComponent />;
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
                  currentUser={currentUser}
                  savedEventsCount={savedEventIds.length}
              />
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-6">

              {/* Stats Cards */}
              <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                <StatCard
                    icon="📊"
                    label="Total Events"
                    value={events.length}
                    color="from-blue-500 to-cyan-500"
                    delay={0.1}
                />
                <StatCard
                    icon="🏞️"
                    label="Parks Featured"
                    value={uniqueParks.length - 1}
                    color="from-green-500 to-emerald-500"
                    delay={0.2}
                />
                <StatCard
                    icon="📅"
                    label="Today's Events"
                    value={events.filter(e => e.start.toLocaleDateString("en-CA") === new Date().toLocaleDateString("en-CA")).length}
                    color="from-orange-500 to-red-500"
                    delay={0.3}
                />
                <StatCard
                    icon="💾"
                    label="Saved Events"
                    value={savedEventIds.length}
                    color="from-purple-500 to-pink-500"
                    delay={0.4}
                    onClick={() => handleQuickAction('saved')}
                />
              </div>

              {/* Enhanced Search and Filters */}
              <EnhancedSearch
                  search={search}
                  onSearchChange={handleSearchChange}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedPark={selectedPark}
                  setSelectedPark={setSelectedPark}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  showAdvancedFilters={showAdvancedFilters}
                  setShowAdvancedFilters={setShowAdvancedFilters}
                  parks={uniqueParks}
                  categories={uniqueCategories}
                  searchResults={searchResults}
                  showSearchDropdown={showSearchDropdown}
                  setShowSearchDropdown={setShowSearchDropdown}
              />

              {/* Two Column Layout: Calendar + Content */}
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>

                {/* Interactive Heatmap */}
                {!isMobile && (
                    <div className="lg:col-span-1">
                      <InteractiveHeatmap
                          monthlyHeatmap={monthlyHeatmap}
                          selectedDate={selectedDate}
                          setSelectedDate={setSelectedDate}
                          events={events}
                      />

                      {/* Trending Events Sidebar */}
                      <FadeInWrapper delay={0.5}>
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mt-6">
                          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                            🔥 Trending Events
                          </h3>
                          <div className="space-y-3">
                            {trendingEvents.slice(0, 3).map((event, index) => (
                                <div key={event.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{EVENT_CATEGORIES[event.category]?.icon || '📅'}</span>
                                    <span className="font-medium text-sm text-gray-800 truncate">{event.title}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 flex items-center gap-2">
                                    <FaMapMarkerAlt />
                                    {event.park}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {event.start.toLocaleDateString()}
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                      </FadeInWrapper>
                    </div>
                )}

                {/* Events List */}
                <div className={isMobile ? 'col-span-1' : 'lg:col-span-2'}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {activeView === 'today' && '📅 Today\'s Events'}
                      {activeView === 'trending' && '🔥 Trending Events'}
                      {activeView === 'saved' && '💾 My Saved Events'}
                      {activeView === 'all' && `📍 Events on ${selectedDate.toDateString()}`}
                    </h2>
                    <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {filteredEvents.length} events
                    </div>
                  </div>

                  {filteredEvents.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className={`font-semibold text-gray-600 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                          No events found
                        </h3>
                        <p className="text-gray-500 mb-6">
                          {activeView === 'saved'
                              ? "You haven't saved any events yet. Start exploring!"
                              : "Try adjusting your filters or search terms"}
                        </p>
                        <button
                            onClick={() => {
                              setSearch('');
                              setSelectedPark('All');
                              setSelectedCategory('All');
                              setActiveView('all');
                              setSelectedDate(new Date());
                            }}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          Reset Filters
                        </button>
                      </div>
                  ) : (
                      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {filteredEvents.map((event, index) => (
                            <EnhancedEventCard
                                key={event.id}
                                event={event}
                                isSaved={savedEventIds.includes(event.id)}
                                onToggleSave={toggleEventSave}
                                currentUser={currentUser}
                                index={index}
                            />
                        ))}
                      </div>
                  )}
                </div>
              </div>

              {/* Mobile Calendar */}
              {isMobile && (
                  <div className="mt-8">
                    <InteractiveHeatmap
                        monthlyHeatmap={monthlyHeatmap}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        events={events}
                    />
                  </div>
              )}

              {/* Related Actions */}
              {!isMobile && (
                  <FadeInWrapper delay={0.8}>
                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200 mt-8">
                      <h3 className="font-bold text-gray-800 mb-6 text-xl">
                        Explore More
                      </h3>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <Link
                            to="/"
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-pink-300 group"
                        >
                          <FaArrowLeft className="text-pink-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-gray-800 text-base">
                              Back to Parks
                            </div>
                            <div className="text-sm text-gray-600">Explore national parks</div>
                          </div>
                        </Link>

                        <Link
                            to="/trip-planner"
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group"
                        >
                          <FaRoute className="text-blue-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-gray-800 text-base">
                              Plan Your Trip
                            </div>
                            <div className="text-sm text-gray-600">Create custom itinerary</div>
                          </div>
                        </Link>

                        <button
                            onClick={() => window.open('https://www.nps.gov/subjects/centennial/events.htm', '_blank')}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-green-300 group w-full text-left"
                        >
                          <FaGlobe className="text-green-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-gray-800 text-base">
                              Official NPS Events
                            </div>
                            <div className="text-sm text-gray-600">Visit the official site</div>
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

export default EnhancedCalendarView;