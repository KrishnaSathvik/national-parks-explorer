import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useToast} from "../context/ToastContext";
import useIsMobile from "../hooks/useIsMobile";
import FadeInWrapper from "../components/FadeInWrapper";
import Fuse from 'fuse.js';
import {debounce} from 'lodash';

import {
    FaArrowRight,
    FaBookOpen,
    FaCalendarAlt,
    FaCogs,
    FaEye,
    FaFilter,
    FaHeart,
    FaLock,
    FaMapMarkerAlt,
    FaNewspaper,
    FaRoute,
    FaSearch,
    FaTimes,
    FaUser
} from "react-icons/fa";

// Enhanced QuickActions component with better mobile design
const QuickActions = ({ favorites, onActionClick, currentUser }) => {
    const {isMobile} = useIsMobile();

    const actions = [
    {
      id: 'plan-trip',
      icon: '🎯',
      title: 'Plan Trip',
      description: 'Create custom itinerary',
      color: 'from-pink-500 to-rose-500',
      action: () => onActionClick('trip-planner')
    },
    {
      id: 'seasonal',
      icon: '🌸',
      title: 'Seasonal Guide',
      description: 'Best parks by season',
      color: 'from-green-500 to-emerald-500',
      action: () => onActionClick('seasonal')
    },
    {
      id: 'recommendations',
      icon: '🧠',
      title: 'AI Suggestions',
      description: 'Smart recommendations',
      color: 'from-purple-500 to-indigo-500',
      action: () => onActionClick('recommendations')
    },
  ];

  return (
      <FadeInWrapper delay={0.2}>
          <div className="mb-6">
              <div
                  className={`grid gap-4 w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} max-w-4xl mx-auto`}>
                  {actions.map((action, index) => (
                      <FadeInWrapper key={action.id} delay={index * 0.1}>
                          <button
                              onClick={action.action}
                              className={`group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 w-full flex flex-col items-center justify-center ${isMobile ? 'min-h-[120px]' : 'min-h-[140px]'}`}
                          >
                              <div
                                  className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-3 group-hover:scale-110 transition-transform`}>
                                  {action.icon}
                              </div>
                              <div
                                  className={`font-semibold text-gray-800 ${isMobile ? 'text-base' : 'text-base md:text-lg'} mb-2`}>{action.title}</div>
                              <div
                                  className={`text-gray-600 text-center ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>{action.description}</div>
                          </button>
                      </FadeInWrapper>
                  ))}
              </div>
          </div>
      </FadeInWrapper>
  );
};

// Enhanced Mobile-First Park Discovery Component
const MobileEnhancedSearch = ({
                                  search,
                                  onSearchChange,
                                  selectedState,
                                  setSelectedState,
                                  selectedSeason,
                                  setSelectedSeason,
                                  uniqueStates,
                                  seasons,
                                  showAdvancedFilters,
                                  setShowAdvancedFilters,
                                  filters,
                                  onFilterChange,
                                  filtered,
                                  currentPage,
                                  totalPages,
                                  searchResults,
                                  showSearchDropdown,
                                  setShowSearchDropdown
                              }) => {
    const {isMobile} = useIsMobile();
    const navigate = useNavigate();

  return (
      <FadeInWrapper delay={0.5}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
              {/* Compact Header for Mobile */}
              <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                          <div
                              className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 md:p-3 rounded-xl text-white">
                              <FaSearch className={isMobile ? "text-lg" : "text-xl"}/>
                          </div>
                          <div>
                              <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>Discover
                                  Parks</h3>
                              <p className="text-gray-600 text-sm">Find your perfect adventure</p>
                          </div>
                      </div>

                      {!isMobile && (
                          <button
                              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                  showAdvancedFilters
                                      ? 'bg-pink-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                              <FaFilter/>
                              <span className="hidden md:inline">Filters</span>
                          </button>
                      )}
                  </div>

                  {/* Mobile-Optimized Search Bar */}
                  <div className="relative mb-4">
                      <input
                          type="text"
                          placeholder="Search parks..."
                          value={search}
                          onChange={onSearchChange}
                          onFocus={() => setShowSearchDropdown(search.length > 0)}
                          onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                          className="w-full p-3 pl-10 pr-10 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
                          style={{fontSize: '16px'}} // Prevents iOS zoom
              />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                      {search && (
                          <button
                              onClick={() => {
                                  onSearchChange({target: {value: ''}});
                                  setShowSearchDropdown(false);
                              }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                          >
                              <FaTimes/>
                          </button>
                      )}
                  </div>

                  {/* Search Dropdown for Mobile */}
                  {showSearchDropdown && searchResults.length > 0 && (
                      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-64 overflow-y-auto">
                          <div className="text-sm font-medium text-gray-700 mb-2">Quick Results</div>
                          {searchResults.slice(0, isMobile ? 4 : 6).map(park => (
                              <button
                                  key={park.id}
                                  onClick={() => {
                                      navigate(`/park/${park.slug}?page=${currentPage}`);
                                      setShowSearchDropdown(false);
                                  }}
                                  className="w-full p-2 text-left hover:bg-white rounded-lg transition flex items-center gap-3 mb-2 last:mb-0"
                              >
                                  <div className="text-lg">🏞️</div>
                                  <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-800 truncate">{park.name}</div>
                                      <div className="text-sm text-gray-600 truncate">{park.state}</div>
                                  </div>
                                  <FaArrowRight className="text-gray-400 text-sm"/>
                              </button>
                          ))}
                      </div>
                  )}

                  {/* Mobile-First Filters */}
                  <div className="space-y-3">
                      {/* State and Season in a row on larger screens, stacked on mobile */}
                      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          <select
                              value={selectedState}
                              onChange={(e) => setSelectedState(e.target.value)}
                              className="border-2 border-gray-200 px-3 py-2 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white"
                              style={{fontSize: '16px'}}
                          >
                              {uniqueStates.map((state) => (
                                  <option key={state} value={state}>{state === 'All' ? 'All States' : state}</option>
                              ))}
                          </select>

                          {/* Mobile Filters Button */}
                          {isMobile && (
                              <button
                                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition ${
                                      showAdvancedFilters
                                          ? 'bg-pink-500 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                              >
                                  <FaFilter/>
                                  Filters
                              </button>
                          )}
                      </div>

                      {/* Season Filter Chips */}
                      <div className="flex flex-wrap gap-2">
                          {seasons.map((season) => (
                              <button
                                  key={season}
                                  onClick={() => setSelectedSeason(season)}
                                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                      selectedSeason === season
                                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                              >
                                  {season === "Spring" && "🌸 "}
                                  {season === "Summer" && "🌞 "}
                                  {season === "Fall" && "🍂 "}
                                  {season === "Winter" && "❄️ "}
                                  {season}
                              </button>
                          ))}
                      </div>

                      {/* Advanced Filters Expandable Section */}
                      {showAdvancedFilters && (
                          <div className="border-t border-gray-200 pt-4 mt-4">
                              <div className="space-y-4">
                                  {/* Entry Fee Filter */}
                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee</label>
                                      <div className="grid grid-cols-2 gap-2">
                                          {['Free', 'Under $15', '$15-30', 'Over $30'].map(range => (
                                              <label key={range}
                                                     className="flex items-center gap-2 text-sm cursor-pointer">
                                                  <input
                                                      type="radio"
                                                      name="feeRange"
                                                      checked={filters.feeRange === range}
                                                      onChange={() => onFilterChange('feeRange', range)}
                                                      className="text-pink-500 focus:ring-pink-400"
                                                  />
                                                  <span>{range}</span>
                                              </label>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Quick Activities */}
                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['Hiking', 'Wildlife', 'Photography', 'Camping'].map(activity => (
                                              <button
                                                  key={activity}
                                                  onClick={() => onFilterChange('activity', activity, !filters.activities?.includes(activity))}
                                                  className={`px-3 py-1 rounded-full text-sm transition ${
                                                      filters.activities?.includes(activity)
                                                          ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                                                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                                  }`}
                                              >
                                                  {activity}
                                              </button>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Reset Filters */}
                                  <button
                                      onClick={() => onFilterChange('reset')}
                                      className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                                  >
                                      Reset All Filters
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Results Summary */}
                  <div
                      className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4 mt-4">
                      <div>
                          Showing {filtered.length} parks
                          {search && ` for "${search}"`}
                      </div>
                      <div>
                          Page {currentPage} of {totalPages}
                      </div>
                  </div>
              </div>
          </div>
      </FadeInWrapper>
  );
};

// Enhanced Mobile Park Card without the large eye icon
const EnhancedMobileParkCard = ({park, isFavorite, onToggleFavorite, currentUser, currentPage, onPlanTrip}) => {
  const navigate = useNavigate();
    const {isMobile} = useIsMobile();

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

  return (
      <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          {/* Image Section */}
          <div className="relative h-48 bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center">
              <div className="text-5xl">🏞️</div>

              {/* Favorite Button */}
          {currentUser && (
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(park.id);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                      isFavorite
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-600 hover:bg-white"
                  }`}
              >
                  <FaHeart className="text-sm"/>
              </button>
          )}

              {/* Best Season Badge */}
          {park.bestSeason && (
              <div
                  className="absolute bottom-3 left-3 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                {park.bestSeason === 'Spring' && '🌸'}
                {park.bestSeason === 'Summer' && '🌞'}
                {park.bestSeason === 'Fall' && '🍂'}
                {park.bestSeason === 'Winter' && '❄️'}
                  {park.bestSeason}
              </div>
          )}
        </div>

          {/* Content Section */}
          <div className="p-4">
              {/* Header with Activities */}
              <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1">
              {getActivityIcons(park).map((icon, index) => (
                  <span key={index} className="text-lg">{icon}</span>
              ))}
            </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      {park.entryFee && park.entryFee > 0 ? `$${park.entryFee}` : 'Free'}
            </div>
          </div>

              {/* Park Name */}
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
            {park.name}
          </h3>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <FaMapMarkerAlt className="text-pink-500 text-sm"/>
                  <span className="text-sm">{park.state}</span>
          </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-600">Established</div>
                      <div className="text-sm font-bold text-gray-800">
                          {park.established || 'Historic'}
                      </div>
            </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-600">Visitors</div>
                      <div className="text-sm font-bold text-gray-800">
                          {park.annualVisitors ? `${park.annualVisitors}M` : 'Popular'}
                      </div>
            </div>
          </div>

              {/* Highlight */}
              {park.highlight && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {park.highlight}
                  </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
            <button
                onClick={() => navigate(`/park/${park.slug}?page=${currentPage}`)}
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
      </div>
  );
};

// Main Enhanced Home Component
const EnhancedMobileHome = ({parks = [], favorites = [], toggleFavorite}) => {
    // State Management
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Enhanced filters state
  const [filters, setFilters] = useState({
    activities: [],
    features: [],
    feeRange: '',
    difficulty: ''
  });

    // Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser, userRole, logout } = useAuth();
    const {isMobile, isTablet} = useIsMobile();

    const parksPerPage = isMobile ? 6 : 9;

    // Fuzzy Search Setup
  const fuse = useMemo(() => new Fuse(parks, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'state', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'highlight', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2
  }), [parks]);

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

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    setShowSearchDropdown(value.length > 0);
    setCurrentPage(1);

    if (value.length >= 2) {
      debouncedSearch(value);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

    // Event Handlers
  const handleLogout = async () => {
    await logout();
    showToast("👋 Logged out successfully", "success");
    navigate("/");
  };

  const handleFilterChange = (type, value, checked = true) => {
    if (type === 'reset') {
      setFilters({
        activities: [],
        features: [],
        feeRange: '',
        difficulty: ''
      });
      return;
    }

    setFilters(prev => {
      const newFilters = { ...prev };

      if (type === 'activity' || type === 'feature') {
        const arrayKey = type === 'activity' ? 'activities' : 'features';
        if (checked) {
          newFilters[arrayKey] = [...(prev[arrayKey] || []), value];
        } else {
          newFilters[arrayKey] = (prev[arrayKey] || []).filter(item => item !== value);
        }
      } else {
        newFilters[type] = value;
      }

      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'trip-planner':
        navigate('/trip-planner');
        break;
      case 'seasonal':
        navigate('/seasonal');
        showToast('🌸 Explore parks by season!', 'info');
        break;
      case 'recommendations':
        navigate('/recommendations');
        showToast('🧠 AI recommendations loading...', 'info');
        break;
      default:
        break;
    }
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

    // Computed Values
  const allStates = useMemo(
      () => parks.flatMap((p) => p.state?.split(",").map((s) => s.trim()) || []),
      [parks]
  );
  const uniqueStates = useMemo(() => ["All", ...Array.from(new Set(allStates))], [allStates]);
  const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];

  // Enhanced filtering logic
  const filtered = parks.filter((p) => {
    const name = p.name?.toLowerCase() || "";
    const state = p.state?.toLowerCase() || "";
    const season = p.bestSeason?.toLowerCase() || "";
    const description = p.description?.toLowerCase() || "";

      const matchesSearch = search.length < 2 ||
          name.includes(search.toLowerCase()) ||
          state.includes(search.toLowerCase()) ||
          description.includes(search.toLowerCase());

      const matchesState = selectedState === "All" || state.includes(selectedState.toLowerCase());
    const matchesSeason = selectedSeason === "All" || season === selectedSeason.toLowerCase();

      const matchesActivities = filters.activities.length === 0 ||
          filters.activities.some(activity => description.includes(activity.toLowerCase()));

      const matchesFeeRange = !filters.feeRange ||
          (filters.feeRange === 'Free' && (!p.entryFee || p.entryFee === 0)) ||
          (filters.feeRange === 'Under $15' && p.entryFee && p.entryFee < 15) ||
          (filters.feeRange === '$15-30' && p.entryFee && p.entryFee >= 15 && p.entryFee <= 30) ||
          (filters.feeRange === 'Over $30' && p.entryFee && p.entryFee > 30);

      return matchesSearch && matchesState && matchesSeason && matchesActivities && matchesFeeRange;
  });

  const indexLast = currentPage * parksPerPage;
  const indexFirst = indexLast - parksPerPage;
  const currentParks = filtered.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filtered.length / parksPerPage);

    // Stats calculations
  const stats = {
    totalParks: parks.length,
    totalStates: uniqueStates.length - 1,
    userFavorites: favorites.length,
    filteredParks: filtered.length
  };

    // Render Methods
  const renderHeroSection = () => (
      <div
          className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-4 md:p-6 text-white overflow-hidden rounded-2xl mb-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>

          <div className="relative z-10">
              <FadeInWrapper delay={0.1}>
            <div>
                <h1 className={`font-extrabold mb-4 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-5xl'}`}>
                🌍 National Parks Explorer
              </h1>
                <p className={`text-purple-100 ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                    Explore {parks.length} magnificent national parks with smart recommendations.
              </p>
            </div>
              </FadeInWrapper>
          </div>
      </div>
  );

  const renderStatsCards = () => (
      <FadeInWrapper delay={0.2}>
          <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {[
                  {
                      label: 'Total Parks',
                      value: stats.totalParks,
                      icon: '🏞️',
                      color: 'from-pink-500 to-rose-500',
                  },
                  {
                      label: 'States',
                      value: stats.totalStates,
                      icon: '🗺️',
                      color: 'from-blue-500 to-cyan-500',
                  },
                  {
                      label: 'Favorites',
                      value: stats.userFavorites,
                      icon: '❤️',
                      color: 'from-red-500 to-pink-500',
                  },
                  {
                      label: 'Results',
                      value: stats.filteredParks,
                      icon: '🔍',
                      color: 'from-green-500 to-emerald-500',
                  }
              ].map((stat, index) => (
                  <FadeInWrapper key={stat.label} delay={index * 0.1}>
                      <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                          <div className="flex items-center justify-between mb-2">
                              <div className={isMobile ? "text-xl" : "text-2xl"}>{stat.icon}</div>
                          </div>
                          <div className={`font-bold mb-1 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{stat.value}</div>
                          <div
                              className={`text-white/90 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{stat.label}</div>
                      </div>
                  </FadeInWrapper>
              ))}
          </div>
      </FadeInWrapper>
  );

  const renderNavigationLinks = () => (
      <div className={`flex flex-wrap justify-center gap-2 text-sm font-medium mb-6 ${isMobile ? 'px-2' : ''}`}>
          <Link
              to="/calendar"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
              <FaCalendarAlt/> Events
          </Link>

          <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
              <FaNewspaper/> Blog
          </Link>

          <Link
              to="/about"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
              <FaBookOpen/> About
          </Link>

          {currentUser && (
              <Link
                  to="/account"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                  <FaUser/>
                  Account
              </Link>
          )}

          {currentUser ? (
              <>
                  {userRole === "admin" && (
                      <a
                          href="/admin"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                      >
                          <FaCogs/> Admin
                      </a>
                  )}

                  <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
                  >
                      Logout
                  </button>
              </>
          ) : (
              <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                  <FaLock/> Login
              </Link>
          )}
      </div>
  );

  const renderParkContent = () => {
    return (
        <FadeInWrapper delay={0.6}>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {parks.length === 0 ? (
                    Array.from({length: isMobile ? 3 : 6}).map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48 w-full shadow-sm"/>
                    ))
                ) : currentParks.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No parks match your search</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                        <button
                            onClick={() => {
                                setSearch('');
                                setSelectedState('All');
                                setSelectedSeason('All');
                                setFilters({
                                    activities: [],
                                    features: [],
                                    feeRange: '',
                                    difficulty: ''
                                });
                            }}
                            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    currentParks.map((park, idx) => (
                        <FadeInWrapper key={park.id} delay={idx * 0.1}>
                            <EnhancedMobileParkCard
                                park={park}
                                isFavorite={favorites.includes(park.id)}
                                onToggleFavorite={toggleFavorite}
                                currentUser={currentUser}
                                currentPage={currentPage}
                                onPlanTrip={handlePlanTrip}
                            />
                        </FadeInWrapper>
                    ))
                )}
            </div>
        </FadeInWrapper>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
        <FadeInWrapper delay={0.7}>
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-8 px-4">
                {/* Previous button */}
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-white text-pink-600 border-pink-400 hover:bg-pink-50 disabled:hover:bg-white min-h-[44px]"
                >
                    Previous
                </button>

                {/* Page numbers - show fewer on mobile */}
                {Array.from({length: Math.min(totalPages, isMobile ? 5 : 7)}, (_, i) => {
                    let pageNum;
                    if (totalPages <= (isMobile ? 5 : 7)) {
                        pageNum = i + 1;
                    } else if (currentPage <= (isMobile ? 3 : 4)) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - (isMobile ? 2 : 3)) {
                        pageNum = totalPages - (isMobile ? 4 : 6) + i;
                    } else {
                        pageNum = currentPage - (isMobile ? 2 : 3) + i;
                    }

                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[44px] px-3 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out ${
                                currentPage === pageNum
                                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg transform scale-105"
                                    : "bg-white text-pink-600 border-pink-300 hover:bg-pink-50 hover:border-pink-400"
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                {/* Next button */}
                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-white text-pink-600 border-pink-400 hover:bg-pink-50 disabled:hover:bg-white min-h-[44px]"
                >
                    Next
                </button>
            </div>
        </FadeInWrapper>
    );
  };

    // Effects
    useEffect(() => {
        setSearchParams({page: currentPage});
    }, [currentPage, setSearchParams]);

    useEffect(() => {
        window.scrollTo({top: 0, behavior: "smooth"});
    }, []);

    // Main Render
  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">

                  {/* Hero Section */}
                  <div className="p-4 md:p-6">
                      {renderHeroSection()}

                      {/* Navigation Links */}
                      {renderNavigationLinks()}

                      {/* Stats Cards */}
                      {renderStatsCards()}

                      {/* Quick Actions */}
                      <QuickActions
                          favorites={favorites}
                          onActionClick={handleQuickAction}
                          currentUser={currentUser}
                      />
                  </div>

                  {/* Main Content Area */}
                  <div className="p-4 md:p-6">
                      {/* Enhanced Search & Filters */}
                      <MobileEnhancedSearch
                          search={search}
                          onSearchChange={handleSearchChange}
                          selectedState={selectedState}
                          setSelectedState={setSelectedState}
                          selectedSeason={selectedSeason}
                          setSelectedSeason={setSelectedSeason}
                          uniqueStates={uniqueStates}
                          seasons={seasons}
                          showAdvancedFilters={showAdvancedFilters}
                          setShowAdvancedFilters={setShowAdvancedFilters}
                          filters={filters}
                          onFilterChange={handleFilterChange}
                          filtered={filtered}
                          currentPage={currentPage}
                          totalPages={totalPages}
                          searchResults={searchResults}
                          showSearchDropdown={showSearchDropdown}
                          setShowSearchDropdown={setShowSearchDropdown}
                      />

                      {/* Parks Content */}
                      {renderParkContent()}

                      {/* Pagination */}
                      {renderPagination()}
                  </div>
              </div>
          </div>
      </div>
  );
};

export default EnhancedMobileHome;