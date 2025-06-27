// src/components/TripPlanner/TripManagement/TripList.jsx
import React, { useState, useMemo } from 'react';
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaPlus,
  FaEye,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRoute,
  FaDollarSign,
  FaClock,
  FaEdit,
  FaTrash,
  FaCopy,
  FaShare,
  FaDownload,
  FaCar,
  FaPlane
} from 'react-icons/fa';
import { useTripPlanner } from '../core/TripPlannerProvider';
import { formatDate, formatCurrency, formatNumber } from '../../../utils/common/formatters';
import LoadingSpinner from '../../shared/ui/LoadingStates';

const TripList = () => {
  const {
    trips,
    isLoading,
    startBuilding,
    startViewing,
    deleteTrip,
    duplicateTrip
  } = useTripPlanner();

  // Local state for filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Filter and sort trips
  const filteredAndSortedTrips = useMemo(() => {
    let filtered = trips.filter(trip => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
          trip.title?.toLowerCase().includes(searchLower) ||
          trip.description?.toLowerCase().includes(searchLower) ||
          trip.parks?.some(park =>
              park.parkName?.toLowerCase().includes(searchLower) ||
              park.state?.toLowerCase().includes(searchLower)
          );

      // Category filter
      const matchesFilter = filterBy === 'all' ||
          (filterBy === 'driving' && trip.transportationMode === 'driving') ||
          (filterBy === 'flying' && trip.transportationMode === 'flying') ||
          (filterBy === 'recent' && isRecentTrip(trip)) ||
          (filterBy === 'expensive' && trip.estimatedCost > 2000) ||
          (filterBy === 'long' && trip.totalDuration > 7);

      return matchesSearch && matchesFilter;
    });

    // Sort trips
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [trips, searchQuery, sortBy, sortOrder, filterBy]);

  const isRecentTrip = (trip) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(trip.createdAt) > weekAgo;
  };

  const handleDeleteTrip = async (tripId, tripTitle) => {
    if (window.confirm(`Are you sure you want to delete "${tripTitle}"?`)) {
      try {
        await deleteTrip(tripId);
      } catch (error) {
        console.error('Failed to delete trip:', error);
      }
    }
  };

  const handleDuplicateTrip = async (trip) => {
    try {
      await duplicateTrip(trip);
    } catch (error) {
      console.error('Failed to duplicate trip:', error);
    }
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'estimatedCost', label: 'Cost' },
    { value: 'totalDuration', label: 'Duration' },
    { value: 'totalDistance', label: 'Distance' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Trips' },
    { value: 'recent', label: 'Recent' },
    { value: 'driving', label: 'Road Trips' },
    { value: 'flying', label: 'Flight Trips' },
    { value: 'expensive', label: 'Premium ($2000+)' },
    { value: 'long', label: 'Extended (7+ days)' }
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading your trips..." />;
  }

  return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                My Trips ({trips.length})
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>
                                {trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)} parks planned
                            </span>
                <span>
                                {formatNumber(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0))} miles
                            </span>
                <span>
                                {formatCurrency(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0))} total budget
                            </span>
              </div>
            </div>

            <button
                onClick={() => startBuilding()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FaPlus />
              Create New Trip
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                  type="text"
                  placeholder="Search trips, parks, or destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white"
              >
                {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white"
              >
                {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      Sort by {option.label}
                    </option>
                ))}
              </select>

              <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>
        </div>

        {/* Trips Grid/List */}
        {filteredAndSortedTrips.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchQuery || filterBy !== 'all' ? 'No trips found' : 'No trips yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterBy !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start planning your first national parks adventure!'
                }
              </p>
              {(!searchQuery && filterBy === 'all') && (
                  <button
                      onClick={() => startBuilding()}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold"
                  >
                    Create Your First Trip
                  </button>
              )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedTrips.map(trip => (
                  <TripCard
                      key={trip.id}
                      trip={trip}
                      onView={() => startViewing(trip)}
                      onEdit={() => startBuilding(trip)}
                      onDelete={() => handleDeleteTrip(trip.id, trip.title)}
                      onDuplicate={() => handleDuplicateTrip(trip)}
                  />
              ))}
            </div>
        )}
      </div>
  );
};

// Individual Trip Card Component
const TripCard = ({ trip, onView, onEdit, onDelete, onDuplicate }) => {
  const [showActions, setShowActions] = useState(false);

  const isUpcoming = trip.startDate && new Date(trip.startDate) > new Date();
  const isPast = trip.endDate && new Date(trip.endDate) < new Date();

  return (
      <div
          className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isUpcoming ? 'bg-green-100 text-green-800' :
                            isPast ? 'bg-gray-100 text-gray-600' :
                                'bg-blue-100 text-blue-800'
                    }`}>
                        {isUpcoming ? 'Upcoming' : isPast ? 'Completed' : 'Planning'}
                    </span>
          </div>

          <h3 className="text-xl font-bold mb-2 pr-20 line-clamp-2">
            {trip.title || 'Untitled Trip'}
          </h3>

          {trip.description && (
              <p className="text-blue-100 text-sm line-clamp-2 mb-4">
                {trip.description}
              </p>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>{formatDate(trip.startDate, { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock />
              <span>{trip.totalDuration || 1} days</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt />
              <span>{trip.parks?.length || 0} parks</span>
            </div>
            <div className="flex items-center gap-2">
              <FaDollarSign />
              <span>{formatCurrency(trip.estimatedCost || 0)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Trip Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Transportation:</span>
              <div className="flex items-center gap-1">
                {trip.transportationMode === 'flying' ? <FaPlane className="text-blue-500" /> : <FaCar className="text-green-500" />}
                <span className="capitalize font-medium">{trip.transportationMode || 'Not set'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">{formatNumber(trip.totalDistance || 0)} miles</span>
            </div>

            {trip.parks && trip.parks.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Parks:</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {trip.parks.slice(0, 3).map((park, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                        >
                                        {park.parkName}
                                    </span>
                    ))}
                    {trip.parks.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                                        +{trip.parks.length - 3} more
                                    </span>
                    )}
                  </div>
                </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`grid grid-cols-2 gap-2 transition-all duration-300 ${
              showActions ? 'opacity-100 transform translate-y-0' : 'opacity-70 transform translate-y-2'
          }`}>
            <button
                onClick={onView}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <FaEye />
              View
            </button>

            <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              <FaEdit />
              Edit
            </button>
          </div>

          {/* Additional Actions (shown on hover) */}
          <div className={`mt-2 grid grid-cols-3 gap-2 transition-all duration-300 ${
              showActions ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            <button
                onClick={onDuplicate}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                title="Duplicate Trip"
            >
              <FaCopy />
              Copy
            </button>

            <button
                onClick={() => shareTrip(trip)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                title="Share Trip"
            >
              <FaShare />
              Share
            </button>

            <button
                onClick={onDelete}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                title="Delete Trip"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        </div>

        {/* Footer with timestamps */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Created {formatDate(trip.createdAt, { month: 'short', day: 'numeric' })}</span>
            {trip.updatedAt && trip.updatedAt !== trip.createdAt && (
                <span>Updated {formatDate(trip.updatedAt, { month: 'short', day: 'numeric' })}</span>
            )}
          </div>
        </div>
      </div>
  );
};

// Helper function for sharing trips
const shareTrip = async (trip) => {
  const shareData = {
    title: `${trip.title} - National Parks Trip`,
    text: `Check out my ${trip.totalDuration}-day trip to ${trip.parks?.length || 0} national parks! Estimated cost: ${formatCurrency(trip.estimatedCost || 0)}`,
    url: window.location.href
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  } else {
    // Fallback to clipboard
    try {
      const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
      await navigator.clipboard.writeText(shareText);
      // You could show a toast here indicating the text was copied
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }
};

export default TripList;