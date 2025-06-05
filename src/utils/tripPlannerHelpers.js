// ✨ Enhanced tripPlannerHelpers.js - Advanced Trip Planning System
import { format, parseISO, differenceInDays, addDays, isWeekend, isBefore, isAfter } from 'date-fns';

// Enhanced park activity mapping for better recommendations
const PARK_ACTIVITIES = {
  hiking: ['trails', 'hike', 'hiking', 'walk', 'trek', 'backpack'],
  wildlife: ['wildlife', 'animals', 'bird', 'bears', 'elk', 'deer', 'bison'],
  photography: ['scenic', 'views', 'sunset', 'sunrise', 'photography', 'landscape'],
  water: ['lake', 'river', 'waterfall', 'swimming', 'fishing', 'rafting', 'kayak'],
  camping: ['camp', 'camping', 'overnight', 'backcountry', 'rv'],
  climbing: ['climb', 'rock', 'boulder', 'mountain', 'peak'],
  cultural: ['history', 'historic', 'cultural', 'museum', 'visitor center'],
  winter: ['snow', 'ski', 'snowshoe', 'winter', 'ice'],
  desert: ['desert', 'canyon', 'arch', 'mesa', 'badlands'],
  forest: ['forest', 'trees', 'redwood', 'sequoia', 'woodland']
};

// Seasonal recommendations for optimal visit timing
const SEASONAL_RECOMMENDATIONS = {
  spring: {
    months: [3, 4, 5],
    benefits: ['Wildflowers blooming', 'Mild temperatures', 'Wildlife activity', 'Fewer crowds'],
    considerations: ['Possible rain', 'Some trails may be closed', 'Variable weather']
  },
  summer: {
    months: [6, 7, 8],
    benefits: ['All facilities open', 'Long daylight hours', 'Best weather for camping', 'Peak wildlife viewing'],
    considerations: ['Heavy crowds', 'Higher prices', 'Extreme heat in some parks', 'Need reservations']
  },
  fall: {
    months: [9, 10, 11],
    benefits: ['Fall foliage', 'Comfortable temperatures', 'Fewer crowds', 'Clear skies'],
    considerations: ['Some facilities closing', 'Weather can change quickly', 'Shorter days']
  },
  winter: {
    months: [12, 1, 2],
    benefits: ['Solitude and quiet', 'Winter activities', 'Lower costs', 'Unique photography'],
    considerations: ['Limited access', 'Cold weather', 'Shorter hours', 'Road closures']
  }
};

// Enhanced transportation cost calculations
const TRANSPORTATION_COSTS = {
  driving: {
    gasPrice: 3.50, // per gallon
    mpg: 25, // average vehicle MPG
    wearAndTear: 0.15, // per mile
    tolls: 0.05, // estimated per mile
    parking: 15 // per day average
  },
  flying: {
    basePrice: 300,
    pricePerMile: 0.12,
    baggage: 50,
    rentalCar: 45, // per day
    airport: {
      parking: 25, // per day
      transport: 30 // to/from airport
    }
  },
  train: {
    basePrice: 150,
    pricePerMile: 0.08,
    sleeper: 100 // upgrade per night
  },
  bus: {
    basePrice: 80,
    pricePerMile: 0.05
  }
};

// Enhanced accommodation cost estimates by region
const ACCOMMODATION_COSTS = {
  budget: { min: 60, max: 100, type: 'Budget motels, hostels' },
  mid: { min: 100, max: 180, type: 'Mid-range hotels, B&Bs' },
  luxury: { min: 200, max: 500, type: 'Luxury resorts, boutique hotels' },
  camping: { min: 25, max: 50, type: 'Campgrounds, RV sites' },
  backcountry: { min: 0, max: 15, type: 'Backcountry permits' }
};

// Food cost estimates by dining style
const FOOD_COSTS = {
  budget: { breakfast: 8, lunch: 12, dinner: 18, snacks: 5 },
  mid: { breakfast: 15, lunch: 25, dinner: 35, snacks: 8 },
  luxury: { breakfast: 25, lunch: 40, dinner: 65, snacks: 12 },
  camping: { breakfast: 5, lunch: 8, dinner: 12, snacks: 3 }
};

/**
 * Enhanced function to create a trip from a park with intelligent recommendations
 */
export const createTripFromPark = (park, navigate, showToast, options = {}) => {
  try {
    const {
      duration = 3,
      includeNearby = true,
      accommodationType = 'mid',
      transportationMode = 'driving'
    } = options;

    // Parse coordinates properly with validation
    let coordinates = { lat: 0, lng: 0 };
    if (park.coordinates) {
      if (typeof park.coordinates === 'string' && park.coordinates.includes(',')) {
        const [lat, lng] = park.coordinates.split(',').map(val => parseFloat(val.trim()));
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coordinates = { lat, lng };
        }
      } else if (park.coordinates.lat && park.coordinates.lng) {
        const lat = parseFloat(park.coordinates.lat);
        const lng = parseFloat(park.coordinates.lng);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coordinates = { lat, lng };
        }
      }
    }

    // Get recommended activities for this park
    const activities = getRecommendedActivities(park);
    
    // Calculate optimal visit dates
    const optimalDates = getOptimalVisitDates(park, duration);
    
    // Create enhanced trip object
    const newTrip = {
      title: `${park.name || park.fullName} Adventure`,
      description: generateTripDescription(park, activities, duration),
      parks: [{
        parkId: park.id,
        parkName: park.name || park.fullName,
        visitDate: optimalDates.startDate,
        stayDuration: duration,
        coordinates,
        state: park.state,
        description: park.description || park.highlight || '',
        activities: activities.slice(0, 5), // Top 5 activities
        estimatedCost: calculateParkVisitCost(park, duration, accommodationType),
        weather: getSeasonalWeather(park, optimalDates.startDate),
        tips: generateParkTips(park, activities)
      }],
      startDate: optimalDates.startDate,
      endDate: optimalDates.endDate,
      transportationMode,
      accommodationType,
      isPublic: false,
      totalDistance: 0,
      estimatedCost: 0,
      totalDuration: duration,
      budget: {
        accommodation: accommodationType,
        dining: 'mid',
        activities: 'standard'
      },
      preferences: {
        pace: 'moderate',
        difficulty: 'moderate',
        groupSize: 2
      },
      generatedAt: new Date().toISOString(),
      recommendations: generateTripRecommendations(park, activities, duration)
    };

    // Calculate costs
    newTrip.estimatedCost = calculateEstimatedCost(newTrip);
    
    navigate('/trip-planner', { state: { preloadedTrip: newTrip } });
    
    showToast(`🎯 Created ${duration}-day adventure for ${park.name || park.fullName}!`, 'trip', {
      title: 'Trip Created',
      subtitle: `Ready to explore • $${newTrip.estimatedCost.toLocaleString()} estimated`,
      actionLabel: 'Customize',
      duration: 5000
    });

    return newTrip;
  } catch (error) {
    console.error('Error creating trip from park:', error);
    showToast('Failed to create trip. Please try again.', 'error');
    throw error;
  }
};

/**
 * Enhanced trip data validation with detailed error reporting
 */
export const validateTripData = (tripData) => {
  const errors = [];
  const warnings = [];
  
  // Required field validation
  if (!tripData.title?.trim()) {
    errors.push('Trip title is required');
  } else if (tripData.title.length > 100) {
    warnings.push('Trip title is quite long and may be truncated in some views');
  }
  
  if (!tripData.parks || !Array.isArray(tripData.parks) || tripData.parks.length === 0) {
    errors.push('At least one park is required');
  }
  
  if (!tripData.startDate) {
    errors.push('Start date is required');
  } else {
    const startDate = new Date(tripData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(startDate.getTime())) {
      errors.push('Start date is invalid');
    } else if (isBefore(startDate, today)) {
      warnings.push('Start date is in the past');
    }
  }
  
  if (!tripData.endDate) {
    errors.push('End date is required');
  } else if (tripData.startDate) {
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    
    if (isNaN(endDate.getTime())) {
      errors.push('End date is invalid');
    } else if (!isBefore(startDate, endDate) && startDate.getTime() !== endDate.getTime()) {
      errors.push('End date must be after start date');
    }
    
    const duration = differenceInDays(endDate, startDate) + 1;
    if (duration > 30) {
      warnings.push('Trip duration is quite long (over 30 days)');
    } else if (duration < 1) {
      errors.push('Trip must be at least 1 day long');
    }
  }
  
  if (!tripData.transportationMode) {
    errors.push('Transportation mode is required');
  }
  
  // Enhanced park validation
  if (tripData.parks && Array.isArray(tripData.parks)) {
    tripData.parks.forEach((park, index) => {
      const parkNum = index + 1;
      
      if (!park.parkId) {
        errors.push(`Park ${parkNum} is missing park ID`);
      }
      if (!park.parkName) {
        errors.push(`Park ${parkNum} is missing park name`);
      }
      if (!park.stayDuration || park.stayDuration < 1) {
        errors.push(`Park ${parkNum} must have a valid stay duration (minimum 1 day)`);
      } else if (park.stayDuration > 14) {
        warnings.push(`Park ${parkNum} has a very long stay duration (${park.stayDuration} days)`);
      }
      
      // Validate coordinates
      if (park.coordinates) {
        const { lat, lng } = park.coordinates;
        if (typeof lat !== 'number' || typeof lng !== 'number' ||
            lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          warnings.push(`Park ${parkNum} has invalid coordinates`);
        }
      }
    });
  }
  
  // Budget validation
  if (tripData.estimatedCost && tripData.estimatedCost < 0) {
    errors.push('Estimated cost cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: calculateValidationScore(tripData, errors, warnings)
  };
};

/**
 * Enhanced trip data sanitization with smart defaults
 */
export const sanitizeTripData = (tripData) => {
  const sanitized = {
    title: String(tripData.title || 'Untitled Trip').trim().slice(0, 100),
    description: String(tripData.description || '').trim().slice(0, 1000),
    parks: Array.isArray(tripData.parks) ? tripData.parks.map((park, index) => ({
      parkId: park.parkId || `temp-${index}`,
      parkName: park.parkName || `Park ${index + 1}`,
      visitDate: park.visitDate || '',
      stayDuration: Math.max(1, Math.min(14, parseInt(park.stayDuration) || 2)),
      coordinates: validateCoordinates(park.coordinates),
      state: String(park.state || '').trim(),
      description: String(park.description || '').trim().slice(0, 500),
      activities: Array.isArray(park.activities) ? park.activities.slice(0, 10) : [],
      estimatedCost: Math.max(0, Number(park.estimatedCost) || 0)
    })) : [],
    startDate: tripData.startDate || '',
    endDate: tripData.endDate || '',
    transportationMode: ['driving', 'flying', 'train', 'bus'].includes(tripData.transportationMode) 
      ? tripData.transportationMode : 'driving',
    accommodationType: ['budget', 'mid', 'luxury', 'camping', 'backcountry'].includes(tripData.accommodationType)
      ? tripData.accommodationType : 'mid',
    totalDistance: Math.max(0, Number(tripData.totalDistance) || 0),
    estimatedCost: Math.max(0, Number(tripData.estimatedCost) || 0),
    totalDuration: Math.max(1, Number(tripData.totalDuration) || 1),
    isPublic: Boolean(tripData.isPublic),
    templateId: tripData.templateId || null,
    templateData: tripData.templateData || null,
    budget: {
      accommodation: tripData.budget?.accommodation || 'mid',
      dining: tripData.budget?.dining || 'mid',
      activities: tripData.budget?.activities || 'standard',
      total: Math.max(0, Number(tripData.budget?.total) || 0)
    },
    preferences: {
      pace: ['slow', 'moderate', 'fast'].includes(tripData.preferences?.pace) 
        ? tripData.preferences.pace : 'moderate',
      difficulty: ['easy', 'moderate', 'challenging'].includes(tripData.preferences?.difficulty)
        ? tripData.preferences.difficulty : 'moderate',
      groupSize: Math.max(1, Math.min(20, parseInt(tripData.preferences?.groupSize) || 2))
    }
  };

  return sanitized;
};

/**
 * Enhanced trip duration calculation with business day awareness
 */
export const calculateTripDuration = (startDate, endDate, options = {}) => {
  const { 
    excludeWeekends = false,
    includeStartDay = true,
    includeEndDay = true 
  } = options;

  if (!startDate || !endDate) return 0;
  
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    
    if (isAfter(start, end)) return 0;
    
    let totalDays = differenceInDays(end, start);
    
    if (includeStartDay && includeEndDay) {
      totalDays += 1;
    } else if (includeStartDay || includeEndDay) {
      // No change needed, differenceInDays already handles this case
    } else {
      totalDays -= 1;
    }
    
    if (excludeWeekends) {
      let businessDays = 0;
      let currentDate = new Date(start);
      
      while (currentDate <= end) {
        if (!isWeekend(currentDate)) {
          businessDays++;
        }
        currentDate = addDays(currentDate, 1);
      }
      
      return Math.max(1, businessDays);
    }
    
    return Math.max(1, totalDays);
  } catch (error) {
    console.warn('Error calculating trip duration:', error);
    return 1;
  }
};

/**
 * Enhanced distance calculation with route optimization
 */
export const calculateDistance = (coord1, coord2, options = {}) => {
  const { unit = 'miles', precision = 1 } = options;
  
  if (!coord1 || !coord2 || 
      typeof coord1.lat !== 'number' || typeof coord1.lng !== 'number' ||
      typeof coord2.lat !== 'number' || typeof coord2.lng !== 'number') {
    return 0;
  }
  
  // Validate coordinate ranges
  if (Math.abs(coord1.lat) > 90 || Math.abs(coord1.lng) > 180 ||
      Math.abs(coord2.lat) > 90 || Math.abs(coord2.lng) > 180) {
    return 0;
  }
  
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * Math.pow(10, precision)) / Math.pow(10, precision);
};

/**
 * Enhanced cost calculation with detailed breakdown
 */
export const calculateEstimatedCost = (tripData, options = {}) => {
  const {
    includeFlights = true,
    includeActivities = true,
    includeEmergency = true,
    region = 'US',
    groupSize = tripData.preferences?.groupSize || 2
  } = options;

  const duration = calculateTripDuration(tripData.startDate, tripData.endDate);
  const distance = calculateTotalDistance(tripData.parks || []);
  const numParks = (tripData.parks || []).length;
  
  // Base costs
  const accommodationType = tripData.accommodationType || tripData.budget?.accommodation || 'mid';
  const diningLevel = tripData.budget?.dining || 'mid';
  
  const accommodationRange = ACCOMMODATION_COSTS[accommodationType] || ACCOMMODATION_COSTS.mid;
  const avgAccommodationCost = (accommodationRange.min + accommodationRange.max) / 2;
  
  const foodCosts = FOOD_COSTS[diningLevel] || FOOD_COSTS.mid;
  const dailyFoodCost = Object.values(foodCosts).reduce((sum, cost) => sum + cost, 0);
  
  // Transportation costs
  let transportationCost = 0;
  const transportMode = tripData.transportationMode || 'driving';
  
  if (transportMode === 'driving') {
    const drivingCosts = TRANSPORTATION_COSTS.driving;
    const gasCost = (distance / drivingCosts.mpg) * drivingCosts.gasPrice;
    const wearCost = distance * drivingCosts.wearAndTear;
    const tollsCost = distance * drivingCosts.tolls;
    const parkingCost = duration * drivingCosts.parking;
    
    transportationCost = gasCost + wearCost + tollsCost + parkingCost;
  } else if (transportMode === 'flying' && includeFlights) {
    const flyingCosts = TRANSPORTATION_COSTS.flying;
    const baseFlight = flyingCosts.basePrice * groupSize;
    const distanceFlight = Math.min(distance, 3000) * flyingCosts.pricePerMile * groupSize;
    const baggage = flyingCosts.baggage * groupSize;
    const rentalCar = duration * flyingCosts.rentalCar;
    const airportCosts = flyingCosts.airport.parking + flyingCosts.airport.transport;
    
    transportationCost = baseFlight + distanceFlight + baggage + rentalCar + airportCosts;
  }
  
  // Accommodation costs (nights = days - 1, unless single day trip)
  const nights = Math.max(0, duration - 1);
  const totalAccommodationCost = nights * avgAccommodationCost;
  
  // Food costs
  const totalFoodCost = duration * dailyFoodCost * groupSize;
  
  // Park fees and activity costs
  let activitiesCost = 0;
  if (includeActivities) {
    const parkFees = numParks * 30; // Average park entrance fee
    const guidedTours = numParks * 75; // Optional guided tours
    const equipmentRental = duration * 25; // Equipment rental per day
    
    activitiesCost = parkFees + (guidedTours * 0.3) + (equipmentRental * 0.5); // Assume 30% do tours, 50% rent equipment
  }
  
  // Emergency buffer
  const emergencyBuffer = includeEmergency ? 
    (totalAccommodationCost + totalFoodCost + transportationCost + activitiesCost) * 0.15 : 0;
  
  const breakdown = {
    accommodation: Math.round(totalAccommodationCost),
    transportation: Math.round(transportationCost),
    food: Math.round(totalFoodCost),
    activities: Math.round(activitiesCost),
    emergency: Math.round(emergencyBuffer),
    total: Math.round(totalAccommodationCost + transportationCost + totalFoodCost + activitiesCost + emergencyBuffer)
  };
  
  return breakdown.total;
};

/**
 * Get recommended activities for a park based on its description and features
 */
const getRecommendedActivities = (park) => {
  const description = (park.description || park.highlight || '').toLowerCase();
  const name = (park.name || '').toLowerCase();
  const activities = [];
  
  Object.entries(PARK_ACTIVITIES).forEach(([activity, keywords]) => {
    const matchCount = keywords.filter(keyword => 
      description.includes(keyword) || name.includes(keyword)
    ).length;
    
    if (matchCount > 0) {
      activities.push({
        name: activity,
        confidence: matchCount / keywords.length,
        keywords: keywords.filter(keyword => 
          description.includes(keyword) || name.includes(keyword)
        )
      });
    }
  });
  
  return activities
    .sort((a, b) => b.confidence - a.confidence)
    .map(activity => activity.name);
};

/**
 * Calculate optimal visit dates based on park and seasonal data
 */
const getOptimalVisitDates = (park, duration) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  
  // Get best season for the park
  const bestSeason = park.bestSeason?.toLowerCase();
  let optimalMonths = [currentMonth + 2]; // Default to 2 months from now
  
  if (bestSeason && SEASONAL_RECOMMENDATIONS[bestSeason]) {
    optimalMonths = SEASONAL_RECOMMENDATIONS[bestSeason].months;
  }
  
  // Find the next optimal month
  let targetMonth = optimalMonths.find(month => month > currentMonth) || optimalMonths[0];
  if (targetMonth <= currentMonth) {
    targetMonth += 12; // Next year
  }
  
  // Calculate start date
  const startDate = new Date(today.getFullYear(), targetMonth - 1, 15); // Mid-month
  if (startDate <= today) {
    startDate.setFullYear(startDate.getFullYear() + 1);
  }
  
  // Calculate end date
  const endDate = addDays(startDate, duration - 1);
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  };
};

/**
 * Generate a descriptive trip description
 */
const generateTripDescription = (park, activities, duration) => {
  const activitiesText = activities.length > 0 
    ? ` Enjoy ${activities.slice(0, 3).join(', ')} and more.`
    : '';
    
  return `Discover the beauty of ${park.name || park.fullName} on this ${duration}-day adventure. ${park.highlight || park.description || 'Experience stunning landscapes and natural wonders.'}${activitiesText} Perfect for nature lovers and outdoor enthusiasts.`;
};

/**
 * Generate park-specific tips
 */
const generateParkTips = (park, activities) => {
  const tips = [];
  
  // Activity-based tips
  if (activities.includes('hiking')) {
    tips.push('Bring sturdy hiking boots and plenty of water');
  }
  if (activities.includes('wildlife')) {
    tips.push('Keep a safe distance from wildlife and bring binoculars');
  }
  if (activities.includes('photography')) {
    tips.push('Golden hour (sunrise/sunset) offers the best lighting');
  }
  if (activities.includes('camping')) {
    tips.push('Make reservations well in advance, especially for peak season');
  }
  
  // General tips
  tips.push('Check weather conditions and park alerts before your visit');
  tips.push('Download offline maps in case of poor cell service');
  
  return tips;
};

/**
 * Generate trip recommendations
 */
const generateTripRecommendations = (park, activities, duration) => {
  return {
    packingList: generatePackingList(activities, duration),
    bestTimeToVisit: getBestTimeToVisit(park),
    nearbyAttractions: [], // Could be enhanced with API calls
    weatherTips: getWeatherTips(park),
    budgetTips: getBudgetTips(duration)
  };
};

/**
 * Generate packing list based on activities
 */
const generatePackingList = (activities, duration) => {
  const essentials = ['Sunscreen', 'Water bottles', 'First aid kit', 'Park map'];
  const activityItems = [];
  
  if (activities.includes('hiking')) {
    activityItems.push('Hiking boots', 'Daypack', 'Trail snacks');
  }
  if (activities.includes('photography')) {
    activityItems.push('Camera', 'Extra batteries', 'Tripod');
  }
  if (activities.includes('camping')) {
    activityItems.push('Tent', 'Sleeping bag', 'Camp stove');
  }
  if (activities.includes('wildlife')) {
    activityItems.push('Binoculars', 'Field guide');
  }
  
  return [...essentials, ...activityItems];
};

/**
 * Utility functions
 */
const validateCoordinates = (coordinates) => {
  if (!coordinates) return { lat: 0, lng: 0 };
  
  if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  
  return { lat: 0, lng: 0 };
};

const calculateValidationScore = (tripData, errors, warnings) => {
  let score = 100;
  score -= errors.length * 20;
  score -= warnings.length * 5;
  
  // Bonus points for completeness
  if (tripData.description?.length > 50) score += 5;
  if (tripData.parks?.length > 1) score += 10;
  if (tripData.budget) score += 5;
  if (tripData.preferences) score += 5;
  
  return Math.max(0, Math.min(100, score));
};

const getBestTimeToVisit = (park) => {
  const season = park.bestSeason?.toLowerCase();
  return SEASONAL_RECOMMENDATIONS[season] || SEASONAL_RECOMMENDATIONS.summer;
};

const getWeatherTips = (park) => {
  const tips = [];
  const season = park.bestSeason?.toLowerCase();
  
  if (season === 'summer') {
    tips.push('Bring sun protection and stay hydrated');
  } else if (season === 'winter') {
    tips.push('Dress in layers and be prepared for cold weather');
  }
  
  return tips;
};

const getBudgetTips = (duration) => {
  const tips = [];
  
  if (duration > 7) {
    tips.push('Consider camping to reduce accommodation costs');
  }
  
  tips.push('Pack your own meals and snacks');
  tips.push('Look for free ranger programs and activities');
  
  return tips;
};

const calculateParkVisitCost = (park, duration, accommodationType) => {
  const accommodationRange = ACCOMMODATION_COSTS[accommodationType] || ACCOMMODATION_COSTS.mid;
  const avgCost = (accommodationRange.min + accommodationRange.max) / 2;
  const nights = Math.max(0, duration - 1);
  
  return {
    accommodation: nights * avgCost,
    parkFee: 30, // Average park entrance fee
    activities: duration * 50, // Average daily activity cost
    total: (nights * avgCost) + 30 + (duration * 50)
  };
};

const getSeasonalWeather = (park, startDate) => {
  // This could be enhanced with real weather API calls
  const month = new Date(startDate).getMonth() + 1;
  
  if (month >= 6 && month <= 8) {
    return { season: 'summer', temp: 'warm', precipitation: 'low' };
  } else if (month >= 12 || month <= 2) {
    return { season: 'winter', temp: 'cold', precipitation: 'variable' };
  } else if (month >= 3 && month <= 5) {
    return { season: 'spring', temp: 'mild', precipitation: 'moderate' };
  } else {
    return { season: 'fall', temp: 'cool', precipitation: 'low' };
  }
};

/**
 * Enhanced total distance calculation with route optimization
 */
export const calculateTotalDistance = (parks, options = {}) => {
  const { optimize = true, unit = 'miles' } = options;
  
  if (!Array.isArray(parks) || parks.length < 2) return 0;
  
  // If optimization is disabled, calculate simple sequential distance
  if (!optimize) {
    let total = 0;
    for (let i = 0; i < parks.length - 1; i++) {
      const park1 = parks[i];
      const park2 = parks[i + 1];
      
      if (park1.coordinates && park2.coordinates) {
        const distance = calculateDistance(park1.coordinates, park2.coordinates, { unit });
        total += distance;
      }
    }
    return Math.round(total);
  }
  
  // Simple optimization: find shortest path (for small number of parks)
  if (parks.length <= 4) {
    return optimizeRouteOrder(parks, unit);
  }
  
  // For larger routes, use greedy nearest neighbor approach
  return calculateGreedyRoute(parks, unit);
};

/**
 * Optimize route order for small number of parks
 */
const optimizeRouteOrder = (parks, unit) => {
  if (parks.length <= 1) return 0;
  
  const distances = {};
  
  // Calculate all pairwise distances
  for (let i = 0; i < parks.length; i++) {
    for (let j = i + 1; j < parks.length; j++) {
      const key = `${i}-${j}`;
      const reverseKey = `${j}-${i}`;
      const distance = calculateDistance(
        parks[i].coordinates, 
        parks[j].coordinates, 
        { unit }
      );
      distances[key] = distance;
      distances[reverseKey] = distance;
    }
  }
  
  // Generate all permutations for small sets
  const permutations = generatePermutations(parks.slice(1)); // Keep first park fixed
  let minDistance = Infinity;
  
  for (const perm of permutations) {
    const route = [parks[0], ...perm];
    let totalDistance = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
      const idx1 = parks.indexOf(route[i]);
      const idx2 = parks.indexOf(route[i + 1]);
      totalDistance += distances[`${idx1}-${idx2}`] || 0;
    }
    
    minDistance = Math.min(minDistance, totalDistance);
  }
  
  return Math.round(minDistance);
};

/**
 * Calculate route using greedy nearest neighbor algorithm
 */
const calculateGreedyRoute = (parks, unit) => {
  const visited = new Set();
  let currentPark = parks[0];
  let totalDistance = 0;
  visited.add(0);
  
  while (visited.size < parks.length) {
    let nearestDistance = Infinity;
    let nearestIndex = -1;
    
    for (let i = 0; i < parks.length; i++) {
      if (visited.has(i)) continue;
      
      const distance = calculateDistance(
        currentPark.coordinates,
        parks[i].coordinates,
        { unit }
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    if (nearestIndex !== -1) {
      totalDistance += nearestDistance;
      currentPark = parks[nearestIndex];
      visited.add(nearestIndex);
    } else {
      break;
    }
  }
  
  return Math.round(totalDistance);
};

/**
 * Generate permutations for route optimization
 */
const generatePermutations = (arr) => {
  if (arr.length <= 1) return [arr];
  
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = generatePermutations(rest);
    
    for (const perm of perms) {
      result.push([arr[i], ...perm]);
    }
  }
  
  return result;
};

/**
 * Enhanced date formatting with locale support
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Not set';
  
  const {
    locale = 'en-US',
    style = 'medium',
    includeTime = false,
    relative = false
  } = options;
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    if (relative) {
      const now = new Date();
      const diffDays = differenceInDays(date, now);
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    }
    
    const formatOptions = {
      short: { month: 'short', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };
    
    if (includeTime) {
      formatOptions[style] = { ...formatOptions[style], hour: 'numeric', minute: '2-digit' };
    }
    
    return date.toLocaleDateString(locale, formatOptions[style] || formatOptions.medium);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Enhanced coordinate parsing with validation
 */
export const parseCoordinates = (coordString) => {
  if (!coordString) return { lat: 0, lng: 0 };
  
  // If already an object with lat/lng
  if (typeof coordString === 'object' && coordString.lat !== undefined && coordString.lng !== undefined) {
    const lat = parseFloat(coordString.lat);
    const lng = parseFloat(coordString.lng);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  
  // If string format "lat,lng"
  if (typeof coordString === 'string' && coordString.includes(',')) {
    const parts = coordString.split(',').map(val => val.trim());
    
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }
  
  console.warn('Invalid coordinates provided:', coordString);
  return { lat: 0, lng: 0 };
};

/**
 * Enhanced gradient selection with better distribution
 */
export const getRandomGradient = (index, options = {}) => {
  const { 
    theme = 'default',
    variant = 'normal'
  } = options;
  
  const gradientThemes = {
    default: [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-teal-500 to-green-500',
      'from-orange-500 to-red-500'
    ],
    nature: [
      'from-green-400 to-emerald-600',
      'from-blue-400 to-teal-600',
      'from-amber-400 to-orange-600',
      'from-sky-400 to-blue-600',
      'from-lime-400 to-green-600'
    ],
    sunset: [
      'from-orange-400 to-red-600',
      'from-pink-400 to-rose-600',
      'from-purple-400 to-pink-600',
      'from-yellow-400 to-orange-600'
    ]
  };
  
  const gradients = gradientThemes[theme] || gradientThemes.default;
  
  if (variant === 'sequential') {
    return gradients[index % gradients.length];
  }
  
  // Better distribution using golden ratio
  const goldenRatio = 0.618033988749;
  const gradientIndex = Math.floor((index * goldenRatio) % 1 * gradients.length);
  
  return gradients[gradientIndex];
};

/**
 * Enhanced itinerary generation with detailed scheduling
 */
export const generateDetailedItinerary = (tripData, options = {}) => {
  const {
    includeTravel = true,
    includeMeals = true,
    includeRest = true,
    startTime = '08:00',
    endTime = '18:00'
  } = options;
  
  if (!tripData.parks || tripData.parks.length === 0) return [];
  
  const duration = calculateTripDuration(tripData.startDate, tripData.endDate);
  const startDate = parseISO(tripData.startDate);
  let itinerary = [];
  let currentDay = 1;
  let currentDate = new Date(startDate);
  
  tripData.parks.forEach((park, parkIndex) => {
    const daysAtPark = park.stayDuration || 2;
    
    for (let day = 0; day < daysAtPark; day++) {
      if (currentDay > duration) break;
      
      const dayActivities = [];
      const isFirstDay = day === 0;
      const isLastDay = day === daysAtPark - 1;
      
      // Morning activities
      if (isFirstDay) {
        dayActivities.push({
          time: startTime,
          activity: 'Arrival & Park Entry',
          description: `Arrive at ${park.parkName}, get oriented, visit visitor center`,
          type: 'arrival',
          duration: 120 // minutes
        });
        
        if (includeMeals) {
          dayActivities.push({
            time: '10:00',
            activity: 'Late Breakfast',
            description: 'Fuel up for the day ahead',
            type: 'meal',
            duration: 60
          });
        }
      } else {
        if (includeMeals) {
          dayActivities.push({
            time: startTime,
            activity: 'Breakfast',
            description: 'Start the day with a hearty meal',
            type: 'meal',
            duration: 60
          });
        }
      }
      
      // Main activities based on park features
      const mainActivities = generateParkActivities(park, day, daysAtPark);
      dayActivities.push(...mainActivities);
      
      if (includeMeals) {
        dayActivities.push({
          time: '12:30',
          activity: 'Lunch',
          description: 'Midday meal and rest',
          type: 'meal',
          duration: 90
        });
        
        dayActivities.push({
          time: '18:30',
          activity: 'Dinner',
          description: 'Evening meal and relaxation',
          type: 'meal',
          duration: 120
        });
      }
      
      if (includeRest && daysAtPark > 1) {
        dayActivities.push({
          time: '20:30',
          activity: 'Evening Rest',
          description: 'Relax, plan tomorrow, enjoy the surroundings',
          type: 'rest',
          duration: 60
        });
      }
      
      itinerary.push({
        day: currentDay,
        date: format(currentDate, 'yyyy-MM-dd'),
        formattedDate: format(currentDate, 'EEEE, MMMM do'),
        type: 'park',
        location: park.parkName,
        parkDay: day + 1,
        totalParkDays: daysAtPark,
        activities: dayActivities,
        weather: getSeasonalWeather(park, format(currentDate, 'yyyy-MM-dd')),
        tips: day === 0 ? generateParkTips(park, park.activities || []) : []
      });
      
      currentDay++;
      currentDate = addDays(currentDate, 1);
    }
    
    // Add travel day if needed
    if (includeTravel && parkIndex < tripData.parks.length - 1 && currentDay <= duration) {
      const nextPark = tripData.parks[parkIndex + 1];
      const travelDistance = calculateDistance(park.coordinates, nextPark.coordinates);
      const travelTime = estimateTravelTime(travelDistance, tripData.transportationMode);
      
      itinerary.push({
        day: currentDay,
        date: format(currentDate, 'yyyy-MM-dd'),
        formattedDate: format(currentDate, 'EEEE, MMMM do'),
        type: 'travel',
        from: park.parkName,
        to: nextPark.parkName,
        distance: travelDistance,
        estimatedTime: travelTime,
        transportationMode: tripData.transportationMode,
        activities: [{
          time: startTime,
          activity: `Travel to ${nextPark.parkName}`,
          description: `${travelDistance} miles via ${tripData.transportationMode}`,
          type: 'travel',
          duration: travelTime
        }]
      });
      
      currentDay++;
      currentDate = addDays(currentDate, 1);
    }
  });
  
  return itinerary;
};

/**
 * Generate activities for a specific day at a park
 */
const generateParkActivities = (park, dayIndex, totalDays) => {
  const activities = [];
  const parkActivities = park.activities || [];
  
  if (dayIndex === 0) {
    // First day - orientation and easy activities
    activities.push({
      time: '11:00',
      activity: 'Park Orientation',
      description: 'Explore visitor center, get maps, talk to rangers',
      type: 'orientation',
      duration: 90
    });
    
    activities.push({
      time: '14:00',
      activity: 'Easy Trail Hike',
      description: 'Start with a shorter trail to get acclimated',
      type: 'hiking',
      duration: 180
    });
  } else if (dayIndex === totalDays - 1) {
    // Last day - highlights and departure prep
    activities.push({
      time: '09:00',
      activity: 'Signature Experience',
      description: 'Visit the park\'s most famous attraction',
      type: 'sightseeing',
      duration: 240
    });
    
    activities.push({
      time: '15:00',
      activity: 'Departure Preparation',
      description: 'Pack up, final photos, gift shop',
      type: 'departure',
      duration: 120
    });
  } else {
    // Middle days - full exploration
    activities.push({
      time: '09:00',
      activity: 'Morning Adventure',
      description: 'Extended hiking or main park activity',
      type: 'adventure',
      duration: 240
    });
    
    activities.push({
      time: '14:00',
      activity: 'Afternoon Exploration',
      description: 'Scenic drives, photography, wildlife viewing',
      type: 'exploration',
      duration: 180
    });
  }
  
  return activities;
};

/**
 * Estimate travel time between locations
 */
const estimateTravelTime = (distance, transportationMode) => {
  const speeds = {
    driving: 55, // mph average including stops
    flying: 500, // effective speed including airport time
    train: 80,
    bus: 45
  };
  
  const speed = speeds[transportationMode] || speeds.driving;
  const travelHours = distance / speed;
  
  // Add buffer time for different modes
  const buffers = {
    driving: 1, // 1 hour for stops, traffic
    flying: 4, // 4 hours for airport procedures
    train: 2, // 2 hours for station procedures
    bus: 1.5 // 1.5 hours for stops
  };
  
  const totalHours = travelHours + (buffers[transportationMode] || buffers.driving);
  return Math.round(totalHours * 60); // Return in minutes
};

/**
 * Export all functions
 */
export {
  SEASONAL_RECOMMENDATIONS,
  ACCOMMODATION_COSTS,
  FOOD_COSTS,
  TRANSPORTATION_COSTS
};

export default {
  createTripFromPark,
  validateTripData,
  sanitizeTripData,
  calculateTripDuration,
  calculateDistance,
  calculateTotalDistance,
  calculateEstimatedCost,
  formatDate,
  parseCoordinates,
  getRandomGradient,
  generateDetailedItinerary,
  getRecommendedActivities,
  getOptimalVisitDates,
  generateTripDescription,
  generateParkTips,
  generateTripRecommendations
};