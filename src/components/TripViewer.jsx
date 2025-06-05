// Fixed TripViewer.jsx
import React, { useState } from 'react';
import { 
  FaEye,
  FaEdit,
  FaTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRoute,
  FaDollarSign,
  FaCar,
  FaPlane
} from 'react-icons/fa';
import TripMap from './TripMap';

const TripViewer = ({ trip, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', title: 'Overview', icon: FaEye },
    { id: 'itinerary', title: 'Itinerary', icon: FaCalendarAlt },
    { id: 'map', title: 'Route Map', icon: FaRoute },
    { id: 'budget', title: 'Budget', icon: FaDollarSign }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    if (!trip.startDate || !trip.endDate) {
      // Fallback to totalDuration or calculate from parks
      if (trip.totalDuration) return trip.totalDuration;
      if (trip.parks?.length) {
        return trip.parks.reduce((sum, park) => sum + (park.stayDuration || 1), 0);
      }
      return 0;
    }
    
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    // Normalize to start of day to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const generateItinerary = () => {
    const duration = calculateDuration();
    if (duration === 0 || !trip.parks?.length) return [];

    let itinerary = [];
    let currentDay = 1;
    
    trip.parks.forEach((park, index) => {
      const daysAtPark = park.stayDuration || 2;
      
      for (let day = 0; day < daysAtPark; day++) {
        // Don't exceed total trip duration
        if (currentDay > duration) break;
        
        itinerary.push({
          day: currentDay,
          type: 'park',
          location: park.parkName,
          parkDay: day + 1,
          totalParkDays: daysAtPark,
          activities: day === 0 ? ['Arrival & Setup', 'Visitor Center'] : 
                     day === daysAtPark - 1 ? ['Final Exploration', 'Departure Prep'] :
                     ['Hiking & Exploration', 'Photography'],
          visitDate: park.visitDate
        });
        currentDay++;
      }
      
      // Only add travel day if there's another park and we haven't exceeded duration
      if (index < trip.parks.length - 1 && currentDay <= duration) {
        const nextPark = trip.parks[index + 1];
        const needsTravelDay = trip.transportationMode === 'flying' || 
          (park.coordinates && nextPark.coordinates && 
           calculateDistance(park.coordinates, nextPark.coordinates) > 200);
        
        if (needsTravelDay) {
          itinerary.push({
            day: currentDay,
            type: 'travel',
            from: park.parkName,
            to: nextPark.parkName,
            activities: trip.transportationMode === 'flying' 
              ? ['Flight Day', 'Airport & Travel Time']
              : ['Travel Day', 'Scenic Route Driving']
          });
          currentDay++;
        }
      }
    });
    
    return itinerary;
  };

  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2 || !coord1.lat || !coord2.lat) return 0;
    
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{trip.title}</h2>
              {trip.description && (
                <p className="text-pink-100 mb-4">{trip.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt />
                  <span>{trip.parks?.length || 0} parks</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRoute />
                  <span>{trip.totalDistance || 0} miles</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaDollarSign />
                  <span>${trip.estimatedCost || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(trip)}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
                title="Edit Trip"
              >
                <FaEdit />
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600'
                  }`}
                >
                  <Icon /> {tab.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">{calculateDuration()}</div>
                  <div className="text-pink-100 text-sm">Days</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">{trip.parks?.length || 0}</div>
                  <div className="text-blue-100 text-sm">Parks</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">{trip.totalDistance || 0}</div>
                  <div className="text-green-100 text-sm">Miles</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">${trip.estimatedCost || 0}</div>
                  <div className="text-yellow-100 text-sm">Budget</div>
                </div>
              </div>

              {/* Parks List */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Parks to Visit</h3>
                <div className="space-y-3">
                  {trip.parks?.map((park, index) => (
                    <div key={park.parkId || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{park.parkName}</h4>
                        <div className="text-sm text-gray-600">
                          {park.visitDate && `Visit: ${formatDate(park.visitDate)}`}
                          {park.visitDate && park.stayDuration && ' • '}
                          {park.stayDuration && `${park.stayDuration} day${park.stayDuration !== 1 ? 's' : ''}`}
                          {park.state && ` • ${park.state}`}
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No parks selected</p>}
                </div>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">Transportation</h4>
                  <div className="flex items-center gap-3">
                    {trip.transportationMode === 'flying' ? <FaPlane className="text-blue-600 text-xl" /> : <FaCar className="text-blue-600 text-xl" />}
                    <span className="font-medium text-blue-700 capitalize">
                      {trip.transportationMode || 'Driving'}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">Trip Style</h4>
                  <div className="text-purple-700">
                    {trip.templateId ? 'Template-based Adventure' : 'Custom Adventure'}
                  </div>
                  {trip.templateData?.difficulty && (
                    <div className="text-sm text-purple-600 mt-1">
                      Difficulty: {trip.templateData.difficulty}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Day-by-Day Itinerary</h3>
              {generateItinerary().length > 0 ? (
                generateItinerary().map((item, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${
                    item.type === 'park' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                        {item.day}
                      </div>
                      <div className="flex-1">
                        {item.type === 'park' ? (
                          <>
                            <h4 className="font-semibold text-gray-800">
                              {item.location} - Day {item.parkDay} of {item.totalParkDays}
                            </h4>
                            {item.visitDate && (
                              <div className="text-sm text-gray-600 mb-1">
                                📅 {formatDate(item.visitDate)}
                              </div>
                            )}
                            <div className="text-sm text-gray-600 mt-1">
                              {item.activities.join(' • ')}
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold text-gray-800">
                              Travel: {item.from} → {item.to}
                            </h4>
                            <div className="text-sm text-gray-600 mt-1">
                              {item.activities.join(' • ')}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No detailed itinerary available. Add parks and dates to generate an itinerary.</p>
                </div>
              )}
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Trip Route Map</h3>
              <div className="h-96">
                <TripMap 
                  parks={trip.parks || []} 
                  transportationMode={trip.transportationMode || 'driving'} 
                />
              </div>
              {trip.parks?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No parks selected for this trip.</p>
                </div>
              )}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Budget Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4">Transportation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Travel Costs:</span>
                      <span className="font-medium">
                        ${trip.transportationMode === 'flying' 
                          ? Math.round((trip.parks?.length || 0) * 275)
                          : Math.round((trip.totalDistance || 0) * 0.20)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-medium capitalize">
                        {trip.transportationMode === 'flying' ? 'Flights' : 'Road Trip'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">Accommodation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lodging ({Math.max(0, calculateDuration() - 1)} nights):</span>
                      <span className="font-medium">${Math.max(0, calculateDuration() - 1) * 85}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4">Park Fees</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Entry Fees:</span>
                      <span className="font-medium">${(trip.parks?.length || 0) * 30}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-4">Food & Meals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Meals ({calculateDuration()} days):</span>
                      <span className="font-medium">${calculateDuration() * 55}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Budget Breakdown */}
              {trip.templateData?.budgetBreakdown && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-4">Template Budget Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-indigo-700">${trip.templateData.budgetBreakdown.accommodation?.total || 0}</div>
                      <div className="text-indigo-600">Accommodation</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-indigo-700">${trip.templateData.budgetBreakdown.transportation?.total || 0}</div>
                      <div className="text-indigo-600">Transportation</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-indigo-700">${trip.templateData.budgetBreakdown.food?.total || 0}</div>
                      <div className="text-indigo-600">Food</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-indigo-700">${trip.templateData.budgetBreakdown.activities?.total || 0}</div>
                      <div className="text-indigo-600">Activities</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl text-white text-center">
                <div className="text-3xl font-bold">${trip.estimatedCost || 0}</div>
                <div className="text-green-100">Total Estimated Cost</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripViewer;