import React from 'react';
import FadeInWrapper from './FadeInWrapper';
import { FaEdit, FaTrash, FaRoute, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';

const TripList = ({ trips, onEditTrip, onDeleteTrip }) => {
  const handleDeleteTrip = (tripId, tripTitle) => {
    if (window.confirm(`Are you sure you want to delete "${tripTitle}"?`)) {
      onDeleteTrip(tripId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Duration not set';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <span className="text-6xl block mb-4">🗺️</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips planned yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first trip to start planning your national parks adventure!
          </p>
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
            <p className="text-sm text-pink-700">
              💡 <strong>Tip:</strong> You can plan multi-park trips, optimize routes, and estimate costs!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {trips.map((trip, index) => (
        <FadeInWrapper key={trip.id} delay={index * 0.1}>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            {/* Trip Header */}
            <div className="p-6 pb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition">
                {trip.title}
              </h3>
              {trip.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Trip Stats */}
            <div className="px-6 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMapMarkerAlt className="text-pink-500" />
                  <span>{trip.parks?.length || 0} Parks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaRoute className="text-blue-500" />
                  <span>{trip.totalDistance || 0} mi</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-green-500" />
                  <span className="truncate">
                    {getDuration(trip.startDate, trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaDollarSign className="text-yellow-500" />
                  <span>${trip.estimatedCost || 0}</span>
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Trip Dates</div>
                <div className="text-sm font-medium text-gray-700">
                  {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                </div>
              </div>

              {/* Parks Preview */}
              {trip.parks && trip.parks.length > 0 && (
                <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                  <div className="text-xs text-pink-600 mb-1 font-medium">Parks to Visit</div>
                  <div className="text-sm text-pink-800">
                    {trip.parks.slice(0, 2).map(park => park.parkName).join(', ')}
                    {trip.parks.length > 2 && ` + ${trip.parks.length - 2} more`}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 flex gap-2">
              <button
                onClick={() => onEditTrip(trip)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition text-sm font-medium"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDeleteTrip(trip.id, trip.title)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </FadeInWrapper>
      ))}
    </div>
  );
};

export default TripList;