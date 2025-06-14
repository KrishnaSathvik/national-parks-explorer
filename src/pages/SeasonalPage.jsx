import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  FaTimes,
  FaMountain,
  FaTree,
  FaFire,
  FaWater,
  FaCamera,
  FaBinoculars
} from 'react-icons/fa';

// Enhanced Seasons Data
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

// Comprehensive Parks Database with ALL seasons
const COMPREHENSIVE_PARK_DATA = {
  'Yellowstone National Park': {
    state: 'Wyoming',
    entryFee: '35',
    coordinates: { lat: 44.4280, lng: -110.5885 },
    bestSeasons: ['spring', 'summer', 'fall'],
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
    },
    fall: {
      whyFamous: 'Spectacular autumn elk bugling season, crisp air enhances geyser visibility, and golden aspen groves create stunning photography opportunities',
      uniqueActivities: [
        'Elk bugling tours in Mammoth area',
        'Fall foliage photography at Firehole Canyon',
        'Peaceful hot spring soaking with fewer crowds',
        'Bison migration watching',
        'Golden hour geyser photography'
      ],
      insiderTips: [
        'Elk most active during September bugling season',
        'Perfect temperatures for long hikes',
        'Snow possible after mid-October'
      ]
    },
    winter: {
      whyFamous: 'Magical snow-covered geothermal features, exclusive snowcoach and snowmobile access, and incredible wildlife tracking opportunities in pristine snow',
      uniqueActivities: [
        'Snowcoach tours to Old Faithful',
        'Cross-country skiing in Lamar Valley',
        'Wildlife tracking in fresh snow',
        'Ice-covered waterfall photography',
        'Northern lights viewing (rare but possible)'
      ],
      insiderTips: [
        'Only north entrance road open to cars',
        'Dress in multiple warm layers',
        'Book snowcoach tours well in advance'
      ]
    }
  },

  'Grand Canyon National Park': {
    state: 'Arizona',
    entryFee: '30',
    coordinates: { lat: 36.1069, lng: -112.1129 },
    bestSeasons: ['spring', 'fall', 'winter'],
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
    },
    summer: {
      whyFamous: 'Despite intense heat at rim level, early morning and evening provide spectacular lighting, and North Rim offers cooler temperatures with stunning views',
      uniqueActivities: [
        'Sunrise viewing at Desert View',
        'Evening ranger programs',
        'North Rim cooler hiking (if open)',
        'Star gazing programs',
        'Early morning photography workshops'
      ],
      insiderTips: [
        'Avoid midday hiking - temperatures exceed 100°F',
        'North Rim 1,000 feet higher and cooler',
        'Bring extra water for any hiking'
      ]
    },
    fall: {
      whyFamous: 'Ideal hiking conditions return with comfortable temperatures, crystal clear air provides exceptional visibility, and autumn light enhances red rock colors',
      uniqueActivities: [
        'Extended rim-to-rim hiking',
        'Comfortable inner canyon camping',
        'Clear air photography with enhanced colors',
        'Comfortable mule rides',
        'Extended sunset viewing sessions'
      ],
      insiderTips: [
        'September-November ideal temperatures',
        'Exceptional visibility for photography',
        'Book inner canyon permits early'
      ]
    },
    winter: {
      whyFamous: 'Dramatic snow-dusted red rocks create stunning contrasts, peaceful atmosphere with fewer crowds, and crisp air provides incredible clarity for photography',
      uniqueActivities: [
        'Snow-dusted canyon photography',
        'Peaceful rim walks with minimal crowds',
        'Winter wildlife spotting',
        'Cozy lodge stays with fireplaces',
        'Clear winter night star gazing'
      ],
      insiderTips: [
        'South Rim open year-round',
        'North Rim closed mid-October to mid-May',
        'Icy conditions possible on rim trails'
      ]
    }
  },

  'Yosemite National Park': {
    state: 'California',
    entryFee: '35',
    coordinates: { lat: 37.8651, lng: -119.5383 },
    bestSeasons: ['spring', 'summer', 'fall'],
    spring: {
      whyFamous: 'Peak waterfall season with Yosemite Falls at maximum flow, dogwood blooms create spectacular displays, and mild weather perfect for valley exploration',
      uniqueActivities: [
        'Waterfall photography at peak flow',
        'Dogwood bloom photography in valley',
        'Comfortable valley floor hiking',
        'Rock climbing season begins',
        'Wildflower meadow exploration'
      ],
      insiderTips: [
        'Waterfalls peak in May-June',
        'Dogwood blooms typically in May',
        'High country still snow-covered'
      ]
    },
    summer: {
      whyFamous: 'Full access to high country including Half Dome and high alpine lakes, extended daylight hours for epic adventures, and warm weather perfect for camping',
      uniqueActivities: [
        'Half Dome cable section hiking',
        'High alpine lake backpacking',
        'Rock climbing on granite walls',
        'Extended backcountry photography',
        'Tuolumne Meadows exploration'
      ],
      insiderTips: [
        'Reserve Half Dome permits well in advance',
        'High country accessible July-September',
        'Valley can be very crowded'
      ]
    },
    fall: {
      whyFamous: 'Perfect hiking weather combines with stunning oak and maple autumn colors, crystal-clear air provides exceptional granite views, and fewer crowds',
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
    },
    winter: {
      whyFamous: 'Dramatic snow-covered granite peaks, peaceful winter atmosphere, unique ice formations on waterfalls, and cross-country skiing opportunities',
      uniqueActivities: [
        'Snow-covered Half Dome photography',
        'Cross-country skiing in valley',
        'Ice formation photography at waterfalls',
        'Peaceful winter camping',
        'Cozy lodge stays in Ahwahnee'
      ],
      insiderTips: [
        'Tire chains required for park entry',
        'Glacier Point Road closed in winter',
        'Reduced waterfall flow but beautiful ice formations'
      ]
    }
  },

  'Zion National Park': {
    state: 'Utah',
    entryFee: '30',
    coordinates: { lat: 37.2982, lng: -113.0263 },
    bestSeasons: ['spring', 'fall'],
    spring: {
      whyFamous: 'Perfect weather for slot canyon hiking, desert wildflowers create colorful displays, and comfortable temperatures ideal for strenuous hikes like Angels Landing',
      uniqueActivities: [
        'Angels Landing chain section hiking',
        'The Narrows wading adventure',
        'Desert wildflower photography',
        'Rock climbing on sandstone walls',
        'Emerald Pools peaceful hiking'
      ],
      insiderTips: [
        'Angels Landing requires timed permits',
        'Wildflowers bloom March-May',
        'The Narrows best with warmer water'
      ]
    },
    summer: {
      whyFamous: 'Early morning and evening provide cooler temperatures for hiking, The Narrows offers refreshing water hiking, and long days extend adventure time',
      uniqueActivities: [
        'Early morning Angels Landing ascents',
        'Refreshing Narrows water hiking',
        'Evening photography in Zion Canyon',
        'Dawn patrol hiking to beat heat',
        'Cool riverside camping'
      ],
      insiderTips: [
        'Start hikes before 7 AM',
        'The Narrows water provides cooling relief',
        'Afternoon temperatures can exceed 100°F'
      ]
    },
    fall: {
      whyFamous: 'Ideal hiking conditions return, autumn cottonwoods create golden displays along Virgin River, and comfortable weather perfect for multi-day adventures',
      uniqueActivities: [
        'Comfortable multi-day backpacking',
        'Autumn cottonwood photography',
        'Extended Angels Landing adventures',
        'Peaceful canyon camping',
        'Golden hour photography sessions'
      ],
      insiderTips: [
        'October-November ideal temperatures',
        'Cottonwoods turn golden in October',
        'Less crowded than spring/summer'
      ]
    },
    winter: {
      whyFamous: 'Mild temperatures perfect for desert hiking, peaceful atmosphere with minimal crowds, and unique winter light enhances red rock colors',
      uniqueActivities: [
        'Peaceful desert hiking',
        'Winter wildlife observation',
        'Uncrowded photography opportunities',
        'Cozy lodge stays',
        'Clear winter night stargazing'
      ],
      insiderTips: [
        'Higher elevations may have snow/ice',
        'River hiking can be very cold',
        'Perfect weather for lower elevation hikes'
      ]
    }
  },

  'Glacier National Park': {
    state: 'Montana',
    entryFee: '30',
    coordinates: { lat: 48.7596, lng: -113.7870 },
    bestSeasons: ['summer', 'fall'],
    spring: {
      whyFamous: 'Lower elevations accessible with rushing waterfalls from snowmelt, bears emerging from hibernation, and fewer crowds on open trails',
      uniqueActivities: [
        'Lower elevation waterfall hikes',
        'Bear watching at Apgar area',
        'Peaceful lake shore walks',
        'Early wildflower photography',
        'Uncrowded visitor center tours'
      ],
      insiderTips: [
        'Going-to-the-Sun Road partially closed',
        'Many high elevation trails snow-covered',
        'Waterfalls at peak flow from snowmelt'
      ]
    },
    summer: {
      whyFamous: 'Full access to Going-to-the-Sun Road and high alpine areas, peak wildflower season in alpine meadows, and extended daylight for epic adventures',
      uniqueActivities: [
        'Complete Going-to-the-Sun Road drive',
        'Alpine meadow wildflower hikes',
        'Glacier viewpoint photography',
        'Backcountry camping adventures',
        'Extended daylight photography sessions'
      ],
      insiderTips: [
        'Road fully open typically July-September',
        'Book backcountry permits early',
        'Peak wildflowers in July-August'
      ]
    },
    fall: {
      whyFamous: 'Spectacular larch trees turn golden, comfortable hiking weather, crystal clear mountain air, and dramatic fall lighting on glaciated peaks',
      uniqueActivities: [
        'Golden larch photography',
        'Comfortable long-distance hiking',
        'Clear mountain peak photography',
        'Peaceful camping with fewer crowds',
        'Extended golden hour sessions'
      ],
      insiderTips: [
        'Larch trees peak color in late September',
        'Going-to-the-Sun Road closes by mid-October',
        'Perfect hiking temperatures'
      ]
    },
    winter: {
      whyFamous: 'Cross-country skiing and snowshoeing opportunities, dramatic snow-covered peaks, peaceful winter atmosphere, and unique ice formations',
      uniqueActivities: [
        'Cross-country skiing on closed roads',
        'Snowshoeing in lower valleys',
        'Winter wildlife tracking',
        'Ice formation photography',
        'Cozy lodge stays'
      ],
      insiderTips: [
        'Most roads closed to vehicles',
        'Extremely cold temperatures',
        'Limited services available'
      ]
    }
  },

  'Rocky Mountain National Park': {
    state: 'Colorado',
    entryFee: '30',
    coordinates: { lat: 40.3428, lng: -105.6836 },
    bestSeasons: ['summer', 'fall'],
    spring: {
      whyFamous: 'Lower elevation wildflowers begin blooming, comfortable temperatures for foothills hiking, and elk calving season provides wildlife viewing opportunities',
      uniqueActivities: [
        'Foothills wildflower hikes',
        'Elk calving observation',
        'Lower elevation waterfall visits',
        'Comfortable valley hiking',
        'Early morning wildlife photography'
      ],
      insiderTips: [
        'Trail Ridge Road typically closed above treeline',
        'Wildflowers start at lower elevations first',
        'Highly variable weather conditions'
      ]
    },
    summer: {
      whyFamous: 'Full access to Trail Ridge Road above treeline, peak alpine wildflower season, and high alpine lake hiking with stunning mountain vistas',
      uniqueActivities: [
        'Trail Ridge Road scenic drive',
        'Alpine wildflower meadow hikes',
        'High mountain lake backpacking',
        'Summit attempts on 14ers',
        'Extended alpine photography'
      ],
      insiderTips: [
        'Trail Ridge Road fully open June-October',
        'Alpine wildflowers peak in July',
        'Afternoon thunderstorms common above treeline'
      ]
    },
    fall: {
      whyFamous: 'Spectacular aspen groves turn golden, elk bugling season creates incredible wildlife viewing, and crisp mountain air provides exceptional visibility',
      uniqueActivities: [
        'Aspen grove photography',
        'Elk bugling photography',
        'Comfortable high elevation hiking',
        'Clear mountain vista photography',
        'Peaceful camping with fewer crowds'
      ],
      insiderTips: [
        'Aspen peak color typically mid-September',
        'Elk bugling season in September',
        'Trail Ridge Road may close early due to snow'
      ]
    },
    winter: {
      whyFamous: 'Cross-country skiing and snowshoeing in peaceful snow-covered landscapes, dramatic snow-capped peaks, and unique winter wildlife viewing',
      uniqueActivities: [
        'Cross-country skiing on closed roads',
        'Snowshoeing in lower valleys',
        'Winter wildlife photography',
        'Ice climbing opportunities',
        'Peaceful winter camping'
      ],
      insiderTips: [
        'Trail Ridge Road closed above treeline',
        'Very cold temperatures and wind',
        'Perfect conditions for winter sports'
      ]
    }
  },

  'Acadia National Park': {
    state: 'Maine',
    entryFee: '30',
    coordinates: { lat: 44.3386, lng: -68.2733 },
    bestSeasons: ['summer', 'fall'],
    spring: {
      whyFamous: 'Lupine wildflowers bloom along coastline, migratory birds return creating excellent birding, and comfortable temperatures for coastal hiking',
      uniqueActivities: [
        'Lupine wildflower photography',
        'Migratory bird watching',
        'Comfortable coastal hiking',
        'Tide pool exploration',
        'Lighthouse photography'
      ],
      insiderTips: [
        'Lupines bloom in late May-June',
        'Variable weather - pack layers',
        'Peak bird migration in May'
      ]
    },
    summer: {
      whyFamous: 'Perfect weather for all activities, extended daylight hours, peak lobster season, and ideal conditions for coastal camping and water activities',
      uniqueActivities: [
        'Cadillac Mountain sunrise viewing',
        'Coastal camping adventures',
        'Lobster boat tours',
        'Extended coastal hiking',
        'Ocean kayaking expeditions'
      ],
      insiderTips: [
        'Book camping reservations early',
        'Cadillac Mountain first sunrise in US',
        'Peak tourist season - expect crowds'
      ]
    },
    fall: {
      whyFamous: 'Spectacular autumn foliage combines with rugged coastline, comfortable hiking weather, and peaceful atmosphere as crowds diminish',
      uniqueActivities: [
        'Fall foliage photography',
        'Comfortable mountain hiking',
        'Peaceful coastal walks',
        'Cozy cabin stays',
        'Extended photography sessions'
      ],
      insiderTips: [
        'Peak foliage typically early October',
        'Perfect hiking temperatures',
        'Much less crowded than summer'
      ]
    },
    winter: {
      whyFamous: 'Dramatic winter storms create spectacular coastal scenes, cross-country skiing opportunities, and peaceful winter atmosphere',
      uniqueActivities: [
        'Winter storm photography',
        'Cross-country skiing trails',
        'Winter wildlife observation',
        'Cozy lodge stays',
        'Peaceful winter hiking'
      ],
      insiderTips: [
        'Many park roads may be unplowed',
        'Dress warmly for coastal winds',
        'Some facilities closed in winter'
      ]
    }
  },

  'Bryce Canyon National Park': {
    state: 'Utah',
    entryFee: '30',
    coordinates: { lat: 37.5930, lng: -112.1871 },
    bestSeasons: ['spring', 'fall'],
    spring: {
      whyFamous: 'Perfect weather for hoodoo exploration, wildflowers bloom in amphitheater, and comfortable temperatures ideal for challenging hikes into canyon',
      uniqueActivities: [
        'Hoodoo photography in perfect light',
        'Comfortable canyon floor hiking',
        'Wildflower meadow exploration',
        'Sunrise Point photography',
        'Extended hiking without heat stress'
      ],
      insiderTips: [
        'May offers perfect hiking weather',
        'Wildflowers bloom April-June',
        'Still possible snow at rim elevation'
      ]
    },
    summer: {
      whyFamous: 'High elevation provides cooler temperatures than other Utah parks, extended daylight for photography, and full access to all viewpoints',
      uniqueActivities: [
        'Extended daylight photography',
        'Comfortable rim trail walking',
        'Backcountry camping',
        'Star gazing programs',
        'Early morning hoodoo hikes'
      ],
      insiderTips: [
        'High elevation keeps temperatures moderate',
        'Afternoon thunderstorms possible',
        'Perfect for camping'
      ]
    },
    fall: {
      whyFamous: 'Ideal hiking conditions with crisp air, autumn colors enhance red rock hoodoos, and crystal clear skies provide exceptional photography',
      uniqueActivities: [
        'Enhanced hoodoo photography',
        'Comfortable all-day hiking',
        'Clear sky star photography',
        'Peaceful camping',
        'Extended golden hour sessions'
      ],
      insiderTips: [
        'September-October ideal temperatures',
        'Exceptional air clarity',
        'Much less crowded than summer'
      ]
    },
    winter: {
      whyFamous: 'Snow-covered hoodoos create magical winter wonderland, peaceful atmosphere, and unique winter photography opportunities',
      uniqueActivities: [
        'Snow-covered hoodoo photography',
        'Winter rim trail walking',
        'Peaceful winter camping',
        'Cross-country skiing opportunities',
        'Winter wildlife tracking'
      ],
      insiderTips: [
        'Snow common at 8,000+ foot elevation',
        'Icy conditions on rim trails',
        'Spectacular winter photography'
      ]
    }
  }
};

// Mock parks data
const mockParks = [
  { id: '1', name: 'Yellowstone National Park', state: 'Wyoming' },
  { id: '2', name: 'Grand Canyon National Park', state: 'Arizona' },
  { id: '3', name: 'Yosemite National Park', state: 'California' },
  { id: '4', name: 'Zion National Park', state: 'Utah' },
  { id: '5', name: 'Glacier National Park', state: 'Montana' },
  { id: '6', name: 'Rocky Mountain National Park', state: 'Colorado' },
  { id: '7', name: 'Acadia National Park', state: 'Maine' },
  { id: '8', name: 'Bryce Canyon National Park', state: 'Utah' }
];

// Enhanced Error Toast Component
const ErrorToast = ({ message, onDismiss }) => (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg animate-slide-down">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <FaInfoCircle className="text-red-500 text-sm" />
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
            <FaTimes className="text-red-400 text-sm" />
          </button>
        </div>
      </div>
    </div>
);

// Enhanced Season Control Panel
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

// Enhanced Park Card with comprehensive data
const EnhancedParkCard = ({ park, season, index, favorites = [], onToggleFavorite }) => {
  const seasonalInfo = COMPREHENSIVE_PARK_DATA[park.name]?.[season.id] || {
    whyFamous: `Perfect ${season.name.toLowerCase()} destination with ideal weather and seasonal activities`,
    uniqueActivities: [`${season.name} hiking`, `${season.name} photography`, `${season.name} wildlife viewing`],
    insiderTips: [`Best time to visit: ${season.name}`, 'Check park website for conditions', 'Book accommodations early']
  };

  const parkData = COMPREHENSIVE_PARK_DATA[park.name] || { state: park.state, entryFee: '30' };
  const isFavorite = favorites.includes(park.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const bestSeasons = parkData.bestSeasons || [season.id];
  const isOptimalSeason = bestSeasons.includes(season.id);

  return (
      <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
          style={{
            animationDelay: `${index * 0.1}s`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
      >
        <div className={`relative bg-gradient-to-r ${season.primaryColor} p-4 text-white overflow-hidden`}>
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
                <FaMapMarkerAlt className="text-xs flex-shrink-0" />
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

            <button
                onClick={() => onToggleFavorite?.(park.id)}
                className={`p-2 rounded-full transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                    isFavorite
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-white/20 text-white hover:bg-white/30'
                }`}
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
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
          <div className={`bg-gradient-to-r ${season.secondaryColor} p-4 rounded-xl mb-4 border-l-4 border-${season.primaryColor.split('-')[1]}-400`}>
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

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm md:text-base min-h-[44px] transform hover:scale-105">
              <FaEye />
              <span>View Details</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm md:text-base min-h-[44px] transform hover:scale-105">
              <FaRoute />
              <span>Plan Trip</span>
            </button>
          </div>
        </div>
      </div>
  );
};

// Statistics Component
const SeasonalStats = ({ parks, currentSeason }) => {
  const seasonalParks = parks.filter(park => COMPREHENSIVE_PARK_DATA[park.name]?.[currentSeason.id]);
  const bestSeasonParks = parks.filter(park =>
      COMPREHENSIVE_PARK_DATA[park.name]?.bestSeasons?.includes(currentSeason.id)
  );

  return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{seasonalParks.length}</div>
          <div className="text-sm text-gray-600">Parks Available</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{bestSeasonParks.length}</div>
          <div className="text-sm text-gray-600">Best Season</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">8</div>
          <div className="text-sm text-gray-600">States</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">4</div>
          <div className="text-sm text-gray-600">Seasons</div>
        </div>
      </div>
  );
};

// Main Enhanced Seasonal Page Component
const EnhancedSeasonalPage = ({ parks = mockParks, favorites = [], toggleFavorite }) => {
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [key, setKey] = useState(0);
  const [showError, setShowError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const currentSeason = SEASONS[currentSeasonIndex];
  const rotationInterval = 25000;
  const progressInterval = 100;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const seasonalParks = useMemo(() => {
    return parks.filter(park => COMPREHENSIVE_PARK_DATA[park.name]?.[currentSeason.id]);
  }, [parks, currentSeason.id]);

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

  const handleDismissError = () => {
    setShowError(false);
  };

  return (
      <div className={`min-h-screen bg-gradient-to-br ${currentSeason.bgGradient} transition-all duration-1000`}>
        {showError && (
            <ErrorToast
                message="Please check your internet connection and try again."
                onDismiss={handleDismissError}
            />
        )}

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
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
              <SeasonControlPanel
                  currentSeason={currentSeason}
                  isAutoRotating={isAutoRotating}
                  onToggleAutoRotate={handleToggleAutoRotate}
                  onSeasonChange={handleSeasonChange}
                  progress={progress}
                  isMobile={isMobile}
              />

              <SeasonalStats parks={parks} currentSeason={currentSeason} />

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