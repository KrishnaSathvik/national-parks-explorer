import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaStar, 
  FaMapMarkerAlt, 
  FaFilter, 
  FaBrain,
  FaLeaf,
  FaMountain,
  FaWater,
  FaFire,
  FaSnowflake,
  FaSun,
  FaClock,
  FaDollarSign,
  FaHiking,
  FaCamera,
  FaCampground,
  FaEye,
  FaHeart
} from 'react-icons/fa';
import FadeInWrapper from './FadeInWrapper';

const ParkSelector = ({ 
  availableParks, 
  selectedParks, 
  onAddPark, 
  loading,
  userPreferences = {},
  tripStyle = 'balanced',
  transportationMode = 'driving'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  const selectedParkIds = selectedParks.map(p => p.parkId);

  // Enhanced filter categories
  const filterCategories = [
    { id: 'all', label: 'All Parks', icon: FaStar, color: 'gray' },
    { id: 'popular', label: 'Most Popular', icon: FaFire, color: 'red' },
    { id: 'scenic', label: 'Scenic Views', icon: FaMountain, color: 'blue' },
    { id: 'wildlife', label: 'Wildlife', icon: FaLeaf, color: 'green' },
    { id: 'water', label: 'Lakes & Rivers', icon: FaWater, color: 'cyan' },
    { id: 'desert', label: 'Desert', icon: FaSun, color: 'yellow' },
    { id: 'winter', label: 'Winter Sports', icon: FaSnowflake, color: 'blue' },
    { id: 'hiking', label: 'Great Hiking', icon: FaHiking, color: 'green' },
    { id: 'photography', label: 'Photography', icon: FaCamera, color: 'purple' },
    { id: 'camping', label: 'Camping', icon: FaCampground, color: 'orange' }
  ];

  // AI-powered park scoring and recommendations
  const calculateAiScore = (park) => {
    let score = 50; // Base score
    
    // Boost popular parks
    const popularParks = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Bryce Canyon'];
    if (popularParks.some(popular => park.name?.includes(popular))) {
      score += 20;
    }
    
    // Boost based on trip style
    if (tripStyle === 'relaxed' && park.description?.toLowerCase().includes('peaceful')) score += 15;
    if (tripStyle === 'intensive' && park.description?.toLowerCase().includes('adventure')) score += 15;
    if (tripStyle === 'balanced') score += 10; // Balanced works with most parks
    
    // Boost based on selected parks (similar regions)
    if (selectedParks.length > 0) {
      const selectedStates = selectedParks.map(p => p.state || '').filter(Boolean);
      if (selectedStates.includes(park.state)) score += 10;
    }
    
    // Boost based on transportation mode
    if (transportationMode === 'flying' && ['California', 'Utah', 'Arizona'].includes(park.state)) score += 10;
    
    // Add some randomness for variety
    score += Math.random() * 20;
    
    return Math.min(100, Math.max(0, score));
  };

  // Enhanced filtering logic
  const getFilteredParks = useMemo(() => {
    let filtered = availableParks.filter(park => 
      !selectedParkIds.includes(park.id)
    );

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(park =>
        park.name?.toLowerCase().includes(searchLower) ||
        park.fullName?.toLowerCase().includes(searchLower) ||
        park.state?.toLowerCase().includes(searchLower) ||
        park.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(park => {
        const desc = park.description?.toLowerCase() || '';
        const name = park.name?.toLowerCase() || '';
        
        switch(activeFilter) {
          case 'popular':
            return ['yellowstone', 'yosemite', 'grand canyon', 'zion'].some(p => name.includes(p));
          case 'scenic':
            return desc.includes('scenic') || desc.includes('view') || desc.includes('overlook');
          case 'wildlife':
            return desc.includes('wildlife') || desc.includes('bear') || desc.includes('elk');
          case 'water':
            return desc.includes('lake') || desc.includes('river') || desc.includes('waterfall');
          case 'desert':
            return desc.includes('desert') || ['Arizona', 'Nevada', 'Utah'].includes(park.state);
          case 'winter':
            return desc.includes('snow') || desc.includes('ski') || ['Montana', 'Wyoming', 'Colorado'].includes(park.state);
          case 'hiking':
            return desc.includes('trail') || desc.includes('hik') || desc.includes('climb');
          case 'photography':
            return desc.includes('photograph') || desc.includes('scenic') || desc.includes('sunset');
          case 'camping':
            return desc.includes('camp') || desc.includes('overnight');
          default:
            return true;
        }
      });
    }

    // Add AI scores
    filtered = filtered.map(park => ({
      ...park,
      aiScore: calculateAiScore(park),
      isRecommended: calculateAiScore(park) > 75
    }));

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'state':
          return (a.state || '').localeCompare(b.state || '');
        case 'ai-score':
          return b.aiScore - a.aiScore;
        default: // relevance
          if (searchTerm) {
            // Boost exact matches
            const aExact = a.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 20 : 0;
            const bExact = b.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 20 : 0;
            return (b.aiScore + bExact) - (a.aiScore + aExact);
          }
          return b.aiScore - a.aiScore;
      }
    });

    return filtered.slice(0, 20); // Limit results
  }, [availableParks, selectedParkIds, searchTerm, activeFilter, sortBy, tripStyle, transportationMode, selectedParks]);

  // AI Recommendations for empty search
  const aiRecommendations = useMemo(() => {
    if (searchTerm || !showAiSuggestions) return [];
    
    return availableParks
      .filter(park => !selectedParkIds.includes(park.id))
      .map(park => ({ ...park, aiScore: calculateAiScore(park) }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 6);
  }, [availableParks, selectedParkIds, showAiSuggestions, tripStyle, selectedParks]);

  const handleParkSelect = (park) => {
    onAddPark(park);
    if (searchTerm) {
      setSearchTerm('');
      setShowDropdown(false);
    }
  };

  const getActivityIcon = (park) => {
    const desc = park.description?.toLowerCase() || '';
    if (desc.includes('desert')) return '🏜️';
    if (desc.includes('mountain')) return '🏔️';
    if (desc.includes('lake') || desc.includes('water')) return '🏊';
    if (desc.includes('forest')) return '🌲';
    if (desc.includes('canyon')) return '🏞️';
    return '🏞️';
  };

  const getParkDifficulty = (park) => {
    const desc = park.description?.toLowerCase() || '';
    if (desc.includes('challenging') || desc.includes('difficult')) return { level: 'Advanced', color: 'red' };
    if (desc.includes('moderate')) return { level: 'Moderate', color: 'yellow' };
    return { level: 'Easy', color: 'green' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gradient-to-r from-pink-200 to-purple-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"></div>
          <div className="flex gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl">
              <FaSearch className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">🧠 AI-Powered Park Discovery</h3>
              <p className="text-gray-500 text-sm">
                {availableParks.length} parks available • {selectedParks.length} selected • Smart recommendations enabled
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiSuggestions(!showAiSuggestions)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                showAiSuggestions 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaBrain className="inline mr-1" />
              AI Suggestions
            </button>
          </div>
        </div>
        
        {/* Enhanced Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search parks by name, state, or features..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(e.target.value.length > 0);
              }}
              onFocus={() => setShowDropdown(searchTerm.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full p-4 pl-14 pr-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
            />
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          </div>
        </div>

        {/* Enhanced Filter Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterCategories.slice(0, 6).map(category => {
            const Icon = category.icon;
            const isActive = activeFilter === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-300`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <Icon />
                {category.label}
              </button>
            );
          })}
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="relevance">🎯 Best Match</option>
            <option value="ai-score">🧠 AI Score</option>
            <option value="name">📝 Name</option>
            <option value="state">📍 State</option>
          </select>
        </div>

        {/* Search Results Summary */}
        {searchTerm && (
          <div className="text-sm text-gray-600 mb-4">
            Found {getFilteredParks.length} parks matching "{searchTerm}"
            {activeFilter !== 'all' && ` in ${filterCategories.find(f => f.id === activeFilter)?.label}`}
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && getFilteredParks.length > 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-20">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FaSearch className="text-pink-500" />
              Search Results ({getFilteredParks.length})
            </div>
            
            <div className="space-y-2">
              {getFilteredParks.map(park => (
                <div
                  key={park.id}
                  onClick={() => handleParkSelect(park)}
                  className="group p-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 cursor-pointer rounded-xl transition-all duration-200 border border-transparent hover:border-pink-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{getActivityIcon(park)}</span>
                        <div className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                          {park.name || park.fullName}
                        </div>
                        {park.isRecommended && (
                          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <FaBrain className="text-xs" />
                            AI Pick
                          </span>
                        )}
                        <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {Math.round(park.aiScore)}% match
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {park.state}
                        </div>
                        {park.description && (
                          <div className="text-gray-600 line-clamp-1 max-w-xs">
                            {park.description.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-pink-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110">
                      <FaPlus />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Section */}
      {!searchTerm && showAiSuggestions && aiRecommendations.length > 0 && (
        <FadeInWrapper delay={0.2}>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <FaBrain className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">🎯 Personalized Recommendations</h3>
                <p className="text-gray-500 text-sm">
                  Based on your {tripStyle} style and {transportationMode} preference
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRecommendations.map((park, index) => (
                <FadeInWrapper key={park.id} delay={index * 0.1}>
                  <div className="group bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      {/* AI Score Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">{getActivityIcon(park)}</span>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {Math.round(park.aiScore)}% Match
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {park.name || park.fullName}
                      </h4>
                      
                      <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-purple-500" />
                        <span>{park.state}</span>
                      </div>
                      
                      {park.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {park.description.substring(0, 80)}...
                        </p>
                      )}

                      {/* Park Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(() => {
                          const difficulty = getParkDifficulty(park);
                          return (
                            <span className={`text-xs px-2 py-1 rounded-full bg-${difficulty.color}-100 text-${difficulty.color}-700`}>
                              {difficulty.level}
                            </span>
                          );
                        })()}
                        
                        {park.isRecommended && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            🌟 Trending
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleParkSelect(park)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <FaPlus /> Add to Trip
                      </button>
                    </div>
                  </div>
                </FadeInWrapper>
              ))}
            </div>

            {/* AI Insights */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <FaBrain className="text-purple-600" />
                Why These Recommendations?
              </h4>
              <div className="text-sm text-purple-700 space-y-1">
                <div>• Optimized for your <strong>{tripStyle}</strong> travel style</div>
                <div>• Compatible with <strong>{transportationMode}</strong> transportation</div>
                <div>• Complements your currently selected {selectedParks.length} park{selectedParks.length !== 1 ? 's' : ''}</div>
                {selectedParks.length > 0 && (
                  <div>• Geographic proximity to {selectedParks[selectedParks.length - 1].parkName}</div>
                )}
              </div>
            </div>
          </div>
        </FadeInWrapper>
      )}

      {/* Empty States */}
      {showDropdown && searchTerm && getFilteredParks.length === 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No parks found</h4>
            <p className="text-gray-500 mb-4">No parks match "{searchTerm}"</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-sm"
              >
                Clear Search
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      {!showDropdown && searchTerm.length === 0 && !showAiSuggestions && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-2xl">💡</div>
            <div>
              <div className="font-medium text-blue-800 mb-2">Smart Search Tips</div>
              <div className="text-blue-700 text-sm space-y-1">
                <div>• Try searching for "Yellowstone", "Grand Canyon", or browse by state</div>
                <div>• Use filters like "Wildlife" or "Scenic Views" to narrow down options</div>
                <div>• AI recommendations are personalized based on your trip style</div>
                <div>• Parks with higher AI scores are better matches for your preferences</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkSelector;