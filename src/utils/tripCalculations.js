// tripCalculations.js

export const calculateTripDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(days, 1);
};

export const calculateTotalDistance = (parks = []) => {
    return parks.reduce((sum, park) => sum + (park.distance || 0), 0);
};

export const calculateEstimatedCost = (trip) => {
    const duration = calculateTripDuration(trip.startDate, trip.endDate);
    const nights = Math.max(0, duration - 1);
    const distance = calculateTotalDistance(trip.parks);
    const parksCount = trip.parks?.length || 0;

    const accommodation = nights * 85;
    const transportation = trip.transportationMode === 'flying'
        ? parksCount * 275
        : distance * 0.2;
    const parkFees = parksCount * 30;
    const food = duration * 55;

    return Math.round(accommodation + transportation + parkFees + food);
};
