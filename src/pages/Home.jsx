import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FadeInWrapper from "../components/FadeInWrapper";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParkCardFlip from "../components/ParkCardFlip";
import { useToast } from "../context/ToastContext";
import useIsMobile from "../hooks/useIsMobile";
import SkeletonLoader from "../components/SkeletonLoader";
import Fuse from 'fuse.js';
import { debounce } from 'lodash';

import {
  FaCalendarAlt,
  FaNewspaper,
  FaBookOpen,
  FaUser,
  FaLock,
  FaCogs,
  FaRoute,
  FaSearch,
  FaFilter,
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
  FaChartBar,
  FaEye,
  FaTimes,
  FaBrain,
  FaCamera,
  FaHiking,
  FaCampground,
  FaTree,
  FaWater,
  FaMountain,
  FaSun,
  FaSnowflake,
  FaLeaf,
  FaCloudRain,
  FaExpand,
  FaList,
  FaTh,
  FaGlobe,
  FaFire,
  FaPlus,
  FaClock,
  FaMoneyBillWave
} from "react-icons/fa";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// ===== QUICK ACTIONS PANEL =====
const QuickActions = ({ favorites, onActionClick, currentUser }) => {
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
      id: 'favorites',
      icon: '❤️',
      title: 'My Favorites',
      description: `${favorites.length} saved parks`,
      color: 'from-red-500 to-pink-500',
      action: () => onActionClick('favorites')
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'Analytics',
      description: 'Your travel insights',
      color: 'from-purple-500 to-indigo-500',
      action: () => onActionClick('analytics')
    },
    {
      id: 'explore',
      icon: '🗺️',
      title: 'Explore Map',
      description: 'Interactive discovery',
      color: 'from-blue-500 to-cyan-500',
      action: () => onActionClick('map')
    }
  ];

  return (
    <FadeInWrapper delay={0.2}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {actions.map((action, index) => (
          <FadeInWrapper key={action.id} delay={index * 0.1}>
            <button 
              onClick={action.action}
              className="group bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <div className="font-semibold text-gray-800 text-sm md:text-base">{action.title}</div>
              <div className="text-xs md:text-sm text-gray-600 mt-1">{action.description}</div>
            </button>
          </FadeInWrapper>
        ))}
      </div>
    </FadeInWrapper>
  );
};

// ===== ENHANCED FILTER SIDEBAR =====
const FilterSidebar = ({ onFilterChange, filters, parks }) => {
  const activities = ['Hiking', 'Wildlife', 'Photography', 'Camping', 'Water Sports', 'Rock Climbing'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800">Filter & Discover</h4>
        <button 
          onClick={() => onFilterChange('reset')}
          className="text-xs text-pink-600 hover:text-pink-800 transition"
        >
          Reset All
        </button>
      </div>
      
      {/* Activity Type Filters */}
      <div className="mb-6">
        <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaHiking className="text-green-500" />
          Activities
        </h5>
        <div className="space-y-2">
          {activities.map(activity => (
            <label key={activity} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input 
                type="checkbox" 
                checked={filters.activities?.includes(activity) || false}
                onChange={(e) => onFilterChange('activity', activity, e.target.checked)}
                className="rounded text-pink-500 focus:ring-pink-400" 
              />
              <span>{activity}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Entry Fee Range */}
      <div className="mb-6">
        <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaMoneyBillWave className="text-yellow-500" />
          Entry Fee
        </h5>
        <div className="space-y-2">
          {['Free', 'Under $15', '$15-30', 'Over $30'].map(range => (
            <label key={range} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
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

      {/* Popular Features */}
      <div className="mb-6">
        <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaStar className="text-purple-500" />
          Features
        </h5>
        <div className="space-y-2">
          {['Waterfalls', 'Desert', 'Mountains', 'Lakes', 'Forests', 'Geysers'].map(feature => (
            <label key={feature} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input 
                type="checkbox" 
                checked={filters.features?.includes(feature) || false}
                onChange={(e) => onFilterChange('feature', feature, e.target.checked)}
                className="rounded text-pink-500 focus:ring-pink-400" 
              />
              <span>{feature}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== VIEW MODE TOGGLE =====
const ViewModeToggle = ({ viewMode, setViewMode }) => (
  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
    {[
      { mode: 'grid', icon: FaTh, label: 'Grid' },
      { mode: 'list', icon: FaList, label: 'List' },
      { mode: 'map', icon: FaGlobe, label: 'Map' }
    ].map(({ mode, icon: Icon, label }) => (
      <button
        key={mode}
        onClick={() => setViewMode(mode)}
        className={`flex items-center gap-2 px-3 py-2 text-sm transition ${
          viewMode === mode 
            ? 'bg-pink-500 text-white' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Icon />
        <span className="hidden md:inline">{label}</span>
      </button>
    ))}
  </div>
);

// ===== ENHANCED PARK CARD =====
const EnhancedParkCard = ({ park, isFavorite, onToggleFavorite, currentUser, currentPage, onPlanTrip }) => {
  const navigate = useNavigate();
  
  const getActivityIcons = (park) => {
    const icons = [];
    const desc = park.description?.toLowerCase() || '';
    const highlight = park.highlight?.toLowerCase() || '';
    
    if (desc.includes('hiking') || highlight.includes('trail')) icons.push('🥾');
    if (desc.includes('wildlife') || highlight.includes('wildlife')) icons.push('🦌');
    if (desc.includes('water') || highlight.includes('lake') || highlight.includes('river')) icons.push('🌊');
    if (desc.includes('mountain') || highlight.includes('peak')) icons.push('⛰️');
    if (desc.includes('scenic') || highlight.includes('scenic')) icons.push('📸');
    
    return icons.slice(0, 3);
  };

  const formatHighlight = (highlight) => {
    if (!highlight) return 'Scenic views and natural beauty';
    
    // Capitalize first letter and ensure it ends with a descriptive phrase
    const formatted = highlight.charAt(0).toUpperCase() + highlight.slice(1);
    
    if (formatted.length < 20) {
      return `${formatted} - Perfect for exploration`;
    }
    
    return formatted;
  };

  const formatHours = (hours) => {
    if (!hours) return '24 hours (typical)';
    return hours;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Enhanced image with overlay */}
      <div className="relative overflow-hidden h-48">
        <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-4xl">
          🏞️
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Quick action buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/park/${park.slug}?page=${currentPage}`);
            }}
            className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition text-white"
            title="View Details"
          >
            <FaEye />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPlanTrip(park);
            }}
            className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition text-white"
            title="Add to Trip Planner"
          >
            <FaRoute />
          </button>
        </div>

        {/* Favorite button */}
        {currentUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(park.id);
            }}
            className={`absolute top-4 left-4 text-xl transition transform duration-200 ${
              isFavorite ? "scale-110 text-red-500" : "scale-100 text-white"
            } hover:scale-125`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}

        {/* Best season badge */}
        {park.bestSeason && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
            {park.bestSeason === 'Spring' && '🌸'}
            {park.bestSeason === 'Summer' && '🌞'}
            {park.bestSeason === 'Fall' && '🍂'}
            {park.bestSeason === 'Winter' && '❄️'}
            Best: {park.bestSeason}
          </div>
        )}
      </div>
      
      {/* Enhanced content */}
      <div className="p-6">
        {/* Activity tags and entry fee */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            {getActivityIcons(park).map((icon, index) => (
              <span key={index} className="text-lg">{icon}</span>
            ))}
          </div>
          {park.entryFee && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              Entry: ${park.entryFee}
            </span>
          )}
        </div>
        
        {/* Park name and state */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
          {park.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <FaMapMarkerAlt className="text-pink-500" />
          <span>{park.state}</span>
        </div>
        
        {/* Park info */}
        <div className="space-y-2 mb-4">
          {/* Highlight */}
          <div className="text-sm text-gray-600">
            <span className="font-medium text-purple-600">🎯 Highlight:</span> {formatHighlight(park.highlight)}
          </div>
          
          {/* Hours */}
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">🕒 Hours:</span> {formatHours(park.hours)}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/park/${park.slug}?page=${currentPage}`)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
          >
            <FaEye /> Explore
          </button>
          <button
            onClick={() => onPlanTrip(park)}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
          >
            <FaRoute /> Plan Trip
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN HOME COMPONENT =====
const Home = ({ parks, favorites, toggleFavorite }) => {
  // ===== STATE MANAGEMENT =====
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [viewMode, setViewMode] = useState('grid');
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

  // ===== HOOKS =====
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser, userRole, logout } = useAuth();
  const isMobile = useIsMobile();

  const parksPerPage = 12;

  // ===== FUZZY SEARCH SETUP =====
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

  // ===== EFFECTS =====
  useEffect(() => {
    setSearchParams({ page: currentPage });
  }, [currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ===== DEBOUNCED SEARCH =====
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

  // ===== EVENT HANDLERS =====
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
      case 'favorites':
        showToast('Showing your favorite parks', 'info');
        // You can implement a favorite filter here
        break;
      case 'analytics':
        showToast('Analytics feature coming soon!', 'info');
        break;
      case 'map':
        setViewMode('map');
        showToast('Switched to map view', 'info');
        break;
      default:
        break;
    }
  };

  const handlePlanTrip = (park) => {
    // Navigate to trip planner with pre-selected park
    navigate('/trip-planner', { state: { selectedPark: park } });
    showToast(`Added ${park.name} to trip planner!`, 'success');
  };

  // ===== COMPUTED VALUES =====
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

    // Basic filters
    const matchesSearch = search.length < 2 || 
      name.includes(search.toLowerCase()) ||
      state.includes(search.toLowerCase()) ||
      description.includes(search.toLowerCase());
    
    const matchesState = selectedState === "All" || state.includes(selectedState.toLowerCase());
    const matchesSeason = selectedSeason === "All" || season === selectedSeason.toLowerCase();

    // Advanced filters
    const matchesActivities = filters.activities.length === 0 || 
      filters.activities.some(activity => description.includes(activity.toLowerCase()));
    
    const matchesFeatures = filters.features.length === 0 ||
      filters.features.some(feature => description.includes(feature.toLowerCase()));

    const matchesFeeRange = !filters.feeRange || 
      (filters.feeRange === 'Free' && (!p.entryFee || p.entryFee === 0)) ||
      (filters.feeRange === 'Under $15' && p.entryFee && p.entryFee < 15) ||
      (filters.feeRange === '$15-30' && p.entryFee && p.entryFee >= 15 && p.entryFee <= 30) ||
      (filters.feeRange === 'Over $30' && p.entryFee && p.entryFee > 30);

    return matchesSearch && matchesState && matchesSeason && matchesActivities && matchesFeatures && matchesFeeRange;
  });

  const indexLast = currentPage * parksPerPage;
  const indexFirst = indexLast - parksPerPage;
  const currentParks = filtered.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filtered.length / parksPerPage);

  // ===== STATS CALCULATIONS =====
  const stats = {
    totalParks: parks.length,
    totalStates: uniqueStates.length - 1,
    userFavorites: favorites.length,
    filteredParks: filtered.length
  };

  // ===== RENDER METHODS =====
  const renderHeroSection = () => (
    <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-6 md:p-8 text-white overflow-hidden rounded-2xl mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      
      <div className="relative z-10">
        <FadeInWrapper delay={0.1}>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                🌍 Discover America's Natural Wonders
              </h1>
              <p className="text-lg md:text-xl text-purple-100 max-w-2xl">
                Explore {parks.length} magnificent national parks with interactive maps, smart recommendations, and personalized insights.
              </p>
            </div>
            
            {currentUser && (
              <div className="flex flex-col gap-3">
                <Link
                  to="/account"
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium backdrop-blur-sm"
                >
                  <FaUser />
                  My Account
                </Link>
              </div>
            )}
          </div>
        </FadeInWrapper>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <FadeInWrapper delay={0.2}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { 
            label: 'Total Parks', 
            value: stats.totalParks, 
            icon: '🏞️', 
            color: 'from-pink-500 to-rose-500',
            description: 'National treasures to explore'
          },
          { 
            label: 'States Covered', 
            value: stats.totalStates, 
            icon: '🗺️', 
            color: 'from-blue-500 to-cyan-500',
            description: 'Coast to coast adventures'
          },
          { 
            label: 'Your Favorites', 
            value: stats.userFavorites, 
            icon: '❤️', 
            color: 'from-red-500 to-pink-500',
            description: currentUser ? 'Parks you love' : 'Sign in to save favorites'
          },
          { 
            label: 'Filtered Results', 
            value: stats.filteredParks, 
            icon: '🔍', 
            color: 'from-green-500 to-emerald-500',
            description: 'Matching your search'
          }
        ].map((stat, index) => (
          <FadeInWrapper key={stat.label} delay={index * 0.1}>
            <div className={`group bg-gradient-to-br ${stat.color} p-4 md:p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl md:text-3xl">{stat.icon}</div>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Live
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-white/90 font-medium text-sm md:text-base">{stat.label}</div>
              <div className="text-white/70 text-xs mt-1">{stat.description}</div>
            </div>
          </FadeInWrapper>
        ))}
      </div>
    </FadeInWrapper>
  );

  const renderNavigationLinks = () => (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-sm font-medium mb-6">
      <Link
        to="/calendar"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FaCalendarAlt /> Park Events
      </Link>
      
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FaNewspaper /> Blog Stories
      </Link>

      <Link
        to="/about"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-800 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FaBookOpen /> About
      </Link>

      {currentUser ? (
        <>
          {userRole === "admin" && (
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              <FaCogs /> Admin Panel
            </a>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FaLock /> Login
        </Link>
      )}
    </div>
  );

  const renderEnhancedSearch = () => (
    <FadeInWrapper delay={0.5}>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        {/* Search Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl text-white">
              <FaSearch className="text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Enhanced Park Discovery</h3>
              <p className="text-gray-600">Find your perfect adventure</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showAdvancedFilters 
                ? 'bg-pink-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaFilter />
            <span className="hidden md:inline">Advanced Filters</span>
          </button>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search parks by name, state, features, or activities..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchDropdown(search.length > 0)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full p-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setShowSearchDropdown(false);
                  setSearchResults([]);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto z-20 mt-2">
              <div className="p-2">
                {searchResults.map(park => (
                  <button
                    key={park.id}
                    onClick={() => {
                      navigate(`/park/${park.slug}?page=${currentPage}`);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full p-3 hover:bg-pink-50 cursor-pointer rounded-lg transition-all text-left flex items-center gap-3"
                  >
                    <div className="text-xl">🏞️</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{park.name}</div>
                      <div className="text-sm text-gray-600">{park.state}</div>
                    </div>
                    <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                      {park.relevanceScore}% match
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Basic Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 border-2 border-gray-200 px-4 py-3 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
          >
            {uniqueStates.map((state) => (
              <option key={state} value={state}>{state === 'All' ? 'All States' : state}</option>
            ))}
          </select>

          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {/* Season Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {seasons.map((season) => (
            <button
              key={season}
              onClick={() => {
                setSelectedSeason(season);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSeason === season
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105"
                  : "bg-white text-pink-600 border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
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

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
          <div>
            Showing {currentParks.length} of {filtered.length} parks
            {search && ` matching "${search}"`}
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </FadeInWrapper>
  );

  const renderParkContent = () => {
    if (viewMode === 'map') {
      return (
        <FadeInWrapper delay={0.6}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-8">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Interactive Park Map</h3>
              <p className="text-gray-600">Click on any marker to learn more about that park</p>
            </div>
            <div className="h-96 md:h-[500px]">
              <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom={true} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filtered.map((park) => {
                  if (!park.coordinates?.includes(",")) return null;
                  const [lat, lng] = park.coordinates.split(",").map((val) => parseFloat(val.trim()));
                  if (isNaN(lat) || isNaN(lng)) return null;
                  return (
                    <Marker key={park.id} position={[lat, lng]}>
                      <Popup>
                        <div className="text-center p-2">
                          <strong className="text-lg">{park.name}</strong><br />
                          <div className="text-sm text-gray-600 my-2">{park.state}</div>
                          {park.entryFee && (
                            <div className="text-sm text-green-600 mb-2">Entry: ${park.entryFee}</div>
                          )}
                          <button
                            onClick={() => navigate(`/park/${park.slug}?page=${currentPage}`)}
                            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition text-sm font-medium"
                          >
                            View Park →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </FadeInWrapper>
      );
    }

    // Grid or List view
    const isListView = viewMode === 'list';
    
    return (
      <FadeInWrapper delay={0.6}>
        <div className={isListView ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {parks.length === 0 ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48 w-full shadow-sm" />
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
                {isListView ? (
                  // List view component
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      🏞️
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{park.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-pink-500" />
                          {park.state}
                        </span>
                        {park.bestSeason && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Best: {park.bestSeason}
                          </span>
                        )}
                        {park.entryFee && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Entry: ${park.entryFee}
                          </span>
                        )}
                        {park.hours && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            <FaClock className="inline mr-1" />
                            {park.hours}
                          </span>
                        )}
                      </div>
                      {park.highlight && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          <span className="font-medium text-purple-600">Highlight:</span> {park.highlight}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/park/${park.slug}?page=${currentPage}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                      >
                        <FaEye className="inline mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => handlePlanTrip(park)}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-sm font-medium"
                      >
                        <FaRoute className="inline mr-2" />
                        Plan Trip
                      </button>
                      {currentUser && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(park.id);
                          }}
                          className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                            favorites.includes(park.id)
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <FaHeart className="inline mr-2" />
                          {favorites.includes(park.id) ? 'Saved' : 'Save'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Grid view - use enhanced park card
                  <EnhancedParkCard
                    park={park}
                    isFavorite={favorites.includes(park.id)}
                    onToggleFavorite={toggleFavorite}
                    currentUser={currentUser}
                    currentPage={currentPage}
                    onPlanTrip={handlePlanTrip}
                  />
                )}
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
        <div className="flex flex-wrap justify-center items-center gap-2 mt-10 mb-16 px-4">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-white text-pink-600 border-pink-400 hover:bg-pink-50 disabled:hover:bg-white"
          >
            Previous
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (currentPage <= 4) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = currentPage - 3 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[44px] px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out ${
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
            className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-white text-pink-600 border-pink-400 hover:bg-pink-50 disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      </FadeInWrapper>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          
          {/* Hero Section */}
          <div className="p-6 md:p-8">
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
          <div className="p-6 md:p-8">
            {/* Enhanced Search & Filters */}
            {renderEnhancedSearch()}
            
            {/* Advanced Filters Sidebar */}
            <div className="flex gap-8">
              {showAdvancedFilters && (
                <div className="w-80 flex-shrink-0 hidden lg:block">
                  <FilterSidebar 
                    onFilterChange={handleFilterChange}
                    filters={filters}
                    parks={parks}
                  />
                </div>
              )}
              
              {/* Parks Content */}
              <div className="flex-1">
                {renderParkContent()}
                
                {/* Pagination */}
                {renderPagination()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;