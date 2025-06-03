// src/utils/TripAnalytics.js
export class TripAnalytics {
  /**
   * Generates comprehensive insights from user trips
   * @param {Array} userTrips - User's trip data
   * @param {Array} allTrips - Global trip data for benchmarking (optional)
   * @returns {Object} Complete analytics insights
   */
  static generateInsights(userTrips, allTrips = []) {
    if (!userTrips || userTrips.length === 0) {
      return this.getEmptyInsights();
    }

    return {
      personalPreferences: this.analyzePersonalPreferences(userTrips),
      benchmarkComparisons: this.compareToBenchmarks(userTrips, allTrips),
      recommendations: this.generateRecommendations(userTrips),
      trendAnalysis: this.analyzeTrends(userTrips),
      costOptimization: this.analyzeCostPatterns(userTrips),
      travelPatterns: this.analyzeTravelPatterns(userTrips),
      efficiency: this.analyzeEfficiency(userTrips)
    };
  }

  /**
   * Analyzes personal travel preferences and patterns
   * @param {Array} trips - User's trips
   * @returns {Object} Personal preference data
   */
  static analyzePersonalPreferences(trips) {
    const preferences = {
      favoriteRegions: {},
      preferredDuration: [],
      budgetRange: [],
      seasonality: { spring: 0, summer: 0, fall: 0, winter: 0 },
      parkTypes: {},
      transportationPreference: { driving: 0, flying: 0 }
    };

    trips.forEach(trip => {
      // Analyze regions
      trip.parks?.forEach(park => {
        const region = this.getRegion(park.state);
        preferences.favoriteRegions[region] = (preferences.favoriteRegions[region] || 0) + 1;
        
        // Analyze park types
        const parkType = this.getParkType(park.parkName);
        preferences.parkTypes[parkType] = (preferences.parkTypes[parkType] || 0) + 1;
      });

      // Analyze duration patterns
      if (trip.totalDuration || trip.startDate && trip.endDate) {
        const duration = trip.totalDuration || this.calculateDuration(trip.startDate, trip.endDate);
        preferences.preferredDuration.push(duration);
      }

      // Analyze budget patterns
      if (trip.estimatedCost) {
        preferences.budgetRange.push(trip.estimatedCost);
      }

      // Analyze seasonality
      if (trip.startDate) {
        const season = this.getSeason(new Date(trip.startDate));
        preferences.seasonality[season]++;
      }

      // Analyze transportation
      if (trip.transportationMode) {
        preferences.transportationPreference[trip.transportationMode]++;
      }
    });

    return {
      topRegions: Object.entries(preferences.favoriteRegions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([region, count]) => ({ region, count, percentage: Math.round((count / trips.length) * 100) })),
        
      avgDuration: preferences.preferredDuration.length > 0 
        ? Math.round(preferences.preferredDuration.reduce((a, b) => a + b, 0) / preferences.preferredDuration.length * 10) / 10
        : 0,
        
      avgBudget: preferences.budgetRange.length > 0
        ? Math.round(preferences.budgetRange.reduce((a, b) => a + b, 0) / preferences.budgetRange.length)
        : 0,
        
      budgetRange: {
        min: Math.min(...preferences.budgetRange),
        max: Math.max(...preferences.budgetRange),
        median: this.calculateMedian(preferences.budgetRange)
      },
      
      favoriteSeasons: Object.entries(preferences.seasonality)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([season, count]) => ({ season, count, percentage: Math.round((count / trips.length) * 100) })),
        
      topParkTypes: Object.entries(preferences.parkTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => ({ type, count })),
        
      transportationSplit: {
        driving: Math.round((preferences.transportationPreference.driving / trips.length) * 100) || 0,
        flying: Math.round((preferences.transportationPreference.flying / trips.length) * 100) || 0
      }
    };
  }

  /**
   * Generates actionable recommendations based on trip patterns
   * @param {Array} trips - User's trips
   * @returns {Array} Array of recommendation objects
   */
  static generateRecommendations(trips) {
    const insights = this.analyzePersonalPreferences(trips);
    const recommendations = [];

    // Budget optimization recommendations
    if (insights.avgBudget > 3000) {
      recommendations.push({
        type: 'budget',
        priority: 'medium',
        title: 'Consider Budget-Friendly Alternatives',
        description: `Your average trip costs $${insights.avgBudget}. Try camping, off-season travel, or shorter trips to reduce costs.`,
        impact: 'Could save 20-30% on total costs',
        actionItems: [
          'Look into camping options at national parks',
          'Plan trips during shoulder seasons',
          'Consider staying at nearby towns instead of park lodges'
        ]
      });
    }

    // Duration optimization
    if (insights.avgDuration < 5) {
      recommendations.push({
        type: 'experience',
        priority: 'low',
        title: 'Extend Your Adventures',
        description: `Your average trip is ${insights.avgDuration} days. Longer trips often provide better value and deeper experiences.`,
        impact: 'Better cost per day and more immersive experiences',
        actionItems: [
          'Plan 7-10 day trips for better park exploration',
          'Combine multiple nearby parks in one trip',
          'Allow for rest days and spontaneous activities'
        ]
      });
    }

    // Regional diversification
    const topRegion = insights.topRegions[0];
    if (topRegion && topRegion.percentage > 70) {
      recommendations.push({
        type: 'exploration',
        priority: 'high',
        title: 'Explore New Regions',
        description: `${topRegion.percentage}% of your trips are in ${topRegion.region}. Consider exploring other regions for diverse experiences.`,
        impact: 'Discover new landscapes and experiences',
        actionItems: [
          'Plan a trip to the opposite coast',
          'Explore international national parks',
          'Try different climate zones and ecosystems'
        ]
      });
    }

    // Seasonal recommendations
    const topSeason = insights.favoriteSeasons[0];
    if (topSeason && topSeason.percentage > 60) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Try Different Seasons',
        description: `You travel mostly in ${topSeason.season}. Each season offers unique park experiences.`,
        impact: 'Experience parks in different conditions and crowds',
        actionItems: [
          'Plan a winter trip for snow activities',
          'Try spring for wildflowers and mild weather',
          'Experience fall colors in deciduous forests'
        ]
      });
    }

    // Transportation efficiency
    if (insights.transportationSplit.driving > 80) {
      recommendations.push({
        type: 'efficiency',
        priority: 'low',
        title: 'Consider Flying for Distant Parks',
        description: 'For parks over 500 miles apart, flying might save time and sometimes money.',
        impact: 'More time at destinations, less driving fatigue',
        actionItems: [
          'Compare flight costs for distant park combinations',
          'Consider rental cars at destinations',
          'Look into national park flight packages'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analyzes travel trends over time
   * @param {Array} trips - User's trips
   * @returns {Object} Trend analysis data
   */
  static analyzeTrends(trips) {
    const tripsByMonth = this.generateTripsByMonth(trips);
    const costTrends = this.analyzeCostTrends(trips);
    const popularityTrends = this.analyzePopularityTrends(trips);

    return {
      tripFrequency: {
        data: tripsByMonth,
        trend: this.calculateTrend(tripsByMonth.map(t => t.trips)),
        peakMonths: tripsByMonth.sort((a, b) => b.trips - a.trips).slice(0, 3)
      },
      costEvolution: {
        data: costTrends,
        trend: this.calculateTrend(costTrends.map(t => t.avgCost)),
        recommendation: costTrends.length > 1 ? this.getCostTrendRecommendation(costTrends) : null
      },
      parkPopularity: popularityTrends
    };
  }

  /**
   * Analyzes cost patterns and optimization opportunities
   * @param {Array} trips - User's trips
   * @returns {Object} Cost analysis data
   */
  static analyzeCostPatterns(trips) {
    const costBreakdown = this.calculateCostBreakdown(trips);
    const costEfficiency = this.analyzeCostEfficiency(trips);
    
    return {
      breakdown: costBreakdown,
      efficiency: costEfficiency,
      optimizationOpportunities: this.findCostOptimizations(trips),
      budgetRecommendations: this.generateBudgetRecommendations(trips)
    };
  }

  /**
   * Analyzes travel patterns and preferences
   * @param {Array} trips - User's trips
   * @returns {Object} Travel pattern data
   */
  static analyzeTravelPatterns(trips) {
    const patterns = {
      tripStyles: this.categorizeTripStyles(trips),
      routeEfficiency: this.analyzeRouteEfficiency(trips),
      timingPatterns: this.analyzeTimingPatterns(trips),
      groupSizePatterns: this.analyzeGroupPatterns(trips)
    };

    return patterns;
  }

  /**
   * Analyzes overall trip efficiency metrics
   * @param {Array} trips - User's trips
   * @returns {Object} Efficiency analysis
   */
  static analyzeEfficiency(trips) {
    let totalDistance = 0;
    let totalCost = 0;
    let totalDuration = 0;
    let totalParks = 0;

    trips.forEach(trip => {
      totalDistance += trip.totalDistance || 0;
      totalCost += trip.estimatedCost || 0;
      totalDuration += trip.totalDuration || 0;
      totalParks += trip.parks?.length || 0;
    });

    return {
      costPerDay: totalDuration > 0 ? Math.round(totalCost / totalDuration) : 0,
      costPerPark: totalParks > 0 ? Math.round(totalCost / totalParks) : 0,
      milesPerDay: totalDuration > 0 ? Math.round(totalDistance / totalDuration) : 0,
      parksPerTrip: trips.length > 0 ? Math.round((totalParks / trips.length) * 10) / 10 : 0,
      efficiencyScore: this.calculateEfficiencyScore(trips),
      recommendations: this.generateEfficiencyRecommendations(trips)
    };
  }

  // Helper methods
  static getRegion(state) {
    const regions = {
      'California': 'West Coast',
      'Oregon': 'West Coast',
      'Washington': 'West Coast',
      'Utah': 'Southwest',
      'Arizona': 'Southwest',
      'Nevada': 'Southwest',
      'Colorado': 'Rocky Mountains',
      'Wyoming': 'Rocky Mountains',
      'Montana': 'Rocky Mountains',
      'Idaho': 'Rocky Mountains',
      'Alaska': 'Alaska',
      'Hawaii': 'Hawaii',
      'Texas': 'South',
      'Florida': 'Southeast',
      'North Carolina': 'Southeast',
      'Tennessee': 'Southeast',
      'Kentucky': 'Southeast',
      'Virginia': 'Southeast',
      'West Virginia': 'Southeast',
      'South Carolina': 'Southeast',
      'Maine': 'Northeast',
      'New York': 'Northeast',
      'Vermont': 'Northeast',
      'New Hampshire': 'Northeast'
    };
    return regions[state] || 'Other';
  }

  static getParkType(parkName) {
    const name = parkName?.toLowerCase() || '';
    
    if (name.includes('canyon')) return 'Canyon';
    if (name.includes('desert') || name.includes('death valley') || name.includes('joshua')) return 'Desert';
    if (name.includes('mountain') || name.includes('glacier') || name.includes('denali')) return 'Mountain';
    if (name.includes('forest') || name.includes('redwood') || name.includes('sequoia')) return 'Forest';
    if (name.includes('lake') || name.includes('crater')) return 'Lake';
    if (name.includes('volcano') || name.includes('yellowstone')) return 'Volcanic';
    if (name.includes('beach') || name.includes('shore') || name.includes('coast')) return 'Coastal';
    
    return 'General';
  }

  static getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  static calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  static calculateMedian(numbers) {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static generateTripsByMonth(trips) {
    const months = {};
    trips.forEach(trip => {
      if (trip.startDate) {
        const month = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months[month] = (months[month] || 0) + 1;
      }
    });
    
    return Object.entries(months).map(([month, trips]) => ({ month, trips }));
  }

  static calculateTrend(data) {
    if (data.length < 2) return 'insufficient data';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.1) return 'increasing';
    if (secondAvg < firstAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  static analyzeCostTrends(trips) {
    const tripsByYear = {};
    
    trips.forEach(trip => {
      if (trip.startDate && trip.estimatedCost) {
        const year = new Date(trip.startDate).getFullYear();
        if (!tripsByYear[year]) tripsByYear[year] = [];
        tripsByYear[year].push(trip.estimatedCost);
      }
    });

    return Object.entries(tripsByYear).map(([year, costs]) => ({
      year: parseInt(year),
      avgCost: Math.round(costs.reduce((a, b) => a + b, 0) / costs.length),
      tripCount: costs.length
    })).sort((a, b) => a.year - b.year);
  }

  static analyzePopularityTrends(trips) {
    const parkCounts = {};
    trips.forEach(trip => {
      trip.parks?.forEach(park => {
        parkCounts[park.parkName] = (parkCounts[park.parkName] || 0) + 1;
      });
    });
    
    return Object.entries(parkCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ 
        name: name.length > 20 ? name.substring(0, 20) + '...' : name, 
        count,
        percentage: Math.round((count / trips.length) * 100)
      }));
  }

  static calculateCostBreakdown(trips) {
    let totalAccommodation = 0;
    let totalTransportation = 0;
    let totalFood = 0;
    let totalFees = 0;
    let totalTrips = trips.length;

    trips.forEach(trip => {
      const duration = trip.totalDuration || 7;
      const distance = trip.totalDistance || 0;
      const parks = trip.parks?.length || 0;
      
      totalAccommodation += duration * 85;
      totalTransportation += trip.transportationMode === 'flying' ? parks * 275 : distance * 0.20;
      totalFood += duration * 55;
      totalFees += parks * 30;
    });

    const total = totalAccommodation + totalTransportation + totalFood + totalFees;

    return {
      accommodation: { amount: Math.round(totalAccommodation), percentage: Math.round((totalAccommodation / total) * 100) },
      transportation: { amount: Math.round(totalTransportation), percentage: Math.round((totalTransportation / total) * 100) },
      food: { amount: Math.round(totalFood), percentage: Math.round((totalFood / total) * 100) },
      fees: { amount: Math.round(totalFees), percentage: Math.round((totalFees / total) * 100) }
    };
  }

  static calculateEfficiencyScore(trips) {
    if (trips.length === 0) return 0;
    
    let totalScore = 0;
    
    trips.forEach(trip => {
      let score = 50; // Base score
      
      // Cost efficiency (lower cost per day = higher score)
      const costPerDay = trip.estimatedCost / (trip.totalDuration || 7);
      if (costPerDay < 200) score += 20;
      else if (costPerDay < 300) score += 10;
      
      // Park efficiency (more parks per trip = higher score)
      const parksCount = trip.parks?.length || 0;
      if (parksCount >= 5) score += 15;
      else if (parksCount >= 3) score += 10;
      else if (parksCount >= 2) score += 5;
      
      // Route efficiency (less driving per park = higher score)
      const milesPerPark = parksCount > 0 ? (trip.totalDistance || 0) / parksCount : 0;
      if (milesPerPark < 100) score += 15;
      else if (milesPerPark < 200) score += 10;
      else if (milesPerPark < 300) score += 5;
      
      totalScore += Math.min(100, score);
    });
    
    return Math.round(totalScore / trips.length);
  }

  static getEmptyInsights() {
    return {
      personalPreferences: {
        topRegions: [],
        avgDuration: 0,
        avgBudget: 0,
        favoriteSeasons: [],
        topParkTypes: [],
        transportationSplit: { driving: 0, flying: 0 }
      },
      recommendations: [],
      trendAnalysis: {
        tripFrequency: { data: [], trend: 'insufficient data' },
        costEvolution: { data: [], trend: 'insufficient data' }
      },
      efficiency: {
        costPerDay: 0,
        costPerPark: 0,
        milesPerDay: 0,
        parksPerTrip: 0,
        efficiencyScore: 0
      }
    };
  }

  // Additional helper methods for comprehensive analysis
  static findCostOptimizations(trips) {
    const optimizations = [];
    const preferences = this.analyzePersonalPreferences(trips);
    
    if (preferences.avgBudget > 2500) {
      optimizations.push({
        category: 'accommodation',
        potential: '20-40%',
        suggestion: 'Consider camping or budget lodging options'
      });
    }
    
    if (preferences.transportationSplit.driving > 70) {
      optimizations.push({
        category: 'transportation',
        potential: '15-25%',
        suggestion: 'Group nearby parks in single trips to reduce fuel costs'
      });
    }
    
    return optimizations;
  }

  static generateBudgetRecommendations(trips) {
    const preferences = this.analyzePersonalPreferences(trips);
    const recommendations = [];
    
    if (preferences.avgBudget < 1500) {
      recommendations.push('Consider extending trips for better value per day');
    }
    
    if (preferences.avgBudget > 4000) {
      recommendations.push('Look into luxury camping or unique accommodations');
    }
    
    return recommendations;
  }

  static categorizeTripStyles(trips) {
    const styles = { relaxed: 0, balanced: 0, intensive: 0 };
    
    trips.forEach(trip => {
      const parksPerDay = (trip.parks?.length || 0) / (trip.totalDuration || 7);
      
      if (parksPerDay <= 0.3) styles.relaxed++;
      else if (parksPerDay <= 0.7) styles.balanced++;
      else styles.intensive++;
    });
    
    return styles;
  }

  static analyzeRouteEfficiency(trips) {
    let totalEfficiency = 0;
    let validTrips = 0;
    
    trips.forEach(trip => {
      if (trip.parks?.length >= 2) {
        const milesPerPark = (trip.totalDistance || 0) / trip.parks.length;
        const efficiency = milesPerPark < 150 ? 'high' : milesPerPark < 300 ? 'medium' : 'low';
        
        if (efficiency === 'high') totalEfficiency += 3;
        else if (efficiency === 'medium') totalEfficiency += 2;
        else totalEfficiency += 1;
        
        validTrips++;
      }
    });
    
    return validTrips > 0 ? totalEfficiency / validTrips : 0;
  }

  static analyzeTimingPatterns(trips) {
    const patterns = {
      leadTime: [],
      duration: [],
      seasonalPreference: {}
    };
    
    trips.forEach(trip => {
      if (trip.createdAt && trip.startDate) {
        const leadTime = Math.floor((new Date(trip.startDate) - new Date(trip.createdAt)) / (1000 * 60 * 60 * 24));
        patterns.leadTime.push(leadTime);
      }
      
      if (trip.startDate) {
        const season = this.getSeason(new Date(trip.startDate));
        patterns.seasonalPreference[season] = (patterns.seasonalPreference[season] || 0) + 1;
      }
    });
    
    return patterns;
  }

  static analyzeGroupPatterns(trips) {
    // This would require additional trip data about group size
    // For now, return placeholder structure
    return {
      averageGroupSize: 2, // Default assumption
      soloTrips: 0,
      familyTrips: 0,
      friendTrips: 0
    };
  }

  static generateEfficiencyRecommendations(trips) {
    const recommendations = [];
    const efficiency = this.analyzeEfficiency(trips);
    
    if (efficiency.costPerDay > 250) {
      recommendations.push('Consider longer trips to reduce daily costs');
    }
    
    if (efficiency.milesPerDay > 300) {
      recommendations.push('Plan shorter driving days for better enjoyment');
    }
    
    if (efficiency.parksPerTrip < 2) {
      recommendations.push('Combine nearby parks in single trips for better efficiency');
    }
    
    return recommendations;
  }

  static getCostTrendRecommendation(costTrends) {
    const trend = this.calculateTrend(costTrends.map(t => t.avgCost));
    
    if (trend === 'increasing') {
      return 'Your trip costs are increasing. Consider budget optimization strategies.';
    } else if (trend === 'decreasing') {
      return 'Great! Your trip costs are decreasing while maintaining quality.';
    }
    
    return 'Your trip costs are stable. Look for opportunities to enhance experiences.';
  }
}