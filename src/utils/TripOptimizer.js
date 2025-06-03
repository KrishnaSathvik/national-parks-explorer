// src/utils/TripOptimizer.js
export class TripOptimizer {
  /**
   * Optimizes the route between parks using nearest neighbor algorithm
   * @param {Array} parks - Array of park objects with coordinates
   * @param {Object} options - Optimization options
   * @returns {Array} - Optimized parks array
   */
  static optimizeRoute(parks, options = {}) {
    if (parks.length <= 2) {
      console.log('Route optimization: Need at least 3 parks for optimization');
      return parks;
    }
    
    const { startIndex = 0, preserveOrder = false } = options;
    
    console.log(`Optimizing route for ${parks.length} parks...`);
    
    // Validate coordinates
    const validParks = parks.filter(park => 
      park.coordinates && park.coordinates.lat && park.coordinates.lng
    );
    
    if (validParks.length !== parks.length) {
      console.warn(`${parks.length - validParks.length} parks missing coordinates`);
    }
    
    if (validParks.length < 2) {
      console.log('Not enough parks with valid coordinates for optimization');
      return parks;
    }
    
    try {
      // Calculate distance matrix
      const distances = this.calculateDistanceMatrix(validParks);
      
      // Use nearest neighbor algorithm for route optimization
      const optimizedIndices = this.nearestNeighborTSP(distances, startIndex);
      
      // Return parks in optimized order
      const optimizedParks = optimizedIndices.map(index => validParks[index]);
      
      // Add back parks without coordinates at the end
      const parksWithoutCoords = parks.filter(park => 
        !park.coordinates || !park.coordinates.lat || !park.coordinates.lng
      );
      
      const finalOptimizedParks = [...optimizedParks, ...parksWithoutCoords];
      
      const savings = this.calculateSavings(parks, finalOptimizedParks);
      console.log(`Route optimized! Distance ${savings > 0 ? 'reduced' : 'optimized'} by ${Math.abs(savings)} miles`);
      
      return finalOptimizedParks;
    } catch (error) {
      console.error('Route optimization failed:', error);
      return parks; // Return original order if optimization fails
    }
  }

  /**
   * Calculates distance matrix between all parks
   * @param {Array} parks - Array of parks with coordinates
   * @returns {Array} - 2D distance matrix
   */
  static calculateDistanceMatrix(parks) {
    const matrix = [];
    for (let i = 0; i < parks.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < parks.length; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = this.haversineDistance(
            parks[i].coordinates,
            parks[j].coordinates
          );
        }
      }
    }
    return matrix;
  }

  /**
   * Nearest Neighbor algorithm for Traveling Salesman Problem
   * @param {Array} distances - Distance matrix
   * @param {number} start - Starting index
   * @returns {Array} - Optimized path indices
   */
  static nearestNeighborTSP(distances, start = 0) {
    const n = distances.length;
    const visited = new Array(n).fill(false);
    const path = [start];
    visited[start] = true;
    
    let current = start;
    for (let i = 1; i < n; i++) {
      let nearest = -1;
      let minDistance = Infinity;
      
      for (let j = 0; j < n; j++) {
        if (!visited[j] && distances[current][j] < minDistance) {
          minDistance = distances[current][j];
          nearest = j;
        }
      }
      
      if (nearest !== -1) {
        visited[nearest] = true;
        path.push(nearest);
        current = nearest;
      }
    }
    
    return path;
  }

  /**
   * Calculates distance between two coordinates using Haversine formula
   * @param {Object} coord1 - {lat, lng}
   * @param {Object} coord2 - {lat, lng}
   * @returns {number} - Distance in miles
   */
  static haversineDistance(coord1, coord2) {
    if (!coord1 || !coord2 || !coord1.lat || !coord2.lat) {
      console.warn('Invalid coordinates provided to haversineDistance');
      return 0;
    }
    
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Calculates total distance for a route
   * @param {Array} parks - Array of parks in order
   * @returns {number} - Total distance in miles
   */
  static calculateTotalDistance(parks) {
    if (parks.length < 2) return 0;
    
    let total = 0;
    for (let i = 0; i < parks.length - 1; i++) {
      const park1 = parks[i];
      const park2 = parks[i + 1];
      
      if (park1.coordinates && park2.coordinates) {
        total += this.haversineDistance(park1.coordinates, park2.coordinates);
      }
    }
    return total;
  }

  /**
   * Calculates distance savings between original and optimized routes
   * @param {Array} originalParks - Original park order
   * @param {Array} optimizedParks - Optimized park order
   * @returns {number} - Distance savings in miles
   */
  static calculateSavings(originalParks, optimizedParks) {
    const originalDistance = this.calculateTotalDistance(originalParks);
    const optimizedDistance = this.calculateTotalDistance(optimizedParks);
    return Math.round(originalDistance - optimizedDistance);
  }

  /**
   * Suggests optimal starting point based on user location
   * @param {Array} parks - Array of parks
   * @param {Object} userLocation - {lat, lng} user coordinates
   * @returns {number} - Index of closest park
   */
  static suggestOptimalStartPoint(parks, userLocation = null) {
    if (!userLocation || parks.length < 2) return 0;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    parks.forEach((park, index) => {
      if (park.coordinates) {
        const distance = this.haversineDistance(userLocation, park.coordinates);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });
    
    return closestIndex;
  }

  /**
   * Analyzes route efficiency and provides insights
   * @param {Array} parks - Array of parks
   * @returns {Object} - Route analysis data
   */
  static analyzeRoute(parks) {
    if (parks.length < 2) {
      return {
        totalDistance: 0,
        averageDistance: 0,
        longestSegment: 0,
        shortestSegment: 0,
        efficiency: 'N/A',
        recommendations: ['Add more parks to analyze route efficiency']
      };
    }

    const distances = [];
    let totalDistance = 0;

    for (let i = 0; i < parks.length - 1; i++) {
      const distance = this.haversineDistance(
        parks[i].coordinates, 
        parks[i + 1].coordinates
      );
      distances.push(distance);
      totalDistance += distance;
    }

    const averageDistance = totalDistance / distances.length;
    const longestSegment = Math.max(...distances);
    const shortestSegment = Math.min(...distances);
    
    // Calculate efficiency score (lower is better)
    const efficiency = longestSegment / averageDistance;
    
    const recommendations = [];
    if (efficiency > 2.5) {
      recommendations.push('Consider reordering parks to reduce long driving segments');
    }
    if (totalDistance > 1500) {
      recommendations.push('Route is quite long - consider splitting into multiple trips');
    }
    if (parks.length > 8) {
      recommendations.push('Large number of parks - ensure adequate time at each location');
    }

    return {
      totalDistance: Math.round(totalDistance),
      averageDistance: Math.round(averageDistance),
      longestSegment: Math.round(longestSegment),
      shortestSegment: Math.round(shortestSegment),
      efficiency: efficiency > 2 ? 'Could be improved' : 'Good',
      recommendations
    };
  }

  /**
   * Optimizes route with time constraints
   * @param {Array} parks - Array of parks with visit dates
   * @param {Object} constraints - Time and distance constraints
   * @returns {Object} - Optimization result with suggestions
   */
  static optimizeWithConstraints(parks, constraints = {}) {
    const {
      maxDailyDriving = 400, // miles
      minStayDuration = 1,   // days
      maxTripDuration = 14   // days
    } = constraints;

    const optimizedParks = this.optimizeRoute(parks);
    const analysis = this.analyzeRoute(optimizedParks);
    
    const violations = [];
    const suggestions = [];

    // Check daily driving limits
    for (let i = 0; i < optimizedParks.length - 1; i++) {
      const distance = this.haversineDistance(
        optimizedParks[i].coordinates,
        optimizedParks[i + 1].coordinates
      );
      
      if (distance > maxDailyDriving) {
        violations.push(`Driving from ${optimizedParks[i].parkName} to ${optimizedParks[i + 1].parkName} exceeds daily limit (${Math.round(distance)} miles)`);
        suggestions.push('Consider adding overnight stops or flying between distant parks');
      }
    }

    // Check stay durations
    optimizedParks.forEach(park => {
      if (park.stayDuration < minStayDuration) {
        suggestions.push(`Consider staying longer at ${park.parkName} for better experience`);
      }
    });

    return {
      optimizedParks,
      analysis,
      violations,
      suggestions,
      feasible: violations.length === 0
    };
  }
}