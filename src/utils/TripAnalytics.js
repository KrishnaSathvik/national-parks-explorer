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
        
      budgetRange: preferences.budgetRange.length > 0 ? {
        min: Math.min(...preferences.budgetRange),
        max: Math.max(...preferences.budgetRange),
        median: this.calculateMedian(preferences.budgetRange)
      } : { min: 0, max: 0, median: 0 },
      
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
   * Compares user trips to benchmarks and global averages
   * @param {Array} userTrips - User's trip data
   * @param {Array} allTrips - Global trip data for benchmarking
   * @returns {Object} Benchmark comparison data
   */
  static compareToBenchmarks(userTrips, allTrips = []) {
    if (userTrips.length === 0) {
      return {
        costComparison: { status: 'insufficient data' },
        durationComparison: { status: 'insufficient data' },
        popularityComparison: { status: 'insufficient data' },
        efficiencyComparison: { status: 'insufficient data' }
      };
    }

    // Calculate user averages
    const userAvgs = this.calculateUserAverages(userTrips);
    
    // If no benchmark data available, return user data only
    if (allTrips.length === 0) {
      return {
        costComparison: {
          userAverage: userAvgs.avgCost,
          benchmarkAverage: null,
          status: 'no benchmark data',
          percentile: null
        },
        durationComparison: {
          userAverage: userAvgs.avgDuration,
          benchmarkAverage: null,
          status: 'no benchmark data',
          percentile: null
        },
        popularityComparison: {
          userTopParks: userAvgs.topParks,
          benchmarkTopParks: [],
          status: 'no benchmark data'
        },
        efficiencyComparison: {
          userScore: userAvgs.efficiencyScore,
          benchmarkScore: null,
          status: 'no benchmark data'
        }
      };
    }

    // Calculate benchmark averages
    const benchmarkAvgs = this.calculateUserAverages(allTrips);
    
    return {
      costComparison: {
        userAverage: userAvgs.avgCost,
        benchmarkAverage: benchmarkAvgs.avgCost,
        percentile: this.calculatePercentile(userAvgs.avgCost, allTrips.map(t => t.estimatedCost || 0)),
        status: userAvgs.avgCost > benchmarkAvgs.avgCost ? 'above average' : 'below average',
        difference: Math.abs(userAvgs.avgCost - benchmarkAvgs.avgCost),
        percentageDiff: benchmarkAvgs.avgCost > 0 ? Math.round(((userAvgs.avgCost - benchmarkAvgs.avgCost) / benchmarkAvgs.avgCost) * 100) : 0
      },
      durationComparison: {
        userAverage: userAvgs.avgDuration,
        benchmarkAverage: benchmarkAvgs.avgDuration,
        percentile: this.calculatePercentile(userAvgs.avgDuration, allTrips.map(t => t.totalDuration || 0)),
        status: userAvgs.avgDuration > benchmarkAvgs.avgDuration ? 'longer trips' : 'shorter trips',
        difference: Math.abs(userAvgs.avgDuration - benchmarkAvgs.avgDuration)
      },
      popularityComparison: {
        userTopParks: userAvgs.topParks,
        benchmarkTopParks: benchmarkAvgs.topParks,
        uniqueParks: this.findUniqueParks(userAvgs.topParks, benchmarkAvgs.topParks),
        status: 'analyzed'
      },
      efficiencyComparison: {
        userScore: userAvgs.efficiencyScore,
        benchmarkScore: benchmarkAvgs.efficiencyScore,
        percentile: this.calculatePercentile(userAvgs.efficiencyScore, allTrips.map(t => this.calculateSingleTripEfficiency(t))),
        status: userAvgs.efficiencyScore > benchmarkAvgs.efficiencyScore ? 'above average' : 'below average'
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
        trend: costTrends.length > 0 ? this.calculateTrend(costTrends.map(t => t.avgCost)) : 'insufficient data',
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

      const costPerDay = totalDuration > 0 ? Math.round(totalCost / totalDuration) : 0;
      const costPerPark = totalParks > 0 ? Math.round(totalCost / totalParks) : 0;
      const milesPerDay = totalDuration > 0 ? Math.round(totalDistance / totalDuration) : 0;
      const parksPerTrip = trips.length > 0 ? Math.round((totalParks / trips.length) * 10) / 10 : 0;
      const efficiencyScore = this.calculateEfficiencyScore(trips);

      // Generate recommendations directly here instead of calling separate method
      const recommendations = [];
      
      if (costPerDay > 250) {
        recommendations.push('Consider longer trips to reduce daily costs');
      }
      
      if (milesPerDay > 300) {
        recommendations.push('Plan shorter driving days for better enjoyment');
      }
      
      if (parksPerTrip < 2) {
        recommendations.push('Combine nearby parks in single trips for better efficiency');
      }

      return {
        costPerDay,
        costPerPark,
        milesPerDay,
        parksPerTrip,
        efficiencyScore,
        recommendations
      };
    }

  // === COST ANALYSIS METHODS ===

  /**
   * Analyzes cost efficiency patterns
   * @param {Array} trips - User's trips
   * @returns {Object} Cost efficiency analysis
   */
  static analyzeCostEfficiency(trips) {
    if (trips.length === 0) {
      return {
        costPerMile: 0,
        costPerDay: 0,
        costPerPark: 0,
        efficiencyRating: 'insufficient data',
        recommendations: []
      };
    }

    let totalCost = 0;
    let totalMiles = 0;
    let totalDays = 0;
    let totalParks = 0;

    trips.forEach(trip => {
      totalCost += trip.estimatedCost || 0;
      totalMiles += trip.totalDistance || 0;
      totalDays += trip.totalDuration || 0;
      totalParks += trip.parks?.length || 0;
    });

    const costPerMile = totalMiles > 0 ? totalCost / totalMiles : 0;
    const costPerDay = totalDays > 0 ? totalCost / totalDays : 0;
    const costPerPark = totalParks > 0 ? totalCost / totalParks : 0;

    // Determine efficiency rating
    let efficiencyRating = 'poor';
    if (costPerDay < 200 && costPerMile < 1.5) efficiencyRating = 'excellent';
    else if (costPerDay < 300 && costPerMile < 2.0) efficiencyRating = 'good';
    else if (costPerDay < 400 && costPerMile < 3.0) efficiencyRating = 'fair';

    const recommendations = [];
    if (costPerDay > 300) {
      recommendations.push('Consider longer trips to reduce daily costs');
    }
    if (costPerMile > 2.0) {
      recommendations.push('Optimize routes to reduce cost per mile');
    }
    if (costPerPark > 500) {
      recommendations.push('Visit more parks per trip for better value');
    }

    return {
      costPerMile: Math.round(costPerMile * 100) / 100,
      costPerDay: Math.round(costPerDay),
      costPerPark: Math.round(costPerPark),
      efficiencyRating,
      recommendations
    };
  }

  /**
   * Finds cost optimization opportunities
   * @param {Array} trips - User's trips
   * @returns {Array} Array of optimization opportunities
   */
  static findCostOptimizations(trips) {
    const optimizations = [];
    const preferences = this.analyzePersonalPreferences(trips);
    
    if (preferences.avgBudget > 2500) {
      optimizations.push({
        category: 'accommodation',
        potential: '20-40%',
        suggestion: 'Consider camping or budget lodging options',
        impact: 'high'
      });
    }
    
    if (preferences.transportationSplit.driving > 70) {
      optimizations.push({
        category: 'transportation',
        potential: '15-25%',
        suggestion: 'Group nearby parks in single trips to reduce fuel costs',
        impact: 'medium'
      });
    }

    if (preferences.avgDuration < 5) {
      optimizations.push({
        category: 'duration',
        potential: '10-20%',
        suggestion: 'Extend trip length for better cost per day',
        impact: 'medium'
      });
    }
    
    return optimizations;
  }

  /**
   * Generates budget recommendations
   * @param {Array} trips - User's trips
   * @returns {Array} Array of budget recommendations
   */
  static generateBudgetRecommendations(trips) {
    const preferences = this.analyzePersonalPreferences(trips);
    const recommendations = [];
    
    if (preferences.avgBudget < 1500) {
      recommendations.push('Consider extending trips for better value per day');
      recommendations.push('Look into mid-range accommodations for better comfort');
    }
    
    if (preferences.avgBudget > 4000) {
      recommendations.push('Look into luxury camping or unique accommodations');
      recommendations.push('Consider guided tours or premium experiences');
    }

    if (preferences.avgBudget >= 1500 && preferences.avgBudget <= 4000) {
      recommendations.push('Your budget range is well-balanced for quality experiences');
      recommendations.push('Consider seasonal variations for better value');
    }
    
    return recommendations;
  }

  // === TRAVEL PATTERN ANALYSIS METHODS ===

  /**
   * Categorizes trip styles based on intensity
   * @param {Array} trips - User's trips
   * @returns {Object} Trip style categorization
   */
  static categorizeTripStyles(trips) {
    const styles = { relaxed: 0, balanced: 0, intensive: 0 };
    
    trips.forEach(trip => {
      const duration = trip.totalDuration || 7;
      const parksCount = trip.parks?.length || 0;
      const parksPerDay = parksCount / duration;
      
      if (parksPerDay <= 0.3) {
        styles.relaxed++;
      } else if (parksPerDay <= 0.7) {
        styles.balanced++;
      } else {
        styles.intensive++;
      }
    });
    
    return styles;
  }

  /**
   * Analyzes route efficiency across trips
   * @param {Array} trips - User's trips
   * @returns {Object} Route efficiency analysis
   */
  static analyzeRouteEfficiency(trips) {
    let totalEfficiency = 0;
    let validTrips = 0;
    
    trips.forEach(trip => {
      if (trip.parks?.length >= 2 && trip.totalDistance) {
        const milesPerPark = trip.totalDistance / trip.parks.length;
        let efficiency = 0;
        
        if (milesPerPark < 150) efficiency = 3; // high
        else if (milesPerPark < 300) efficiency = 2; // medium
        else efficiency = 1; // low
        
        totalEfficiency += efficiency;
        validTrips++;
      }
    });
    
    const avgEfficiency = validTrips > 0 ? totalEfficiency / validTrips : 0;
    
    return {
      averageEfficiency: Math.round(avgEfficiency * 100) / 100,
      rating: avgEfficiency >= 2.5 ? 'high' : avgEfficiency >= 1.5 ? 'medium' : 'low',
      validTrips,
      recommendations: avgEfficiency < 2 ? [
        'Plan more direct routes between parks',
        'Consider clustering nearby parks together',
        'Use route optimization tools'
      ] : []
    };
  }

  /**
   * Analyzes timing patterns in trip planning
   * @param {Array} trips - User's trips
   * @returns {Object} Timing pattern analysis
   */
  static analyzeTimingPatterns(trips) {
    const patterns = {
      leadTime: [],
      duration: [],
      seasonalPreference: { spring: 0, summer: 0, fall: 0, winter: 0 },
      dayOfWeekStart: {}
    };
    
    trips.forEach(trip => {
      // Calculate lead time (planning ahead)
      if (trip.createdAt && trip.startDate) {
        const leadTime = Math.floor((new Date(trip.startDate) - new Date(trip.createdAt)) / (1000 * 60 * 60 * 24));
        if (leadTime >= 0) patterns.leadTime.push(leadTime);
      }
      
      // Duration patterns
      if (trip.totalDuration) {
        patterns.duration.push(trip.totalDuration);
      }
      
      // Seasonal preferences
      if (trip.startDate) {
        const season = this.getSeason(new Date(trip.startDate));
        patterns.seasonalPreference[season]++;
        
        // Day of week preferences
        const dayOfWeek = new Date(trip.startDate).toLocaleDateString('en-US', { weekday: 'long' });
        patterns.dayOfWeekStart[dayOfWeek] = (patterns.dayOfWeekStart[dayOfWeek] || 0) + 1;
      }
    });
    
    return {
      averageLeadTime: patterns.leadTime.length > 0 ? 
        Math.round(patterns.leadTime.reduce((a, b) => a + b, 0) / patterns.leadTime.length) : 0,
      averageDuration: patterns.duration.length > 0 ?
        Math.round((patterns.duration.reduce((a, b) => a + b, 0) / patterns.duration.length) * 10) / 10 : 0,
      seasonalPreference: patterns.seasonalPreference,
      dayOfWeekStart: patterns.dayOfWeekStart,
      planningStyle: patterns.leadTime.length > 0 ? 
        (patterns.leadTime.reduce((a, b) => a + b, 0) / patterns.leadTime.length > 30 ? 'planner' : 'spontaneous') : 'unknown'
    };
  }

  /**
   * Analyzes group size patterns (placeholder for future enhancement)
   * @param {Array} trips - User's trips
   * @returns {Object} Group pattern analysis
   */
  static analyzeGroupPatterns(trips) {
    // This would require additional trip data about group size
    // For now, return estimated structure based on available data
    return {
      averageGroupSize: 2, // Default assumption for couples/families
      estimatedSoloTrips: Math.floor(trips.length * 0.2),
      estimatedFamilyTrips: Math.floor(trips.length * 0.6),
      estimatedFriendTrips: Math.floor(trips.length * 0.2),
      dataSource: 'estimated' // Indicates this is estimated data
    };
  }

  // === HELPER METHODS ===

  /**
   * Helper method to calculate user averages for benchmarking
   */
  static calculateUserAverages(trips) {
    if (trips.length === 0) return { avgCost: 0, avgDuration: 0, topParks: [], efficiencyScore: 0 };

    const totalCost = trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0);
    const totalDuration = trips.reduce((sum, trip) => sum + (trip.totalDuration || 0), 0);
    
    // Get top parks
    const parkCounts = {};
    trips.forEach(trip => {
      trip.parks?.forEach(park => {
        parkCounts[park.parkName] = (parkCounts[park.parkName] || 0) + 1;
      });
    });
    
    const topParks = Object.entries(parkCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      avgCost: Math.round(totalCost / trips.length),
      avgDuration: Math.round((totalDuration / trips.length) * 10) / 10,
      topParks,
      efficiencyScore: this.calculateEfficiencyScore(trips)
    };
  }

  /**
   * Calculate percentile ranking
   */
  static calculatePercentile(value, allValues) {
    if (allValues.length === 0) return null;
    
    const validValues = allValues.filter(v => v > 0);
    if (validValues.length === 0) return null;
    
    const sorted = [...validValues].sort((a, b) => a - b);
    const rank = sorted.findIndex(v => v >= value);
    
    if (rank === -1) return 100; // Value is higher than all others
    
    return Math.round((rank / sorted.length) * 100);
  }

  /**
   * Find parks unique to user compared to benchmark
   */
  static findUniqueParks(userParks, benchmarkParks) {
    const benchmarkParkNames = new Set(benchmarkParks.map(p => p.name));
    return userParks.filter(park => !benchmarkParkNames.has(park.name));
  }

  /**
   * Calculate efficiency score for a single trip
   */
  static calculateSingleTripEfficiency(trip) {
    let score = 50; // Base score
    
    const costPerDay = (trip.estimatedCost || 0) / (trip.totalDuration || 7);
    if (costPerDay < 200) score += 20;
    else if (costPerDay < 300) score += 10;
    
    const parksCount = trip.parks?.length || 0;
    if (parksCount >= 5) score += 15;
    else if (parksCount >= 3) score += 10;
    else if (parksCount >= 2) score += 5;
    
    const milesPerPark = parksCount > 0 ? (trip.totalDistance || 0) / parksCount : 0;
    if (milesPerPark < 100) score += 15;
    else if (milesPerPark < 200) score += 10;
    else if (milesPerPark < 300) score += 5;
    
    return Math.min(100, score);
  }

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

    if (total === 0) {
      return {
        accommodation: { amount: 0, percentage: 0 },
        transportation: { amount: 0, percentage: 0 },
        food: { amount: 0, percentage: 0 },
        fees: { amount: 0, percentage: 0 }
      };
    }

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
      const costPerDay = (trip.estimatedCost || 0) / (trip.totalDuration || 7);
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

  static getEmptyInsights() {
    return {
      personalPreferences: {
        topRegions: [],
        avgDuration: 0,
        avgBudget: 0,
        budgetRange: { min: 0, max: 0, median: 0 },
        favoriteSeasons: [],
        topParkTypes: [],
        transportationSplit: { driving: 0, flying: 0 }
      },
      benchmarkComparisons: {
        costComparison: { status: 'insufficient data' },
        durationComparison: { status: 'insufficient data' },
        popularityComparison: { status: 'insufficient data' },
        efficiencyComparison: { status: 'insufficient data' }
      },
      recommendations: [],
      trendAnalysis: {
        tripFrequency: { data: [], trend: 'insufficient data', peakMonths: [] },
        costEvolution: { data: [], trend: 'insufficient data', recommendation: null },
        parkPopularity: []
      },
      costOptimization: {
        breakdown: {
          accommodation: { amount: 0, percentage: 0 },
          transportation: { amount: 0, percentage: 0 },
          food: { amount: 0, percentage: 0 },
          fees: { amount: 0, percentage: 0 }
        },
        efficiency: {
          costPerMile: 0,
          costPerDay: 0,
          costPerPark: 0,
          efficiencyRating: 'insufficient data',
          recommendations: []
        },
        optimizationOpportunities: [],
        budgetRecommendations: []
      },
      travelPatterns: {
        tripStyles: { relaxed: 0, balanced: 0, intensive: 0 },
        routeEfficiency: {
          averageEfficiency: 0,
          rating: 'unknown',
          validTrips: 0,
          recommendations: []
        },
        timingPatterns: {
          averageLeadTime: 0,
          averageDuration: 0,
          seasonalPreference: { spring: 0, summer: 0, fall: 0, winter: 0 },
          dayOfWeekStart: {},
          planningStyle: 'unknown'
        },
        groupSizePatterns: {
          averageGroupSize: 2,
          estimatedSoloTrips: 0,
          estimatedFamilyTrips: 0,
          estimatedFriendTrips: 0,
          dataSource: 'estimated'
        }
      },
      efficiency: {
        costPerDay: 0,
        costPerPark: 0,
        milesPerDay: 0,
        parksPerTrip: 0,
        efficiencyScore: 0,
        recommendations: []
      }
    };
  }
}