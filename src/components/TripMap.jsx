// Fixed TripMap.jsx - Simplified and Reliable
import React from 'react';
import { FaMapMarkerAlt, FaRoute, FaCar, FaPlane } from 'react-icons/fa';

const TripMap = ({ 
  parks = [], 
  transportationMode = 'driving'
}) => {
  
  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2 || 
        typeof coord1.lat !== 'number' || typeof coord1.lng !== 'number' ||
        typeof coord2.lat !== 'number' || typeof coord2.lng !== 'number') {
      return 0;
    }
    
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateTotalDistance = () => {
    if (parks.length < 2) return 0;
    
    let total = 0;
    for (let i = 0; i < parks.length - 1; i++) {
      const park1 = parks[i];
      const park2 = parks[i + 1];
      
      if (park1.coordinates && park2.coordinates) {
        const distance = calculateDistance(park1.coordinates, park2.coordinates);
        total += distance;
      }
    }
    
    return Math.round(total);
  };

  const calculateTravelTime = () => {
    const distance = calculateTotalDistance();
    if (transportationMode === 'flying') {
      // Assume 2.5 hours per flight (including airport time)
      const flightLegs = Math.max(0, parks.length - 1);
      return `${Math.round(flightLegs * 2.5)}h`;
    } else {
      // Assume 60 mph average driving speed
      const drivingHours = distance > 0 ? Math.round(distance / 60) : 0;
      return `${drivingHours}h`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-pink-800 flex items-center gap-2">
              <span className="text-lg">🗺️</span> 
              <span className="hidden sm:inline">Trip Route Overview</span>
              <span className="sm:hidden">Route Map</span>
            </h3>
            <p className="text-sm text-pink-600 mt-1">
              {parks.length === 0 
                ? 'Add parks to see your route' 
                : `${parks.length} park${parks.length !== 1 ? 's' : ''} • ${calculateTotalDistance()} miles • ${transportationMode === 'flying' ? 'Flight' : 'Road'} trip`
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-8 h-8 bg-blue-300 rounded-full"></div>
          <div className="absolute top-12 right-8 w-6 h-6 bg-green-300 rounded-full"></div>
          <div className="absolute bottom-8 left-12 w-4 h-4 bg-purple-300 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-pink-300 rounded-full"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Route Overview</h3>
            <p className="text-sm text-gray-600">
              {parks.length} stops • {calculateTotalDistance()} miles • {transportationMode}
            </p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-4 max-h-72 overflow-y-auto">
            {parks.map((park, index) => (
              <div key={park.parkId || index} className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <h4 className="font-semibold text-gray-800">{park.parkName}</h4>
                  {park.state && (
                    <p className="text-sm text-gray-600">{park.state}</p>
                  )}
                  {park.stayDuration && (
                    <p className="text-xs text-gray-500">{park.stayDuration} day{park.stayDuration > 1 ? 's' : ''}</p>
                  )}
                </div>
                {index < parks.length - 1 && (
                  <div className="flex items-center gap-2 text-gray-500 flex-shrink-0">
                    {transportationMode === 'flying' ? <FaPlane /> : <FaCar />}
                    <div className="text-xs">
                      {park.coordinates && parks[index + 1].coordinates &&
                       typeof park.coordinates.lat === 'number' &&
                       typeof parks[index + 1].coordinates.lat === 'number'
                        ? `${Math.round(calculateDistance(park.coordinates, parks[index + 1].coordinates))} mi`
                        : 'Distance N/A'
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {parks.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🏞️</div>
                <p className="font-medium">Add parks to see your route</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer with trip stats */}
      {parks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-pink-50 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800">{parks.length}</div>
              <div className="text-xs text-gray-600">Parks</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{calculateTotalDistance()}</div>
              <div className="text-xs text-gray-600">Miles</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{calculateTravelTime()}</div>
              <div className="text-xs text-gray-600">Travel Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {parks.reduce((sum, park) => sum + (parseInt(park.stayDuration) || 1), 0)}
              </div>
              <div className="text-xs text-gray-600">Park Days</div>
            </div>
          </div>
          
          {/* Transportation mode indicator */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
              {transportationMode === 'flying' ? <FaPlane /> : <FaCar />}
              <span className="font-medium capitalize">{transportationMode} trip</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMap;