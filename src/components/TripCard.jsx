// src/components/TripCard.jsx
import React from 'react';
import { FaEdit, FaTrash, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaDollarSign, FaCar, FaPlane } from 'react-icons/fa';
import { formatDate, formatCurrency, formatDuration } from '../utils/common/formatters'; // ✅ Updated import

const TripCard = ({ trip, onEdit, onDelete, onView, className = '' }) => {
    return (
        <div className={`bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${className}`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 pr-3">
                        {trip.title || 'Untitled Trip'}
                    </h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onView(trip)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                        >
                            <FaEye />
                        </button>
                        <button
                            onClick={() => onEdit(trip)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Trip"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => onDelete(trip.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Trip"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                {/* Description */}
                {trip.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
                )}

                {/* Trip Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-pink-500" />
                        <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-blue-500" />
                            <span className="font-medium">{trip.parks?.length || 0}</span>
                            <span className="text-gray-500">parks</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FaClock className="text-purple-500" />
                            <span className="font-medium">{trip.totalDuration || 1}</span>
                            <span className="text-gray-500">days</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FaDollarSign className="text-green-500" />
                            <span className="font-medium">{formatCurrency(trip.estimatedCost || 0)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        {trip.transportationMode === 'flying' ? (
                            <FaPlane className="text-blue-500" />
                        ) : (
                            <FaCar className="text-green-500" />
                        )}
                        <span className="capitalize text-gray-600">
                            {trip.transportationMode || 'Not specified'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
                <button
                    onClick={() => onView(trip)}
                    className="w-full py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                >
                    View Full Details →
                </button>
            </div>
        </div>
    );
};

export default TripCard;