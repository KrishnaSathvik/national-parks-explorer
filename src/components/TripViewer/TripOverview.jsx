// TripOverview.jsx
import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaPlane, FaCar } from 'react-icons/fa';

const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const TripOverview = ({ trip }) => {
    return (
        <div className="space-y-6">
            {/* Description */}
            {trip.description && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Trip Summary</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {trip.description}
                    </p>
                </div>
            )}

            {/* Trip Dates */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Dates & Duration</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-pink-500" />
                    <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Estimated {trip.totalDuration || 1} day{trip.totalDuration > 1 ? 's' : ''}
                </p>
            </div>

            {/* Transportation Mode */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Transportation</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 capitalize">
                    {trip.transportationMode === 'flying' ? <FaPlane className="text-blue-500" /> : <FaCar className="text-green-500" />}
                    <span>{trip.transportationMode || 'not set'}</span>
                </div>
            </div>

            {/* Park List */}
            {trip.parks && trip.parks.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Planned Parks</h3>
                    <ul className="divide-y divide-gray-200 border border-gray-100 rounded-xl overflow-hidden">
                        {trip.parks.map((park, index) => (
                            <li key={park.parkId || index} className="p-4 bg-white hover:bg-gray-50">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-800 truncate">{park.parkName}</h4>
                                        <p className="text-xs text-gray-500">
                                            {park.state} • {park.stayDuration || 2} day{park.stayDuration > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TripOverview;
