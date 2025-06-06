// TripOptimizer.js (refactored route sorting logic)

// Sort parks to minimize distance using a greedy nearest-neighbor algorithm
export const optimizeTripRoute = (parks) => {
  if (!parks || parks.length <= 2) return parks;

  const visited = new Set();
  const sorted = [parks[0]];
  visited.add(parks[0].parkId);

  while (sorted.length < parks.length) {
    const last = sorted[sorted.length - 1];
    let nearest = null;
    let minDist = Infinity;

    parks.forEach(p => {
      if (visited.has(p.parkId)) return;
      const dist = haversineDistance(last.coordinates, p.coordinates);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    });

    if (nearest) {
      sorted.push(nearest);
      visited.add(nearest.parkId);
    } else {
      break;
    }
  }

  return sorted;
};

export const haversineDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return Infinity;
  const R = 3958.8; // Earth radius in miles
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};