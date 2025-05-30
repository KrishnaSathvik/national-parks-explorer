import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';

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
    .slice(0, 8); // Limit to 8 results

  const handleParkSelect = (park) => {
    onAddPark(park);
    setSearchTerm('');
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <FaSearch className="text-pink-500" />
        Add Parks to Your Trip
      </label>
      
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
          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 pl-12"
        />
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        
        {showDropdown && filteredParks.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
            {filteredParks.map(park => (
              <div
                key={park.id}
                onClick={() => handleParkSelect(park)}
                className="p-4 hover:bg-pink-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 group-hover:text-pink-600">
                      {park.name}
                    </div>
                    <div className="text-sm text-gray-500">{park.state}</div>
                    {park.bestSeason && (
                      <div className="text-xs text-pink-600 mt-1">
                        Best: {park.bestSeason}
                      </div>
                    )}
                  </div>
                  <FaPlus className="text-pink-500 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && searchTerm && filteredParks.length === 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
            <div className="text-center text-gray-500">
              <span className="text-2xl block mb-2">🔍</span>
              No parks found matching "{searchTerm}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkSelector;