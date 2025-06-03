import React, { useState, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import Fuse from 'fuse.js';
import { 
  FaSearch, 
  FaPlus, 
  FaStar, 
  FaMapMarkerAlt, 
  FaFilter,
  FaHeart,
  FaTimes
} from 'react-icons/fa';
import FadeInWrapper from './FadeInWrapper';

const ParkSelector = ({ 
  availableParks, 
  selectedParks, 
  onAddPark, 
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);

  const selectedParkIds = selectedParks.map(p => p.parkId);

  // Simple filter categories
  const filterCategories = [
    { id: 'all', label: 'All Parks', icon: FaStar },
    { id: 'popular', label: 'Popular', icon: FaHeart },
    { id: 'california', label: 'California', icon: FaMapMarkerAlt },
    { id: 'utah', label: 'Utah', icon: FaMapMarkerAlt },
    { id: 'arizona', label: 'Arizona', icon: FaMapMarkerAlt },
    { id: 'wyoming', label: 'Wyoming', icon: FaMapMarkerAlt }
  ];

  // Enhanced fuzzy search setup
  const fuse = useMemo(() => new Fuse(availableParks, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'fullName', weight: 0.3 },
      { name: 'state', weight: 0.2 },
      { name: 'description', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2
  }), [availableParks]);

  // Debounced search function with performance optimization
  const debouncedSearch = useMemo(
    () => debounce((searchValue, callback) => {
      if (searchValue.length < 2) {
        callback([]);
        return;
      }

      const results = fuse.search(searchValue)
        .slice(0, 12)
        .map(result => ({
          ...result.item,
          relevanceScore: Math.round((1 - result.score) * 100),
          searchHighlight: true
        }));
      
      callback(results);
    }, 300),
    [fuse]
  );

  // Enhanced search handler
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);

    if (value.length === 0) {
      setSearchResults([]);
      return;
    }

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    // Show loading state
    setSearchResults([{ id: 'loading', name: 'Searching...', isLoading: true }]);

    debouncedSearch(value, (results) => {
      setSearchResults(results);
    });
  }, [debouncedSearch]);

  // Enhanced relevance calculation
  const calculateRelevance = useCallback((park) => {
    let score = 50; // Base score
    
    // Boost popular parks
    const popularParks = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Bryce Canyon'];
    if (popularParks.some(popular => park.name?.includes(popular))) {
      score += 30;
    }
    
    // Boost search matches if searching
    if (searchTerm && park.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      score += 25;
    }
    
    // Add some variety
    score += Math.random() * 15;
    
    return Math.min(100, Math.round(score));
  }, [searchTerm]);

  // Enhanced filtering logic with search integration
  const getFilteredParks = useMemo(() => {
    let filtered = [];

    if (searchTerm.length >= 2) {
      // Use search results when searching
      filtered = searchResults.filter(park => 
        !park.isLoading && !selectedParkIds.includes(park.id)
      );
    } else {
      // Use original filtering when not searching
      filtered = availableParks.filter(park => 
        !selectedParkIds.includes(park.id)
      );

      // Apply category filter
      if (activeFilter !== 'all') {
        filtered = filtered.filter(park => {
          const name = park.name?.toLowerCase() || '';
          const state = park.state?.toLowerCase() || '';
          
          switch(activeFilter) {
            case 'popular':
              return ['yellowstone', 'yosemite', 'grand canyon', 'zion', 'bryce'].some(p => name.includes(p));
            case 'california':
              return state.includes('california');
            case 'utah':
              return state.includes('utah');
            case 'arizona':
              return state.includes('arizona');
            case 'wyoming':
              return state.includes('wyoming');
            default:
              return true;
          }
        });
      }

      // Add relevance scores for non-search results
      filtered = filtered
        .map(park => ({
          ...park,
          relevanceScore: calculateRelevance(park)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return filtered.slice(0, 12); // Limit results for performance
  }, [availableParks, selectedParkIds, searchTerm, activeFilter, searchResults, calculateRelevance]);

  const handleParkSelect = (park) => {
    onAddPark(park);
    if (searchTerm) {
      setSearchTerm('');
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const getActivityIcon = (park) => {
    const desc = park.description?.toLowerCase() || '';
    const name = park.name?.toLowerCase() || '';
    
    if (desc.includes('desert') || name.includes('death valley') || name.includes('joshua')) return '🏜️';
    if (desc.includes('mountain') || name.includes('denali') || name.includes('rainier')) return '🏔️';
    if (desc.includes('lake') || desc.includes('water') || name.includes('crater lake')) return '💧';
    if (desc.includes('forest') || name.includes('redwood') || name.includes('sequoia')) return '🌲';
    if (desc.includes('canyon') || name.includes('grand canyon') || name.includes('bryce')) return '🏞️';
    if (name.includes('yellowstone')) return '🌋';
    if (name.includes('yosemite')) return '⛰️';
    return '🏞️';
  };

  const getPopularityBadge = (park) => {
    const popularParks = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Bryce Canyon'];
    const isPopular = popularParks.some(popular => park.name?.includes(popular));
    
    if (isPopular) {
      return (
        <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
          <FaStar className="text-xs" />
          Popular
        </span>
      );
    }
    return null;
  };

  // Search term highlighting function
  const highlightSearchTerm = (text, term) => {
    if (!term || !text || term.length < 2) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gradient-to-r from-pink-200 to-purple-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"></div>
          <div className="flex gap-2 overflow-x-auto">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl">
              <FaSearch className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Enhanced Park Discovery</h3>
              <p className="text-gray-500 text-sm">
                {availableParks.length} parks available • {selectedParks.length} selected
                {searchTerm && ` • "${searchTerm}"`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search parks by name, state, or features... (try 'utah' or 'canyon')"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(searchTerm.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full p-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all min-h-[48px]"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowDropdown(false);
                  setSearchResults([]);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Search Statistics */}
          {searchTerm && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {searchResults.length > 0 && !searchResults[0]?.isLoading && (
                  <span>Found {searchResults.length} parks matching "{searchTerm}"</span>
                )}
                {searchResults.length === 0 && searchTerm.length >= 2 && !searchResults[0]?.isLoading && (
                  <span>No parks found for "{searchTerm}" - try different keywords</span>
                )}
                {searchResults[0]?.isLoading && (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                    Searching...
                  </span>
                )}
              </div>
              {searchTerm.length >= 2 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Fuzzy search enabled
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterCategories.map(category => {
            const Icon = category.icon;
            const isActive = activeFilter === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] ${
                  isActive
                    ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <Icon className="text-xs" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Search Results Summary */}
        {(searchTerm || activeFilter !== 'all') && (
          <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <FaSearch className="text-blue-500" />
              <span>
                Found {getFilteredParks.length} parks
                {searchTerm && ` matching "${searchTerm}"`}
                {activeFilter !== 'all' && ` in ${filterCategories.find(f => f.id === activeFilter)?.label}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search Dropdown Results */}
      {showDropdown && getFilteredParks.length > 0 && searchTerm.length >= 2 && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-20">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FaSearch className="text-pink-500" />
              Quick Add from Search ({getFilteredParks.length})
            </div>
            
            <div className="space-y-2">
              {getFilteredParks.slice(0, 6).map(park => (
                <div
                  key={park.id}
                  onClick={() => handleParkSelect(park)}
                  className="group p-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 cursor-pointer rounded-lg transition-all duration-200 border border-transparent hover:border-pink-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getActivityIcon(park)}</span>
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                          {highlightSearchTerm(park.name || park.fullName, searchTerm)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {highlightSearchTerm(park.state, searchTerm)}
                        </div>
                      </div>
                      {getPopularityBadge(park)}
                      {park.relevanceScore && (
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          park.relevanceScore >= 80 
                            ? 'bg-green-100 text-green-700'
                            : park.relevanceScore >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {park.relevanceScore}% match
                        </div>
                      )}
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

      {/* Main Park Grid */}
      {!showDropdown && (
        <FadeInWrapper delay={0.2}>
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
            {getFilteredParks.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">
                    {searchTerm || activeFilter !== 'all' ? 'Search Results' : 'Recommended Parks'}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {getFilteredParks.length} park{getFilteredParks.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredParks.map((park, index) => (
                    <FadeInWrapper key={park.id} delay={index * 0.1}>
                      <div className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="p-6">
                          {/* Park Header with Enhanced Badges */}
                          <div className="flex items-start justify-between mb-4">
                            <span className="text-3xl">{getActivityIcon(park)}</span>
                            <div className="flex flex-col items-end gap-2">
                              {getPopularityBadge(park)}
                              {/* Relevance Score Badge */}
                              {park.relevanceScore && (
                                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  park.relevanceScore >= 80 
                                    ? 'bg-green-100 text-green-700'
                                    : park.relevanceScore >= 60
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {park.relevanceScore}% match
                                </div>
                              )}
                              {/* Search Result Badge */}
                              {park.searchHighlight && (
                                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Search Result
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Enhanced Park Title with Search Highlighting */}
                          <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                            {highlightSearchTerm(park.name || park.fullName, searchTerm)}
                          </h4>
                          
                          <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-pink-500 flex-shrink-0" />
                            <span>{highlightSearchTerm(park.state || 'Various States', searchTerm)}</span>
                          </div>
                          
                          {park.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                              {highlightSearchTerm(park.description.substring(0, 100), searchTerm)}...
                            </p>
                          )}
                          
                          <button
                            onClick={() => handleParkSelect(park)}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[48px]"
                          >
                            <FaPlus /> Add to Trip
                          </button>
                        </div>
                      </div>
                    </FadeInWrapper>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No parks found</h4>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? `No parks match "${searchTerm}"` 
                    : 'Try adjusting your filters to see more parks'
                  }
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSearchResults([]);
                      }}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-sm min-h-[40px]"
                    >
                      Clear Search
                    </button>
                  )}
                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm min-h-[40px]"
                    >
                      Show All Parks
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </FadeInWrapper>
      )}

      {/* Enhanced Tips Panel */}
      {!searchTerm && !showDropdown && activeFilter === 'all' && getFilteredParks.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-2xl">💡</div>
            <div>
              <div className="font-medium text-blue-800 mb-2">Enhanced Search Tips</div>
              <div className="text-blue-700 text-sm space-y-1">
                <div>• <strong>Fuzzy search:</strong> Type "yosemte" and still find "Yosemite"</div>
                <div>• <strong>Multi-field search:</strong> Search by name, state, or features</div>
                <div>• <strong>Smart suggestions:</strong> Parks ranked by relevance score</div>
                <div>• <strong>Quick filters:</strong> Use category buttons for region-specific results</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkSelector;