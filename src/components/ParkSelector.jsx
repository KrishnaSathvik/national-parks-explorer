// src/components/ParkSelector.jsx - Enhanced Version
import React, { useState } from 'react';
import { FaSearch, FaPlus, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const ParkSelector = ({ availableParks, selectedParks, onAddPark, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedParkIds = selectedParks.map(p => p.parkId);
  
  const filteredParks = availableParks
    .filter(park => 
      !selectedParkIds.includes(park.id) &&
      (park.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       park.state?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .slice(0, 8);

  const handleParkSelect = (park) => {
    onAddPark(park);
    setSearchTerm('');
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gradient-to-r from-pink-200 to-purple-200 rounded w-1/3"></div>
          <div className="h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl">
          <FaSearch className="text-white text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Add Parks to Your Trip</h3>
          <p className="text-gray-500 text-sm">Search from {availableParks.length} national parks</p>
        </div>
      </div>
      
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for national parks..."
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
        
        {showDropdown && filteredParks.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
            <div className="p-2">
              {filteredParks.map(park => (
                <div
                  key={park.id}
                  onClick={() => handleParkSelect(park)}
                  className="group p-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 cursor-pointer rounded-xl transition-all duration-200 border border-transparent hover:border-pink-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                          {park.name}
                        </div>
                        {park.highlight && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {park.state}
                        </div>
                        {park.bestSeason && (
                          <div className="text-pink-600 font-medium">
                            Best: {park.bestSeason}
                          </div>
                        )}
                        {park.entryFee && (
                          <div className="text-green-600 font-medium">
                            ${park.entryFee}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="bg-pink-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110">
                        <FaPlus />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDropdown && searchTerm && filteredParks.length === 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No parks found</h4>
              <p className="text-gray-500">No parks match "{searchTerm}". Try a different search term.</p>
            </div>
          </div>
        )}

        {!showDropdown && searchTerm.length === 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="text-blue-500 text-xl">💡</div>
              <div>
                <div className="font-medium text-blue-800">Quick Tip</div>
                <div className="text-blue-700 text-sm">Try searching for "Yellowstone", "Grand Canyon", or browse by state name</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkSelector;