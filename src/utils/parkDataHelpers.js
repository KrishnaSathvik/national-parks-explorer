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

export const getActivitiesFromPark = (park) => {
  if (park.activities && Array.isArray(park.activities)) return park.activities;

  const text = `${park.name} ${park.highlight} ${
      park.placesToVisit?.map((p) => `${p.name} ${p.description}`).join(' ') || ''
  }`.toLowerCase();

  const activities = [];
  if (text.includes('hiking') || text.includes('trail')) activities.push('Hiking');
  if (text.includes('wildlife') || text.includes('bird')) activities.push('Wildlife');
  if (text.includes('photo') || text.includes('sunrise') || text.includes('view')) activities.push('Photography');
  if (text.includes('camping') || park.hotelsAndCampgrounds?.some(h => h.name?.toLowerCase().includes('camp'))) activities.push('Camping');
  if (text.includes('water') || text.includes('beach')) activities.push('Water Sports');
  if (text.includes('climb') || text.includes('rungs')) activities.push('Rock Climbing');

  return activities.length ? activities : ['Hiking', 'Photography'];
};

export const getFeaturesFromPark = (park) => {
  if (park.features && Array.isArray(park.features)) return park.features;

  const text = `${park.name} ${park.highlight} ${
      park.placesToVisit?.map((p) => `${p.name} ${p.description}`).join(' ') || ''
  }`.toLowerCase();

  const features = [];
  if (text.includes('mountain')) features.push('Mountains');
  if (text.includes('beach')) features.push('Beaches');
  if (text.includes('lake') || text.includes('pond')) features.push('Lakes');
  if (text.includes('forest')) features.push('Forests');
  if (text.includes('rock') || text.includes('granite')) features.push('Rock Formations');
  if (text.includes('waterfall') || text.includes('falls')) features.push('Waterfalls');
  if (text.includes('desert') || text.includes('dune')) features.push('Desert');
  if (text.includes('geyser') || text.includes('hot spring')) features.push('Geysers');

  return features;
};

export const getDifficultyFromPark = (park) => {
  if (park.difficulty) return park.difficulty;

  const text = `${park.name} ${park.highlight} ${
      park.placesToVisit?.map((p) => `${p.name} ${p.description}`).join(' ') || ''
  }`.toLowerCase();

  if (text.includes('strenuous') || text.includes('advanced')) return 'Advanced';
  if (text.includes('moderate') || text.includes('trail')) return 'Moderate';
  return 'Easy';
};

export const getCrowdLevelFromPark = (park) => {
  if (park.crowdLevel) return park.crowdLevel;

  const popular = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Great Smoky Mountains'];
  const moderate = ['Acadia', 'Rocky Mountain', 'Glacier', 'Olympic', 'Arches'];
  if (popular.some(p => park.name?.includes(p))) return 'High';
  if (moderate.some(p => park.name?.includes(p))) return 'Moderate';
  return 'Low';
};

export const getParkDescription = (park) => {
  if (park.description) return park.description;
  if (park.placesToVisit?.length) {
    const highlights = park.placesToVisit.slice(0, 2).map((p) => p.name).join(', ');
    return `Experience ${highlights} and more at this magnificent national park.`;
  }
  if (park.highlight) {
    return `Discover ${park.highlight} and the natural beauty of ${park.name}.`;
  }
  return `Explore the wonders of ${park.name}.`;
};

export const getSeasonalInfo = (park, season) => {
  if (park.bestTimeToVisit?.[season.toLowerCase()]) return park.bestTimeToVisit[season.toLowerCase()];

  const defaultSeasons = {
    spring: "Mild weather and wildflowers.",
    summer: "Peak access and full activities.",
    fall: "Cool air and beautiful foliage.",
    winter: "Snowy, quiet beauty (check road status).",
  };
  return defaultSeasons[season.toLowerCase()] || "Great time to explore.";
};

// --- NEW additions for enhanced stats ---

import { getEstablishedYear, getParkSize, getVisitorCount, getClimate, getNearestCity } from './parkStaticData'; // you can place the static maps here or inline if preferred

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
  return `${count} visitors/year`;
};

// --- Final data enhancer ---

export const enhanceParkData = (park) => {
  const entryFee = parseEntryFee(park.entryFee);

  return {
    ...park,

    // Auto-generated fields
    established: getEstablishedYear(park.name),
    size: getParkSize(park.name),
    annualVisitors: getVisitorCount(park.name),
    climate: getClimate(park.name, park.state),
    nearestCity: getNearestCity(park.name, park.state),

    // Derived from content
    entryFee,
    activities: getActivitiesFromPark(park),
    features: getFeaturesFromPark(park),
    description: getParkDescription(park),
    difficulty: getDifficultyFromPark(park),
    crowdLevel: getCrowdLevelFromPark(park),

    // Fallbacks and helpers
    fullName: park.fullName || park.name,
    bestSeason: park.bestSeason || 'Spring',
    formattedEntryFee: formatEntryFee(entryFee),
    seasonDisplay: getBestSeasonDisplay(park.bestSeason),
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

export default {
  parseEntryFee,
  formatEntryFee,
  getBestSeasonDisplay,
  getActivitiesFromPark,
  getFeaturesFromPark,
  getDifficultyFromPark,
  getCrowdLevelFromPark,
  getParkDescription,
  getSeasonalInfo,
  enhanceParkData,
  filterParksBySeason,
  searchParks,
  formatParkYear,
  formatParkArea,
  formatVisitorCount,
};
