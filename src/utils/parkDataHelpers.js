// src/utils/parkDataHelpers.js

// --- Existing utility functions ---

export const parseEntryFee = (entryFee) => {
  if (typeof entryFee === 'number') return entryFee;
  if (typeof entryFee === 'string') {
    const numeric = parseInt(entryFee.replace(/[^0-9]/g, ''));
    return isNaN(numeric) ? 0 : numeric;
  }
  return 0;
};

export const formatEntryFee = (entryFee) => {
  const fee = parseEntryFee(entryFee);
  return fee === 0 ? 'Free' : `$${fee}`;
};

export const getBestSeasonDisplay = (bestSeason) => {
  const seasonEmojis = {
    Spring: '🌸',
    Summer: '☀️',
    Fall: '🍂',
    Winter: '❄️',
  };
  return bestSeason ? `${seasonEmojis[bestSeason] || '🌟'} ${bestSeason}` : 'Year-round';
};

// NEW: Enhanced hours extraction for park cards
export const getParkHours = (park) => {
  // Check for general park hours
  if (park.hours) return park.hours;

  // Check visitor center hours
  if (park.placesToVisit?.length) {
    const visitorCenter = park.placesToVisit.find(place =>
        place.name?.toLowerCase().includes('visitor') ||
        place.name?.toLowerCase().includes('center')
    );
    if (visitorCenter?.hours) return visitorCenter.hours;
  }

  // Check first place with hours
  if (park.placesToVisit?.length) {
    const placeWithHours = park.placesToVisit.find(place => place.hours);
    if (placeWithHours?.hours) return placeWithHours.hours;
  }

  // Default hours
  return "Daily 24 hours";
};

export const getActivitiesFromPark = (park) => {
  if (park.activities && Array.isArray(park.activities)) return park.activities;

  const text = `${park.name} ${park.highlight} ${park.description || ''} ${
      park.placesToVisit?.map((p) => `${p.name} ${p.description}`).join(' ') || ''
  }`.toLowerCase();

  const activities = [];
  if (text.includes('hiking') || text.includes('trail')) activities.push('Hiking');
  if (text.includes('wildlife') || text.includes('bird')) activities.push('Wildlife');
  if (text.includes('photo') || text.includes('sunrise') || text.includes('view')) activities.push('Photography');
  if (text.includes('camping') || park.hotelsAndCampgrounds?.some(h => h.name?.toLowerCase().includes('camp'))) activities.push('Camping');
  if (text.includes('water') || text.includes('beach') || text.includes('lake') || text.includes('river')) activities.push('Water Sports');
  if (text.includes('climb') || text.includes('rungs')) activities.push('Rock Climbing');
  if (text.includes('fish')) activities.push('Fishing');
  if (text.includes('kayak') || text.includes('canoe') || text.includes('boat')) activities.push('Boating');

  return activities.length ? activities : ['Hiking', 'Photography'];
};

export const getFeaturesFromPark = (park) => {
  if (park.features && Array.isArray(park.features)) return park.features;

  const text = `${park.name} ${park.highlight} ${park.description || ''} ${
      park.placesToVisit?.map((p) => `${p.name} ${p.description}`).join(' ') || ''
  }`.toLowerCase();

  const features = [];
  if (text.includes('mountain') || text.includes('peak')) features.push('Mountains');
  if (text.includes('beach') || text.includes('coast')) features.push('Beaches');
  if (text.includes('lake') || text.includes('pond')) features.push('Lakes');
  if (text.includes('forest') || text.includes('tree')) features.push('Forests');
  if (text.includes('rock') || text.includes('granite') || text.includes('stone')) features.push('Rock Formations');
  if (text.includes('waterfall') || text.includes('falls')) features.push('Waterfalls');
  if (text.includes('desert') || text.includes('dune') || text.includes('sand')) features.push('Desert');
  if (text.includes('geyser') || text.includes('hot spring')) features.push('Geysers');
  if (text.includes('cave') || text.includes('cavern')) features.push('Caves');
  if (text.includes('canyon') || text.includes('gorge')) features.push('Canyons');
  if (text.includes('river') || text.includes('stream')) features.push('Rivers');

  return features;
};

export const getDifficultyFromPark = (park) => {
  if (park.difficulty) return park.difficulty;

  const text = `${park.name} ${park.highlight} ${park.description || ''} ${
      park.placesToVisit?.map((p) => `${p.name} ${p.description}`).join(' ') || ''
  }`.toLowerCase();

  if (text.includes('strenuous') || text.includes('advanced') || text.includes('challenging') || text.includes('difficult')) return 'Advanced';
  if (text.includes('moderate') || text.includes('trail') || text.includes('hike')) return 'Moderate';
  return 'Easy';
};

export const getCrowdLevelFromPark = (park) => {
  if (park.crowdLevel) return park.crowdLevel;

  const popular = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Great Smoky Mountains', 'Arches', 'Bryce Canyon'];
  const moderate = ['Acadia', 'Rocky Mountain', 'Glacier', 'Olympic', 'Joshua Tree', 'Sequoia', 'Kings Canyon'];

  if (popular.some(p => park.name?.includes(p))) return 'High';
  if (moderate.some(p => park.name?.includes(p))) return 'Moderate';
  return 'Low';
};

export const getParkDescription = (park) => {
  if (park.description) return park.description;
  if (park.highlight) return park.highlight;
  if (park.placesToVisit?.length) {
    const highlights = park.placesToVisit.slice(0, 2).map((p) => p.name).join(', ');
    return `Experience ${highlights} and more at this magnificent national park.`;
  }
  return `Explore the wonders of ${park.name}.`;
};

export const getSeasonalInfo = (park, season) => {
  if (park.bestTimeToVisit?.[season.toLowerCase()]) return park.bestTimeToVisit[season.toLowerCase()];

  const defaultSeasons = {
    spring: "Mild weather and wildflowers bloom.",
    summer: "Peak access and full activities available.",
    fall: "Cool air and beautiful foliage.",
    winter: "Snowy, quiet beauty (check road status).",
  };
  return defaultSeasons[season.toLowerCase()] || "Great time to explore.";
};

// --- Enhanced formatting functions for the new UI ---

import { getEstablishedYear, getParkSize, getVisitorCount, getClimate, getNearestCity } from './parkStaticData';

export const formatParkYear = (year) => {
  if (!year) return 'Historic';
  const age = new Date().getFullYear() - year;
  return `${year} (${age} years old)`;
};

export const formatParkArea = (acres) => {
  if (!acres) return 'Area varies';
  if (acres > 1_000_000) return `${(acres / 1_000_000).toFixed(1)}M acres`;
  if (acres > 1_000) return `${(acres / 1_000).toFixed(1)}k acres`;
  return `${acres.toLocaleString()} acres`;
};

export const formatVisitorCount = (count) => {
  if (!count) return 'Popular';
  if (count > 1_000_000) return `${(count / 1_000_000).toFixed(1)}M visitors/year`;
  if (count > 1_000) return `${(count / 1_000).toFixed(0)}k visitors/year`;
  return `${count.toLocaleString()} visitors/year`;
};

// NEW: Enhanced activity icon mapping for park cards
export const getActivityIcons = (park) => {
  const icons = [];
  const desc = (park.description || '').toLowerCase();
  const highlight = (park.highlight || '').toLowerCase();
  const activities = getActivitiesFromPark(park);

  // Activity-based icons
  if (activities.includes('Hiking') || desc.includes('hiking') || highlight.includes('trail')) icons.push('🥾');
  if (activities.includes('Wildlife') || desc.includes('wildlife') || highlight.includes('wildlife')) icons.push('🦌');
  if (activities.includes('Water Sports') || desc.includes('water') || highlight.includes('lake') || highlight.includes('river')) icons.push('🌊');
  if (desc.includes('mountain') || highlight.includes('peak') || highlight.includes('summit')) icons.push('⛰️');
  if (activities.includes('Photography') || desc.includes('photo') || highlight.includes('scenic')) icons.push('📸');
  if (activities.includes('Camping') || desc.includes('camp')) icons.push('🏕️');
  if (desc.includes('desert') || highlight.includes('desert')) icons.push('🌵');
  if (desc.includes('forest') || highlight.includes('forest')) icons.push('🌲');

  return icons.slice(0, 3); // Return max 3 icons
};

// NEW: Enhanced park data processor
export const enhanceParkData = (park) => {
  const entryFee = parseEntryFee(park.entryFee);

  return {
    ...park,

    // Auto-generated fields from static data
    established: getEstablishedYear(park.name),
    size: getParkSize(park.name),
    annualVisitors: getVisitorCount(park.name),
    climate: getClimate(park.name, park.state),
    nearestCity: getNearestCity(park.name, park.state),

    // Derived from content
    entryFee,
    hours: getParkHours(park),
    activities: getActivitiesFromPark(park),
    activityIcons: getActivityIcons(park),
    features: getFeaturesFromPark(park),
    description: getParkDescription(park),
    difficulty: getDifficultyFromPark(park),
    crowdLevel: getCrowdLevelFromPark(park),

    // Fallbacks and helpers
    fullName: park.fullName || park.name,
    bestSeason: park.bestSeason || 'Spring',
    formattedEntryFee: formatEntryFee(entryFee),
    seasonDisplay: getBestSeasonDisplay(park.bestSeason),
    formattedEstablished: formatParkYear(getEstablishedYear(park.name)),
    formattedSize: formatParkArea(getParkSize(park.name)),
    formattedVisitors: formatVisitorCount(getVisitorCount(park.name)),
    getSeasonalInfo: (season) => getSeasonalInfo(park, season),
  };
};

export const filterParksBySeason = (parks, season) =>
    parks.filter((park) => park.bestSeason?.toLowerCase() === season.toLowerCase());

export const searchParks = (parks, query) => {
  if (!query || query.length < 2) return parks;
  const q = query.toLowerCase();
  return parks.filter((park) =>
      `${park.name} ${park.state} ${park.description} ${park.highlight} ${park.placesToVisit?.map(p => p.name).join(' ')}`.toLowerCase().includes(q)
  );
};

// NEW: Enhanced filtering functions for the new UI
export const filterParksByFeeRange = (parks, feeRange) => {
  if (!feeRange) return parks;

  return parks.filter(park => {
    const fee = parseEntryFee(park.entryFee);
    switch(feeRange) {
      case 'Free': return fee === 0;
      case 'Under $15': return fee > 0 && fee < 15;
      case '$15-30': return fee >= 15 && fee <= 30;
      case 'Over $30': return fee > 30;
      default: return true;
    }
  });
};

export const filterParksByActivities = (parks, activities) => {
  if (!activities || activities.length === 0) return parks;

  return parks.filter(park => {
    const parkActivities = getActivitiesFromPark(park);
    return activities.some(activity =>
        parkActivities.some(parkActivity =>
            parkActivity.toLowerCase().includes(activity.toLowerCase())
        )
    );
  });
};

export default {
  parseEntryFee,
  formatEntryFee,
  getBestSeasonDisplay,
  getParkHours,
  getActivitiesFromPark,
  getActivityIcons,
  getFeaturesFromPark,
  getDifficultyFromPark,
  getCrowdLevelFromPark,
  getParkDescription,
  getSeasonalInfo,
  enhanceParkData,
  filterParksBySeason,
  filterParksByFeeRange,
  filterParksByActivities,
  searchParks,
  formatParkYear,
  formatParkArea,
  formatVisitorCount,
};