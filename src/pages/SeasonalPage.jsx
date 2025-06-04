import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FadeInWrapper from '../components/FadeInWrapper';
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
  FaStar,
  FaArrowLeft
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

// ===== SEASONAL PARK DATA =====
const getSeasonalParkInfo = (parkName, season) => {
  const seasonalData = {
    'Yellowstone National Park': {
      spring: { 
        whyFamous: 'Wildlife emerges from winter hibernation and geysers are most active in mild weather',
        uniqueActivities: ['Bear and wolf watching', 'Geyser photography', 'Early wildflower hikes', 'Bison calving season']
      },
      summer: { 
        whyFamous: 'All roads open providing full park access with peak wildlife activity and extended daylight',
        uniqueActivities: ['Backcountry camping', 'Grand Loop Road tour', 'Fishing in pristine lakes', 'Ranger programs']
      },
      fall: { 
        whyFamous: 'Elk bugling season creates magical soundscapes while autumn colors paint the landscape',
        uniqueActivities: ['Elk photography', 'Fall foliage drives', 'Cooler hiking weather', 'Thermal feature viewing']
      },
      winter: { 
        whyFamous: 'Magical winter wonderland with steaming geysers creating dramatic contrasts against snow',
        uniqueActivities: ['Snowcoach tours', 'Cross-country skiing', 'Winter wildlife tracking', 'Ice photography']
      }
    },
    'Yosemite National Park': {
      spring: { 
        whyFamous: 'Waterfalls reach peak flow from snowmelt while wildflowers carpet the valley floor',
        uniqueActivities: ['Waterfall photography', 'Valley wildflower walks', 'Mist Trail hiking', 'Rock climbing prep']
      },
      summer: { 
        whyFamous: 'High country becomes accessible for alpine adventures and rock climbing reaches its peak',
        uniqueActivities: ['Half Dome permits', 'High Sierra camps', 'Rock climbing courses', 'Backcountry permits']
      },
      fall: { 
        whyFamous: 'Perfect weather combines with stunning autumn colors and crystal-clear mountain air',
        uniqueActivities: ['Fall color photography', 'Comfortable valley hikes', 'Clear granite views', 'Peaceful camping']
      },
      winter: { 
        whyFamous: 'Snow-covered granite domes create a pristine winter landscape perfect for photography',
        uniqueActivities: ['Winter photography workshops', 'Snowshoeing adventures', 'Cozy lodge stays', 'Ice skating']
      }
    },
    'Grand Canyon National Park': {
      spring: { 
        whyFamous: 'Perfect hiking weather with mild temperatures ideal for rim and inner canyon exploration',
        uniqueActivities: ['South Rim walks', 'Desert wildflower viewing', 'Perfect sunrise viewing', 'Comfortable camping']
      },
      summer: { 
        whyFamous: 'Extended daylight hours maximize viewing time despite challenging heat conditions',
        uniqueActivities: ['Early morning hikes', 'Helicopter tours', 'River rafting', 'Sunset photography']
      },
      fall: { 
        whyFamous: 'Ideal temperatures create perfect conditions with crystal clear views and comfortable hiking',
        uniqueActivities: ['Rim-to-rim hikes', 'Fall color photography', 'Comfortable camping', 'Clear stargazing']
      },
      winter: { 
        whyFamous: 'Rare snow creates stunning contrasts between white snow and red rocks with peaceful solitude',
        uniqueActivities: ['Snow photography', 'Peaceful rim walks', 'Winter wildlife viewing', 'Cozy lodge visits']
      }
    },
    'Zion National Park': {
      spring: { 
        whyFamous: 'River levels are perfect for wading while desert wildflowers create colorful displays',
        uniqueActivities: ['Virgin River wading', 'Wildflower photography', 'Angels Landing prep', 'Canyon photography']
      },
      summer: { 
        whyFamous: 'Peak adventure season with all trails open despite intense heat requiring early starts',
        uniqueActivities: ['The Narrows wading', 'Early morning hikes', 'Shuttle system tours', 'Photography workshops']
      },
      fall: { 
        whyFamous: 'Cottonwood trees turn golden while perfect temperatures make hiking incredibly comfortable',
        uniqueActivities: ['Fall foliage walks', 'Comfortable long hikes', 'Perfect photography light', 'River activities']
      },
      winter: { 
        whyFamous: 'Mild winter weather provides peaceful exploration with occasional snow-dusted red rocks',
        uniqueActivities: ['Peaceful hiking', 'Winter photography', 'Comfortable camping', 'Solitude experiences']
      }
    },
    'Bryce Canyon National Park': {
      spring: { 
        whyFamous: 'Snow contrasts beautifully with red hoodoos while high elevation wildflowers begin blooming',
        uniqueActivities: ['Hoodoo photography', 'Spring wildflowers', 'Clear air photography', 'Comfortable rim walks']
      },
      summer: { 
        whyFamous: 'Perfect temperatures at high elevation provide relief from desert heat with extended daylight',
        uniqueActivities: ['Sunrise Point viewing', 'Cool hiking weather', 'Star gazing programs', 'Photography workshops']
      },
      fall: { 
        whyFamous: 'Autumn colors complement the red rocks while crisp air creates incredible visibility',
        uniqueActivities: ['Fall color photography', 'Perfect hiking weather', 'Clear sunrise viewing', 'Comfortable camping']
      },
      winter: { 
        whyFamous: 'Snow-covered hoodoos create a magical winter landscape with incredible photographic opportunities',
        uniqueActivities: ['Snow photography', 'Winter hiking', 'Snowshoeing trails', 'Peaceful winter visits']
      }
    }
  };
  
  return seasonalData[parkName]?.[season] || { 
    whyFamous: `Perfect ${season} destination with ideal weather and seasonal activities`,
    uniqueActivities: ['Seasonal hiking', 'Photography opportunities', 'Wildlife viewing', 'Scenic exploration']
  };
};

// ===== SEASONAL PARK CARD (LIST FORMAT) =====
const SeasonalParkCard = ({ park, season, onView, onPlanTrip, onToggleFavorite, isFavorite, currentUser, index }) => {
  const seasonalInfo = getSeasonalParkInfo(park.name, season.id);
  
  const getSeasonalActivity = (park, season) => {
    return seasonalInfo.uniqueActivities || [
      `${season.name} hiking`,
      `${season.name} photography`,
      `${season.name} wildlife viewing`,
      `${season.name} scenic drives`
    ];
  };

  return (
    <FadeInWrapper delay={index * 0.1}>
      <div className="group bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 p-6 mb-4">
        {/* Header with season badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-pulse">{season.emoji}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                {park.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt className="text-pink-500" />
                <span>{park.state}</span>
                {park.entryFee && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">
                      Entry: ${park.entryFee}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`bg-gradient-to-r ${season.primaryColor} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg`}>
            Perfect for {season.name}
          </div>
        </div>

        {/* Seasonal info */}
        <div className={`bg-gradient-to-r ${season.secondaryColor} p-5 rounded-xl mb-4 border-l-4 ${season.primaryColor.replace('from-', 'border-').split(' ')[0]}`}>
          <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🌟</span>
            Why {park.name} shines in {season.name}:
          </div>
          <div className="text-gray-700 mb-4 leading-relaxed">
            {seasonalInfo.whyFamous}
          </div>
          
          {/* Must-do activities */}
          <div className="space-y-2">
            <div className="font-medium text-purple-700 flex items-center gap-2">
              <span>🎯</span>
              Must-do {season.name} activities:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getSeasonalActivity(park, season).slice(0, 4).map((activity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional park info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl mb-1">{season.weatherIcon}</div>
            <div className="text-xs font-medium text-gray-700">Temperature</div>
            <div className="text-sm text-gray-600">{season.avgTemperature}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xs font-medium text-gray-700">Crowd Level</div>
            <div className="text-sm text-gray-600">{season.crowdLevel}</div>
          </div>
          {park.bestSeason && (
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-xs font-medium text-gray-700">Best Season</div>
              <div className="text-sm text-gray-600">{park.bestSeason}</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onView(park)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaEye /> Explore Park
          </button>
          <button
            onClick={() => onPlanTrip(park)}
            className={`flex-1 bg-gradient-to-r ${season.primaryColor} text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <FaRoute /> Plan {season.name} Trip
          </button>
          {currentUser && (
            <button
              onClick={() => onToggleFavorite(park.id)}
              className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
                isFavorite
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaHeart />
            </button>
          )}
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
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                  <div className="text-center lg:text-left">
                    <div className="text-6xl md:text-8xl mb-4 animate-pulse">
                      {currentSeason.emoji}
                    </div>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-extrabold mb-4">
                      {currentSeason.name} National Parks
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto lg:mx-0 mb-6">
                      {currentSeason.description}
                    </p>
                    <div className="text-lg font-medium bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
                      {currentSeason.tagline}
                    </div>
                  </div>
                  
                  {/* Back to Explore Button */}
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

            {/* Parks List */}
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

                <div className="space-y-4">
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