import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FadeInWrapper from '../components/FadeInWrapper';
import { getSeasonalParkInfo } from '../data/seasonalParkData';
import {
  FaLeaf,
  FaSun,
  FaSnowflake,
  FaMapMarkerAlt,
  FaRoute,
  FaEye,
  FaHeart,
  FaCalendarAlt,
  FaThermometerHalf,
  FaCloudRain,
  FaClock,
  FaCamera,
  FaHiking,
  FaCampground,
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaMountain,
  FaWater,
  FaTree,
  FaFire,
  FaMagic,
  FaGlobe,
  FaArrowRight,
  FaStar
} from 'react-icons/fa';

// ===== SEASONAL DATA =====
const SEASONS = [
  {
    id: 'spring',
    name: 'Spring',
    emoji: '🌸',
    icon: FaLeaf,
    primaryColor: 'from-green-400 to-emerald-500',
    secondaryColor: 'from-green-50 to-emerald-50',
    accentColor: 'green',
    description: 'Nature awakens with blooming wildflowers and refreshing temperatures',
    highlights: ['Wildflower blooms', 'Mild temperatures', 'Fewer crowds', 'Perfect hiking weather'],
    bestActivities: ['Hiking', 'Photography', 'Wildlife viewing', 'Wildflower tours'],
    avgTemperature: '60-75°F',
    crowdLevel: 'Low to Moderate',
    weatherIcon: '🌱',
    tagline: 'Bloom Into Adventure',
    specialFeatures: [
      { icon: '🌺', text: 'Wildflower super blooms' },
      { icon: '🦋', text: 'Migrating butterflies' },
      { icon: '🏔️', text: 'Snow-capped peaks' },
      { icon: '💧', text: 'Rushing waterfalls' }
    ]
  },
  {
    id: 'summer',
    name: 'Summer',
    emoji: '☀️',
    icon: FaSun,
    primaryColor: 'from-yellow-400 to-orange-500',
    secondaryColor: 'from-yellow-50 to-orange-50',
    accentColor: 'orange',
    description: 'Peak season with long days and endless outdoor adventures',
    highlights: ['Long daylight hours', 'All facilities open', 'Peak wildlife activity', 'Water activities'],
    bestActivities: ['Camping', 'Water sports', 'Backcountry hiking', 'Scenic drives'],
    avgTemperature: '75-90°F',
    crowdLevel: 'High',
    weatherIcon: '☀️',
    tagline: 'Endless Summer Adventures',
    specialFeatures: [
      { icon: '🏊', text: 'Swimming & water sports' },
      { icon: '🌞', text: 'Extended daylight hours' },
      { icon: '🦌', text: 'Active wildlife' },
      { icon: '⛺', text: 'Prime camping season' }
    ]
  },
  {
    id: 'fall',
    name: 'Fall',
    emoji: '🍂',
    icon: FaLeaf,
    primaryColor: 'from-orange-400 to-red-500',
    secondaryColor: 'from-orange-50 to-red-50',
    accentColor: 'orange',
    description: 'Spectacular autumn colors paint the landscape in brilliant hues',
    highlights: ['Fall foliage', 'Crisp weather', 'Harvest festivals', 'Clear skies'],
    bestActivities: ['Leaf peeping', 'Photography', 'Scenic drives', 'Cool weather hiking'],
    avgTemperature: '50-70°F',
    crowdLevel: 'Moderate',
    weatherIcon: '🍁',
    tagline: 'Fall Into Natural Beauty',
    specialFeatures: [
      { icon: '🍁', text: 'Spectacular fall colors' },
      { icon: '📸', text: 'Perfect lighting for photos' },
      { icon: '🥾', text: 'Ideal hiking temperatures' },
      { icon: '🌙', text: 'Clear night skies' }
    ]
  },
  {
    id: 'winter',
    name: 'Winter',
    emoji: '❄️',
    icon: FaSnowflake,
    primaryColor: 'from-blue-400 to-cyan-500',
    secondaryColor: 'from-blue-50 to-cyan-50',
    accentColor: 'blue',
    description: 'Serene snow-covered landscapes offer peaceful winter wonderlands',
    highlights: ['Snow activities', 'Solitude', 'Winter wildlife', 'Cozy lodges'],
    bestActivities: ['Snowshoeing', 'Cross-country skiing', 'Ice climbing', 'Winter photography'],
    avgTemperature: '20-45°F',
    crowdLevel: 'Low',
    weatherIcon: '❄️',
    tagline: 'Winter Wonderland Awaits',
    specialFeatures: [
      { icon: '⛷️', text: 'Snow sports activities' },
      { icon: '🔥', text: 'Cozy fireside lodges' },
      { icon: '🦅', text: 'Winter wildlife viewing' },
      { icon: '✨', text: 'Pristine snow landscapes' }
    ]
  }
];

// ===== SEASONAL PARK CARD =====
const SeasonalParkCard = ({ park, season, onView, onPlanTrip, onToggleFavorite, isFavorite, currentUser, index }) => {
  const getSeasonalActivity = (park, season) => {
    const parkName = park.name?.toLowerCase() || '';

    {/* Enhanced park-specific seasonal info */}
    {(() => {
      const seasonalInfo = getSeasonalParkInfo(park.name, season.id);
      if (seasonalInfo) {
        return (
          <div className={`bg-gradient-to-r ${season.secondaryColor} p-4 rounded-xl mb-4`}>
            <div className="font-medium text-sm mb-2 text-gray-700">
              🌟 Why {park.name} shines in {season.name}:
            </div>
            <div className="text-xs text-gray-600 mb-3">
              {seasonalInfo.whyFamous}
            </div>
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium text-purple-600">🎯 Must-do:</span>
                <div className="mt-1 space-y-1">
                  {seasonalInfo.uniqueActivities.slice(0, 2).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      <span>{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    })()}
    
    // Park-specific seasonal activities
    const parkSpecific = {
      spring: {
        'yellowstone': ['🌋 Geyser viewing (active season)', '🦌 Wildlife awakening', '🌸 Early wildflowers'],
        'yosemite': ['💧 Waterfall peak flow', '🌸 Valley wildflowers', '🥾 Mist Trail hiking'],
        'grand canyon': ['🌅 Perfect sunrise views', '🌡️ Ideal temperatures', '🥾 Rim trail walks'],
        'zion': ['🌊 Virgin River wading', '🌸 Wildflower blooms', '🥾 Angels Landing prep'],
        'bryce canyon': ['🌨️ Snow contrast beauty', '🌸 High elevation blooms', '📸 Clear air photography'],
        'default': ['🌸 Wildflower viewing', '🥾 Spring hiking', '📸 Nature photography']
      },
      summer: {
        'yellowstone': ['🌋 All geysers active', '🚗 Full road access', '⛺ Prime camping'],
        'yosemite': ['🧗 Rock climbing season', '🥾 High country access', '🏊 Swimming holes'],
        'grand canyon': ['🌅 Early morning hikes', '🚁 Helicopter tours', '🌙 Star gazing'],
        'glacier': ['🏔️ Going-to-Sun Road', '🥾 Alpine hiking', '🌸 Wildflower peak'],
        'default': ['🏕️ Camping', '🚣 Water activities', '🌄 Sunrise viewing']
      },
      fall: {
        'great smoky mountains': ['🍂 Peak fall colors', '🦌 Elk bugling', '🥾 Cool hiking'],
        'yosemite': ['🍂 Valley floor colors', '📸 Perfect lighting', '🥾 Comfortable temps'],
        'grand canyon': ['🌅 Clear sky viewing', '🥾 Ideal hiking weather', '🍂 Desert colors'],
        'zion': ['🍂 Cottonwood colors', '🥾 Perfect hiking temps', '🌊 River activities'],
        'default': ['🍂 Fall foliage', '📷 Photography', '🥾 Cool weather hiking']
      },
      winter: {
        'yellowstone': ['❄️ Snow landscapes', '🌋 Steaming geysers', '🦅 Winter wildlife'],
        'grand canyon': ['❄️ Snow-dusted rim', '🥾 Peaceful hiking', '🔥 Cozy lodges'],
        'yosemite': ['❄️ Snow photography', '⛷️ Cross-country skiing', '🏔️ Alpine beauty'],
        'death valley': ['🌡️ Perfect temperatures', '🌸 Desert blooms', '🥾 Prime hiking'],
        'default': ['❄️ Snow activities', '🔥 Winter lodges', '🦅 Wildlife viewing']
      }
    };

    const seasonKey = season.id;
    const activities = parkSpecific[seasonKey];
    
    // Try to find park-specific activities
    for (const [key, value] of Object.entries(activities)) {
      if (key !== 'default' && parkName.includes(key.replace(' ', ''))) {
        return value;
      }
    }
    
    // Return default activities for the season
    return activities.default;
  };

  return (
    <FadeInWrapper delay={index * 0.15}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1">
        {/* Seasonal Header */}
        <div className={`bg-gradient-to-br ${season.primaryColor} p-6 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {season.id === 'spring' && (
              <>
                <div className="absolute top-2 right-4 text-2xl animate-bounce delay-300">🌸</div>
                <div className="absolute top-8 right-12 text-lg animate-bounce delay-700">🦋</div>
              </>
            )}
            {season.id === 'summer' && (
              <>
                <div className="absolute top-2 right-4 text-2xl animate-pulse">☀️</div>
                <div className="absolute top-8 right-12 text-lg animate-pulse delay-500">🌞</div>
              </>
            )}
            {season.id === 'fall' && (
              <>
                <div className="absolute top-2 right-4 text-2xl animate-bounce">🍂</div>
                <div className="absolute top-8 right-12 text-lg animate-bounce delay-300">🍁</div>
              </>
            )}
            {season.id === 'winter' && (
              <>
                <div className="absolute top-2 right-4 text-2xl animate-bounce">❄️</div>
                <div className="absolute top-8 right-12 text-lg animate-bounce delay-200">✨</div>
              </>
            )}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1 group-hover:scale-105 transition-transform duration-300">
                  {park.name}
                </h3>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <FaMapMarkerAlt />
                  <span>{park.state}</span>
                </div>
              </div>
              
              {/* Seasonal badge */}
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                Perfect for {season.name}
              </div>
            </div>
            
            {/* Season-specific tag */}
            <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
              <span className="text-lg">{season.emoji}</span>
              <span>Best in {season.name}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Park info */}
          <div className="space-y-3 mb-6">
            {park.entryFee && (
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  Entry: ${park.entryFee}
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {season.avgTemperature}
                </span>
              </div>
            )}
            
            {park.highlight && (
              <div className="text-sm text-gray-600">
                <span className="font-medium text-purple-600">🎯 {season.name} Highlight:</span> {park.highlight}
              </div>
            )}
          </div>
          {/* Season-specific why it's famous */}
          <div className="text-sm text-gray-600 mb-3">
            <span className="font-medium text-purple-600">🌟 {season.name} Fame:</span>
            {(() => {
              const parkName = park.name?.toLowerCase() || '';
              const whyFamous = {
                spring: {
                  'yellowstone': 'Wildlife emerges and geysers are most active',
                  'yosemite': 'Waterfalls at peak flow from snowmelt',
                  'grand canyon': 'Perfect weather for rim exploration',
                  'default': 'Mild weather and blooming wildflowers'
                },
                summer: {
                  'yellowstone': 'All roads open, full park access',
                  'glacier': 'Going-to-Sun Road fully accessible',
                  'yosemite': 'High country hiking and climbing',
                  'default': 'Peak season with full amenities'
                },
                fall: {
                  'great smoky mountains': 'Best fall foliage in the country',
                  'yosemite': 'Incredible photography lighting',
                  'grand canyon': 'Crystal clear views and perfect temps',
                  'default': 'Beautiful autumn colors and cool weather'
                },
                winter: {
                  'yellowstone': 'Magical winter wonderland with steaming features',
                  'grand canyon': 'Rare snow creates stunning contrasts',
                  'death valley': 'Perfect temperatures and possible wildflowers',
                  'default': 'Peaceful solitude and winter beauty'
                }
              };
              
              const seasonFame = whyFamous[season.id];
              for (const [key, value] of Object.entries(seasonFame)) {
                if (key !== 'default' && parkName.includes(key.replace(' ', ''))) {
                  return value;
                }
              }
              return seasonFame.default;
            })()}
          </div>

          {/* Seasonal activities */}
          <div className={`bg-gradient-to-r ${season.secondaryColor} p-4 rounded-xl mb-6`}>
            <div className="font-medium text-sm mb-2 text-gray-700">Perfect {season.name} Activities:</div>
            <div className="space-y-1">
              {getSeasonalActivity(park, season).slice(0, 2).map((activity, idx) => (
                <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => onView(park)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <FaEye /> Explore
              </button>
              <button
                onClick={() => onPlanTrip(park)}
                className={`flex-1 bg-gradient-to-r ${season.primaryColor} text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 transform hover:scale-105`}
              >
                <FaRoute /> Plan {season.name} Trip
              </button>
            </div>
            
            {currentUser && (
              <button
                onClick={() => onToggleFavorite(park.id)}
                className={`w-full py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 ${
                  isFavorite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaHeart />
                {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            )}
          </div>
        </div>
      </div>
    </FadeInWrapper>
  );
};

// ===== SEASON CONTROL PANEL =====
const SeasonControlPanel = ({ currentSeason, isAutoRotating, onToggleAutoRotate, onSeasonChange, progress }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Current season info */}
        <div className="flex items-center gap-4">
          <div className={`bg-gradient-to-r ${currentSeason.primaryColor} p-4 rounded-2xl text-white text-2xl`}>
            {currentSeason.emoji}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{currentSeason.name} Parks</h3>
            <p className="text-gray-600 text-sm">{currentSeason.tagline}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Season selector */}
          <div className="flex gap-1 md:gap-2">
            {SEASONS.map(season => (
              <button
                key={season.id}
                onClick={() => onSeasonChange(season)}
                className={`p-1.5 md:p-2 rounded-lg transition-all duration-200 ${
                  currentSeason.id === season.id
                    ? `bg-gradient-to-r ${season.primaryColor} text-white shadow-lg transform scale-105 md:scale-110`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={season.name}
              >
                <span className="text-base md:text-lg">{season.emoji}</span>
              </button>
            ))}
          </div>

          {/* Auto-rotate toggle */}
          <button
            onClick={onToggleAutoRotate}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isAutoRotating
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isAutoRotating ? <FaPause /> : <FaPlay />}
            <span className="hidden md:inline">{isAutoRotating ? 'Pause' : 'Auto-Rotate'}</span>
          </button>
        </div>
      </div>

      {/* Progress bar for auto-rotation */}
      {isAutoRotating && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Next season in:</span>
            <span>{Math.ceil((100 - progress) * 0.25)}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${currentSeason.primaryColor} h-2 rounded-full transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== SEASONAL INSIGHTS PANEL =====
const SeasonalInsightsPanel = ({ season, parksCount }) => {
  return (
    <FadeInWrapper delay={0.3}>
      <div className={`bg-gradient-to-br ${season.secondaryColor} rounded-2xl p-8 mb-8`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`bg-gradient-to-r ${season.primaryColor} p-3 rounded-xl text-white`}>
            <season.icon className="text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{season.name} Park Insights</h3>
            <p className="text-gray-600">{season.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Season stats */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <FaThermometerHalf className="text-blue-500" />
                <span className="font-medium text-gray-700">Temperature</span>
              </div>
              <div className="text-lg font-bold text-gray-800">{season.avgTemperature}</div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <FaGlobe className="text-green-500" />
                <span className="font-medium text-gray-700">Crowd Level</span>
              </div>
              <div className="text-lg font-bold text-gray-800">{season.crowdLevel}</div>
            </div>
          </div>

          {/* Special features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 mb-3">Special {season.name} Features:</h4>
            {season.specialFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                <span className="text-lg">{feature.icon}</span>
                <span className="text-sm text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeInWrapper>
  );
};

// ===== MAIN SEASONAL PAGE =====
const SeasonalPage = ({ parks, favorites, toggleFavorite }) => {
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [key, setKey] = useState(0); // For triggering re-renders with animations

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const currentSeason = SEASONS[currentSeasonIndex];
  const rotationInterval = 25000; // 25 seconds
  const progressInterval = 100; // Update progress every 100ms

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (progressInterval / rotationInterval) * 100;
      });
    }, progressInterval);

    const rotationTimer = setInterval(() => {
      setCurrentSeasonIndex(prev => {
        const nextIndex = (prev + 1) % SEASONS.length;
        setKey(prevKey => prevKey + 1); // Trigger re-render for animations
        setProgress(0);
        return nextIndex;
      });
    }, rotationInterval);

    return () => {
      clearInterval(progressTimer);
      clearInterval(rotationTimer);
    };
  }, [isAutoRotating]);

  // Filter parks by current season
  const seasonalParks = useMemo(() => {
    return parks.filter(park => 
      park.bestSeason?.toLowerCase() === currentSeason.name.toLowerCase()
    ).slice(0, 12); // Limit to 12 parks for performance
  }, [parks, currentSeason]);

  const handleSeasonChange = (season) => {
    const newIndex = SEASONS.findIndex(s => s.id === season.id);
    setCurrentSeasonIndex(newIndex);
    setProgress(0);
    setKey(prev => prev + 1);
    showToast(`🌟 Switched to ${season.name} recommendations!`, 'info');
  };

  const handleToggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
    setProgress(0);
    showToast(
      isAutoRotating ? '⏸️ Auto-rotation paused' : '▶️ Auto-rotation started', 
      'info'
    );
  };

  const handleViewPark = (park) => {
    navigate(`/park/${park.slug}`);
  };

  const handlePlanTrip = (park) => {
    navigate('/trip-planner', { state: { selectedPark: park, suggestedSeason: currentSeason.name } });
    showToast(`Added ${park.name} to ${currentSeason.name.toLowerCase()} trip planner!`, 'success');
  };

  const stats = {
    totalSeasonalParks: seasonalParks.length,
    avgTemperature: currentSeason.avgTemperature,
    crowdLevel: currentSeason.crowdLevel,
    bestActivities: currentSeason.bestActivities.length
  };

  return (
    <div key={key} className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
          
          {/* Dynamic Hero Section */}
          <div className={`relative bg-gradient-to-r ${currentSeason.primaryColor} p-8 text-white overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            
            {/* Animated season elements */}
            <div className="absolute inset-0 pointer-events-none">
              {currentSeason.id === 'spring' && (
                <>
                  <div className="absolute top-10 left-20 text-4xl animate-bounce delay-300">🌸</div>
                  <div className="absolute top-32 right-32 text-3xl animate-bounce delay-700">🦋</div>
                  <div className="absolute bottom-20 left-40 text-2xl animate-bounce delay-1000">🌿</div>
                </>
              )}
              {currentSeason.id === 'summer' && (
                <>
                  <div className="absolute top-10 right-20 text-4xl animate-pulse">☀️</div>
                  <div className="absolute top-32 left-32 text-3xl animate-pulse delay-500">🌞</div>
                  <div className="absolute bottom-20 right-40 text-2xl animate-pulse delay-1000">🏖️</div>
                </>
              )}
              {currentSeason.id === 'fall' && (
                <>
                  <div className="absolute top-10 left-20 text-4xl animate-bounce">🍂</div>
                  <div className="absolute top-32 right-32 text-3xl animate-bounce delay-300">🍁</div>
                  <div className="absolute bottom-20 left-40 text-2xl animate-bounce delay-600">🎃</div>
                </>
              )}
              {currentSeason.id === 'winter' && (
                <>
                  <div className="absolute top-10 right-20 text-4xl animate-bounce">❄️</div>
                  <div className="absolute top-32 left-32 text-3xl animate-bounce delay-200">✨</div>
                  <div className="absolute bottom-20 right-40 text-2xl animate-bounce delay-400">🏔️</div>
                </>
              )}
            </div>
            
            <div className="relative z-10">
              <FadeInWrapper delay={0.1}>
                <div className="text-center">
                  <div className="text-6xl md:text-8xl mb-4 animate-pulse">
                    {currentSeason.emoji}
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-6xl font-extrabold mb-4">
                    {currentSeason.name} National Parks
                  </h1>
                  <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-6">
                    {currentSeason.description}
                  </p>
                  <div className="text-lg font-medium bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
                    {currentSeason.tagline}
                  </div>
                </div>
              </FadeInWrapper>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Season Control Panel */}
            <SeasonControlPanel
              currentSeason={currentSeason}
              isAutoRotating={isAutoRotating}
              onToggleAutoRotate={handleToggleAutoRotate}
              onSeasonChange={handleSeasonChange}
              progress={progress}
            />

            {/* Stats Cards */}
            <FadeInWrapper delay={0.2}>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 mb-6 md:mb-8">
                {[
                  { 
                    label: `${currentSeason.name} Parks`, 
                    value: stats.totalSeasonalParks, 
                    icon: currentSeason.emoji, 
                    color: currentSeason.primaryColor,
                    description: `Perfect for ${currentSeason.name.toLowerCase()}`
                  },
                  { 
                    label: 'Temperature', 
                    value: stats.avgTemperature, 
                    icon: '🌡️', 
                    color: 'from-blue-500 to-cyan-500',
                    description: 'Average range'
                  },
                  { 
                    label: 'Crowd Level', 
                    value: stats.crowdLevel, 
                    icon: '👥', 
                    color: 'from-purple-500 to-pink-500',
                    description: 'Expected visitors'
                  },
                  { 
                    label: 'Activities', 
                    value: stats.bestActivities, 
                    icon: '🎯', 
                    color: 'from-green-500 to-emerald-500',
                    description: 'Seasonal highlights'
                  }
                ].map((stat, index) => (
                  <FadeInWrapper key={stat.label} delay={index * 0.1}>
                    <div className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-3xl">{stat.icon}</div>
                        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {currentSeason.name}
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

            {/* Seasonal Insights Panel */}
            <SeasonalInsightsPanel season={currentSeason} parksCount={seasonalParks.length} />

            {/* Parks Grid */}
            {seasonalParks.length > 0 ? (
              <div className="space-y-6">
                <FadeInWrapper delay={0.4}>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Best Parks for {currentSeason.name}
                    </h2>
                    <p className="text-gray-600">
                      Discover {seasonalParks.length} parks perfect for your {currentSeason.name.toLowerCase()} adventure
                    </p>
                  </div>
                </FadeInWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {seasonalParks.map((park, index) => (
                    <SeasonalParkCard
                      key={park.id}
                      park={park}
                      season={currentSeason}
                      onView={handleViewPark}
                      onPlanTrip={handlePlanTrip}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.includes(park.id)}
                      currentUser={currentUser}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <FadeInWrapper delay={0.4}>
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">{currentSeason.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    No {currentSeason.name} Parks Available
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We're still curating the best {currentSeason.name.toLowerCase()} destinations. 
                    Check back soon or explore other seasons!
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {SEASONS.filter(s => s.id !== currentSeason.id).map(season => (
                      <button
                        key={season.id}
                        onClick={() => handleSeasonChange(season)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        <span>{season.emoji}</span>
                        <span>Try {season.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {/* Seasonal Tips & Recommendations */}
            <FadeInWrapper delay={0.6}>
              <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentSeason.name} Travel Tips
                  </h2>
                  <p className="text-gray-600">
                    Make the most of your {currentSeason.name.toLowerCase()} national park adventures
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Weather & Packing */}
                  <div className={`bg-gradient-to-br ${currentSeason.secondaryColor} p-6 rounded-xl`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-r ${currentSeason.primaryColor} p-3 rounded-lg text-white`}>
                        <FaThermometerHalf />
                      </div>
                      <h3 className="font-bold text-gray-800">Weather & Packing</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currentSeason.weatherIcon}</span>
                        <span>Average: {currentSeason.avgTemperature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👥</span>
                        <span>Crowds: {currentSeason.crowdLevel}</span>
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <div className="font-medium text-xs mb-1">Essential Gear:</div>
                        {currentSeason.id === 'spring' && (
                          <div className="text-xs space-y-1">
                            <div>• Layers for changing weather</div>
                            <div>• Waterproof jacket</div>
                            <div>• Comfortable hiking boots</div>
                          </div>
                        )}
                        {currentSeason.id === 'summer' && (
                          <div className="text-xs space-y-1">
                            <div>• Sun protection (hat, sunscreen)</div>
                            <div>• Plenty of water</div>
                            <div>• Lightweight, breathable clothing</div>
                          </div>
                        )}
                        {currentSeason.id === 'fall' && (
                          <div className="text-xs space-y-1">
                            <div>• Warm layers for cool mornings</div>
                            <div>• Camera for fall colors</div>
                            <div>• Sturdy shoes for hiking</div>
                          </div>
                        )}
                        {currentSeason.id === 'winter' && (
                          <div className="text-xs space-y-1">
                            <div>• Insulated, waterproof clothing</div>
                            <div>• Snow shoes or crampons</div>
                            <div>• Emergency supplies</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Best Activities */}
                  <div className={`bg-gradient-to-br ${currentSeason.secondaryColor} p-6 rounded-xl`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-r ${currentSeason.primaryColor} p-3 rounded-lg text-white`}>
                        <FaHiking />
                      </div>
                      <h3 className="font-bold text-gray-800">Top Activities</h3>
                    </div>
                    <div className="space-y-2">
                      {currentSeason.bestActivities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg">
                          <span className="text-lg">
                            {activity.includes('Hiking') && '🥾'}
                            {activity.includes('Photography') && '📸'}
                            {activity.includes('Camping') && '🏕️'}
                            {activity.includes('Water') && '🚣'}
                            {activity.includes('Snowshoeing') && '❄️'}
                            {activity.includes('Skiing') && '⛷️'}
                            {activity.includes('Wildlife') && '🦌'}
                            {activity.includes('Scenic') && '🚗'}
                            {!activity.includes('Hiking') && !activity.includes('Photography') && !activity.includes('Camping') && !activity.includes('Water') && !activity.includes('Snowshoeing') && !activity.includes('Skiing') && !activity.includes('Wildlife') && !activity.includes('Scenic') && '🎯'}
                          </span>
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Planning Tips */}
                  <div className={`bg-gradient-to-br ${currentSeason.secondaryColor} p-6 rounded-xl`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-r ${currentSeason.primaryColor} p-3 rounded-lg text-white`}>
                        <FaCalendarAlt />
                      </div>
                      <h3 className="font-bold text-gray-800">Planning Tips</h3>
                    </div>
                    <div className="space-y-3">
                      {currentSeason.id === 'spring' && (
                        <>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-green-700 mb-1">🌸 Wildflower Timing</div>
                            <div className="text-gray-600 text-xs">Peak blooms vary by elevation and location. Check park websites for current conditions.</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-blue-700 mb-1">💧 Trail Conditions</div>
                            <div className="text-gray-600 text-xs">Snow may still block high-elevation trails. Verify accessibility before travel.</div>
                          </div>
                        </>
                      )}
                      {currentSeason.id === 'summer' && (
                        <>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-red-700 mb-1">🏕️ Book Early</div>
                            <div className="text-gray-600 text-xs">Summer is peak season. Reserve accommodations and permits well in advance.</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-orange-700 mb-1">🌅 Beat the Heat</div>
                            <div className="text-gray-600 text-xs">Start hikes early morning or late afternoon to avoid midday heat.</div>
                          </div>
                        </>
                      )}
                      {currentSeason.id === 'fall' && (
                        <>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-orange-700 mb-1">🍂 Peak Colors</div>
                            <div className="text-gray-600 text-xs">Fall foliage timing varies by region. Higher elevations change first.</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-purple-700 mb-1">📸 Golden Hour</div>
                            <div className="text-gray-600 text-xs">Perfect lighting for photography with crisp, clear air.</div>
                          </div>
                        </>
                      )}
                      {currentSeason.id === 'winter' && (
                        <>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-blue-700 mb-1">❄️ Road Conditions</div>
                            <div className="text-gray-600 text-xs">Many park roads close or require chains. Check current conditions.</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg text-sm">
                            <div className="font-medium text-cyan-700 mb-1">🏔️ Limited Services</div>
                            <div className="text-gray-600 text-xs">Visitor centers and facilities may have reduced hours or be closed.</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWrapper>

            {/* Call to Action */}
            <FadeInWrapper delay={0.7}>
              <div className={`mt-12 bg-gradient-to-r ${currentSeason.primaryColor} rounded-2xl p-8 text-white text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-8 text-3xl opacity-30 animate-bounce">
                  {currentSeason.emoji}
                </div>
                <div className="absolute bottom-4 right-8 text-3xl opacity-30 animate-bounce delay-500">
                  {currentSeason.emoji}
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-4">
                    Ready for Your {currentSeason.name} Adventure?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Start planning your perfect {currentSeason.name.toLowerCase()} national park trip today!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/trip-planner')}
                      className="inline-flex items-center gap-2 bg-white text-gray-800 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaRoute />
                      Plan My {currentSeason.name} Trip
                    </button>
                    
                    <button
                      onClick={() => navigate('/parks')}
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-200 font-bold text-lg border-2 border-white/30 hover:border-white/50"
                    >
                      <FaGlobe />
                      Explore All Parks
                    </button>
                  </div>
                </div>
              </div>
            </FadeInWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalPage;