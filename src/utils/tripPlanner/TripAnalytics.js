// src/utils/tripPlanner/tripAnalytics.js

/**
 * Comprehensive trip analytics utilities for the National Parks Trip Planner
 * Provides statistical analysis, insights, and data visualization support
 */

/**
 * Calculate comprehensive travel statistics from trips array
 * @param {Array} trips - Array of trip objects
 * @returns {Object} Statistics object with travel metrics
 */
export const getTravelStats = (trips) => {
  if (!trips || trips.length === 0) {
    return {
      totalTrips: 0,
      totalParks: 0,
      totalDistance: 0,
      totalCost: 0,
      totalDays: 0,
      avgTripLength: 0,
      avgTripCost: 0,
      avgParksPerTrip: 0,
      avgCostPerDay: 0,
      avgCostPerPark: 0,
      avgDistancePerTrip: 0
    };
  }

  const totalTrips = trips.length;
  const totalParks = trips.reduce((sum, t) => sum + (t.parks?.length || 0), 0);
  const totalDistance = trips.reduce((sum, t) => sum + (t.totalDistance || 0), 0);
  const totalCost = trips.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const totalDays = trips.reduce((sum, t) => sum + (t.totalDuration || 0), 0);

  return {
    totalTrips,
    totalParks,
    totalDistance: Math.round(totalDistance),
    totalCost: Math.round(totalCost),
    totalDays,
    avgTripLength: totalTrips > 0 ? Math.round(totalDays / totalTrips) : 0,
    avgTripCost: totalTrips > 0 ? Math.round(totalCost / totalTrips) : 0,
    avgParksPerTrip: totalTrips > 0 ? Math.round((totalParks / totalTrips) * 10) / 10 : 0,
    avgCostPerDay: totalDays > 0 ? Math.round(totalCost / totalDays) : 0,
    avgCostPerPark: totalParks > 0 ? Math.round(totalCost / totalParks) : 0,
    avgDistancePerTrip: totalTrips > 0 ? Math.round(totalDistance / totalTrips) : 0
  };
};

/**
 * Get most visited states from trips with detailed metrics
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of state objects with visit counts and percentages
 */
export const getMostVisitedStates = (trips) => {
  if (!trips || trips.length === 0) return [];

  const stateCounts = {};
  const stateMetrics = {};

  trips.forEach(trip => {
    trip.parks?.forEach(park => {
      const state = park.state;
      if (state) {
        stateCounts[state] = (stateCounts[state] || 0) + 1;

        if (!stateMetrics[state]) {
          stateMetrics[state] = {
            totalDays: 0,
            totalCost: 0,
            parkCount: 0,
            trips: new Set()
          };
        }

        stateMetrics[state].totalDays += park.stayDuration || 2;
        stateMetrics[state].parkCount += 1;
        stateMetrics[state].trips.add(trip.id);
      }
    });

    // Add trip-level metrics for states
    const tripStates = new Set(trip.parks?.map(p => p.state).filter(Boolean));
    tripStates.forEach(state => {
      if (stateMetrics[state]) {
        stateMetrics[state].totalCost += (trip.estimatedCost || 0) / tripStates.size;
      }
    });
  });

  const totalParks = trips.reduce((sum, t) => sum + (t.parks?.length || 0), 0);

  return Object.entries(stateCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([state, count]) => {
        const metrics = stateMetrics[state];
        return {
          state,
          count,
          percentage: totalParks > 0 ? Math.round((count / totalParks) * 100) : 0,
          avgDaysPerVisit: metrics ? Math.round(metrics.totalDays / count) : 0,
          avgCostPerVisit: metrics ? Math.round(metrics.totalCost / metrics.trips.size) : 0,
          uniqueTrips: metrics ? metrics.trips.size : 0
        };
      })
      .slice(0, 15);
};

/**
 * Get park visit frequency analysis with detailed metrics
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of park objects with visit counts and metrics
 */
export const getParkVisitFrequency = (trips) => {
  if (!trips || trips.length === 0) return [];

  const parkMetrics = {};

  trips.forEach(trip => {
    trip.parks?.forEach(park => {
      const key = park.parkName || park.name;
      if (key) {
        if (!parkMetrics[key]) {
          parkMetrics[key] = {
            name: key,
            state: park.state,
            visits: 0,
            totalDays: 0,
            trips: new Set(),
            lastVisited: null
          };
        }

        parkMetrics[key].visits += 1;
        parkMetrics[key].totalDays += park.stayDuration || 2;
        parkMetrics[key].trips.add(trip.id);

        const tripDate = new Date(trip.startDate);
        if (!parkMetrics[key].lastVisited || tripDate > parkMetrics[key].lastVisited) {
          parkMetrics[key].lastVisited = tripDate;
        }
      }
    });
  });

  return Object.values(parkMetrics)
      .sort((a, b) => b.visits - a.visits)
      .map(park => ({
        ...park,
        avgDaysPerVisit: park.visits > 0 ? Math.round(park.totalDays / park.visits) : 0,
        uniqueTrips: park.trips.size,
        trips: undefined // Remove Set object for serialization
      }))
      .slice(0, 20);
};

/**
 * Get transportation mode breakdown with cost analysis
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of transportation mode objects with metrics
 */
export const getTransportationBreakdown = (trips) => {
  if (!trips || trips.length === 0) return [];

  const modeMetrics = {};

  trips.forEach(trip => {
    const mode = trip.transportationMode || 'unspecified';

    if (!modeMetrics[mode]) {
      modeMetrics[mode] = {
        mode,
        count: 0,
        totalCost: 0,
        totalDistance: 0,
        totalDays: 0,
        totalParks: 0
      };
    }

    modeMetrics[mode].count += 1;
    modeMetrics[mode].totalCost += trip.estimatedCost || 0;
    modeMetrics[mode].totalDistance += trip.totalDistance || 0;
    modeMetrics[mode].totalDays += trip.totalDuration || 0;
    modeMetrics[mode].totalParks += trip.parks?.length || 0;
  });

  const total = trips.length;

  return Object.values(modeMetrics).map(metrics => ({
    mode: metrics.mode,
    count: metrics.count,
    percentage: Math.round((metrics.count / total) * 100),
    avgCost: metrics.count > 0 ? Math.round(metrics.totalCost / metrics.count) : 0,
    avgDistance: metrics.count > 0 ? Math.round(metrics.totalDistance / metrics.count) : 0,
    avgDuration: metrics.count > 0 ? Math.round(metrics.totalDays / metrics.count) : 0,
    avgParks: metrics.count > 0 ? Math.round((metrics.totalParks / metrics.count) * 10) / 10 : 0
  }));
};

/**
 * Get seasonal travel preferences with detailed analysis
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of season objects with travel metrics
 */
export const getSeasonalPreferences = (trips) => {
  if (!trips || trips.length === 0) return [];

  const seasonMetrics = {
    spring: { name: 'Spring', count: 0, totalCost: 0, totalParks: 0, months: [2, 3, 4] },
    summer: { name: 'Summer', count: 0, totalCost: 0, totalParks: 0, months: [5, 6, 7] },
    fall: { name: 'Fall', count: 0, totalCost: 0, totalParks: 0, months: [8, 9, 10] },
    winter: { name: 'Winter', count: 0, totalCost: 0, totalParks: 0, months: [11, 0, 1] }
  };

  trips.forEach(trip => {
    if (trip.startDate) {
      const month = new Date(trip.startDate).getMonth();
      let season = null;

      for (const [key, data] of Object.entries(seasonMetrics)) {
        if (data.months.includes(month)) {
          season = key;
          break;
        }
      }

      if (season) {
        seasonMetrics[season].count += 1;
        seasonMetrics[season].totalCost += trip.estimatedCost || 0;
        seasonMetrics[season].totalParks += trip.parks?.length || 0;
      }
    }
  });

  const total = trips.length;

  return Object.entries(seasonMetrics).map(([key, metrics]) => ({
    season: metrics.name,
    count: metrics.count,
    percentage: total > 0 ? Math.round((metrics.count / total) * 100) : 0,
    avgCost: metrics.count > 0 ? Math.round(metrics.totalCost / metrics.count) : 0,
    avgParks: metrics.count > 0 ? Math.round((metrics.totalParks / metrics.count) * 10) / 10 : 0
  }));
};

/**
 * Get monthly travel trends with year-over-year comparison
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of month objects with travel data
 */
export const getMonthlyTrends = (trips) => {
  if (!trips || trips.length === 0) return [];

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyData = Array.from({ length: 12 }, (_, index) => ({
    month: monthNames[index],
    fullMonth: new Date(2024, index).toLocaleString('default', { month: 'long' }),
    count: 0,
    totalCost: 0,
    totalParks: 0,
    years: {}
  }));

  trips.forEach(trip => {
    if (trip.startDate) {
      const date = new Date(trip.startDate);
      const month = date.getMonth();
      const year = date.getFullYear();

      monthlyData[month].count += 1;
      monthlyData[month].totalCost += trip.estimatedCost || 0;
      monthlyData[month].totalParks += trip.parks?.length || 0;

      if (!monthlyData[month].years[year]) {
        monthlyData[month].years[year] = 0;
      }
      monthlyData[month].years[year] += 1;
    }
  });

  return monthlyData.map(data => ({
    ...data,
    avgCost: data.count > 0 ? Math.round(data.totalCost / data.count) : 0,
    avgParks: data.count > 0 ? Math.round((data.totalParks / data.count) * 10) / 10 : 0,
    years: Object.keys(data.years).length
  }));
};

/**
 * Get cost trends over time with detailed analysis
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of cost trend objects
 */
export const getCostTrends = (trips) => {
  if (!trips || trips.length === 0) return [];

  return trips
      .filter(trip => trip.estimatedCost && trip.createdAt)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((trip, index, sortedTrips) => {
        const previousTrip = index > 0 ? sortedTrips[index - 1] : null;
        const costChange = previousTrip
            ? trip.estimatedCost - previousTrip.estimatedCost
            : 0;
        const percentChange = previousTrip && previousTrip.estimatedCost > 0
            ? Math.round(((trip.estimatedCost - previousTrip.estimatedCost) / previousTrip.estimatedCost) * 100)
            : 0;

        return {
          date: trip.createdAt,
          cost: trip.estimatedCost,
          title: trip.title,
          month: new Date(trip.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          }),
          costChange,
          percentChange,
          parks: trip.parks?.length || 0,
          duration: trip.totalDuration || 1,
          costPerDay: trip.totalDuration > 0 ? Math.round(trip.estimatedCost / trip.totalDuration) : 0
        };
      });
};

/**
 * Get trip duration distribution analysis
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of duration category objects
 */
export const getTripDurationDistribution = (trips) => {
  if (!trips || trips.length === 0) return [];

  const categories = [
    { key: 'weekend', label: 'Weekend (1-3 days)', min: 1, max: 3 },
    { key: 'short', label: 'Short (4-7 days)', min: 4, max: 7 },
    { key: 'medium', label: 'Medium (8-14 days)', min: 8, max: 14 },
    { key: 'extended', label: 'Extended (15+ days)', min: 15, max: Infinity }
  ];

  const distribution = categories.map(category => ({
    ...category,
    count: 0,
    totalCost: 0,
    totalParks: 0,
    trips: []
  }));

  trips.forEach(trip => {
    const duration = trip.totalDuration || 1;
    const category = distribution.find(cat => duration >= cat.min && duration <= cat.max);

    if (category) {
      category.count += 1;
      category.totalCost += trip.estimatedCost || 0;
      category.totalParks += trip.parks?.length || 0;
      category.trips.push(trip.id);
    }
  });

  const total = trips.length;

  return distribution.map(category => ({
    category: category.label,
    key: category.key,
    count: category.count,
    percentage: total > 0 ? Math.round((category.count / total) * 100) : 0,
    avgCost: category.count > 0 ? Math.round(category.totalCost / category.count) : 0,
    avgParks: category.count > 0 ? Math.round((category.totalParks / category.count) * 10) / 10 : 0
  }));
};

/**
 * Get budget distribution analysis with detailed metrics
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of budget category objects
 */
export const getBudgetDistribution = (trips) => {
  if (!trips || trips.length === 0) return [];

  const categories = [
    { key: 'budget', label: 'Budget (< $1,000)', min: 0, max: 999, color: 'green' },
    { key: 'moderate', label: 'Moderate ($1,000 - $2,999)', min: 1000, max: 2999, color: 'blue' },
    { key: 'premium', label: 'Premium ($3,000 - $4,999)', min: 3000, max: 4999, color: 'purple' },
    { key: 'luxury', label: 'Luxury ($5,000+)', min: 5000, max: Infinity, color: 'gold' }
  ];

  const distribution = categories.map(category => ({
    ...category,
    count: 0,
    totalDuration: 0,
    totalParks: 0,
    trips: []
  }));

  trips.forEach(trip => {
    const cost = trip.estimatedCost || 0;
    const category = distribution.find(cat => cost >= cat.min && cost <= cat.max);

    if (category) {
      category.count += 1;
      category.totalDuration += trip.totalDuration || 0;
      category.totalParks += trip.parks?.length || 0;
      category.trips.push({
        id: trip.id,
        title: trip.title,
        cost: trip.estimatedCost
      });
    }
  });

  const total = trips.length;

  return distribution.map(category => ({
    category: category.label,
    key: category.key,
    color: category.color,
    count: category.count,
    percentage: total > 0 ? Math.round((category.count / total) * 100) : 0,
    avgDuration: category.count > 0 ? Math.round(category.totalDuration / category.count) : 0,
    avgParks: category.count > 0 ? Math.round((category.totalParks / category.count) * 10) / 10 : 0,
    avgCost: category.count > 0 ? Math.round(
        category.trips.reduce((sum, trip) => sum + trip.cost, 0) / category.count
    ) : 0
  }));
};

/**
 * Get trip efficiency metrics and optimization suggestions
 * @param {Array} trips - Array of trip objects
 * @returns {Object} Efficiency metrics object
 */
export const getTripEfficiencyMetrics = (trips) => {
  if (!trips || trips.length === 0) {
    return {
      avgCostPerDay: 0,
      avgCostPerPark: 0,
      avgMilesPerDay: 0,
      avgParksPerDay: 0,
      efficiencyScore: 0,
      suggestions: []
    };
  }

  const totalCost = trips.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const totalDays = trips.reduce((sum, t) => sum + (t.totalDuration || 0), 0);
  const totalParks = trips.reduce((sum, t) => sum + (t.parks?.length || 0), 0);
  const totalMiles = trips.reduce((sum, t) => sum + (t.totalDistance || 0), 0);

  const metrics = {
    avgCostPerDay: totalDays > 0 ? Math.round(totalCost / totalDays) : 0,
    avgCostPerPark: totalParks > 0 ? Math.round(totalCost / totalParks) : 0,
    avgMilesPerDay: totalDays > 0 ? Math.round(totalMiles / totalDays) : 0,
    avgParksPerDay: totalDays > 0 ? Math.round((totalParks / totalDays) * 100) / 100 : 0
  };

  // Calculate efficiency score (0-100)
  let efficiencyScore = 50; // Base score

  // Adjust based on cost efficiency
  if (metrics.avgCostPerDay < 200) efficiencyScore += 10;
  else if (metrics.avgCostPerDay > 400) efficiencyScore -= 10;

  // Adjust based on park coverage
  if (metrics.avgParksPerDay > 0.3) efficiencyScore += 15;
  else if (metrics.avgParksPerDay < 0.2) efficiencyScore -= 10;

  // Adjust based on travel efficiency
  if (metrics.avgMilesPerDay < 200) efficiencyScore += 10;
  else if (metrics.avgMilesPerDay > 500) efficiencyScore -= 15;

  efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

  // Generate suggestions
  const suggestions = [];

  if (metrics.avgCostPerDay > 350) {
    suggestions.push('Consider budget accommodations or camping to reduce daily costs');
  }

  if (metrics.avgParksPerDay < 0.25) {
    suggestions.push('Try visiting more parks per trip to maximize your time and budget');
  }

  if (metrics.avgMilesPerDay > 400) {
    suggestions.push('Reduce daily driving distances by grouping nearby parks together');
  }

  if (metrics.avgCostPerPark > 500) {
    suggestions.push('Look for multi-park passes or consider shorter stays per park');
  }

  return {
    ...metrics,
    efficiencyScore: Math.round(efficiencyScore),
    suggestions
  };
};

/**
 * Generate comprehensive smart insights based on trip data
 * @param {Array} trips - Array of trip objects
 * @returns {Array} Array of insight objects with actionable recommendations
 */
export const generateSmartInsights = (trips) => {
  if (!trips || trips.length === 0) {
    return [{
      type: 'getting-started',
      icon: '🚀',
      title: 'Start Your Adventure',
      description: 'Plan your first national parks trip to begin building your travel analytics.',
      suggestion: 'Use our trip templates to get started quickly with proven itineraries.',
      priority: 'high'
    }];
  }

  const insights = [];
  const stats = getTravelStats(trips);
  const seasonalPrefs = getSeasonalPreferences(trips);
  const transportBreakdown = getTransportationBreakdown(trips);
  const topStates = getMostVisitedStates(trips);
  const budgetDist = getBudgetDistribution(trips);
  const efficiency = getTripEfficiencyMetrics(trips);

  // Cost optimization insights
  if (stats.avgTripCost > 4000) {
    insights.push({
      type: 'cost-optimization',
      icon: '💰',
      title: 'Premium Explorer',
      description: `Your average trip cost of ${stats.avgTripCost.toLocaleString()} indicates luxury travel preferences.`,
      suggestion: 'Consider mixing premium and budget accommodations, or explore shoulder seasons for better rates.',
      priority: 'medium',
      savings: Math.round(stats.avgTripCost * 0.2)
    });
  } else if (stats.avgTripCost < 1200) {
    insights.push({
      type: 'cost-opportunity',
      icon: '🎯',
      title: 'Budget Master',
      description: `Excellent cost control at $${stats.avgTripCost.toLocaleString()} per trip.`,
      suggestion: 'You have room to add premium experiences or extend trip durations within typical budgets.',
      priority: 'low'
    });
  }

  // Seasonal optimization
  const favoriteSeason = seasonalPrefs.reduce((max, season) =>
      season.count > max.count ? season : max, seasonalPrefs[0] || { season: 'Summer', count: 0, percentage: 0 }
  );

  if (favoriteSeason.percentage > 50) {
    const otherSeasons = seasonalPrefs.filter(s => s.season !== favoriteSeason.season && s.count === 0);
    if (otherSeasons.length > 0) {
      insights.push({
        type: 'seasonal-diversity',
        icon: '🌍',
        title: `Expand Beyond ${favoriteSeason.season}`,
        description: `${favoriteSeason.percentage}% of your trips are in ${favoriteSeason.season.toLowerCase()}.`,
        suggestion: `Try ${otherSeasons[0]?.season?.toLowerCase() || 'other seasons'} for different experiences and potentially lower costs.`,
        priority: 'medium'
      });
    }
  }

  // Transportation efficiency
  const primaryTransport = transportBreakdown.reduce((max, mode) =>
      mode.count > max.count ? mode : max, transportBreakdown[0] || { mode: 'driving', percentage: 0, avgDistance: 0 }
  );

  if (primaryTransport.percentage > 80) {
    if (primaryTransport.mode === 'driving' && primaryTransport.avgDistance > 1500) {
      insights.push({
        type: 'transport-optimization',
        icon: '✈️',
        title: 'Consider Flying for Long Distances',
        description: `Your road trips average ${primaryTransport.avgDistance} miles.`,
        suggestion: 'Flying to distant parks could save time and potentially reduce total costs on longer trips.',
        priority: 'medium'
      });
    } else if (primaryTransport.mode === 'flying' && primaryTransport.avgDistance < 800) {
      insights.push({
        type: 'transport-optimization',
        icon: '🚗',
        title: 'Road Trips for Nearby Parks',
        description: 'Your flights average short distances.',
        suggestion: 'Consider scenic road trips for nearby parks to reduce costs and enjoy the journey.',
        priority: 'medium'
      });
    }
  }

  // Geographic diversity
  if (topStates.length > 0) {
    const topState = topStates[0];
    const totalStateVisits = topStates.reduce((sum, state) => sum + state.count, 0);

    if (topState.percentage > 40) {
      insights.push({
        type: 'geographic-diversity',
        icon: '📍',
        title: `Branch Out from ${topState.state}`,
        description: `${topState.percentage}% of your park visits are in ${topState.state}.`,
        suggestion: 'Explore national parks in neighboring states or different regions for new experiences.',
        priority: 'low'
      });
    }
  }

  // Efficiency insights
  if (efficiency.efficiencyScore < 60) {
    insights.push({
      type: 'efficiency-improvement',
      icon: '⚡',
      title: 'Optimize Your Trips',
      description: `Your trip efficiency score is ${efficiency.efficiencyScore}/100.`,
      suggestion: efficiency.suggestions[0] || 'Focus on grouping nearby parks and optimizing travel routes.',
      priority: 'high'
    });
  } else if (efficiency.efficiencyScore > 85) {
    insights.push({
      type: 'efficiency-celebration',
      icon: '🎉',
      title: 'Trip Planning Expert',
      description: `Excellent efficiency score of ${efficiency.efficiencyScore}/100!`,
      suggestion: 'Share your planning expertise with the community or mentor other travelers.',
      priority: 'low'
    });
  }

  // Budget insights
  const budgetCategory = budgetDist.find(cat => cat.count > 0) || budgetDist[0];
  if (budgetCategory.count > trips.length * 0.8) {
    insights.push({
      type: 'budget-consistency',
      icon: '📊',
      title: `Consistent ${budgetCategory.key} Traveler`,
      description: `${Math.round((budgetCategory.count / trips.length) * 100)}% of your trips fall in the ${budgetCategory.key} category.`,
      suggestion: budgetCategory.key === 'budget'
          ? 'Consider splurging on one premium experience per trip.'
          : 'Maintain this consistent approach or explore budget-friendly alternatives.',
      priority: 'low'
    });
  }

  // Recent activity insights
  const recentTrips = trips.filter(trip => {
    const tripDate = new Date(trip.createdAt || trip.startDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return tripDate > sixMonthsAgo;
  });

  if (recentTrips.length === 0 && trips.length > 0) {
    insights.push({
      type: 'activity-encouragement',
      icon: '🌟',
      title: 'Time for Your Next Adventure',
      description: 'It\'s been a while since your last trip planning session.',
      suggestion: 'Check out new park destinations or revisit favorite locations with updated itineraries.',
      priority: 'medium'
    });
  }

  // Sort insights by priority and limit to top 6
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return insights
      .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
      .slice(0, 6);
};

/**
 * Get comparative analysis between trips
 * @param {Array} trips - Array of trip objects
 * @returns {Object|null} Comparative analysis object or null if insufficient data
 */
export const getComparativeAnalysis = (trips) => {
  if (!trips || trips.length < 2) {
    return null;
  }

  const sortedByCost = [...trips].sort((a, b) => (b.estimatedCost || 0) - (a.estimatedCost || 0));
  const sortedByDuration = [...trips].sort((a, b) => (b.totalDuration || 0) - (a.totalDuration || 0));
  const sortedByParks = [...trips].sort((a, b) => (b.parks?.length || 0) - (a.parks?.length || 0));
  const sortedByDistance = [...trips].sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0));

  return {
    cost: {
      highest: sortedByCost[0],
      lowest: sortedByCost[sortedByCost.length - 1],
      range: (sortedByCost[0]?.estimatedCost || 0) - (sortedByCost[sortedByCost.length - 1]?.estimatedCost || 0)
    },
    duration: {
      longest: sortedByDuration[0],
      shortest: sortedByDuration[sortedByDuration.length - 1],
      range: (sortedByDuration[0]?.totalDuration || 0) - (sortedByDuration[sortedByDuration.length - 1]?.totalDuration || 0)
    },
    parks: {
      mostParks: sortedByParks[0],
      fewestParks: sortedByParks[sortedByParks.length - 1],
      range: (sortedByParks[0]?.parks?.length || 0) - (sortedByParks[sortedByParks.length - 1]?.parks?.length || 0)
    },
    distance: {
      farthest: sortedByDistance[0],
      shortest: sortedByDistance[sortedByDistance.length - 1],
      range: (sortedByDistance[0]?.totalDistance || 0) - (sortedByDistance[sortedByDistance.length - 1]?.totalDistance || 0)
    }
  };
};

