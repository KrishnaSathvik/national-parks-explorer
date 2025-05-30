// src/components/TripList.jsx - Enhanced Version
import React from 'react';
import FadeInWrapper from './FadeInWrapper';
import { 
  FaEdit, 
  FaTrash, 
  FaRoute, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaMapMarkerAlt,
  FaClock,
  FaEye,
  FaHeart
} from 'react-icons/fa';

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

  const getRandomGradient = (index) => {
    const gradients = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
    ];
    return gradients[index % gradients.length];
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-20">
        <FadeInWrapper delay={0.1}>
          <div className="max-w-lg mx-auto">
            <div className="relative mb-8">
              <div className="text-8xl mb-4">🗺️</div>
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce">✨</div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No trips planned yet</h3>
            <p className="text-lg text-gray-600 mb-8">
              Create your first trip to start planning your ultimate national parks adventure!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-200">
                <div className="text-pink-500 text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-pink-800 mb-1">Smart Planning</h4>
                <p className="text-sm text-pink-700">Optimize routes and estimate costs automatically</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                <div className="text-blue-500 text-2xl mb-2">🗺️</div>
                <h4 className="font-semibold text-blue-800 mb-1">Visual Routes</h4>
                <p className="text-sm text-blue-700">See your journey on interactive maps</p>
              </div>
            </div>
          </div>
        </FadeInWrapper>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {trips.map((trip, index) => (
        <FadeInWrapper key={trip.id} delay={index * 0.1}>
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            
            {/* Card Header with Gradient */}
            <div className={`bg-gradient-to-r ${getRandomGradient(index)} p-6 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold line-clamp-2 group-hover:text-pink-100 transition-colors">
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                    <FaHeart className="text-red-300" />
                    <span>Trip</span>
                  </div>
                </div>
                
                {trip.description && (
                  <p className="text-white/90 text-sm line-clamp-2 mb-4">
                    {trip.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-white/80" />
                    <span>{trip.parks?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock className="text-white/80" />
                    <span>{getDuration(trip.startDate, trip.endDate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-gray-800">{trip.totalDistance || 0}</div>
                  <div className="text-xs text-gray-500 font-medium">MILES</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-gray-800">${trip.estimatedCost || 0}</div>
                  <div className="text-xs text-gray-500 font-medium">BUDGET</div>
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <FaCalendarAlt className="text-blue-500 text-sm" />
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Trip Dates</span>
                </div>
                <div className="text-sm font-medium text-blue-800">
                  {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                </div>
              </div>

              {/* Parks Preview */}
              {trip.parks && trip.parks.length > 0 && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl mb-6 border border-pink-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-pink-500 text-sm" />
                    <span className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Parks to Visit</span>
                  </div>
                  <div className="text-sm font-medium text-pink-800 line-clamp-2">
                    {trip.parks.slice(0, 2).map(park => park.parkName).join(', ')}
                    {trip.parks.length > 2 && (
                      <span className="text-pink-600"> +{trip.parks.length - 2} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onEditTrip(trip)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaEdit /> Edit Trip
                </button>
                <button
                  onClick={() => handleDeleteTrip(trip.id, trip.title)}
                  className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 group"
                >
                  <FaTrash className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </FadeInWrapper>
      ))}
    </div>
  );
};


export default TripList;