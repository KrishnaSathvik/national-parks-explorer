// ============================================
// src/components/TripAnalytics.jsx
import React from 'react';
import { FaChartBar, FaRoute, FaMapMarkerAlt, FaDollarSign, FaBrain } from 'react-icons/fa';
import { getTravelStats, getMostVisitedStates, getTransportationBreakdown } from '../utils/tripPlanner/tripAnalytics'; // ✅ Updated import
import { formatCurrency } from '../utils/common/formatters'; // ✅ Updated import

const TripAnalytics = ({ trips }) => {
    const stats = getTravelStats(trips);
    const topStates = getMostVisitedStates(trips);
    const transportBreakdown = getTransportationBreakdown(trips);

    if (trips.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Analytics Available</h3>
                <p className="text-gray-600 mb-6">Create some trips to see detailed analytics and insights!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 Your Travel Analytics</h3>
                <p className="text-gray-600">Insights from your {trips.length} planned trip{trips.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl text-white text-center transform hover:scale-105 transition-all duration-200">
                    <div className="text-3xl font-bold">{stats.totalTrips}</div>
                    <div className="text-blue-100 text-sm">Total Trips</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl text-white text-center transform hover:scale-105 transition-all duration-200">
                    <div className="text-3xl font-bold">{stats.totalParks}</div>
                    <div className="text-purple-100 text-sm">Parks to Visit</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl text-white text-center transform hover:scale-105 transition-all duration-200">
                    <div className="text-3xl font-bold">{stats.totalDays}</div>
                    <div className="text-green-100 text-sm">Total Days</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-2xl text-white text-center transform hover:scale-105 transition-all duration-200">
                    <div className="text-3xl font-bold">{formatCurrency(stats.totalCost)}</div>
                    <div className="text-yellow-100 text-sm">Total Budget</div>
                </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Transportation Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaRoute className="text-blue-500" />
                        Transportation Preferences
                    </h4>
                    <div className="space-y-4">
                        {transportBreakdown.map(({ mode, count, percentage }) => (
                            <div key={mode} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="capitalize font-medium">
                                        {mode === 'driving' ? '🚗 Road Trips' : '✈️ Air Travel'}
                                    </span>
                                    <span className="font-semibold">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${
                                            mode === 'driving'
                                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-sm text-gray-600">{count} trip{count !== 1 ? 's' : ''}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Destinations */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-green-500" />
                        Popular States
                    </h4>
                    <div className="space-y-3">
                        {topStates.slice(0, 5).map(({ state, count }, index) => {
                            const maxCount = topStates[0]?.count || 1;
                            const percentage = (count / maxCount) * 100;

                            return (
                                <div key={state} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-700">{state}</span>
                                        <span className="font-semibold text-gray-800">{count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Trip Breakdown */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaChartBar className="text-purple-500" />
                    Trip Breakdown
                </h4>
                <div className="space-y-4">
                    {trips.map((trip, index) => (
                        <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                                    ['from-pink-500 to-rose-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-indigo-500'][index % 4]
                                }`}></div>
                                <div>
                                    <h5 className="font-semibold text-gray-800">{trip.title}</h5>
                                    <div className="text-sm text-gray-600">
                                        {trip.parks?.length || 0} parks • {trip.totalDuration || 1} days
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-gray-800">{formatCurrency(trip.estimatedCost || 0)}</div>
                                <div className="text-sm text-gray-600">Budget</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <FaBrain className="text-purple-600" />
                    Smart Travel Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Average trip cost: {formatCurrency(stats.avgTripCost || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Average parks per trip: {stats.avgParksPerTrip || 0}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Average trip length: {stats.avgTripLength || 0} days</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Most expensive trip: {formatCurrency(Math.max(...trips.map(t => t.estimatedCost || 0)))}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripAnalytics;