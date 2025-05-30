// src/components/TripBuilder.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ParkSelector from './ParkSelector';
import TripMap from './TripMap';
import FadeInWrapper from './FadeInWrapper';
import { FaRoute, FaSave, FaTimes, FaOptimize } from 'react-icons/fa';

const TripBuilder = ({ trip, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [tripData, setTripData] = useState(trip);
  const [allParks, setAllParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parksLoading, setParksLoading] = useState(true);

  useEffect(() => {
    fetchAllParks();
  }, []);

  const fetchAllParks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'parks'));
      const parks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllParks(parks);
    } catch (error) {
      console.error('Error fetching parks:', error);
      showToast('Failed to load parks data', 'error');
    } finally {
      setParksLoading(false);
    }
  };

  const addParkToTrip = (park) => {
    // Extract coordinates from the "lat,lng" string format your app uses
    let coordinates = { lat: 0, lng: 0 };
    if (park.coordinates && park.coordinates.includes(',')) {
      const [lat, lng] = park.coordinates.split(',').map(val => parseFloat(val.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = { lat, lng };
      }
    }

    const newPark = {
      parkId: park.id,
      parkName: park.name || park.fullName,
      visitDate: '',
      stayDuration: 1,
      coordinates,
      slug: park.slug
    };
    
    setTripData({
      ...tripData,
      parks: [...tripData.parks, newPark]
    });
  };

  const removeParkFromTrip = (parkId) => {
    setTripData({
      ...tripData,
      parks: tripData.parks.filter(p => p.parkId !== parkId)
    });
  };

  const updateParkDetails = (parkId, field, value) => {
    setTripData({
      ...tripData,
      parks: tripData.parks.map(park => 
        park.parkId === parkId ? { ...park, [field]: value } : park
      )
    });
  };

  const calculateDistance = (coord1, coord2) => {
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

  const optimizeRoute = () => {
    if (tripData.parks.length < 2) return;
    
    // Simple nearest neighbor algorithm
    const optimized = [];
    const remaining = [...tripData.parks];
    
    let current = remaining.shift();
    optimized.push(current);

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let shortestDistance = calculateDistance(current.coordinates, remaining[0].coordinates);

      for (let i = 1; i < remaining.length; i++) {
        const distance = calculateDistance(current.coordinates, remaining[i].coordinates);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = i;
        }
      }

      current = remaining.splice(nearestIndex, 1)[0];
      optimized.push(current);
    }
    
    setTripData({ ...tripData, parks: optimized });
    showToast('🎯 Route optimized!', 'success');
  };

  const calculateTotalDistance = () => {
    if (tripData.parks.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < tripData.parks.length - 1; i++) {
      const distance = calculateDistance(
        tripData.parks[i].coordinates,
        tripData.parks[i + 1].coordinates
      );
      totalDistance += distance;
    }
    return Math.round(totalDistance);
  };

  const calculateEstimatedCost = () => {
    const distance = calculateTotalDistance();
    const gasCost = distance * 0.15; // $0.15 per mile
    const parkFees = tripData.parks.length * 30; // $30 average entry fee
    const lodging = tripData.parks.reduce((sum, park) => sum + (park.stayDuration * 150), 0); // $150/night
    return Math.round(gasCost + parkFees + lodging);
  };

  const handleSave = async () => {
    if (!tripData.title.trim()) {
      showToast('Please enter a trip title', 'error');
      return;
    }
    if (tripData.parks.length === 0) {
      showToast('Please add at least one park', 'error');
      return;
    }

    setLoading(true);
    try {
      const tripToSave = {
        ...tripData,
        totalDistance: calculateTotalDistance(),
        estimatedCost: calculateEstimatedCost()
      };
      await onSave(tripToSave);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <FadeInWrapper delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <input
              type="text"
              placeholder="Enter your trip title..."
              value={tripData.title}
              onChange={(e) => setTripData({...tripData, title: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={tripData.startDate}
                onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={tripData.endDate}
                onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>
        </div>
      </FadeInWrapper>

      <FadeInWrapper delay={0.2}>
        <textarea
          placeholder="Describe your trip adventure..."
          value={tripData.description}
          onChange={(e) => setTripData({...tripData, description: e.target.value})}
          className="w-full p-4 border border-gray-200 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
        />
      </FadeInWrapper>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Panel - Trip Building */}
        <div className="space-y-6">
          <FadeInWrapper delay={0.3}>
            <ParkSelector 
              availableParks={allParks}
              selectedParks={tripData.parks}
              onAddPark={addParkToTrip}
              loading={parksLoading}
            />
          </FadeInWrapper>

          {/* Selected Parks */}
          <FadeInWrapper delay={0.4}>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Selected Parks ({tripData.parks.length})
                </h3>
                {tripData.parks.length > 1 && (
                  <button
                    onClick={optimizeRoute}
                    className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-800 font-medium"
                  >
                    <FaRoute /> Optimize Route
                  </button>
                )}
              </div>
              
              {tripData.parks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">🏞️</span>
                  <p>No parks selected yet</p>
                  <p className="text-sm">Search and add parks above to start planning!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tripData.parks.map((park, index) => (
                    <div key={park.parkId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{park.parkName}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="date"
                            value={park.visitDate}
                            onChange={(e) => updateParkDetails(park.parkId, 'visitDate', e.target.value)}
                            className="text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
                            placeholder="Visit date"
                          />
                          <select
                            value={park.stayDuration}
                            onChange={(e) => updateParkDetails(park.parkId, 'stayDuration', parseInt(e.target.value))}
                            className="text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
                          >
                            {[1,2,3,4,5,6,7].map(days => (
                              <option key={days} value={days}>
                                {days} day{days > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => removeParkFromTrip(park.parkId)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeInWrapper>

          {/* Trip Summary */}
          {tripData.parks.length > 0 && (
            <FadeInWrapper delay={0.5}>
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6">
                <h3 className="font-semibold text-pink-800 mb-4 flex items-center gap-2">
                  <span className="text-lg">📊</span> Trip Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Distance:</span>
                    <span className="font-medium text-pink-700">{calculateTotalDistance()} miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Cost:</span>
                    <span className="font-medium text-pink-700">${calculateEstimatedCost()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parks to Visit:</span>
                    <span className="font-medium text-pink-700">{tripData.parks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Days:</span>
                    <span className="font-medium text-pink-700">
                      {tripData.parks.reduce((sum, park) => sum + park.stayDuration, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </FadeInWrapper>
          )}

          {/* Action Buttons */}
          <FadeInWrapper delay={0.6}>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading || !tripData.title || tripData.parks.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-pink-600 text-white py-3 px-6 rounded-xl hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                <FaSave /> {loading ? 'Saving...' : 'Save Trip'}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-400 font-medium transition"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </FadeInWrapper>
        </div>

        {/* Right Panel - Map */}
        <div className="xl:sticky xl:top-4">
          <FadeInWrapper delay={0.7}>
            <TripMap parks={tripData.parks} />
          </FadeInWrapper>
        </div>
      </div>
    </div>
  );
};

export default TripBuilder;