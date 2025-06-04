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
  FaPlay,
  FaPause,
  FaArrowLeft,
  FaInfoCircle
} from 'react-icons/fa';

// ===== SEASONS DATA =====
const SEASONS = [
  {
    id: 'spring',
    name: 'Spring',
    emoji: '🌸',
    icon: FaLeaf,
    primaryColor: 'from-green-400 to-emerald-500',
    secondaryColor: 'from-green-50 to-emerald-50',
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
    description: 'Serene snow-covered landscapes offer peaceful winter wonderlands',
    tagline: 'Winter Wonderland Awaits'
  }
];

// ===== REAL SEASONAL PARK DATA =====
const REAL_SEASONAL_PARK_DATA = {
  'Yellowstone National Park': {
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
      whyFamous: 'Elk bugling season creates unforgettable soundscapes, aspen groves turn golden, and cooler weather makes hiking comfortable with crystal-clear photography conditions',
      uniqueActivities: [
        'Elk bugling photography and recording',
        'Aspen grove hiking in northern ranges',
        'Thermal feature photography in crisp air',
        'Comfortable backcountry day hikes',
        'Wildlife tracking workshops'
      ],
      insiderTips: [
        'Elk bugling peaks mid-September',
        'Best aspen colors: late September',
        'Thermal contrasts most dramatic in cool air'
      ]
    },
    winter: {
      whyFamous: 'Magical winter wonderland where steaming geysers create dramatic ice sculptures, wildlife concentrates in thermal areas, and snowcoach access provides unique experiences',
      uniqueActivities: [
        'Snowcoach tours to Old Faithful',
        'Cross-country skiing on groomed trails',
        'Winter wildlife photography (bison, elk, wolves)',
        'Ice photography at thermal features',
        'Guided snowshoe adventures'
      ],
      insiderTips: [
        'Book snowcoach tours early (limited capacity)',
        'Temperatures can drop to -30°F',
        'Most facilities closed except Old Faithful area'
      ]
    }
  },
  'Arches National Park': {
  spring: {
    whyFamous: 'Pleasant weather for hiking through red rock landscapes and dramatic desert blooms set against famous arches and spires',
    uniqueActivities: [
      'Delicate Arch sunset hike in cool temps',
      'Desert wildflower photography',
      'Stargazing with minimal cloud cover',
      'Ranger-led Fiery Furnace tours',
      'Canyon hiking through Courthouse Wash'
    ],
    insiderTips: [
      'Arrive before 8 AM to avoid parking issues',
      'Fiery Furnace requires a permit or guide',
      'Sun angle is best for arch photography in the morning'
    ]
  },
  summer: {
    whyFamous: 'Clear skies and iconic desert sunrises/sunsets draw photographers and adventure seekers despite the intense midday heat',
    uniqueActivities: [
      'Sunrise at Turret Arch or North Window',
      'Evening photography at Balanced Rock',
      'Short hikes at dawn and dusk',
      'Auto-touring the Scenic Drive',
      'Night sky astrophotography'
    ],
    insiderTips: [
      'Avoid hiking after 10 AM – temps can exceed 105°F',
      'Hydrate frequently – bring more water than expected',
      'Best Milky Way shots: new moon nights, 2–4 AM'
    ]
  },
  fall: {
    whyFamous: 'Cooler weather and golden desert hues make hiking ideal, and the crowds start to thin, offering a peaceful experience',
    uniqueActivities: [
      'Extended hiking to Tower Arch or Devil’s Garden',
      'Fall light photography at Landscape Arch',
      'Ranger talks on desert geology',
      'Rock scrambling in cooler temperatures',
      'Camping under starry skies'
    ],
    insiderTips: [
      'Perfect temperatures: 60–80°F',
      'Crowds lighter after Labor Day',
      'Less dust means clearer photography'
    ]
  },
  winter: {
    whyFamous: 'Snow-dusted arches create surreal photography opportunities with few visitors and a peaceful desert silence',
    uniqueActivities: [
      'Delicate Arch with snow backdrop',
      'Snowshoeing or light trekking in Devils Garden',
      'Minimalist winter landscape photography',
      'Solitude hikes on primitive trails',
      'Stargazing in silence'
    ],
    insiderTips: [
      'Early closures possible due to snow or ice',
      'Use traction devices for icy trails',
      'Visitor center open but limited services'
    ]
  }
},
'Glacier National Park': {
  spring: {
    whyFamous: 'Lower elevation trails open first, wildlife emerges from hibernation, and waterfalls from snowmelt roar down alpine valleys',
    uniqueActivities: [
      'Wildlife viewing in Many Glacier area',
      'Waterfall hikes (Running Eagle Falls)',
      'Birdwatching in lower valleys',
      'Photography of snowcapped peaks',
      'Trail of the Cedars hike'
    ],
    insiderTips: [
      'Going-to-the-Sun Road partially closed until late June',
      'Wildflowers bloom early in valley areas',
      'Bears are active – carry bear spray'
    ]
  },
  summer: {
    whyFamous: 'Full access to Going-to-the-Sun Road and alpine trails, glacier views, and dramatic mountain vistas at their best',
    uniqueActivities: [
      'Logan Pass hike to Hidden Lake',
      'Sunrise photography at Lake McDonald',
      'Boat tours on St. Mary or Two Medicine lakes',
      'Glacier-fed lake kayaking',
      'High alpine wildflower identification'
    ],
    insiderTips: [
      'Entry reservation required (check nps.gov)',
      'Start hikes early to see wildlife',
      'Glacier melt creates high waterfalls in July'
    ]
  },
  fall: {
    whyFamous: 'Golden larch trees light up the mountainsides, wildlife activity spikes, and clear skies provide epic visibility',
    uniqueActivities: [
      'Larch and aspen foliage photography',
      'Moose spotting at Fishercap Lake',
      'Backcountry camping in cooler temps',
      'Clear sunrise views from Logan Pass',
      'Fall color hikes in North Fork'
    ],
    insiderTips: [
      'Roads begin closing mid-October',
      'Bears hyperfeed in fall – keep distance',
      'Best foliage: late September – early October'
    ]
  },
  winter: {
    whyFamous: 'Quiet, snow-covered wilderness perfect for cross-country skiing and peaceful winter solitude with mountain backdrops',
    uniqueActivities: [
      'Skiing along Lake McDonald Road',
      'Snowshoeing from Apgar Village',
      'Frozen waterfall photography',
      'Solitude at Bowman Lake',
      'Ranger-led winter programs'
    ],
    insiderTips: [
      'Only west side of park accessible by road',
      'Extreme cold possible – dress in layers',
      'Limited services – plan ahead'
    ]
  }
},
'Acadia National Park': {
  spring: {
    whyFamous: 'Wildflowers bloom, trails open as snow melts, and the park awakens with birdsong and coastal beauty',
    uniqueActivities: [
      'Jordan Pond loop hike with lupines in bloom',
      'Carriage road biking in cool weather',
      'Birdwatching at Sieur de Monts',
      'Sunrise from Cadillac Mountain',
      'Explore tide pools at low tide'
    ],
    insiderTips: [
      'Mosquitoes are active – bring spray',
      'Trails muddy from melt – wear waterproof boots',
      'Check tide tables for coastal hikes'
    ]
  },
  summer: {
    whyFamous: 'Mild temperatures, lush greenery, and fully open roads make Acadia a popular coastal escape',
    uniqueActivities: [
      'Sunrise at Cadillac Mountain (early morning)',
      'Ocean Path hike to Thunder Hole',
      'Kayaking in Frenchman Bay',
      'Biking scenic carriage roads',
      'Swimming at Sand Beach'
    ],
    insiderTips: [
      'Crowds peak in July/August – arrive early',
      'Park Loop Road best done clockwise',
      'Book Bar Harbor accommodations early'
    ]
  },
  fall: {
    whyFamous: 'World-famous fall foliage paints the park in red, gold, and orange with crisp air and fewer crowds',
    uniqueActivities: [
      'Park Loop drive for foliage views',
      'Jordan Pond fall reflection photography',
      'Foliage hike to Beehive or Bubble Rock',
      'Lobster boat tours in cool air',
      'Photography from Otter Cliff'
    ],
    insiderTips: [
      'Peak color: early to mid-October',
      'Cool mornings – layer up',
      'Foliage best with morning sun or after rain'
    ]
  },
  winter: {
    whyFamous: 'Peaceful snowy coastline, cross-country skiing along carriage roads, and unique ocean-meets-snow scenes',
    uniqueActivities: [
      'Snowshoeing to Jordan Pond',
      'Cross-country skiing carriage trails',
      'Frozen coastline photography',
      'Peaceful wildlife tracking',
      'Cozy winter stays in Bar Harbor'
    ],
    insiderTips: [
      'Limited road access (some areas gated)',
      'Ice possible near shoreline – wear spikes',
      'Best light: midday when sun is low'
    ]
  }
},
'Rocky Mountain National Park': {
  spring: {
    whyFamous: 'Lower elevation trails melt first, elk and moose emerge, and alpine lakes begin thawing for crystal-clear reflections',
    uniqueActivities: [
      'Elk viewing in Moraine Park',
      'Thawing lake photography (Sprague Lake)',
      'Birdwatching on Cub Lake Trail',
      'Ranger-led spring ecology walks',
      'Snowshoeing at Bear Lake early season'
    ],
    insiderTips: [
      'Check trail conditions for snow patches',
      'Roads to high elevations may still be closed',
      'Start early – spring storms common'
    ]
  },
  summer: {
    whyFamous: 'All roads and alpine trails open with wildflowers, abundant wildlife, and dramatic mountain views at their best',
    uniqueActivities: [
      'Trail Ridge Road scenic drive',
      'Alpine lake hikes (Emerald, Sky Pond)',
      'Sunrise photography from Many Parks Curve',
      'Backpacking above treeline',
      'Wildflower identification on Ute Trail'
    ],
    insiderTips: [
      'Timed entry permits required',
      'Afternoon thunderstorms are common – hike early',
      'Expect altitude effects above 10,000 feet'
    ]
  },
  fall: {
    whyFamous: 'Golden aspens and elk rut make this one of the most photogenic and sonically rich seasons in the park',
    uniqueActivities: [
      'Elk bugling at dawn in Moraine Park',
      'Aspen grove hikes in Bear Lake area',
      'Fall color photography along Peak to Peak Hwy',
      'Stargazing under crisp skies',
      'Cool weather day hiking'
    ],
    insiderTips: [
      'Best foliage: mid-September',
      'Elk are active at dawn/dusk',
      'Clear skies ideal for night photography'
    ]
  },
  winter: {
    whyFamous: 'Snow blankets alpine terrain offering snowshoeing and solitude, with wildlife sightings at lower elevations',
    uniqueActivities: [
      'Snowshoe to Dream Lake',
      'Winter wildlife photography (elk, coyote)',
      'Cross-country skiing near Hidden Valley',
      'Snowy sunrise shots at Bear Lake',
      'Ranger-led winter walks'
    ],
    insiderTips: [
      'Weather can be extreme – check forecasts',
      'Only lower trails accessible in deep snow',
      'Dress in layers – quick weather shifts'
    ]
  }
},
'Badlands National Park': {
  spring: {
    whyFamous: 'Prairie wildflowers bloom across rugged formations, and baby bison and bighorn sheep sightings increase',
    uniqueActivities: [
      'Fossil exhibit trail hikes',
      'Sunrise photography at Big Badlands Overlook',
      'Wildflower photography in prairie areas',
      'Bison and bighorn sheep spotting',
      'Night sky viewing in cool air'
    ],
    insiderTips: [
      'Best wildlife viewing: early mornings',
      'Spring storms = dramatic cloud photos',
      'Avoid muddy trails after rain'
    ]
  },
  summer: {
    whyFamous: 'Vast landscapes under epic skies make this a surreal experience, though scorching temps require caution',
    uniqueActivities: [
      'Sunset shots from Pinnacles Overlook',
      'Short hikes at dawn (Door Trail, Notch Trail)',
      'Night sky astrophotography',
      'Ranger fossil talks',
      'Scenic drive with air-conditioned breaks'
    ],
    insiderTips: [
      'Temps can exceed 100°F – bring water',
      'Storms = amazing sky backdrops',
      'Best photography light: 6–8 AM and 6–9 PM'
    ]
  },
  fall: {
    whyFamous: 'Cooler temps and golden prairie light make fall perfect for hiking and extended photo sessions',
    uniqueActivities: [
      'Extended hikes on Castle Trail',
      'Sunset photography in golden grasslands',
      'Fossil hunting in drier weather',
      'Comfortable backcountry camping',
      'Bird migration observation'
    ],
    insiderTips: [
      'Best hiking weather: September–October',
      'Sun angles are ideal for formation shadows',
      'Fewer bugs and crowds'
    ]
  },
  winter: {
    whyFamous: 'Frost and snow create an eerie beauty in the formations, and silence amplifies the remote feel',
    uniqueActivities: [
      'Frosty sunrise photography at Conata Basin',
      'Snow-covered butte photography',
      'Wildlife tracking in snow',
      'Solitude walks in main loop',
      'Winter night sky views'
    ],
    insiderTips: [
      'Road closures after storms common',
      'Dress for strong wind chills',
      'Best photos: just after snowfall'
    ]
  }
}
  'Yosemite National Park': {
    spring: {
      whyFamous: 'Waterfalls reach peak flow from Sierra snowmelt, creating thunderous cascades, while valley wildflowers create stunning foregrounds for granite dome photography',
      uniqueActivities: [
        'Yosemite Falls photography at peak flow',
        'Valley floor wildflower macro photography',
        'Mist Trail hiking (prepare to get soaked)',
        'Rock climbing route preparation',
        'Dogwood blossom photography in valley'
      ],
      insiderTips: [
        'Waterfalls peak in May-June',
        'Mist Trail requires rain gear',
        'Valley wildflowers best in April-May'
      ]
    },
    summer: {
      whyFamous: 'High Sierra becomes fully accessible for alpine adventures, Tioga Pass opens revealing pristine alpine lakes, and rock climbing reaches peak season with perfect granite conditions',
      uniqueActivities: [
        'Half Dome cable climb (permits required)',
        'High Sierra Camps backpacking loops',
        'Multi-pitch granite climbing courses',
        'Alpine lake photography in high country',
        'Backpacking to Cathedral Lakes'
      ],
      insiderTips: [
        'Half Dome permits sell out in minutes',
        'High country accessible July-September',
        'Start climbs at dawn to avoid afternoon heat'
      ]
    },
    fall: {
      whyFamous: 'Perfect hiking weather combines with stunning oak and maple autumn colors, crystal-clear air provides exceptional granite views, and comfortable temperatures extend outdoor time',
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
      whyFamous: 'Snow-dusted granite domes create pristine winter landscapes, Horsetail Fall potentially becomes "firefall" in February, and peaceful solitude transforms the valley experience',
      uniqueActivities: [
        'Horsetail Fall "firefall" photography (February)',
        'Winter photography workshops',
        'Snowshoeing to Mirror Lake',
        'Cozy Ahwahnee Hotel stays',
        'Ice skating at Curry Village'
      ],
      insiderTips: [
        'Firefall conditions rare - need clear skies',
        'Tire chains required for park access',
        'Many high country areas inaccessible'
      ]
    }
  },
  'Grand Canyon National Park': {
    spring: {
      whyFamous: 'Perfect hiking weather with mild temperatures ideal for rim and inner canyon exploration, desert wildflowers bloom creating colorful displays, and clear air provides exceptional visibility',
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
      whyFamous: 'Extended daylight hours maximize viewing time with 14+ hours of sunlight, helicopter and river rafting tours operate at full capacity, though inner canyon heat requires early starts',
      uniqueActivities: [
        'Sunrise photography tours (5:30 AM)',
        'Colorado River rafting expeditions',
        'Helicopter tours over North Rim',
        'Early morning inner canyon hikes',
        'Extended sunset viewing sessions'
      ],
      insiderTips: [
        'Inner canyon reaches 120°F - avoid midday',
        'River trips book 1-2 years ahead',
        'Rim temperatures comfortable despite heat below'
      ]
    },
    fall: {
      whyFamous: 'Ideal temperatures create perfect conditions with crystal clear views, comfortable hiking weather extends throughout the day, and autumn light provides exceptional photography conditions',
      uniqueActivities: [
        'Rim-to-rim hiking in perfect weather',
        'Extended photography sessions',
        'Comfortable multi-day backpacking',
        'Clear night sky stargazing',
        'Geology and fossil hunting tours'
      ],
      insiderTips: [
        'Best weather of the year: September-November',
        'Exceptional visibility for photography',
        'Perfect conditions for longer hikes'
      ]
    },
    winter: {
      whyFamous: 'Rare snow creates stunning contrasts between white snow and red rocks, peaceful solitude with minimal crowds, and dramatic winter storm photography opportunities',
      uniqueActivities: [
        'Snow-dusted canyon photography',
        'Peaceful rim walks without crowds',
        'Winter storm cloud photography',
        'Cozy lodge visits and programs',
        'Wildlife viewing (elk, condors)'
      ],
      insiderTips: [
        'Snow possible but not guaranteed',
        'North Rim closed October-May',
        'Dramatic weather creates best photos'
      ]
    }
  },
  'Zion National Park': {
    spring: {
      whyFamous: 'Virgin River levels perfect for wading through narrow slot canyons, desert wildflowers create vibrant displays, and mild temperatures make strenuous hikes comfortable',
      uniqueActivities: [
        'The Narrows wading in perfect conditions',
        'Desert wildflower photography',
        'Angels Landing preparation hikes',
        'Canyon photography with spring light',
        'Emerald Pools waterfall viewing'
      ],
      insiderTips: [
        'River water cold but manageable',
        'Wildflowers peak March-April',
        'Perfect weather for strenuous hikes'
      ]
    },
    summer: {
      whyFamous: 'Peak adventure season with all trails accessible, though intense heat requires strategic early morning starts, and The Narrows provides cooling relief from desert temperatures',
      uniqueActivities: [
        'Early morning Angels Landing climbs',
        'The Narrows cooling river hikes',
        'Shuttle system scenic tours',
        'Photography workshops with dramatic lighting',
        'Evening ranger programs'
      ],
      insiderTips: [
        'Start hikes by 6 AM to beat heat',
        'The Narrows offers cooling relief',
        'Carry extra water - temperatures reach 110°F'
      ]
    },
    fall: {
      whyFamous: 'Cottonwood and maple trees turn brilliant gold and red, perfect hiking temperatures make all trails comfortable, and exceptional photography light enhances red rock formations',
      uniqueActivities: [
        'Fall foliage photography along Virgin River',
        'Comfortable full-day hiking adventures',
        'Perfect light photography workshops',
        'Extended river activities',
        'Peaceful camping in ideal weather'
      ],
      insiderTips: [
        'Fall colors peak in November',
        'Perfect temperatures for any hike',
        'Exceptional light for red rock photography'
      ]
    },
    winter: {
      whyFamous: 'Mild winter weather provides peaceful exploration opportunities, occasional snow dusts red rocks creating magical scenes, and comfortable temperatures for desert hiking',
      uniqueActivities: [
        'Peaceful winter hiking',
        'Snow-dusted red rock photography',
        'Comfortable camping in mild weather',
        'Solitude experiences on popular trails',
        'Clear night sky stargazing'
      ],
      insiderTips: [
        'Temperatures rarely drop below freezing',
        'Occasional snow creates stunning photos',
        'Perfect season for avoiding crowds'
      ]
    }
  },
  'Bryce Canyon National Park': {
    spring: {
      whyFamous: 'Snow contrasts beautifully with red hoodoos creating dramatic photography, high elevation wildflowers begin blooming, and crystal-clear air provides exceptional visibility',
      uniqueActivities: [
        'Snow and hoodoo contrast photography',
        'High elevation wildflower identification',
        'Clear air landscape photography',
        'Comfortable rim trail walking',
        'Dramatic storm cloud photography'
      ],
      insiderTips: [
        'Snow possible through May at 8,000+ feet',
        'Dramatic weather creates best photos',
        'Layer clothing for temperature swings'
      ]
    },
    summer: {
      whyFamous: 'Perfect temperatures at 8,000+ feet elevation provide relief from desert heat, extended daylight hours for photography, and comfortable conditions for strenuous hikes',
      uniqueActivities: [
        'Sunrise Point photography sessions',
        'Cool temperature hiking in desert region',
        'Astronomy programs with dark skies',
        'Photography workshops with perfect light',
        'Comfortable backcountry exploration'
      ],
      insiderTips: [
        'Comfortable 70°F when desert is 100°F+',
        'Excellent night sky viewing',
        'Perfect hiking weather despite desert location'
      ]
    },
    fall: {
      whyFamous: 'Autumn aspen groves complement red rocks with golden colors, crisp air creates incredible visibility for photography, and perfect hiking weather extends throughout the day',
      uniqueActivities: [
        'Aspen and hoodoo color combination photography',
        'Perfect weather hiking adventures',
        'Crystal clear sunrise viewing',
        'Comfortable camping in ideal conditions',
        'Extended photography sessions'
      ],
      insiderTips: [
        'Aspen colors peak in late September',
        'Exceptional visibility for distant views',
        'Perfect weather for extended outdoor time'
      ]
    },
    winter: {
      whyFamous: 'Snow-covered hoodoos create otherworldly winter landscapes, cross-country skiing through snow-laden pine forests, and peaceful winter photography opportunities',
      uniqueActivities: [
        'Snow-covered hoodoo photography',
        'Cross-country skiing on groomed trails',
        'Snowshoeing adventures in pine forests',
        'Winter landscape photography workshops',
        'Peaceful winter solitude experiences'
      ],
      insiderTips: [
        'Heavy snow common at high elevation',
        'Ski equipment rentals available',
        'Road conditions can be challenging'
      ]
    }
  }
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

// ===== STREAMLINED PARK CARD =====
const StreamlinedParkCard = ({ park, season, index }) => {
  const seasonalInfo = REAL_SEASONAL_PARK_DATA[park.name]?.[season.id] || {
    whyFamous: `Perfect ${season.name.toLowerCase()} destination with ideal weather and seasonal activities`,
    uniqueActivities: [`${season.name} hiking`, `${season.name} photography`, `${season.name} wildlife viewing`],
    insiderTips: [`Best time to visit: ${season.name}`, 'Check park website for conditions', 'Book accommodations early']
  };

  return (
    <FadeInWrapper delay={index * 0.1}>
      <div className="group bg-white rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 mb-6">
        {/* Header */}
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
                    <span className="text-green-600 font-medium">Entry: ${park.entryFee}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`bg-gradient-to-r ${season.primaryColor} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg`}>
            Perfect for {season.name}
          </div>
        </div>

        {/* Why it's special section */}
        <div className={`bg-gradient-to-r ${season.secondaryColor} p-5 rounded-xl mb-4 border-l-4 ${season.primaryColor.replace('from-', 'border-').split(' ')[0]}`}>
          <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🌟</span>
            Why {park.name} shines in {season.name}:
          </div>
          <div className="text-gray-700 leading-relaxed">
            {seasonalInfo.whyFamous}
          </div>
        </div>

        {/* Unique activities */}
        <div className="mb-4">
          <div className="font-medium text-purple-700 flex items-center gap-2 mb-3">
            <span>🎯</span>
            Must-do {season.name} activities:
          </div>
          <div className="grid grid-cols-1 gap-2">
            {seasonalInfo.uniqueActivities.slice(0, 5).map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insider tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="font-medium text-blue-700 flex items-center gap-2 mb-2">
            <FaInfoCircle />
            Insider Tips:
          </div>
          <div className="space-y-1">
            {seasonalInfo.insiderTips.slice(0, 3).map((tip, idx) => (
              <div key={idx} className="text-sm text-blue-600 flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeInWrapper>
  );
};

// ===== MAIN SEASONAL PAGE =====
const SeasonalPage = ({ parks }) => {
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [key, setKey] = useState(0);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentSeason = SEASONS[currentSeasonIndex];
  const rotationInterval = 25000; // 25 seconds
  const progressInterval = 100;

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

  // Filter parks that have real seasonal data
  const seasonalParks = useMemo(() => {
    return parks.filter(park => REAL_SEASONAL_PARK_DATA[park.name]).slice(0, 10);
  }, [parks]);

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
                      Best {currentSeason.name} National Parks
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

            {/* Parks List */}
            {seasonalParks.length > 0 ? (
              <div className="space-y-6">
                <FadeInWrapper delay={0.4}>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Best Parks for {currentSeason.name}
                    </h2>
                    <p className="text-gray-600">
                      Discover {seasonalParks.length} parks with unique {currentSeason.name.toLowerCase()} experiences
                    </p>
                  </div>
                </FadeInWrapper>

                <div className="space-y-4">
                  {seasonalParks.map((park, index) => (
                    <StreamlinedParkCard
                      key={park.id}
                      park={park}
                      season={currentSeason}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalPage;