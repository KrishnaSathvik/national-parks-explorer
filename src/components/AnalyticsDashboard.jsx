// AnalyticsDashboard.jsx (Refactored for clarity and chart display)
import React from 'react';
import { FaMapMarkedAlt, FaRoute, FaDollarSign } from 'react-icons/fa';
import { formatNumber } from '../utils/formatUtils';

const AnalyticsDashboard = ({ trips }) => {
    const totalTrips = trips.length;
    const totalParks = trips.reduce((sum, t) => sum + (t.parks?.length || 0), 0);
    const totalMiles = trips.reduce((sum, t) => sum + (t.totalDistance || 0), 0);
    const totalCost = trips.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Trip Analytics Summary</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-xl text-center">
                    <div className="text-lg font-bold">{totalTrips}</div>
                    <div className="text-sm">Trips Planned</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-red-400 text-white p-4 rounded-xl text-center">
                    <div className="text-lg font-bold">{totalParks}</div>
                    <div className="text-sm">Parks Visited</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-4 rounded-xl text-center">
                    <div className="text-lg font-bold">{formatNumber(totalMiles)} mi</div>
                    <div className="text-sm">Total Distance</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-4 rounded-xl text-center">
                    <div className="text-lg font-bold">${formatNumber(totalCost)}</div>
                    <div className="text-sm">Estimated Spend</div>
                </div>
            </div>

            {/* Insert charts/visuals if needed here */}
            <div className="mt-6 text-center text-gray-400 text-sm italic">
                Add charts for trips over time, cost distribution, or most visited parks.
            </div>
        </div>
    );
};

export default AnalyticsDashboard;