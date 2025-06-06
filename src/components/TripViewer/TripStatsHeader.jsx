// TripStatsHeader.jsx
import React from 'react';
import { FaEdit, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaRoute, FaDollarSign } from 'react-icons/fa';

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

const formatNumber = (num, unit = '') => {
    if (!num || num === 0) return `0${unit}`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${unit}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k${unit}`;
    return `${Math.round(num)}${unit}`;
};

const TripStatsHeader = ({ trip, onEdit, onClose }) => {
    const duration = trip.totalDuration || 0;
    const totalDistance = trip.totalDistance || 0;
    const estimatedCost = trip.estimatedCost || 0;
    const parksCount = trip.parks?.length || 0;

    return (
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 line-clamp-2">
                            {trip.title || 'Untitled Trip'}
                        </h2>
                        {trip.description && (
                            <p className="text-pink-100 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                                {trip.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => onEdit(trip)}
                            className="bg-white/20 hover:bg-white/30 p-2 sm:p-3 rounded-xl transition"
                            title="Edit Trip"
                        >
                            <FaEdit className="text-sm sm:text-base" />
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white/20 hover:bg-white/30 p-2 sm:p-3 rounded-xl transition"
                            title="Close"
                        >
                            <FaTimes className="text-sm sm:text-base" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <FaCalendarAlt className="flex-shrink-0" />
                        <span className="truncate">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <FaMapMarkerAlt className="flex-shrink-0" />
                        <span className="truncate">{parksCount} parks</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <FaRoute className="flex-shrink-0" />
                        <span className="truncate">{formatNumber(totalDistance)} mi</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <FaDollarSign className="flex-shrink-0" />
                        <span className="truncate">${formatNumber(estimatedCost)}</span>
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
    );
};

export default TripStatsHeader;
