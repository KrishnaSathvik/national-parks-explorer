// src/components/TripViewer/tabs/TripOverview.jsx
import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaPlane, FaCar, FaUsers, FaStar, FaInfoCircle } from 'react-icons/fa';
import { formatCurrency, formatDate, formatDuration } from '../../../utils/common/formatters';

const TripOverview = ({ trip }) => {
    // Enhanced transportation display
    const getTransportationInfo = () => {
        const mode = trip.transportationMode || 'driving';
        const icons = {
            driving: { icon: FaCar, color: 'text-green-500', label: 'Road Trip' },
            flying: { icon: FaPlane, color: 'text-blue-500', label: 'Flight + Rental' }
        };
        return icons[mode] || icons.driving;
    };

    const transportInfo = getTransportationInfo();
    const TransportIcon = transportInfo.icon;

    // Trip difficulty assessment
    const getDifficultyInfo = () => {
        const difficulty = trip.preferences?.difficulty || 'moderate';
        const difficultyMap = {
            easy: { label: 'Easy', color: 'text-green-600', bg: 'bg-green-100' },
            moderate: { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' },
            challenging: { label: 'Challenging', color: 'text-red-600', bg: 'bg-red-100' }
        };
        return difficultyMap[difficulty] || difficultyMap.moderate;
    };

    const difficultyInfo = getDifficultyInfo();

    // Calculate trip metrics
    const tripMetrics = {
        avgStayPerPark: trip.parks?.length > 0
            ? Math.round((trip.totalDuration || 1) / trip.parks.length * 10) / 10
            : 0,
        avgCostPerDay: trip.totalDuration > 0
            ? Math.round((trip.estimatedCost || 0) / trip.totalDuration)
            : 0,
        avgCostPerPark: trip.parks?.length > 0
            ? Math.round((trip.estimatedCost || 0) / trip.parks.length)
            : 0
    };

    return (
        <div className="space-y-6">
            {/* Trip Description */}
            {trip.description && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaInfoCircle className="text-blue-600" />
                        Trip Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {trip.description}
                    </p>
                </div>
            )}

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Dates & Duration */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-pink-500" />
                        Timeline
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Start Date:</span>
                            <span className="text-sm font-medium text-gray-800">
                {formatDate(trip.startDate)}
              </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">End Date:</span>
                            <span className="text-sm font-medium text-gray-800">
                {formatDate(trip.endDate)}
              </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Duration:</span>
                            <span className="text-sm font-semibold text-pink-600">
                {formatDuration(trip.totalDuration || 1)}
              </span>
                        </div>
                    </div>
                </div>

                {/* Transportation & Logistics */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TransportIcon className={transportInfo.color} />
                        Travel Details
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Mode:</span>
                            <span className="text-sm font-medium text-gray-800">
                {transportInfo.label}
              </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Distance:</span>
                            <span className="text-sm font-medium text-gray-800">
                {Math.round(trip.totalDistance || 0).toLocaleString()} miles
              </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Difficulty:</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyInfo.bg} ${difficultyInfo.color}`}>
                {difficultyInfo.label}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip Metrics */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Trip Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                            {tripMetrics.avgStayPerPark}
                        </div>
                        <div className="text-xs text-gray-500">Avg Days/Park</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                            {formatCurrency(tripMetrics.avgCostPerDay)}
                        </div>
                        <div className="text-xs text-gray-500">Cost/Day</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                            {formatCurrency(tripMetrics.avgCostPerPark)}
                        </div>
                        <div className="text-xs text-gray-500">Cost/Park</div>
                    </div>
                </div>
            </div>

            {/* Planned Parks */}
            {trip.parks && trip.parks.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-500" />
                            Planned Parks ({trip.parks.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {trip.parks.map((park, index) => (
                            <div key={park.parkId || index} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-800 truncate">
                                                    {park.parkName}
                                                </h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <FaMapMarkerAlt className="text-red-400" />
                                                    {park.state}
                                                </p>
                                            </div>
                                            <div className="text-right ml-2">
                                                <div className="text-sm font-medium text-pink-600">
                                                    {park.stayDuration || 2} day{(park.stayDuration || 2) > 1 ? 's' : ''}
                                                </div>
                                                {park.suggestedActivities && park.suggestedActivities.length > 0 && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {park.suggestedActivities.slice(0, 2).join(', ')}
                                                        {park.suggestedActivities.length > 2 && '...'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Park description if available */}
                                        {park.description && (
                                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                                {park.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trip Preferences */}
            {trip.preferences && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Preferences</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {trip.preferences.activities && trip.preferences.activities.length > 0 && (
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Preferred Activities:</div>
                                <div className="flex flex-wrap gap-1">
                                    {trip.preferences.activities.slice(0, 3).map((activity, index) => (
                                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {activity}
                    </span>
                                    ))}
                                    {trip.preferences.activities.length > 3 && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{trip.preferences.activities.length - 3} more
                    </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {trip.preferences.groupSize && (
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Group Size:</div>
                                <div className="flex items-center gap-1 text-sm text-gray-800">
                                    <FaUsers className="text-gray-500" />
                                    {trip.preferences.groupSize} {trip.preferences.groupSize === 1 ? 'person' : 'people'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Actions or Tips */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    Pro Tips
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                    <li>• Book accommodations 2-3 months in advance for popular parks</li>
                    <li>• Check park websites for seasonal closures and permit requirements</li>
                    <li>• Download offline maps in case of poor cell service</li>
                    {trip.transportationMode === 'driving' && (
                        <li>• Plan rest stops every 2 hours on long driving days</li>
                    )}
                    {trip.parks && trip.parks.length > 3 && (
                        <li>• Consider splitting this into multiple shorter trips for a more relaxed pace</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default TripOverview;