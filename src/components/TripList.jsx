// TripList.jsx (Refactored)
import React from 'react';
import { FaTrash, FaEdit, FaMapMarkerAlt, FaRoute, FaDollarSign } from 'react-icons/fa';
import { formatDate, formatNumber } from '../utils/formatUtils';

const TripList = ({ trips, onEdit, onDelete }) => {
  if (!trips || trips.length === 0) {
    return <p className="text-sm text-gray-500">No trips saved yet.</p>;
  }

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map(trip => (
            <div key={trip.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 line-clamp-1">
                  {trip.title || 'Untitled Trip'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => onEdit(trip)}
                      title="Edit"
                      className="p-1 rounded hover:bg-gray-100 text-blue-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                      onClick={() => onDelete(trip.id)}
                      title="Delete"
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-pink-500" />
                  {trip.parks?.length || 0} parks
                </div>
                <div className="flex items-center gap-1">
                  <FaRoute className="text-purple-500" />
                  {formatNumber(trip.totalDistance)} mi
                </div>
                <div className="flex items-center gap-1">
                  <FaDollarSign className="text-green-500" />
                  ${formatNumber(trip.estimatedCost)}
                </div>
                <div className="text-right text-gray-400 italic">
                  {trip.transportationMode || 'n/a'}
                </div>
              </div>
            </div>
        ))}
      </div>
  );
};

export default TripList;