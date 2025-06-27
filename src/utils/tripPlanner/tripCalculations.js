// src/utils/tripPlanner/tripCalculations.js
export const calculateTripDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(days, 1);
    } catch (error) {
        console.error('Error calculating trip duration:', error);
        return 1;
    }
};

export const haversineDistance = (coord1, coord2) => {
    if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) {
        return 0;
    }

    const R = 3958.8; // Earth radius in miles
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const calculateTotalDistance = (parks = []) => {
    if (!parks || parks.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < parks.length - 1; i++) {
        const current = parks[i];
        const next = parks[i + 1];

        if (current.coordinates && next.coordinates) {
            const distance = haversineDistance(current.coordinates, next.coordinates);
            totalDistance += distance;
        }
    }

    return Math.round(totalDistance);
};

export const calculateEstimatedCost = (trip) => {
    const duration = calculateTripDuration(trip.startDate, trip.endDate);
    const nights = Math.max(0, duration - 1);
    const distance = calculateTotalDistance(trip.parks);
    const parksCount = trip.parks?.length || 0;

    // Enhanced cost calculations with dynamic pricing
    const accommodation = nights * getCostByLocation(trip.parks, 'accommodation', 85);
    const transportation = trip.transportationMode === 'flying'
        ? calculateFlightCosts(trip.parks, parksCount)
        : calculateDrivingCosts(distance, parksCount);
    const parkFees = parksCount * 30; // $30/park entry fee
    const food = duration * getCostByLocation(trip.parks, 'food', 55);
    const miscellaneous = Math.round((accommodation + transportation + parkFees + food) * 0.15);

    return Math.round(accommodation + transportation + parkFees + food + miscellaneous);
};

// Helper functions for dynamic pricing
const getCostByLocation = (parks, type, baseRate) => {
    if (!parks || parks.length === 0) return baseRate;

    // Adjust costs based on park locations (high-cost areas like California, Utah)
    const highCostStates = ['California', 'Utah', 'Colorado', 'Wyoming'];
    const hasHighCostParks = parks.some(park =>
        highCostStates.includes(park.state)
    );

    return hasHighCostParks ? baseRate * 1.3 : baseRate;
};

const calculateFlightCosts = (parks, parksCount) => {
    // Base flight cost + distance-based pricing
    const baseFlightCost = 275;
    const uniqueStates = new Set(parks.map(park => park.state)).size;

    // More expensive if traveling across multiple states
    const multiplier = uniqueStates > 3 ? 1.2 : 1.0;

    return Math.round(parksCount * baseFlightCost * multiplier);
};

const calculateDrivingCosts = (distance, parksCount) => {
    // Gas + wear & tear + parking fees
    const gasAndWear = distance * 0.35; // Updated rate for 2025
    const parkingFees = parksCount * 15; // Parking at each park

    return Math.round(gasAndWear + parkingFees);
};

// Advanced route optimization using nearest neighbor with 2-opt improvement
export const optimizeTripRoute = (parks) => {
    if (!parks || parks.length <= 2) return parks;

    // Step 1: Nearest neighbor algorithm
    const unvisited = [...parks];
    const optimized = [unvisited.shift()];

    while (unvisited.length > 0) {
        const current = optimized[optimized.length - 1];
        let nearestIndex = 0;
        let minDistance = Infinity;

        unvisited.forEach((park, index) => {
            const distance = haversineDistance(current.coordinates, park.coordinates);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = index;
            }
        });

        optimized.push(unvisited.splice(nearestIndex, 1)[0]);
    }

    // Step 2: 2-opt improvement for better optimization
    return improve2Opt(optimized);
};

const improve2Opt = (route) => {
    if (route.length < 4) return route;

    let improved = true;
    let bestRoute = [...route];

    while (improved) {
        improved = false;

        for (let i = 1; i < route.length - 2; i++) {
            for (let j = i + 1; j < route.length - 1; j++) {
                const newRoute = [...bestRoute];

                // Reverse the segment between i and j
                const segment = newRoute.slice(i, j + 1).reverse();
                newRoute.splice(i, j - i + 1, ...segment);

                if (calculateTotalDistance(newRoute) < calculateTotalDistance(bestRoute)) {
                    bestRoute = newRoute;
                    improved = true;
                }
            }
        }
    }

    return bestRoute;
};

// Smart duration suggestions based on park size and activities
export const suggestParkDuration = (park) => {
    if (!park) return 2;

    const parkSizeFactors = {
        'Yellowstone': 4,
        'Grand Canyon': 3,
        'Yosemite': 3,
        'Glacier': 4,
        'Olympic': 3,
        'Great Smoky Mountains': 2,
        'Zion': 2,
        'Bryce Canyon': 2,
        'Arches': 2,
        'Canyonlands': 3
    };

    // Check if park name contains any of the major parks
    for (const [parkName, days] of Object.entries(parkSizeFactors)) {
        if (park.name && park.name.includes(parkName)) {
            return days;
        }
    }

    // Default suggestion based on description length (indicator of complexity)
    if (park.description && park.description.length > 500) return 3;
    if (park.description && park.description.length > 200) return 2;

    return 2; // Default
};