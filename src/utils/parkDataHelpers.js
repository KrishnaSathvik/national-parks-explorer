// src/utils/parkDataHelpers.js
// Utility functions to handle your existing data format

// Parse entry fee from various formats
export const parseEntryFee = (entryFee) => {
  if (typeof entryFee === 'number') return entryFee;
  if (typeof entryFee === 'string') {
    const numeric = parseInt(entryFee.replace(/[^0-9]/g, ''));
    return isNaN(numeric) ? 0 : numeric;
  }
  return 0;
};

// Format entry fee for display
export const formatEntryFee = (entryFee) => {
  const fee = parseEntryFee(entryFee);
  return fee === 0 ? 'Free' : `$${fee}`;
};

// Get best season display text
export const getBestSeasonDisplay = (bestSeason) => {
  const seasonEmojis = {
    'Spring': '🌸',
    'Summer': '☀️',
    'Fall': '🍂',
    'Winter': '❄️'
  };
  
  return bestSeason ? `${seasonEmojis[bestSeason] || '🌟'} ${bestSeason}` : 'Year-round';
};

// Extract activities from park data
export const getActivitiesFromPark = (park) => {
  // If activities field exists, use it
  if (park.activities && Array.isArray(park.activities)) {
    return park.activities;
  }
  
  // Otherwise, generate from existing data
  const activities = [];
  const placesToVisitText = park.placesToVisit ? 
    park.placesToVisit.map(place => `${place.name} ${place.description}`).join(' ') : '';
  const text = `${park.name} ${park.highlight} ${placesToVisitText}`.toLowerCase();
  
  if (text.includes('hiking') || text.includes('trail') || text.includes('beehive trail')) {
    activities.push('Hiking');
  }
  if (text.includes('wildlife') || text.includes('bird') || text.includes('animal')) {
    activities.push('Wildlife');
  }
  if (text.includes('photography') || text.includes('scenic') || text.includes('views') || 
      text.includes('sunrise') || text.includes('panoramic')) {
    activities.push('Photography');
  }
  if (text.includes('camping') || 
      park.hotelsAndCampgrounds?.some(h => h.name?.toLowerCase().includes('campground'))) {
    activities.push('Camping');
  }
  if (text.includes('water') || text.includes('beach') || text.includes('pond') || 
      text.includes('ocean') || text.includes('swimming')) {
    activities.push('Water Sports');
  }
  if (text.includes('climb') || text.includes('iron rungs') || text.includes('rock climbing')) {
    activities.push('Rock Climbing');
  }
  
  return activities.length > 0 ? activities : ['Hiking', 'Photography'];
};

// Extract features from park data
export const getFeaturesFromPark = (park) => {
  // If features field exists, use it
  if (park.features && Array.isArray(park.features)) {
    return park.features;
  }
  
  // Otherwise, generate from existing data
  const features = [];
  const placesToVisitText = park.placesToVisit ? 
    park.placesToVisit.map(place => `${place.name} ${place.description}`).join(' ') : '';
  const text = `${park.name} ${park.highlight} ${placesToVisitText}`.toLowerCase();
  
  if (text.includes('mountain') || text.includes('peak') || text.includes('cadillac mountain')) {
    features.push('Mountains');
  }
  if (text.includes('beach') || text.includes('sand beach') || text.includes('shore')) {
    features.push('Beaches');
  }
  if (text.includes('pond') || text.includes('jordan pond') || text.includes('lake')) {
    features.push('Lakes');
  }
  if (text.includes('forest') || text.includes('tree') || text.includes('foliage')) {
    features.push('Forests');
  }
  if (text.includes('thunder hole') || text.includes('waves') || text.includes('inlet') || 
      text.includes('granite') || text.includes('rock formation')) {
    features.push('Rock Formations');
  }
  if (text.includes('waterfall') || text.includes('falls')) {
    features.push('Waterfalls');
  }
  if (text.includes('desert') || text.includes('dune')) {
    features.push('Desert');
  }
  if (text.includes('geyser') || text.includes('hot spring')) {
    features.push('Geysers');
  }
  
  return features;
};

// Get difficulty level from park data
export const getDifficultyFromPark = (park) => {
  if (park.difficulty) return park.difficulty;
  
  const placesToVisitText = park.placesToVisit ? 
    park.placesToVisit.map(place => `${place.name} ${place.description}`).join(' ') : '';
  const text = `${park.name} ${park.highlight} ${placesToVisitText}`.toLowerCase();
  
  if (text.includes('challenging') || text.includes('iron rungs') || text.includes('difficult') ||
      text.includes('strenuous') || text.includes('advanced')) {
    return 'Advanced';
  }
  if (text.includes('moderate') || text.includes('hike') || text.includes('trail')) {
    return 'Moderate';
  }
  
  return 'Easy'; // Default for scenic viewing, driving, etc.
};

// Get crowd level from park data
export const getCrowdLevelFromPark = (park) => {
  if (park.crowdLevel) return park.crowdLevel;
  
  const popularParks = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Great Smoky Mountains'];
  const moderateParks = ['Acadia', 'Rocky Mountain', 'Glacier', 'Olympic', 'Arches'];
  
  const parkName = park.name || '';
  
  if (popularParks.some(popular => parkName.includes(popular))) {
    return 'High';
  }
  if (moderateParks.some(moderate => parkName.includes(moderate))) {
    return 'Moderate';
  }
  
  return 'Low'; // Default for lesser-known parks
};

// Get park description
export const getParkDescription = (park) => {
  if (park.description) return park.description;
  
  // Generate from placesToVisit if no description
  if (park.placesToVisit && park.placesToVisit.length > 0) {
    const highlights = park.placesToVisit.slice(0, 2).map(place => place.name).join(', ');
    return `Experience ${highlights} and more at this magnificent national park.`;
  }
  
  // Generate from highlight
  if (park.highlight) {
    return `Discover ${park.highlight} and the natural beauty of ${park.name}.`;
  }
  
  return `Explore the unique attractions and natural wonders of ${park.name}.`;
};

// Get seasonal information
export const getSeasonalInfo = (park, season) => {
  if (park.bestTimeToVisit && park.bestTimeToVisit[season.toLowerCase()]) {
    return park.bestTimeToVisit[season.toLowerCase()];
  }
  
  // Default seasonal descriptions
  const seasonalDefaults = {
    spring: "Mild weather with blooming wildflowers and ideal hiking conditions.",
    summer: "Peak season with warm weather, perfect for all outdoor activities.",
    fall: "Cooler temperatures and beautiful fall foliage.",
    winter: "Snow-covered landscapes and fewer crowds; check accessibility."
  };
  
  return seasonalDefaults[season.toLowerCase()] || "Great time to visit this beautiful park.";
};

// Enhanced park object with computed fields
export const enhanceParkData = (park) => {
  return {
    ...park,
    // Standardize entry fee as number
    entryFee: parseEntryFee(park.entryFee),
    
    // Generate missing fields from existing data
    activities: getActivitiesFromPark(park),
    features: getFeaturesFromPark(park),
    description: getParkDescription(park),
    difficulty: getDifficultyFromPark(park),
    crowdLevel: getCrowdLevelFromPark(park),
    
    // Ensure these fields exist
    fullName: park.fullName || park.name,
    bestSeason: park.bestSeason || 'Spring', // Default if missing
    
    // Helper methods for display
    formattedEntryFee: formatEntryFee(park.entryFee),
    seasonDisplay: getBestSeasonDisplay(park.bestSeason),
    
    // Seasonal information getter
    getSeasonalInfo: (season) => getSeasonalInfo(park, season)
  };
};

// Utility for filtering parks by season
export const filterParksBySeason = (parks, season) => {
  return parks.filter(park => 
    park.bestSeason?.toLowerCase() === season.toLowerCase()
  );
};

// Utility for searching parks
export const searchParks = (parks, query) => {
  if (!query || query.length < 2) return parks;
  
  const searchTerm = query.toLowerCase();
  return parks.filter(park => {
    const searchableText = `
      ${park.name} 
      ${park.state} 
      ${park.description || ''} 
      ${park.highlight || ''}
      ${park.placesToVisit?.map(p => p.name).join(' ') || ''}
    `.toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
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
  searchParks
};