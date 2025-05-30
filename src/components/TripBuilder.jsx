// src/components/TripBuilder.jsx - Complete Enhanced Version
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ParkSelector from './ParkSelector';
import TripMap from './TripMap';
import FadeInWrapper from './FadeInWrapper';
import { 
  FaRoute, 
  FaSave, 
  FaTimes, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaEdit,
  FaCogs
} from 'react-icons/fa';

const TripBuilder = ({ trip, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [tripData, setTripData] = useState(trip);
  const [allParks, setAllParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parksLoading, setParksLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Trip Details', icon: FaEdit, description: 'Name your adventure' },
    { id: 2, title: 'Select Parks', icon: FaMapMarkerAlt, description: 'Choose your destinations' },
    { id: 3, title: 'Plan Route', icon: FaRoute, description: 'Optimize your journey' },
    { id: 4, title: 'Review & Save', icon: FaCheckCircle, description: 'Finalize your trip' }
  ];

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
    const R = 3959;
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const optimizeNearestNeighbor = (parks) => {
    if (parks.length <= 2) return parks;
    
    const optimized = [];
    const remaining = [...parks];
    
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
    
    return optimized;
  };

  const optimizeMultipleStartPoints = (parks) => {
    if (parks.length <= 2) return parks;
    
    let bestRoute = parks;
    let bestDistance = getTotalDistance(parks);
    
    for (let startIndex = 0; startIndex < Math.min(parks.length, 5); startIndex++) {
      const reorderedParks = [
        parks[startIndex],
        ...parks.slice(0, startIndex),
        ...parks.slice(startIndex + 1)
      ];
      
      const optimizedFromThisStart = optimizeNearestNeighbor([...reorderedParks]);
      const distance = getTotalDistance(optimizedFromThisStart);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestRoute = optimizedFromThisStart;
      }
    }
    
    return bestRoute;
  };

  const getTotalDistance = (parks) => {
    if (parks.length < 2) return 0;
    
    let total = 0;
    for (let i = 0; i < parks.length - 1; i++) {
      total += calculateDistance(parks[i].coordinates, parks[i + 1].coordinates);
    }
    return total;
  };

  const optimizeRoute = () => {
    if (tripData.parks.length < 2) {
      showToast('You need at least 2 parks to optimize the route', 'info');
      return;
    }
    
    const originalParks = [...tripData.parks];
    
    try {
      const nearestNeighborRoute = optimizeNearestNeighbor([...tripData.parks]);
      const multiStartRoute = optimizeMultipleStartPoints([...tripData.parks]);
      
      const bestRoute = getTotalDistance(nearestNeighborRoute) <= getTotalDistance(multiStartRoute) 
        ? nearestNeighborRoute 
        : multiStartRoute;
      
      const oldDistance = getTotalDistance(originalParks);
      const newDistance = getTotalDistance(bestRoute);
      const savings = oldDistance - newDistance;
      
      setTripData({ ...tripData, parks: bestRoute });
      
      if (savings > 5) {
        showToast(`🎯 Route optimized! Saved ${Math.round(savings)} miles and $${Math.round(savings * 0.15)} in gas costs!`, 'success');
      } else {
        showToast('✅ Your route is already well optimized!', 'info');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      showToast('⚠️ Optimization failed, keeping original route', 'warning');
    }
  };

  const calculateTotalDistance = () => {
    return Math.round(getTotalDistance(tripData.parks));
  };

  const calculateDetailedBudget = () => {
    const distance = calculateTotalDistance();
    const numParks = tripData.parks.length;
    const totalDays = tripData.parks.reduce((sum, park) => sum + park.stayDuration, 0);
    
    const breakdown = {
      transportation: {
        gasoline: Math.round(distance * 0.15),
        wear: Math.round(distance * 0.05),
        tolls: Math.round(distance * 0.02),
      },
      accommodation: {
        camping: Math.round(totalDays * 35),
        hotels: Math.round(totalDays * 120),
        recommended: Math.round(totalDays * 85)
      },
      parkFees: {
        entries: numParks * 30,
        parking: numParks * 5,
        permits: Math.round(numParks * 0.3 * 25)
      },
      food: {
        budget: totalDays * 35,
        moderate: totalDays * 65,
        dining: totalDays * 95
      }
    };
    
    const budgetLevels = {
      budget: breakdown.transportation.gasoline + breakdown.transportation.wear + 
               breakdown.accommodation.camping + breakdown.parkFees.entries + 
               breakdown.parkFees.parking + breakdown.food.budget,
               
      moderate: breakdown.transportation.gasoline + breakdown.transportation.wear + 
                breakdown.transportation.tolls + breakdown.accommodation.recommended + 
                breakdown.parkFees.entries + breakdown.parkFees.parking + 
                breakdown.parkFees.permits + breakdown.food.moderate,
                
      comfortable: breakdown.transportation.gasoline + breakdown.transportation.wear + 
                   breakdown.transportation.tolls + breakdown.accommodation.hotels + 
                   breakdown.parkFees.entries + breakdown.parkFees.parking + 
                   breakdown.parkFees.permits + breakdown.food.dining
    };
    
    return {
      breakdown,
      budgetLevels,
      recommended: budgetLevels.moderate
    };
  };

  const calculateEstimatedCost = () => {
    const detailedBudget = calculateDetailedBudget();
    return detailedBudget.recommended;
  };

  const handleSave = async () => {
    if (!tripData.title.trim()) {
      showToast('Please enter a trip title', 'error');
      setCurrentStep(1);
      return;
    }
    if (tripData.parks.length === 0) {
      showToast('Please add at least one park', 'error');
      setCurrentStep(2);
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

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return tripData.title.trim().length > 0;
      case 2: return tripData.parks.length > 0;
      case 3: return true;
      case 4: return tripData.title.trim() && tripData.parks.length > 0;
      default: return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <FadeInWrapper delay={0.1}>
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Create Your Trip</h2>
            <div className="text-sm text-gray-500">Step {currentStep} of 4</div>
          </div>
          
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-pink-500 border-pink-500 text-white shadow-lg' 
                      : isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <FaCheckCircle /> : <Icon />}
                  </div>
                  <div className="ml-3 min-w-0">
                    <div className={`text-sm font-medium ${isActive ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ml-4 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </FadeInWrapper>

      {/* Step Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Step 1: Trip Details */}
          {currentStep === 1 && (
            <FadeInWrapper delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaEdit className="text-pink-500" />
                  Trip Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Trip Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Southwest National Parks Adventure"
                      value={tripData.title}
                      onChange={(e) => setTripData({...tripData, title: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg font-medium focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={tripData.startDate}
                          onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all text-gray-700 bg-white"
                          style={{
                            colorScheme: 'light',
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield'
                          }}
                        />
                        <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {tripData.startDate && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          ✓ {new Date(tripData.startDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={tripData.endDate}
                          onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                          min={tripData.startDate || new Date().toISOString().split('T')[0]}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all text-gray-700 bg-white"
                          style={{
                            colorScheme: 'light',
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield'
                          }}
                        />
                        <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {tripData.endDate && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          ✓ {new Date(tripData.endDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                    <textarea
                      placeholder="Describe your adventure, goals, or special interests..."
                      value={tripData.description}
                      onChange={(e) => setTripData({...tripData, description: e.target.value})}
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </FadeInWrapper>
          )}

          {/* Step 2: Select Parks */}
          {currentStep === 2 && (
            <FadeInWrapper delay={0.2}>
              <div className="space-y-6">
                <ParkSelector 
                  availableParks={allParks}
                  selectedParks={tripData.parks}
                  onAddPark={addParkToTrip}
                  loading={parksLoading}
                />
                
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <FaMapMarkerAlt className="text-pink-500" />
                      Selected Parks ({tripData.parks.length})
                    </h3>
                    {tripData.parks.length > 1 && (
                      <button
                        onClick={optimizeRoute}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                      >
                        <FaCogs /> Optimize Route
                      </button>
                    )}
                  </div>
                  
                  {tripData.parks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏞️</div>
                      <h4 className="text-xl font-semibold text-gray-600 mb-2">No parks selected yet</h4>
                      <p className="text-gray-500">Search and add parks above to start planning your adventure!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tripData.parks.map((park, index) => (
                        <div key={park.parkId} className="group bg-gradient-to-r from-gray-50 to-pink-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                          <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-lg mb-3">{park.parkName}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Visit Date</label>
                                  <input
                                    type="date"
                                    value={park.visitDate}
                                    onChange={(e) => updateParkDetails(park.parkId, 'visitDate', e.target.value)}
                                    min={tripData.startDate || new Date().toISOString().split('T')[0]}
                                    max={tripData.endDate || undefined}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Stay Duration</label>
                                  <select
                                    value={park.stayDuration}
                                    onChange={(e) => updateParkDetails(park.parkId, 'stayDuration', parseInt(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                                  >
                                    {[1,2,3,4,5,6,7].map(days => (
                                      <option key={days} value={days}>
                                        {days} day{days > 1 ? 's' : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeParkFromTrip(park.parkId)}
                              className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </FadeInWrapper>
          )}

          {/* Step 3: Plan Route */}
          {currentStep === 3 && (
            <FadeInWrapper delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaRoute className="text-pink-500" />
                  Route Planning
                </h3>
                
                {tripData.parks.length > 1 ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h4 className="font-semibold text-blue-800 mb-2">Smart Route Optimization</h4>
                      <p className="text-blue-700 text-sm mb-4">
                        Our algorithm analyzes multiple routes and finds the shortest path between all your selected parks.
                      </p>
                      <button
                        onClick={optimizeRoute}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium"
                      >
                        <FaCogs /> Optimize My Route
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <FaClock className="text-green-600" />
                          Travel Insights
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Total Distance:</span>
                            <span className="font-medium">{calculateTotalDistance()} miles</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Estimated Drive Time:</span>
                            <span className="font-medium">{Math.round(calculateTotalDistance() / 60)} hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Gas Cost:</span>
                            <span className="font-medium">${Math.round(calculateTotalDistance() * 0.15)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-purple-600" />
                          Trip Overview
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Parks to Visit:</span>
                            <span className="font-medium">{tripData.parks.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Total Days:</span>
                            <span className="font-medium">
                              {tripData.parks.reduce((sum, park) => sum + park.stayDuration, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Park Fees:</span>
                            <span className="font-medium">${tripData.parks.length * 30}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">Add more parks to plan your route</h4>
                    <p className="text-gray-500">You need at least 2 parks to create a route plan.</p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-4 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
                    >
                      Go Back & Add Parks
                    </button>
                  </div>
                )}
              </div>
            </FadeInWrapper>
          )}

          {/* Step 4: Review & Save */}
          {currentStep === 4 && (
            <FadeInWrapper delay={0.2}>
              <div className="space-y-6">
                {/* Trip Summary Card */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold mb-2">{tripData.title || 'Untitled Trip'}</h3>
                  <p className="text-pink-100 mb-6">{tripData.description || 'No description provided'}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{tripData.parks.length}</div>
                      <div className="text-pink-200 text-sm">Parks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {tripData.parks.reduce((sum, park) => sum + park.stayDuration, 0)}
                      </div>
                      <div className="text-pink-200 text-sm">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">${calculateEstimatedCost()}</div>
                      <div className="text-pink-200 text-sm">Budget</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Budget Breakdown */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Detailed Budget Breakdown</h3>
                  
                  {(() => {
                    const budget = calculateDetailedBudget();
                    return (
                      <>
                        {/* Budget Level Selector */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {Object.entries(budget.budgetLevels).map(([level, cost]) => (
                            <div key={level} className={`p-4 rounded-xl border-2 text-center transition-all ${
                              level === 'moderate' ? 'border-pink-300 bg-pink-50' : 'border-gray-200'
                            }`}>
                              <div className="text-lg font-bold capitalize text-gray-800">{level}</div>
                              <div className="text-2xl font-bold text-pink-600">${cost}</div>
                              <div className="text-xs text-gray-500">Total Trip Cost</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Breakdown Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700">Transportation</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Gasoline ({calculateTotalDistance()} miles)</span>
                                <span>${budget.breakdown.transportation.gasoline}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vehicle wear & tear</span>
                                <span>${budget.breakdown.transportation.wear}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tolls (estimated)</span>
                                <span>${budget.breakdown.transportation.tolls}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700">
                              Accommodation ({tripData.parks.reduce((sum, park) => sum + park.stayDuration, 0)} nights)
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Camping</span>
                                <span>${budget.breakdown.accommodation.camping}</span>
                              </div>
                              <div className="flex justify-between text-pink-600 font-medium">
                                <span>Mixed (recommended)</span>
                                <span>${budget.breakdown.accommodation.recommended}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hotels</span>
                                <span>${budget.breakdown.accommodation.hotels}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700">Park Fees</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Entry fees ({tripData.parks.length} parks)</span>
                                <span>${budget.breakdown.parkFees.entries}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Parking fees</span>
                                <span>${budget.breakdown.parkFees.parking}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Special permits</span>
                                <span>${budget.breakdown.parkFees.permits}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700">
                              Food ({tripData.parks.reduce((sum, park) => sum + park.stayDuration, 0)} days)
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Budget meals</span>
                                <span>${budget.breakdown.food.budget}</span>
                              </div>
                              <div className="flex justify-between text-pink-600 font-medium">
                                <span>Moderate (recommended)</span>
                                <span>${budget.breakdown.food.moderate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Restaurant dining</span>
                                <span>${budget.breakdown.food.dining}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Budget Tips */}
                        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <span className="text-xl">💡</span>
                            Money-Saving Tips
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                            <div>• Book campsites in advance for better rates</div>
                            <div>• Pack meals and snacks to reduce food costs</div>
                            <div>• Get the America the Beautiful Annual Pass ($80)</div>
                            <div>• Consider visiting during shoulder seasons</div>
                            <div>• Use GasBuddy app to find cheapest gas stations</div>
                            <div>• Stay in nearby towns for cheaper accommodation</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Parks Itinerary */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Your Itinerary</h3>
                  
                  {tripData.parks.length > 0 ? (
                    <div className="space-y-4">
                      {tripData.parks.map((park, index) => (
                        <div key={park.parkId} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl border border-gray-200">
                          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{park.parkName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              {park.visitDate && (
                                <div className="flex items-center gap-1">
                                  <FaCalendarAlt className="text-pink-500" />
                                  {new Date(park.visitDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <FaClock className="text-blue-500" />
                                {park.stayDuration} day{park.stayDuration > 1 ? 's' : ''}
                              </div>
                              {index < tripData.parks.length - 1 && (
                                <div className="flex items-center gap-1">
                                  <FaRoute className="text-green-500" />
                                  {Math.round(calculateDistance(park.coordinates, tripData.parks[index + 1].coordinates))} mi to next
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl block mb-2">📋</span>
                      <p>No parks in your itinerary yet</p>
                    </div>
                  )}
                </div>

                {/* Final Details Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Trip Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Trip Title</span>
                        <span className="text-gray-900">{tripData.title || 'Not set'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Date Range</span>
                        <span className="text-gray-900">
                          {tripData.startDate && tripData.endDate 
                            ? `${new Date(tripData.startDate).toLocaleDateString()} - ${new Date(tripData.endDate).toLocaleDateString()}`
                            : 'Not set'
                          }
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Total Duration</span>
                        <span className="text-gray-900">
                          {tripData.startDate && tripData.endDate 
                            ? (() => {
                                const start = new Date(tripData.startDate);
                                const end = new Date(tripData.endDate);
                                const diffTime = Math.abs(end - start);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                              })()
                            : 'Not set'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Parks Selected</span>
                        <span className="text-gray-900">{tripData.parks.length} parks</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Total Distance</span>
                        <span className="text-gray-900">{calculateTotalDistance()} miles</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                        <span className="font-medium text-green-700">Estimated Total Cost</span>
                        <span className="text-green-900 font-bold text-lg">${calculateEstimatedCost()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ready to Save Message */}
                  <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 text-white rounded-full p-2">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">Ready to Save Your Trip!</h4>
                        <p className="text-green-700 text-sm">
                          Your trip plan is complete. Click "Save Trip" to store it and start your adventure planning!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWrapper>
          )}

        </div>

        {/* Right Sidebar - Map */}
        <div className="xl:col-span-1">
          <div className="sticky top-4">
            <FadeInWrapper delay={0.3}>
              <TripMap parks={tripData.parks} />
            </FadeInWrapper>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <FadeInWrapper delay={0.4}>
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            <FaChevronLeft />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          <div className="flex items-center gap-4">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
              >
                Next Step
                <FaChevronRight />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading || !canProceedToNext()}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
              >
                <FaSave />
                {loading ? 'Saving Trip...' : 'Save Trip'}
              </button>
            )}
          </div>
        </div>
      </FadeInWrapper>
    </div>
  );
};

export default TripBuilder;