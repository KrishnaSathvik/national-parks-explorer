// src/components/TripBuilder/steps/TripStepParks.jsx (Enhanced with Smart Features)
import React, { useState, useMemo } from 'react';
import {
    FaMapMarkerAlt,
    FaTrash,
    FaSearch,
    FaCheckCircle,
    FaStar,
    FaRoute,
    FaHiking,
    FaCamera,
    FaBinoculars,
    FaWater,
    FaTree,
    FaFish,
    FaMountain,
    FaFilter,
    FaBrain,
    FaHeart,
    FaSort,
    FaMapSigns,
    FaClock,
    FaInfoCircle,
    FaMagic,
    FaPlus
} from 'react-icons/fa';
import { optimizeTripRoute, suggestParkDuration } from '../../../utils/tripPlanner/tripCalculations';

const TripStepParks = ({ tripData, setTripData, allParks }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [sortBy, setSortBy] = useState('smart'); // smart, name, state, popularity
    const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

    // Get unique states for filtering
    const states = useMemo(() => {
        const uniqueStates = [...new Set(allParks.map(park => park.state))].filter(Boolean);
        return uniqueStates.sort();
    }, [allParks]);

    // Activity to park features mapping
    const activityToParkFeatures = {
        'hiking': ['trails', 'hiking', 'backpacking', 'wilderness'],
        'photography': ['scenic', 'landscape', 'overlook', 'viewpoint', 'sunrise', 'sunset'],
        'wildlife': ['wildlife', 'animals', 'birds', 'mammals', 'viewing'],
        'water-activities': ['lake', 'river', 'waterfall', 'swimming', 'boating'],
        'fishing': ['fishing', 'lake', 'river', 'stream'],
        'camping': ['camping', 'campground', 'backcountry'],
        'stargazing': ['dark sky', 'astronomy', 'night', 'stargazing'],
        'scenic-drives': ['scenic drive', 'auto tour', 'driving', 'road']
    };

    // Calculate park score based on user preferences
    const calculateParkScore = (park) => {
        const preferences = tripData.preferences || {};
        const selectedActivities = preferences.activities || [];

        if (selectedActivities.length === 0) return 50; // Default score

        let score = 0;
        const description = (park.description || '').toLowerCase();
        const name = (park.name || '').toLowerCase();
        const searchText = `${name} ${description}`;

        selectedActivities.forEach(activity => {
            const keywords = activityToParkFeatures[activity] || [];
            const activityScore = keywords.reduce((sum, keyword) => {
                const keywordMatches = (searchText.match(new RegExp(keyword, 'g')) || []).length;
                return sum + keywordMatches * 10;
            }, 0);
            score += activityScore;
        });

        // Bonus for popular parks
        const popularParks = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Arches'];
        if (popularParks.some(popular => name.includes(popular.toLowerCase()))) {
            score += 20;
        }

        // Normalize score to 0-100
        return Math.min(100, Math.max(0, score));
    };

    // Enhanced park filtering and sorting
    const filteredAndSortedParks = useMemo(() => {
        let filtered = allParks.filter(park => {
            const matchesSearch = !searchQuery ||
                park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                park.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (park.description && park.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesState = !selectedState || park.state === selectedState;

            // Smart recommendation filter
            if (showOnlyRecommended) {
                const score = calculateParkScore(park);
                return matchesSearch && matchesState && score > 30;
            }

            return matchesSearch && matchesState;
        });

        // Add scores to parks for sorting
        filtered = filtered.map(park => ({
            ...park,
            score: calculateParkScore(park)
        }));

        // Sort parks
        switch (sortBy) {
            case 'smart':
                return filtered.sort((a, b) => b.score - a.score);
            case 'name':
                return filtered.sort((a, b) => a.name.localeCompare(b.name));
            case 'state':
                return filtered.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
            case 'popularity':
                // Simple popularity heuristic based on name recognition
                const getPopularityScore = (park) => {
                    const popular = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Arches', 'Bryce'];
                    return popular.findIndex(p => park.name.includes(p)) !== -1 ? 1000 : park.score;
                };
                return filtered.sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
            default:
                return filtered;
        }
    }, [allParks, searchQuery, selectedState, sortBy, showOnlyRecommended, tripData.preferences]);

    const addPark = (park) => {
        if (tripData.parks.find(p => p.parkId === park.parkId)) {
            return; // Already added
        }

        const suggestedDuration = suggestParkDuration(park);

        const newPark = {
            parkId: park.parkId,
            parkName: park.name,
            state: park.state,
            stayDuration: suggestedDuration,
            coordinates: park.coordinates,
            score: park.score,
            description: park.description
        };

        setTripData(prev => ({ ...prev, parks: [...prev.parks, newPark] }));
    };

    const removePark = (parkId) => {
        setTripData(prev => ({
            ...prev,
            parks: prev.parks.filter(p => p.parkId !== parkId)
        }));
    };

    const updateParkDuration = (parkId, duration) => {
        const newDuration = Math.max(1, Math.min(14, parseInt(duration) || 1));
        setTripData(prev => ({
            ...prev,
            parks: prev.parks.map(p =>
                p.parkId === parkId ? { ...p, stayDuration: newDuration } : p
            )
        }));
    };

    const optimizeRoute = () => {
        if (tripData.parks.length > 2) {
            const optimizedParks = optimizeTripRoute(tripData.parks);
            setTripData(prev => ({ ...prev, parks: optimizedParks }));
        }
    };

    const addRecommendedParks = () => {
        const recommendedParks = filteredAndSortedParks
            .filter(park => park.score > 60 && !tripData.parks.find(p => p.parkId === park.parkId))
            .slice(0, 3);

        recommendedParks.forEach(addPark);
    };

    const selectedActivities = tripData.preferences?.activities || [];
    const getScoreColor = (score) => {
        if (score >= 70) return 'text-green-600 bg-green-100';
        if (score >= 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-500 bg-gray-100';
    };

    const getActivityIcon = (activity) => {
        const icons = {
            'hiking': FaHiking,
            'photography': FaCamera,
            'wildlife': FaBinoculars,
            'water-activities': FaWater,
            'fishing': FaFish,
            'camping': FaTree,
            'stargazing': FaStar,
            'scenic-drives': FaMountain
        };
        return icons[activity] || FaMapMarkerAlt;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FaMapMarkerAlt className="text-blue-500 text-2xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Select Your Parks</h2>
                </div>
                <p className="text-gray-600">
                    Choose the national parks you want to visit. We've ranked them based on your preferences!
                </p>
            </div>

            {/* Smart Recommendations Banner */}
            {selectedActivities.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <FaBrain className="text-purple-600" />
                        Smart Recommendations Active
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-purple-700 text-sm mb-2">
                                <strong>We're prioritizing parks that match:</strong>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedActivities.map(activity => {
                                    const Icon = getActivityIcon(activity);
                                    return (
                                        <span key={activity} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      <Icon className="text-xs" />
                                            {activity.replace('-', ' ')}
                    </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={addRecommendedParks}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                            >
                                <FaMagic />
                                Add Top 3
                            </button>
                            <button
                                onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                    showOnlyRecommended
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {showOnlyRecommended ? 'Show All' : 'Recommended Only'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Parks Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FaRoute className="text-pink-500 text-xl" />
                        <h3 className="text-xl font-bold text-gray-800">
                            Your Itinerary ({tripData.parks.length} park{tripData.parks.length !== 1 ? 's' : ''})
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {tripData.parks.length > 0 && (
                            <div className="text-sm text-gray-500">
                                Total: {tripData.parks.reduce((sum, park) => sum + park.stayDuration, 0)} days
                            </div>
                        )}
                        {tripData.parks.length > 2 && (
                            <button
                                onClick={optimizeRoute}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                            >
                                <FaRoute />
                                Optimize Route
                            </button>
                        )}
                    </div>
                </div>

                {tripData.parks.length === 0 ? (
                    <div className="text-center py-12">
                        <FaMapMarkerAlt className="text-6xl mx-auto mb-4 text-gray-300" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No parks selected yet</h4>
                        <p className="text-gray-500 mb-4">
                            Browse the parks below and add them to your itinerary
                        </p>
                        {selectedActivities.length > 0 && (
                            <button
                                onClick={addRecommendedParks}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center gap-2 mx-auto"
                            >
                                <FaMagic />
                                Add Recommended Parks
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tripData.parks.map((park, index) => (
                            <div key={park.parkId} className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-pink-50 hover:to-purple-50 transition-all duration-200 border border-gray-200">
                                <div className="bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold w-12 h-12 flex items-center justify-center rounded-full text-sm shadow-lg">
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800">{park.parkName}</h4>
                                        {park.score && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(park.score)}`}>
                        {Math.round(park.score)}% match
                      </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">{park.state}</p>
                                    {park.description && (
                                        <p className="text-xs text-gray-600 line-clamp-2">{park.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border shadow-sm">
                                        <FaClock className="text-gray-400 text-sm" />
                                        <input
                                            type="number"
                                            value={park.stayDuration}
                                            onChange={(e) => updateParkDuration(park.parkId, e.target.value)}
                                            min={1}
                                            max={14}
                                            className="w-12 text-center text-sm font-semibold text-gray-800 bg-transparent border-none focus:outline-none"
                                        />
                                        <span className="text-xs text-gray-500">day{park.stayDuration > 1 ? 's' : ''}</span>
                                    </div>

                                    <button
                                        onClick={() => removePark(park.parkId)}
                                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Remove from trip"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-start gap-3">
                                <FaInfoCircle className="text-blue-500 mt-0.5" />
                                <div className="text-sm text-blue-700">
                                    <p className="font-medium mb-1">Pro Tips:</p>
                                    <ul className="space-y-1 text-blue-600">
                                        <li>• Parks are visited in the order shown - drag to reorder or use "Optimize Route"</li>
                                        <li>• Suggested stay durations are based on park size and your activity preferences</li>
                                        <li>• Higher match percentages indicate better alignment with your preferences</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Available Parks Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FaSearch className="text-green-500 text-xl" />
                        <h3 className="text-xl font-bold text-gray-800">Available Parks</h3>
                    </div>
                    <div className="text-sm text-gray-500">
                        {filteredAndSortedParks.length} park{filteredAndSortedParks.length !== 1 ? 's' : ''} found
                    </div>
                </div>

                {/* Enhanced Search and Filter */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    <div className="lg:col-span-2 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search parks by name, state, or features..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                        />
                    </div>

                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white"
                    >
                        <option value="">All States</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white"
                    >
                        <option value="smart">🧠 Smart Ranking</option>
                        <option value="name">📝 Alphabetical</option>
                        <option value="state">📍 By State</option>
                        <option value="popularity">⭐ Most Popular</option>
                    </select>
                </div>

                {/* Parks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedParks.map(park => {
                        const isSelected = tripData.parks.find(p => p.parkId === park.parkId);
                        const scoreColor = getScoreColor(park.score);

                        return (
                            <button
                                key={park.parkId}
                                onClick={() => !isSelected && addPark(park)}
                                disabled={isSelected}
                                className={`text-left p-4 border-2 rounded-xl transition-all duration-200 ${
                                    isSelected
                                        ? 'border-green-300 bg-green-50 cursor-not-allowed shadow-inner'
                                        : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50 hover:shadow-lg transform hover:-translate-y-1'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{park.name}</h4>
                                        <p className="text-xs text-gray-500 mb-2">{park.state}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 ml-2">
                                        {isSelected ? (
                                            <FaCheckCircle className="text-green-500 text-lg" />
                                        ) : (
                                            selectedActivities.length > 0 && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreColor}`}>
                          {Math.round(park.score)}%
                        </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {park.description && (
                                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
                                        {park.description}
                                    </p>
                                )}

                                {!isSelected ? (
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-medium text-pink-600 flex items-center gap-1">
                                            <FaPlus className="text-xs" />
                                            Add to Trip
                                        </div>
                                        {park.score > 60 && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                        Recommended
                      </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                                        <FaCheckCircle className="text-xs" />
                                        Added to Trip
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {filteredAndSortedParks.length === 0 && (
                    <div className="text-center py-12">
                        <FaFilter className="text-4xl mx-auto mb-4 text-gray-300" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No parks found</h4>
                        <p className="text-gray-500 mb-4">
                            Try adjusting your search criteria or filters
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedState('');
                                setShowOnlyRecommended(false);
                            }}
                            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 text-sm font-medium"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripStepParks;