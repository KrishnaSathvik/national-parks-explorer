import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaHeart,
  FaInfoCircle,
  FaLeaf,
  FaMapMarkerAlt,
  FaPause,
  FaPlay,
  FaRegHeart,
  FaRoute,
  FaSnowflake,
  FaSun,
  FaTimes
} from 'react-icons/fa';

// Enhanced Seasons Data with better mobile optimization
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

// Enhanced park data for demo
const ENHANCED_PARK_DATA = {
  'Yellowstone National Park': {
    state: 'Wyoming',
    entryFee: '35',
    coordinates: {lat: 44.4280, lng: -110.5885},
    spring: {
      whyFamous: 'Peak wildlife viewing as bears emerge from hibernation, wolf activity increases dramatically, and geysers are most photogenic against dramatic spring skies',
      uniqueActivities: [
        'Grizzly bear photography at Hayden Valley (peak activity)',
        'Wolf watching in Lamar Valley at dawn',
        'Geyser photography with storm clouds backdrop',
        'Bison calving season observation',
        'Early wildflower hikes on lower elevation trails'
      ],
      insiderTips: [
        'Best bear viewing: 6-9 AM at Hayden Valley',
        'Pack layers - weather changes rapidly',
        'Many roads still closed above 7,000 feet'
      ]
    },
    summer: {
      whyFamous: 'Full park access with all roads open, extended 16-hour daylight for photography, and peak backcountry hiking with wildflower meadows in full bloom',
      uniqueActivities: [
        'Backcountry camping in Yellowstone Lake area',
        'Complete Grand Loop Road scenic drive',
        'Fishing for native cutthroat trout',
        'Photography workshops at Grand Prismatic',
        'Ranger-led evening programs'
      ],
      insiderTips: [
        'Book camping 5 months in advance',
        'Start hikes before 7 AM to beat crowds',
        'Thermal features most active in cool mornings'
      ]
    }
  },
  'Grand Canyon National Park': {
    state: 'Arizona',
    entryFee: '30',
    coordinates: {lat: 36.1069, lng: -112.1129},
    spring: {
      whyFamous: 'Perfect hiking weather with mild temperatures ideal for rim and inner canyon exploration, desert wildflowers bloom creating colorful displays',
      uniqueActivities: [
        'South Rim sunrise photography',
        'Desert wildflower identification hikes',
        'Comfortable inner canyon day hikes',
        'Condor watching at Hopi Point',
        'Geology tours with park rangers'
      ],
      insiderTips: [
        'Perfect temperatures: 60-75°F',
        'Wildflowers bloom March-May',
        'Book accommodations early for spring break'
      ]
    }
  },
  'Yosemite National Park': {
    state: 'California',
    entryFee: '35',
    coordinates: {lat: 37.8651, lng: -119.5383},
    fall: {
      whyFamous: 'Perfect hiking weather combines with stunning oak and maple autumn colors, crystal-clear air provides exceptional granite views',
      uniqueActivities: [
        'Valley floor autumn color photography',
        'Comfortable granite dome hiking',
        'Clear sunrise photography from Glacier Point',
        'Peaceful camping with fewer crowds',
        'Extended golden hour photography'
      ],
      insiderTips: [
        'Fall colors peak in late October',
        'Perfect hiking temperatures in valley',
        'Exceptional visibility for photography'
      ]
    }
  }
};

// Mock parks data for demo
const mockParks = [
  {id: '1', name: 'Yellowstone National Park', state: 'Wyoming'},
  {id: '2', name: 'Grand Canyon National Park', state: 'Arizona'},
  {id: '3', name: 'Yosemite National Park', state: 'California'},
  {id: '4', name: 'Zion National Park', state: 'Utah'},
  {id: '5', name: 'Glacier National Park', state: 'Montana'},
  {id: '6', name: 'Rocky Mountain National Park', state: 'Colorado'},
  {id: '7', name: 'Acadia National Park', state: 'Maine'},
  {id: '8', name: 'Bryce Canyon National Park', state: 'Utah'}
];

// Enhanced Error Toast Component
const ErrorToast = ({message, onDismiss}) => (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg animate-slide-down">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <FaInfoCircle className="text-red-500 text-sm"/>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800 font-medium">Connection Issue</p>
            <p className="text-xs text-red-600 mt-1">{message}</p>
          </div>
          <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 rounded-full hover:bg-red-100 transition-colors"
          >
            <FaTimes className="text-red-400 text-sm"/>
          </button>
        </div>
      </div>
    </div>
);

// Enhanced Season Control Panel with mobile-first design
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
        {/* Mobile-optimized header */}
        <div className="flex flex-col space-y-4">
          {/* Current season info */}
          <div className="flex items-center gap-3">
            <div
                className={`bg-gradient-to-r ${currentSeason.primaryColor} p-3 md:p-4 rounded-2xl text-white text-xl md:text-2xl flex-shrink-0            `}>
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

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Season selector - optimized for mobile */}
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

            {/* Auto-rotate toggle */}
            <button
                onClick={onToggleAutoRotate}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 min-h-[44px] ${
                    isAutoRotating
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {isAutoRotating ? <FaPause className="text-sm"/> : <FaPlay className="text-sm"/>}
              {!isMobile && (
                  <span className="text-sm font-medium">
                {isAutoRotating ? 'Pause' : 'Auto'}
              </span>
              )}
            </button>
          </div>

          {/* Progress bar for auto-rotation */}
          {isAutoRotating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Next season in:</span>
                  <span>{Math.ceil((100 - progress) * 0.25)}s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                      className={`bg-gradient-to-r ${currentSeason.primaryColor} h-2 rounded-full transition-all duration-1000`}
                      style={{width: `${progress}%`}}
                  />
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

// Enhanced Mobile-First Park Card
const EnhancedParkCard = ({park, season, index, favorites = [], onToggleFavorite}) => {
  const seasonalInfo = ENHANCED_PARK_DATA[park.name]?.[season.id] || {
    whyFamous: `Perfect ${season.name.toLowerCase()} destination with ideal weather and seasonal activities`,
    uniqueActivities: [`${season.name} hiking`, `${season.name} photography`, `${season.name} wildlife viewing`],
    insiderTips: [`Best time to visit: ${season.name}`, 'Check park website for conditions', 'Book accommodations early']
  };

  const parkData = ENHANCED_PARK_DATA[park.name] || {state: park.state, entryFee: '30'};
  const isFavorite = favorites.includes(park.id);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
      <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
          style={{
            animationDelay: `${index * 0.1}s`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
      >
        {/* Header with gradient background */}
        <div className={`relative bg-gradient-to-r ${season.primaryColor} p-4 text-white overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 text-4xl opacity-50">{season.emoji}</div>
            <div className="absolute bottom-2 left-2 text-2xl opacity-30">{season.emoji}</div>
          </div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold mb-1 line-clamp-2">
                {park.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <FaMapMarkerAlt className="text-xs flex-shrink-0"/>
                <span className="truncate">{parkData.state}</span>
                {parkData.entryFee && (
                    <>
                      <span>•</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                    ${parkData.entryFee}
                  </span>
                    </>
                )}
              </div>
            </div>

            {/* Favorite button */}
            <button
                onClick={() => onToggleFavorite?.(park.id)}
                className={`p-2 rounded-full transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                    isFavorite
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-white/20 text-white hover:bg-white/30'
                }`}
            >
              {isFavorite ? <FaHeart/> : <FaRegHeart/>}
            </button>
          </div>

          {/* Perfect for season badge */}
          <div className="mt-3 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
            <span className="text-sm">{season.emoji}</span>
            <span>Perfect for {season.name}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Why it's special section */}
          <div
              className={`bg-gradient-to-r ${season.secondaryColor} p-4 rounded-xl mb-4 border-l-4 border-${season.primaryColor.split('-')[1]}-400`}>
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm md:text-base">
              <span>🌟</span>
              <span>Why visit in {season.name}:</span>
            </div>
            <div className="text-gray-700 text-sm md:text-base leading-relaxed">
              {seasonalInfo.whyFamous}
            </div>
          </div>

          {/* Activities section */}
          <div className="mb-4">
            <div className="font-medium text-purple-700 flex items-center gap-2 mb-3 text-sm md:text-base">
              <span>🎯</span>
              <span>Must-do activities:</span>
            </div>

            <div className="space-y-2">
              {(isExpanded ? seasonalInfo.uniqueActivities : seasonalInfo.uniqueActivities.slice(0, 3)).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"/>
                    <span className="leading-relaxed">{activity}</span>
                  </div>
              ))}
            </div>

            {seasonalInfo.uniqueActivities.length > 3 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  {isExpanded ? 'Show less' : `Show ${seasonalInfo.uniqueActivities.length - 3} more`}
                  {isExpanded ? <FaChevronLeft className="text-xs"/> : <FaChevronRight className="text-xs"/>}
                </button>
            )}
          </div>

          {/* Insider tips */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="font-medium text-blue-700 flex items-center gap-2 mb-2 text-sm md:text-base">
              <FaInfoCircle/>
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

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <button
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm md:text-base min-h-[44px]">
              <FaEye/>
              <span>View Details</span>
            </button>
            <button
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm md:text-base min-h-[44px]">
              <FaRoute/>
              <span>Plan Trip</span>
            </button>
          </div>
        </div>
      </div>
  );
};

// Main Enhanced Seasonal Page Component
const EnhancedSeasonalPage = ({parks = [], favorites = [], toggleFavorite}) => {
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false); // Disabled by default for better mobile UX
  const [progress, setProgress] = useState(0);
  const [key, setKey] = useState(0);
  const [showError, setShowError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const currentSeason = SEASONS[currentSeasonIndex];
  const rotationInterval = 25000;
  const progressInterval = 100;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotation effect
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

  // With this:
  const seasonalParks = useMemo(() => {
    return parks.filter(park => ENHANCED_PARK_DATA[park.name]).slice(0, 8);
  }, [parks]);

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

  // With this:
  const handleToggleFavorite = (parkId) => {
    toggleFavorite?.(parkId);
  };

  const handleDismissError = () => {
    setShowError(false);
  };

  return (
      <div className={`min-h-screen bg-gradient-to-br ${currentSeason.bgGradient} transition-all duration-1000`}>
        {/* Error Toast */}
        {showError && (
            <ErrorToast
                message="Please check your internet connection and try again."
                onDismiss={handleDismissError}
            />
        )}

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">

            {/* Dynamic Hero Section */}
            <div
                className={`relative bg-gradient-to-r ${currentSeason.primaryColor} p-6 md:p-8 text-white overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"/>

              {/* Animated season elements for mobile */}
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
                    <div
                        className="text-sm md:text-lg font-medium bg-white/20 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full inline-block">
                      {currentSeason.tagline}
                    </div>
                  </div>

                  {/* Back button */}
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

            {/* Content */}
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

              {/* Parks List */}
              {seasonalParks.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center mb-6 md:mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        Best Parks for {currentSeason.name}
                      </h2>
                      <p className="text-gray-600 text-sm md:text-base">
                        Discover {seasonalParks.length} parks with unique {currentSeason.name.toLowerCase()} experiences
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {seasonalParks.map((park, index) => (
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
                      No {currentSeason.name} Parks Available
                    </h3>
                    <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base">
                      We're still curating the best {currentSeason.name.toLowerCase()} destinations.
                      Check back soon or explore other seasons!
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {SEASONS.filter(s => s.id !== currentSeason.id).map(season => (
                          <button
                              key={season.id}
                              onClick={() => handleSeasonChange(season)}
                              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm md:text-base min-h-[44px]"
                          >
                            <span>{season.emoji}</span>
                            <span>Try {season.name}</span>
                          </button>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EnhancedSeasonalPage;
