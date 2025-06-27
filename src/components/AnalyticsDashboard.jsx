// AnalyticsDashboard.jsx (Updated with new formatters)
import React from 'react';
import { FaMapMarkedAlt, FaRoute, FaDollarSign, FaClock } from 'react-icons/fa';
import { formatNumber, formatCurrency } from '../utils/common/formatters'; // ✅ Updated import

const AnalyticsDashboard = ({ trips }) => {
    const totalTrips = trips.length;
    const totalParks = trips.reduce((sum, t) => sum + (t.parks?.length || 0), 0);
    const totalMiles = trips.reduce((sum, t) => sum + (t.totalDistance || 0), 0);
    const totalCost = trips.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
    const totalDays = trips.reduce((sum, t) => sum + (t.totalDuration || 0), 0);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Trip Analytics Summary</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-xl text-center transform hover:scale-105 transition-all duration-200 shadow-lg">
                    <FaRoute className="text-2xl mx-auto mb-2 text-blue-100" />
                    <div className="text-lg font-bold">{totalTrips}</div>
                    <div className="text-sm text-blue-100">Trips Planned</div>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-red-400 text-white p-4 rounded-xl text-center transform hover:scale-105 transition-all duration-200 shadow-lg">
                    <FaMapMarkedAlt className="text-2xl mx-auto mb-2 text-pink-100" />
                    <div className="text-lg font-bold">{totalParks}</div>
                    <div className="text-sm text-pink-100">Parks to Visit</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-4 rounded-xl text-center transform hover:scale-105 transition-all duration-200 shadow-lg">
                    <FaRoute className="text-2xl mx-auto mb-2 text-purple-100" />
                    <div className="text-lg font-bold">{formatNumber(totalMiles)} mi</div>
                    <div className="text-sm text-purple-100">Total Distance</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-4 rounded-xl text-center transform hover:scale-105 transition-all duration-200 shadow-lg">
                    <FaDollarSign className="text-2xl mx-auto mb-2 text-green-100" />
                    <div className="text-lg font-bold">{formatCurrency(totalCost)}</div> {/* ✅ Better currency formatting */}
                    <div className="text-sm text-green-100">Estimated Budget</div>
                </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <FaClock className="text-2xl mx-auto mb-2 text-gray-400" />
                    <div className="text-lg font-bold text-gray-800">{totalDays}</div>
                    <div className="text-sm text-gray-600">Total Days</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-lg font-bold text-gray-800">
                        {totalTrips > 0 ? Math.round(totalParks / totalTrips * 10) / 10 : 0}
                    </div>
                    <div className="text-sm text-gray-600">Avg Parks/Trip</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-lg font-bold text-gray-800">
                        {formatCurrency(totalTrips > 0 ? totalCost / totalTrips : 0)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Trip Cost</div>
                </div>
            </div>

            {/* Placeholder for future charts */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-gray-600 text-sm">
                    Interactive charts showing trip trends, cost breakdowns, popular destinations, and seasonal patterns
                </p>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;