// TripAnalytics.js (refactored logic utilities)

export const getMostVisitedStates = (trips) => {
  const stateCounts = {};
  trips.forEach(trip => {
    trip.parks?.forEach(park => {
      const state = park.state;
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });
  });
  return Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => ({ state, count }));
};

export const getParkVisitFrequency = (trips) => {
  const parkCounts = {};
  trips.forEach(trip => {
    trip.parks?.forEach(park => {
      const key = park.parkName || park.parkId;
      parkCounts[key] = (parkCounts[key] || 0) + 1;
    });
  });
  return Object.entries(parkCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
};

export const getTravelStats = (trips) => {
  return {
    totalTrips: trips.length,
    totalParks: trips.reduce((sum, t) => sum + (t.parks?.length || 0), 0),
    totalDistance: trips.reduce((sum, t) => sum + (t.totalDistance || 0), 0),
    totalCost: trips.reduce((sum, t) => sum + (t.estimatedCost || 0), 0),
    avgTripLength: trips.length ? Math.round(trips.reduce((sum, t) => sum + (t.totalDuration || 1), 0) / trips.length) : 0
  };
};