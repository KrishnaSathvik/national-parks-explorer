// Fixed TripList.jsx - Simplified and Clean
import React, { useState } from 'react';
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
  FaHeart,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaCar,
  FaPlane,
  FaSearch,
  FaStar
} from 'react-icons/fa';

const TripList = ({ trips, onEditTrip, onDeleteTrip, onViewTrip }) => {
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Validate and sanitize trip data
  const validTrips = trips.filter(trip => 
    trip && 
    typeof trip === 'object' && 
    trip.id && 
    trip.title
  ).map(trip => ({
    ...trip,
    estimatedCost: Number(trip.estimatedCost) || 0,
    totalDuration: Number(trip.totalDuration) || 0,
    totalDistance: Number(trip.totalDistance) || 0,
    parks: Array.isArray(trip.parks) ? trip.parks : []
  }));

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
      'from-teal-500 to-green-500',
      'from-orange-500 to-red-500',
    ];
    return gradients[index % gradients.length];
  };

  // Enhanced filtering and sorting
  const filteredAndSortedTrips = () => {
    let filtered = validTrips.filter(trip => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = trip.title?.toLowerCase().includes(query);
        const matchesDescription = trip.description?.toLowerCase().includes(query);
        const matchesParks = trip.parks?.some(park => 
          park.parkName?.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesDescription && !matchesParks) {
          return false;
        }
      }

      // Category filter
      switch(filterBy) {
        case 'upcoming':
          return trip.startDate && new Date(trip.startDate) > new Date();
        case 'past':
          return trip.endDate && new Date(trip.endDate) < new Date();
        case 'road-trip':
          return trip.transportationMode === 'driving';
        case 'flights':
          return trip.transportationMode === 'flying';
        case 'budget':
          return (trip.estimatedCost || 0) < 2000;
        case 'luxury':
          return (trip.estimatedCost || 0) >= 5000;
        default:
          return true;
      }
    });

    // Sort trips
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'date':
          comparison = new Date(b.startDate || 0) - new Date(a.startDate || 0);
          break;
        case 'cost':
          comparison = (b.estimatedCost || 0) - (a.estimatedCost || 0);
          break;
        case 'parks':
          comparison = (b.parks?.length || 0) - (a.parks?.length || 0);
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'duration':
          comparison = (b.totalDuration || 0) - (a.totalDuration || 0);
          break;
        default: // created
          comparison = new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return filtered;
  };

  const processedTrips = filteredAndSortedTrips();

  // No trips state
  if (validTrips.length === 0) {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-200">
                <div className="text-pink-500 text-3xl mb-3">🎯</div>
                <h4 className="font-semibold text-pink-800 mb-2">Smart Planning</h4>
                <p className="text-sm text-pink-700">Optimize routes and estimate costs automatically</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                <div className="text-blue-500 text-3xl mb-3">🗺️</div>
                <h4 className="font-semibold text-blue-800 mb-2">Interactive Maps</h4>
                <p className="text-sm text-blue-700">Visual route planning with real-time updates</p>
              </div>
            </div>
          </div>
        </FadeInWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls Bar */}
      <FadeInWrapper delay={0.1}>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips, parks, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
              >
                <option value="all">All Trips</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Trips</option>
                <option value="road-trip">Road Trips</option>
                <option value="flights">Flight Trips</option>
                <option value="budget">Budget (&lt;$2k)</option>
                <option value="luxury">Luxury ($5k+)</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
              >
                <option value="created">Created Date</option>
                <option value="date">Trip Date</option>
                <option value="cost">Cost</option>
                <option value="parks">Parks Count</option>
                <option value="duration">Duration</option>
                <option value="title">Title</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2 text-gray-500 hover:text-pink-600 transition"
                title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              </button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {processedTrips.length} of {validTrips.length} trip{validTrips.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {filterBy !== 'all' && ` in ${filterBy.replace('-', ' ')}`}
            </div>
            
            {processedTrips.length > 0 && (
              <div className="text-sm text-gray-500">
                Total value: ${processedTrips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </FadeInWrapper>

      {/* No Results */}
      {processedTrips.length === 0 && validTrips.length > 0 && (
        <FadeInWrapper delay={0.2}>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips match your filters</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
            >
              Clear Filters
            </button>
          </div>
        </FadeInWrapper>
      )}

      {/* Trip Cards Grid */}
      {processedTrips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {processedTrips.map((trip, index) => (
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
                      <div className="flex items-center gap-1">
                        {trip.transportationMode === 'flying' ? <FaPlane className="text-white/80" /> : <FaCar className="text-white/80" />}
                        <span className="capitalize">{trip.transportationMode || 'driving'}</span>
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
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-gray-800">{trip.totalDistance || 0}</div>
                      <div className="text-xs text-gray-500 font-medium">MILES</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-gray-800">${trip.estimatedCost || 0}</div>
                      <div className="text-xs text-gray-500 font-medium">BUDGET</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {trip.totalDuration || trip.parks?.reduce((sum, park) => sum + (park.stayDuration || 1), 0) || 0}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">DAYS</div>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewTrip(trip)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => onEditTrip(trip)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaEdit /> Edit
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
      )}
    </div>
  );
};

export default TripList;