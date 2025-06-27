// src/utils/tripPlanner/tripHelpers.js
import { calculateEstimatedCost, calculateTripDuration, calculateTotalDistance } from './tripCalculations';

export const createEmptyTrip = () => ({
    id: null,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    parks: [],
    transportationMode: 'driving',
    totalDistance: 0,
    estimatedCost: 0,
    totalDuration: 1,
    isPublic: false,
    createdAt: null,
    updatedAt: null,
    preferences: {
        difficulty: 'moderate',
        activities: [],
        budget: 'moderate',
        groupSize: 2
    }
});

export const validateTrip = (trip) => {
    const errors = {};

    // Basic validation
    if (!trip.title?.trim()) {
        errors.title = 'Trip title is required';
    }

    if (!trip.startDate) {
        errors.startDate = 'Start date is required';
    }

    if (!trip.endDate) {
        errors.endDate = 'End date is required';
    }

    // Date validation
    if (trip.startDate && trip.endDate) {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const today = new Date().setHours(0, 0, 0, 0);

        if (start >= end) {
            errors.endDate = 'End date must be after start date';
        }

        if (start < today) {
            errors.startDate = 'Start date cannot be in the past';
        }

        // Check for reasonable trip length (max 6 months)
        const maxDays = 180;
        const tripDays = calculateTripDuration(trip.startDate, trip.endDate);
        if (tripDays > maxDays) {
            errors.endDate = `Trip cannot be longer than ${maxDays} days`;
        }
    }

    // Parks validation
    if (!trip.parks || trip.parks.length === 0) {
        errors.parks = 'Please select at least one park';
    } else if (trip.parks.length > 20) {
        errors.parks = 'Maximum 20 parks allowed per trip';
    }

    // Transportation validation
    if (!trip.transportationMode) {
        errors.transportationMode = 'Please select a transportation method';
    }

    // Advanced validations
    if (trip.parks && trip.parks.length > 0) {
        const totalStayDays = trip.parks.reduce((sum, park) => sum + (park.stayDuration || 2), 0);
        const tripDuration = calculateTripDuration(trip.startDate, trip.endDate);

        if (totalStayDays > tripDuration + 5) { // Allow some flexibility
            errors.parks = 'Total park stay days exceed trip duration';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const generateTripItinerary = (trip) => {
    if (!trip.parks || trip.parks.length === 0 || !trip.startDate) {
        return [];
    }

    const itinerary = [];
    let currentDate = new Date(trip.startDate);

    trip.parks.forEach((park, index) => {
        const stayDuration = Math.max(1, parseInt(park.stayDuration) || 2);

        // Add park visit days
        for (let day = 0; day < stayDuration; day++) {
            itinerary.push({
                type: 'visit',
                date: new Date(currentDate),
                dayNumber: itinerary.filter(item => item.type === 'visit').length + 1,
                park: {
                    id: park.parkId,
                    name: park.parkName,
                    state: park.state,
                    stayDay: day + 1,
                    totalStayDays: stayDuration,
                    coordinates: park.coordinates,
                    suggestedActivities: getSuggestedActivities(park, day + 1)
                }
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add travel day (except for last park)
        if (index < trip.parks.length - 1) {
            const travelDuration = calculateTravelTime(park, trip.parks[index + 1], trip.transportationMode);

            itinerary.push({
                type: 'travel',
                date: new Date(currentDate),
                dayNumber: null,
                from: {
                    name: park.parkName,
                    state: park.state
                },
                to: {
                    name: trip.parks[index + 1].parkName,
                    state: trip.parks[index + 1].state
                },
                mode: trip.transportationMode,
                estimatedDuration: travelDuration,
                suggestions: getTravelSuggestions(park, trip.parks[index + 1], trip.transportationMode)
            });

            // Add extra travel days for long drives
            if (trip.transportationMode === 'driving' && travelDuration > 8) {
                currentDate.setDate(currentDate.getDate() + 1);
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    return itinerary;
};

// Helper function to suggest activities based on park and day
const getSuggestedActivities = (park, dayNumber) => {
    const activities = {
        1: ['Visitor Center', 'Easy Scenic Drives', 'Photography'],
        2: ['Moderate Hiking', 'Wildlife Viewing', 'Ranger Programs'],
        3: ['Challenging Hikes', 'Backcountry Exploration', 'Sunrise/Sunset Views'],
        4: ['Multi-day Activities', 'Special Tours', 'Rest and Reflection']
    };

    return activities[Math.min(dayNumber, 4)] || activities[1];
};

// Calculate travel time between parks
const calculateTravelTime = (fromPark, toPark, mode) => {
    if (!fromPark.coordinates || !toPark.coordinates) return 4; // Default

    const distance = haversineDistance(fromPark.coordinates, toPark.coordinates);

    if (mode === 'flying') {
        return Math.max(2, Math.ceil(distance / 500)); // Flight time + airport time
    } else {
        const drivingHours = distance / 60; // Assuming 60 mph average
        return Math.max(1, Math.ceil(drivingHours));
    }
};

// Get travel suggestions
const getTravelSuggestions = (fromPark, toPark, mode) => {
    const suggestions = [];

    if (mode === 'driving') {
        suggestions.push('Plan scenic stops along the route');
        suggestions.push('Check road conditions and closures');
        suggestions.push('Book overnight stays if driving time > 6 hours');
    } else {
        suggestions.push('Book flights 2-3 months in advance');
        suggestions.push('Consider rental car at destination');
        suggestions.push('Check baggage restrictions for outdoor gear');
    }

    return suggestions;
};

export const createTripFromTemplate = (template, allParks) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30); // 30 days from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + template.duration);

    // Enhanced park mapping with better matching logic
    const templateParks = template.parks.map(templatePark => {
        const matchingPark = findBestParkMatch(templatePark, allParks);

        if (matchingPark) {
            return {
                parkId: matchingPark.id || matchingPark.parkId,
                parkName: matchingPark.name || matchingPark.fullName,
                state: templatePark.state || matchingPark.state,
                stayDuration: templatePark.days || 2,
                coordinates: parseCoordinates(matchingPark.coordinates),
                description: matchingPark.description || '',
                suggestedActivities: getSuggestedActivities(matchingPark, 1)
            };
        }
        return null;
    }).filter(Boolean);

    return {
        ...createEmptyTrip(),
        title: template.title,
        description: template.description,
        parks: templateParks,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        transportationMode: template.transportation?.mode || 'driving',
        templateId: template.id,
        estimatedCost: template.estimatedCost || calculateEstimatedCost({
            parks: templateParks,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            transportationMode: template.transportation?.mode || 'driving'
        }),
        totalDuration: template.duration,
        preferences: {
            difficulty: template.difficulty || 'moderate',
            activities: template.highlights || [],
            budget: template.budgetLevel || 'moderate',
            groupSize: 2
        }
    };
};

// Enhanced park matching logic
const findBestParkMatch = (templatePark, allParks) => {
    const templateName = templatePark.name.toLowerCase();

    // Direct name match
    let match = allParks.find(park => {
        const parkName = (park.name || park.fullName || '').toLowerCase();
        return parkName === templateName;
    });

    if (match) return match;

    // Partial name match
    match = allParks.find(park => {
        const parkName = (park.name || park.fullName || '').toLowerCase();
        return parkName.includes(templateName.split(' ')[0]) ||
            templateName.includes(parkName.split(' ')[0]);
    });

    if (match) return match;

    // State-based match as fallback
    return allParks.find(park =>
        park.state === templatePark.state &&
        park.name && park.name.toLowerCase().includes('national')
    );
};

// Parse coordinates safely
const parseCoordinates = (coordinates) => {
    if (!coordinates) return { lat: 0, lng: 0 };

    if (typeof coordinates === 'string' && coordinates.includes(',')) {
        const [lat, lng] = coordinates.split(',').map(val => parseFloat(val.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    } else if (coordinates.lat && coordinates.lng) {
        return {
            lat: parseFloat(coordinates.lat),
            lng: parseFloat(coordinates.lng)
        };
    }

    return { lat: 0, lng: 0 };
};

export const exportTripToJSON = (trip) => {
    const exportData = {
        metadata: {
            exportedAt: new Date().toISOString(),
            version: '2.0',
            source: 'National Parks Explorer'
        },
        trip: {
            title: trip.title,
            description: trip.description,
            startDate: trip.startDate,
            endDate: trip.endDate,
            transportationMode: trip.transportationMode,
            preferences: trip.preferences
        },
        itinerary: generateTripItinerary(trip),
        parks: trip.parks.map(park => ({
            name: park.parkName,
            state: park.state,
            stayDuration: park.stayDuration,
            coordinates: park.coordinates,
            suggestedActivities: park.suggestedActivities
        })),
        budget: {
            estimatedCost: trip.estimatedCost,
            breakdown: getCostBreakdown(trip)
        },
        logistics: {
            totalDistance: trip.totalDistance,
            totalDuration: trip.totalDuration,
            transportationMode: trip.transportationMode
        }
    };

    return JSON.stringify(exportData, null, 2);
};

export const shareTrip = async (trip) => {
    const shareData = {
        title: `${trip.title} - National Parks Adventure`,
        text: `Join me on a ${trip.totalDuration}-day journey through ${trip.parks?.length || 0} amazing national parks! Estimated cost: $${trip.estimatedCost?.toLocaleString()}`,
        url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            return { success: true, method: 'native' };
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                return { success: false, error: 'Failed to share' };
            }
            return { success: false, error: 'Share cancelled' };
        }
    } else {
        // Enhanced fallback with multiple options
        try {
            const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
            await navigator.clipboard.writeText(shareText);
            return { success: true, method: 'clipboard' };
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return { success: false, error: 'Failed to copy to clipboard' };
        }
    }
};

// Enhanced cost breakdown calculation
const getCostBreakdown = (trip) => {
    const duration = calculateTripDuration(trip.startDate, trip.endDate);
    const nights = Math.max(0, duration - 1);
    const distance = calculateTotalDistance(trip.parks);
    const parksCount = trip.parks?.length || 0;

    const accommodation = nights * 85;
    const transportation = trip.transportationMode === 'flying'
        ? parksCount * 275
        : distance * 0.35 + (parksCount * 15);
    const parkFees = parksCount * 30;
    const food = duration * 55;
    const miscellaneous = Math.round((accommodation + transportation + parkFees + food) * 0.15);

    return {
        accommodation: Math.round(accommodation),
        transportation: Math.round(transportation),
        parkFees: Math.round(parkFees),
        food: Math.round(food),
        miscellaneous: Math.round(miscellaneous),
        total: Math.round(accommodation + transportation + parkFees + food + miscellaneous)
    };
};