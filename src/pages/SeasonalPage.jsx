// REPLACE your existing SeasonalPage with this updated version

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HybridParksService from '../services/HybridParksService'; // Import the new service
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaInfoCircle,
  FaLeaf,
  FaMapMarkerAlt,
  FaPause,
  FaPlay,
  FaRegHeart,
  FaSnowflake,
  FaSun,
  FaTimes,
  FaCamera,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaExclamationTriangle
} from 'react-icons/fa';

// Your existing SEASONS data (keep exactly the same)
const SEASONS = [
  {
    id: 'spring',
    name: 'Spring',
    emoji: '🌸',
    icon: FaLeaf,
    primaryColor: 'from-green-400 to-emerald-500',
    secondaryColor: 'from-green-50 to-emerald-50',
    bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
    description: 'Nature awakens with blooming wildflowers and refreshing temperatures',
    tagline: 'Bloom Into Adventure'
  },
  {
    id: 'summer',
    name: 'Summer',
    emoji: '☀️',
    icon: FaSun,
    primaryColor: 'from-yellow-400 to-orange-500',
    secondaryColor: 'from-yellow-50 to-orange-50',
    bgGradient: 'from-yellow-50 via-orange-50 to-red-50',
    description: 'Peak season with long days and endless outdoor adventures',
    tagline: 'Endless Summer Adventures'
  },
  {
    id: 'fall',
    name: 'Fall',
    emoji: '🍂',
    icon: FaLeaf,
    primaryColor: 'from-orange-400 to-red-500',
    secondaryColor: 'from-orange-50 to-red-50',
    bgGradient: 'from-orange-50 via-red-50 to-pink-50',
    description: 'Spectacular autumn colors paint the landscape in brilliant hues',
    tagline: 'Fall Into Natural Beauty'
  },
  {
    id: 'winter',
    name: 'Winter',
    emoji: '❄️',
    icon: FaSnowflake,
    primaryColor: 'from-blue-400 to-cyan-500',
    secondaryColor: 'from-blue-50 to-cyan-50',
    bgGradient: 'from-blue-50 via-cyan-50 to-indigo-50',
    description: 'Serene snow-covered landscapes offer peaceful winter wonderlands',
    tagline: 'Winter Wonderland Awaits'
  }
];

// Enhanced Loading Component
const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Parks...</h3>
      <p className="text-gray-600">Fetching the latest park information</p>
    </div>
);

// Enhanced Error Component
const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-20">
      <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-600 mb-4 text-center max-w-md">{message}</p>
      <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
);

// Updated Park Card - now works with hybrid data
const EnhancedParkCard = ({ park, season, index, favorites = [], onToggleFavorite }) => {
  // 🎯 NEW: Access seasonal info from hybrid service data
  const seasonalInfo = park.seasons?.[season.id] || {
    whyFamous: `Perfect ${season.name.toLowerCase()} destination with ideal weather and seasonal activities`,
    uniqueActivities: [`${season.name} hiking`, `${season.name} photography`, `${season.name} wildlife viewing`],
    insiderTips: [`Best time to visit: ${season.name}`, 'Check park website for conditions', 'Book accommodations early']
  };

  const isFavorite = favorites.includes(park.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const bestSeasons = park.bestSeasons || [season.id];
  const isOptimalSeason = bestSeasons.includes(season.id);

  // 🏆 NEW: Show data quality indicator
  const dataQuality = park.dataQuality || { tier: 'standard', accuracy: 75 };
  const qualityColor = dataQuality.tier === 'premium' ? 'text-green-600' : 'text-blue-600';
  const qualityIcon = dataQuality.tier === 'premium' ? '🏆' : '📊';

  return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Park Image */}
        {park.imageUrl && (
            <div className="relative h-48 overflow-hidden">
              <img
                  src={park.imageUrl}
                  alt={park.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Data Quality Badge */}
              <div className={`absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium ${qualityColor} flex items-center gap-1`}>
                <span>{qualityIcon}</span>
                <span>{dataQuality.accuracy}%</span>
              </div>

              <button
                  onClick={() => onToggleFavorite?.(park.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                      isFavorite
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
        )}

        <div className={`relative bg-gradient-to-r ${season.primaryColor} p-4 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold mb-1 line-clamp-2">
                {park.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <FaMapMarkerAlt className="text-xs flex-shrink-0" />
                <span className="truncate">{park.state}</span>
                {park.entryFee && (
                    <>
                      <span>•</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                    ${park.entryFee}
                  </span>
                    </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                isOptimalSeason ? 'bg-green-500/90 text-white' : 'bg-white/20 text-white'
            }`}>
              <span className="text-sm">{season.emoji}</span>
              <span>{isOptimalSeason ? 'Perfect for' : 'Good for'} {season.name}</span>
            </div>
            {isOptimalSeason && (
                <div className="inline-flex items-center gap-1 bg-yellow-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <span>⭐</span>
                  <span>Best Season</span>
                </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className={`bg-gradient-to-r ${season.secondaryColor} p-4 rounded-xl mb-4 border-l-4 border-green-400`}>
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm md:text-base">
              <span>🌟</span>
              <span>Why visit in {season.name}:</span>
            </div>
            <div className="text-gray-700 text-sm md:text-base leading-relaxed">
              {seasonalInfo.whyFamous}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-medium text-purple-700 flex items-center gap-2 mb-3 text-sm md:text-base">
              <FaCamera />
              <span>Must-do activities:</span>
            </div>

            <div className="space-y-2">
              {(isExpanded ? seasonalInfo.uniqueActivities : seasonalInfo.uniqueActivities.slice(0, 3)).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2" />
                    <span className="leading-relaxed">{activity}</span>
                  </div>
              ))}
            </div>

            {seasonalInfo.uniqueActivities.length > 3 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
                >
                  {isExpanded ? 'Show less' : `Show ${seasonalInfo.uniqueActivities.length - 3} more`}
                  {isExpanded ? <FaChevronLeft className="text-xs" /> : <FaChevronRight className="text-xs" />}
                </button>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-medium text-blue-700 flex items-center gap-2 mb-2 text-sm md:text-base">
              <FaInfoCircle />
              <span>Insider Tips:</span>
            </div>
            <div className="space-y-1">
              {seasonalInfo.insiderTips.slice(0, 3).map((tip, idx) => (
                  <div key={idx} className="text-sm text-blue-600 flex items-start gap-2">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

// Your existing SeasonControlPanel (keep exactly the same)
const SeasonControlPanel = ({
                              currentSeason,
                              isAutoRotating,
                              onToggleAutoRotate,
                              onSeasonChange,
                              progress,
                              isMobile
                            }) => {
  return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-r ${currentSeason.primaryColor} p-3 md:p-4 rounded-2xl text-white text-xl md:text-2xl flex-shrink-0`}>
              {currentSeason.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                {currentSeason.name} Parks
              </h3>
              <p className="text-sm md:text-base text-gray-600 truncate">
                {currentSeason.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 flex-1 justify-center">
              {SEASONS.map(season => (
                  <button
                      key={season.id}
                      onClick={() => onSeasonChange(season)}
                      className={`p-2 md:p-3 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                          currentSeason.id === season.id
                              ? `bg-gradient-to-r ${season.primaryColor} text-white shadow-lg transform scale-105`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'
                      }`}
                      title={season.name}
                  >
                    <span className="text-lg md:text-xl">{season.emoji}</span>
                  </button>
              ))}
            </div>

            <button
                onClick={onToggleAutoRotate}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 min-h-[44px] ${
                    isAutoRotating
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {isAutoRotating ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
              {!isMobile && (
                  <span className="text-sm font-medium">
                {isAutoRotating ? 'Pause' : 'Auto'}
              </span>
              )}
            </button>
          </div>

          {isAutoRotating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Next season in:</span>
                  <span>{Math.ceil((100 - progress) * 0.25)}s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                      className={`bg-gradient-to-r ${currentSeason.primaryColor} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

// Enhanced Statistics Component with data quality metrics
const SeasonalStats = ({ parks, currentSeason, filteredParks }) => {
  const seasonalParks = parks.filter(park => park.seasons?.[currentSeason.id]);
  const bestSeasonParks = parks.filter(park => park.bestSeasons?.includes(currentSeason.id));
  const premiumParks = parks.filter(park => park.dataQuality?.tier === 'premium');

  return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{filteredParks.length}</div>
          <div className="text-sm text-gray-600">Available Parks</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{bestSeasonParks.length}</div>
          <div className="text-sm text-gray-600">Best Season</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{premiumParks.length}</div>
          <div className="text-sm text-gray-600">Premium Data</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{parks.length}</div>
          <div className="text-sm text-gray-600">Total Parks</div>
        </div>
      </div>
  );
};

// MAIN COMPONENT - Updated to use Hybrid Service
const EnhancedSeasonalPage = ({ favorites = [], toggleFavorite }) => {
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [key, setKey] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 🚀 NEW: Hybrid data management states
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentSeason = SEASONS[currentSeasonIndex];
  const rotationInterval = 25000;
  const progressInterval = 100;

  // 🚀 NEW: Load parks using Hybrid Service
  useEffect(() => {
    const loadParks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the new Hybrid Service instead of hardcoded data
        const parksData = await HybridParksService.fetchAllParks();
        setParks(parksData);

        console.log(`✅ Loaded ${parksData.length} parks with hybrid strategy`);

      } catch (err) {
        setError('Failed to load parks data. Please try again.');
        console.error('Failed to load parks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadParks();
  }, []);

  // Handle window resize (keep existing logic)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotation logic (keep existing)
  useEffect(() => {
    if (!isAutoRotating) return;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + (progressInterval / rotationInterval) * 100;
      });
    }, progressInterval);

    const rotationTimer = setInterval(() => {
      setCurrentSeasonIndex(prev => {
        const nextIndex = (prev + 1) % SEASONS.length;
        setKey(prevKey => prevKey + 1);
        setProgress(0);
        return nextIndex;
      });
    }, rotationInterval);

    return () => {
      clearInterval(progressTimer);
      clearInterval(rotationTimer);
    };
  }, [isAutoRotating]);

  // 🚀 NEW: Enhanced filtering with search
  const filteredParks = useMemo(() => {
    return parks.filter(park => {
      // Filter by season availability
      const hasSeasonData = park.seasons?.[currentSeason.id];
      if (!hasSeasonData) return false;

      // Filter by search term
      if (searchTerm) {
        const matchesSearch = park.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            park.state.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [parks, currentSeason.id, searchTerm]);

  const handleSeasonChange = (season) => {
    const newIndex = SEASONS.findIndex(s => s.id === season.id);
    setCurrentSeasonIndex(newIndex);
    setProgress(0);
    setKey(prev => prev + 1);
  };

  const handleToggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
    setProgress(0);
  };

  const handleToggleFavorite = (parkId) => {
    toggleFavorite?.(parkId);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger reload
    window.location.reload();
  };

  return (
      <div className={`min-h-screen bg-gradient-to-br ${currentSeason.bgGradient} transition-all duration-1000`}>
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
            {/* Header (keep existing design) */}
            <div className={`relative bg-gradient-to-r ${currentSeason.primaryColor} p-6 md:p-8 text-white overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />

              <div className="absolute inset-0 pointer-events-none">
                {currentSeason.id === 'spring' && (
                    <>
                      <div className="absolute top-4 left-4 text-2xl md:text-4xl animate-bounce delay-300">🌸</div>
                      <div className="absolute top-16 right-8 text-xl md:text-3xl animate-bounce delay-700">🦋</div>
                      <div className="absolute bottom-8 left-12 text-lg md:text-2xl animate-bounce delay-1000">🌿</div>
                    </>
                )}
                {currentSeason.id === 'summer' && (
                    <>
                      <div className="absolute top-4 right-4 text-2xl md:text-4xl animate-pulse">☀️</div>
                      <div className="absolute top-16 left-8 text-xl md:text-3xl animate-pulse delay-500">🌞</div>
                      <div className="absolute bottom-8 right-12 text-lg md:text-2xl animate-pulse delay-1000">🏖️</div>
                    </>
                )}
                {currentSeason.id === 'fall' && (
                    <>
                      <div className="absolute top-4 left-4 text-2xl md:text-4xl animate-bounce delay-200">🍂</div>
                      <div className="absolute top-16 right-8 text-xl md:text-3xl animate-bounce delay-600">🍁</div>
                      <div className="absolute bottom-8 left-12 text-lg md:text-2xl animate-bounce delay-1000">🌰</div>
                    </>
                )}
                {currentSeason.id === 'winter' && (
                    <>
                      <div className="absolute top-4 right-4 text-2xl md:text-4xl animate-pulse">❄️</div>
                      <div className="absolute top-16 left-8 text-xl md:text-3xl animate-pulse delay-300">⛄</div>
                      <div className="absolute bottom-8 right-12 text-lg md:text-2xl animate-pulse delay-800">🏔️</div>
                    </>
                )}
              </div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-6">
                  <div className="text-center lg:text-left">
                    <div className="text-4xl md:text-6xl lg:text-8xl mb-4 animate-pulse">
                      {currentSeason.emoji}
                    </div>
                    <h1 className="text-xl md:text-3xl lg:text-5xl font-extrabold mb-4">
                      Best {currentSeason.name} National Parks
                    </h1>
                    <p className="text-sm md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto lg:mx-0 mb-4 lg:mb-6">
                      {currentSeason.description}
                    </p>
                    <div className="text-sm md:text-lg font-medium bg-white/20 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full inline-block">
                      {currentSeason.tagline}
                    </div>
                  </div>

                  <Link
                      to="/"
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 min-h-[44px] justify-center"
                  >
                    <FaArrowLeft />
                    <span className="hidden sm:inline">Back to Explore</span>
                    <span className="sm:hidden">Back</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8">
              {/* Season Control Panel */}
              <SeasonControlPanel
                  currentSeason={currentSeason}
                  isAutoRotating={isAutoRotating}
                  onToggleAutoRotate={handleToggleAutoRotate}
                  onSeasonChange={handleSeasonChange}
                  progress={progress}
                  isMobile={isMobile}
              />

              {loading ? (
                  <LoadingState />
              ) : error ? (
                  <ErrorState message={error} onRetry={handleRetry} />
              ) : (
                  <>
                    {/* 🚀 NEW: Search Bar */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 mb-6">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search parks by name or state..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Enhanced Statistics */}
                    <SeasonalStats
                        parks={parks}
                        currentSeason={currentSeason}
                        filteredParks={filteredParks}
                    />

                    {/* Parks Grid */}
                    {filteredParks.length > 0 ? (
                        <div className="space-y-6">
                          <div className="text-center mb-6 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                              Best Parks for {currentSeason.name}
                            </h2>
                            <p className="text-gray-600 text-sm md:text-base">
                              Discover {filteredParks.length} parks with unique {currentSeason.name.toLowerCase()} experiences
                            </p>
                          </div>

                          {/* Responsive Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredParks.map((park, index) => (
                                <EnhancedParkCard
                                    key={`${park.id}-${key}`}
                                    park={park}
                                    season={currentSeason}
                                    index={index}
                                    favorites={favorites}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                          </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 md:py-20">
                          <div className="text-4xl md:text-6xl mb-4">{currentSeason.emoji}</div>
                          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                            No Parks Found
                          </h3>
                          <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base">
                            No parks match your current search for {currentSeason.name.toLowerCase()}.
                            Try adjusting your search or explore other seasons.
                          </p>
                          <button
                              onClick={() => setSearchTerm('')}
                              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                          >
                            Clear Search
                          </button>
                        </div>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EnhancedSeasonalPage;