/**
 * Get travel patterns and trends analysis
 * @param {Array} trips - Array of trip objects
 * @returns {Object} Travel patterns analysis
 */
export const getTravelPatterns = (trips) => {
  if (!trips || trips.length === 0) {
    return {
      planningLeadTime: 0,
      preferredTripLength: null,
      peakTravelMonths: [],
      growthTrends: null,
      consistency: {
        budget: 0,
        duration: 0,
        transportation: 0
      }
    };
  }

  // Calculate planning lead time
  const planningLeadTimes = trips
      .filter(trip => trip.createdAt && trip.startDate)
      .map(trip => {
        const created = new Date(trip.createdAt);
        const start = new Date(trip.startDate);
        return Math.max(0, Math.floor((start - created) / (1000 * 60 * 60 * 24)));
      });

  const avgLeadTime = planningLeadTimes.length > 0
      ? Math.round(planningLeadTimes.reduce((sum, days) => sum + days, 0) / planningLeadTimes.length)
      : 0;

  // Find preferred trip length
  const durationCounts = {};
  trips.forEach(trip => {
    const duration = trip.totalDuration || 1;
    durationCounts[duration] = (durationCounts[duration] || 0) + 1;
  });

  const preferredTripLength = Object.entries(durationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

  // Peak travel months
  const monthCounts = Array(12).fill(0);
  trips.forEach(trip => {
    if (trip.startDate) {
      const month = new Date(trip.startDate).getMonth();
      monthCounts[month]++;
    }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const peakTravelMonths = monthCounts
      .map((count, index) => ({ month: monthNames[index], count }))
      .filter(data => data.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

  // Growth trends (if we have trips spanning multiple years)
  const yearData = {};
  trips.forEach(trip => {
    if (trip.createdAt) {
      const year = new Date(trip.createdAt).getFullYear();
      if (!yearData[year]) {
        yearData[year] = { count: 0, totalCost: 0, totalParks: 0 };
      }
      yearData[year].count++;
      yearData[year].totalCost += trip.estimatedCost || 0;
      yearData[year].totalParks += trip.parks?.length || 0;
    }
  });

  const years = Object.keys(yearData).sort();
  const growthTrends = years.length > 1 ? {
    tripGrowth: years.length > 1 ? ((yearData[years[years.length - 1]].count - yearData[years[0]].count) / yearData[years[0]].count) * 100 : 0,
    budgetGrowth: years.length > 1 ? ((yearData[years[years.length - 1]].totalCost - yearData[years[0]].totalCost) / Math.max(1, yearData[years[0]].totalCost)) * 100 : 0,
    parkGrowth: years.length > 1 ? ((yearData[years[years.length - 1]].totalParks - yearData[years[0]].totalParks) / Math.max(1, yearData[years[0]].totalParks)) * 100 : 0
  } : null;

  // Consistency analysis
  const budgets = trips.map(t => t.estimatedCost || 0).filter(c => c > 0);
  const durations = trips.map(t => t.totalDuration || 1);
  const transportModes = trips.map(t => t.transportationMode).filter(Boolean);

  const budgetCV = budgets.length > 1 ? calculateCoefficientOfVariation(budgets) : 0;
  const durationCV = durations.length > 1 ? calculateCoefficientOfVariation(durations) : 0;
  const transportConsistency = transportModes.length > 0
      ? Math.max(...Object.values(transportModes.reduce((acc, mode) => {
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {}))) / transportModes.length
      : 0;

  return {
    planningLeadTime: avgLeadTime,
    preferredTripLength: preferredTripLength ? parseInt(preferredTripLength) : null,
    peakTravelMonths,
    growthTrends,
    consistency: {
      budget: Math.round((1 - budgetCV) * 100), // Higher score = more consistent
      duration: Math.round((1 - durationCV) * 100),
      transportation: Math.round(transportConsistency * 100)
    }
  };
};

/**
 * Calculate coefficient of variation for consistency analysis
 * @param {Array} values - Array of numeric values
 * @returns {number} Coefficient of variation (0-1, lower = more consistent)
 */
const calculateCoefficientOfVariation = (values) => {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return mean > 0 ? Math.min(1, stdDev / mean) : 0;
};

/**
 * Generate executive summary report
 * @param {Array} trips - Array of trip objects
 * @returns {Object} Executive summary with key metrics and insights
 */
export const generateExecutiveSummary = (trips) => {
  if (!trips || trips.length === 0) {
    return {
      overview: 'No trips planned yet',
      keyMetrics: {},
      topInsights: [],
      recommendations: [],
      nextSteps: ['Plan your first national parks adventure']
    };
  }

  const stats = getTravelStats(trips);
  const insights = generateSmartInsights(trips);
  const patterns = getTravelPatterns(trips);
  const efficiency = getTripEfficiencyMetrics(trips);

  // Key performance indicators
  const keyMetrics = {
    totalInvestment: stats.totalCost,
    parksExplored: stats.totalParks,
    daysAdventuring: stats.totalDays,
    milesJourneyed: stats.totalDistance,
    avgTripValue: stats.avgTripCost,
    efficiencyScore: efficiency.efficiencyScore,
    planningConsistency: (patterns.consistency.budget + patterns.consistency.duration + patterns.consistency.transportation) / 3
  };

  // Top insights (priority-based)
  const topInsights = insights
      .filter(insight => insight.priority === 'high' || insight.priority === 'medium')
      .slice(0, 3);

  // Strategic recommendations
  const recommendations = [];

  if (efficiency.efficiencyScore < 70) {
    recommendations.push({
      category: 'Optimization',
      action: 'Improve trip efficiency',
      impact: 'High',
      description: 'Focus on route optimization and cost management'
    });
  }

  if (stats.avgParksPerTrip < 2) {
    recommendations.push({
      category: 'Experience',
      action: 'Increase park coverage per trip',
      impact: 'Medium',
      description: 'Visit multiple parks in the same region to maximize travel value'
    });
  }

  if (patterns.consistency.budget < 60) {
    recommendations.push({
      category: 'Planning',
      action: 'Establish consistent budget framework',
      impact: 'Medium',
      description: 'Create budget templates for different trip types'
    });
  }

  // Next steps based on current state
  const nextSteps = [];

  if (trips.length < 3) {
    nextSteps.push('Plan 2-3 more trips to establish travel patterns');
  }

  if (insights.some(i => i.type === 'seasonal-diversity')) {
    nextSteps.push('Explore different seasons for varied experiences');
  }

  if (efficiency.suggestions.length > 0) {
    nextSteps.push(efficiency.suggestions[0]);
  }

  nextSteps.push('Share experiences with the travel community');

  return {
    overview: `${trips.length} trips planned covering ${stats.totalParks} national parks with ${stats.totalDays} days of adventure`,
    keyMetrics,
    topInsights,
    recommendations,
    nextSteps: nextSteps.slice(0, 4)
  };
};

/**
 * Export analytics data for external use
 * @param {Array} trips - Array of trip objects
 * @param {string} format - Export format ('json', 'csv', 'summary')
 * @returns {string|Object} Formatted analytics data
 */
export const exportAnalyticsData = (trips, format = 'json') => {
  const analytics = {
    metadata: {
      exportDate: new Date().toISOString(),
      tripCount: trips.length,
      version: '2.0'
    },
    summary: generateExecutiveSummary(trips),
    statistics: getTravelStats(trips),
    patterns: getTravelPatterns(trips),
    breakdowns: {
      states: getMostVisitedStates(trips),
      transportation: getTransportationBreakdown(trips),
      seasonal: getSeasonalPreferences(trips),
      budget: getBudgetDistribution(trips),
      duration: getTripDurationDistribution(trips)
    },
    insights: generateSmartInsights(trips),
    efficiency: getTripEfficiencyMetrics(trips),
    trends: {
      monthly: getMonthlyTrends(trips),
      costs: getCostTrends(trips)
    }
  };

  switch (format.toLowerCase()) {
    case 'csv':
      // Convert key metrics to CSV format
      const csvData = trips.map(trip => ({
        title: trip.title || 'Untitled',
        startDate: trip.startDate || '',
        endDate: trip.endDate || '',
        duration: trip.totalDuration || 0,
        parks: trip.parks?.length || 0,
        cost: trip.estimatedCost || 0,
        distance: trip.totalDistance || 0,
        transportation: trip.transportationMode || ''
      }));

      const csvHeaders = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => Object.values(row).join(','));
      return [csvHeaders, ...csvRows].join('\n');

    case 'summary':
      return analytics.summary;

    case 'json':
    default:
      return JSON.stringify(analytics, null, 2);
  }
};