// src/components/TripViewer/tabs/TripItinerary.jsx
import React, { useMemo } from 'react';
import { FaCalendarDay, FaClock, FaMapMarkerAlt, FaRoute, FaPlane, FaCar, FaHiking, FaCamera, FaMountain } from 'react-icons/fa';
import { generateTripItinerary } from '../../../utils/tripPlanner/tripHelpers';
import { formatDate } from '../../../utils/common/formatters';

const TripItinerary = ({ trip }) => {
    // Generate comprehensive itinerary using helper function
    const itinerary = useMemo(() => {
        if (!trip.parks || trip.parks.length === 0 || !trip.startDate) {
            return [];
        }
        return generateTripItinerary(trip);
    }, [trip]);

    // Enhanced activity suggestions based on day type
    const getActivitySuggestions = (park, dayNumber) => {
        const baseActivities = {
            1: [
                { icon: FaMapMarkerAlt, activity: 'Visit Visitor Center', priority: 'high' },
                { icon: FaCamera, activity: 'Scenic Photography', priority: 'medium' },
                { icon: FaCar, activity: 'Easy Scenic Drives', priority: 'medium' }
            ],
            2: [
                { icon: FaHiking, activity: 'Moderate Hiking', priority: 'high' },
                { icon: FaMountain, activity: 'Wildlife Viewing', priority: 'medium' },
                { icon: FaCalendarDay, activity: 'Ranger Programs', priority: 'low' }
            ],
            3: [
                { icon: FaMountain, activity: 'Challenging Hikes', priority: 'high' },
                { icon: FaHiking, activity: 'Backcountry Exploration', priority: 'medium' },
                { icon: FaCamera, activity: 'Sunrise/Sunset Views', priority: 'high' }
            ]
        };

        return baseActivities[Math.min(dayNumber, 3)] || baseActivities[1];
    };

    // Get travel time estimation
    const getTravelInfo = (item) => {
        if (item.estimatedDuration) {
            return `${item.estimatedDuration} hours`;
        }
        return item.mode === 'flying' ? '2-4 hours' : '4-8 hours';
    };

    if (!itinerary || itinerary.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FaCalendarDay className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Itinerary Available</h3>
                <p className="text-sm text-gray-500">
                    Add parks and dates to your trip to generate a detailed itinerary.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Itinerary Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Adventure Timeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-blue-600">
                            {itinerary.filter(item => item.type === 'visit').length}
                        </div>
                        <div className="text-blue-700">Park Days</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-purple-600">
                            {itinerary.filter(item => item.type === 'travel').length}
                        </div>
                        <div className="text-purple-700">Travel Days</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-green-600">
                            {trip.parks?.length || 0}
                        </div>
                        <div className="text-green-700">Destinations</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-orange-600">
                            {trip.totalDuration || 1}
                        </div>
                        <div className="text-orange-700">Total Days</div>
                    </div>
                </div>
            </div>

            {/* Detailed Itinerary */}
            <div className="space-y-3">
                {itinerary.map((item, index) => (
                    <div key={index} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                        item.type === 'visit' ? 'border-green-200' : 'border-blue-200'
                    }`}>

                        {item.type === 'visit' ? (
                            // Park Visit Day
                            <div className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Day indicator */}
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold w-12 h-12 flex items-center justify-center rounded-xl text-sm shadow-lg">
                                        Day {item.dayNumber}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-green-600" />
                                                    {item.park.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {item.park.state} • Day {item.park.stayDay} of {item.park.totalStayDays}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-800">
                                                    {formatDate(item.date)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suggested Activities */}
                                        {item.park.suggestedActivities && item.park.suggestedActivities.length > 0 && (
                                            <div className="mt-3">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Activities:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {getActivitySuggestions(item.park, item.park.stayDay).map((suggestion, actIndex) => {
                                                        const ActivityIcon = suggestion.icon;
                                                        return (
                                                            <div key={actIndex} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                                                                suggestion.priority === 'high'
                                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                                    : suggestion.priority === 'medium'
                                                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                            }`}>
                                                                <ActivityIcon className="text-xs" />
                                                                <span>{suggestion.activity}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Day-specific tips */}
                                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-xs text-green-700">
                                                {item.park.stayDay === 1 && "Start with the visitor center to get park maps and current conditions."}
                                                {item.park.stayDay === 2 && "Perfect day for longer hikes and exploring key attractions."}
                                                {item.park.stayDay >= 3 && "Consider challenging trails or off-the-beaten-path locations."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Travel Day
                            <div className="p-4 bg-blue-50">
                                <div className="flex items-start gap-4">
                                    {/* Travel indicator */}
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-bold w-12 h-12 flex items-center justify-center rounded-xl shadow-lg">
                                        {item.mode === 'flying' ? <FaPlane /> : <FaCar />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    <FaRoute className="text-blue-600" />
                                                    Travel Day
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {item.from.name} → {item.to.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-800">
                                                    {formatDate(item.date)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Est. {getTravelInfo(item)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Travel method details */}
                                        <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                          item.mode === 'flying'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                      }`}>
                        {item.mode === 'flying' ? 'Flight + Rental Car' : 'Road Trip'}
                      </span>
                                            {item.estimatedDuration > 6 && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          Long Travel Day
                        </span>
                                            )}
                                        </div>

                                        {/* Travel suggestions */}
                                        {item.suggestions && item.suggestions.length > 0 && (
                                            <div className="mt-3">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Travel Tips:</h5>
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    {item.suggestions.map((suggestion, suggIndex) => (
                                                        <li key={suggIndex} className="flex items-start gap-2">
                                                            <span className="text-blue-500 mt-0.5">•</span>
                                                            <span>{suggestion}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Trip Summary Footer */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 mt-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">Trip Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                        <div className="font-bold text-purple-600 text-lg">
                            {itinerary.filter(item => item.type === 'visit').length}
                        </div>
                        <div className="text-purple-700">Days Exploring</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                        <div className="font-bold text-purple-600 text-lg">
                            {trip.parks?.length || 0}
                        </div>
                        <div className="text-purple-700">Parks Visited</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                        <div className="font-bold text-purple-600 text-lg">
                            {Math.round(trip.totalDistance || 0).toLocaleString()}
                        </div>
                        <div className="text-purple-700">Miles Traveled</div>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700 text-center">
                        <strong>Remember:</strong> This itinerary is a suggestion. Always check park websites for current conditions,
                        closures, and permit requirements before your trip.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TripItinerary;