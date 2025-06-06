// TripStepReview.jsx
import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaRoute, FaDollarSign } from 'react-icons/fa';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const TripStepReview = ({ tripData }) => {
    return (
        <div className="space-y-8">
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Trip Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendarAlt className="text-pink-500" />
                        {formatDate(tripData.startDate)} → {formatDate(tripData.endDate)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="text-blue-500" />
                        {tripData.parks.length} park{tripData.parks.length !== 1 && 's'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaRoute className="text-purple-500" />
                        {tripData.totalDistance} mi
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaDollarSign className="text-green-500" />
                        ${tripData.estimatedCost}
                    </div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Selected Parks</h3>
                {tripData.parks.length === 0 ? (
                    <p className="text-sm text-gray-500">No parks selected.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {tripData.parks.map((park, index) => (
                            <li key={park.parkId} className="py-2 text-sm text-gray-700">
                                <span className="font-semibold">{index + 1}. {park.parkName}</span> — {park.state} • {park.stayDuration} day{park.stayDuration > 1 && 's'}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TripStepReview;