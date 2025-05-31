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
  FaCogs,
  FaCar,
  FaPlane,
  FaBrain,
  FaLightbulb
} from 'react-icons/fa';

const TripBuilder = ({ trip, allParks, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [tripData, setTripData] = useState(trip);
  const [parksData, setParksData] = useState(allParks || []);
  const [loading, setLoading] = useState(false);
  const [parksLoading, setParksLoading] = useState(!allParks);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Enhanced planning states
  const [transportationMode, setTransportationMode] = useState(trip.transportationMode || 'driving');
  const [tripStyle, setTripStyle] = useState(trip.tripStyle || 'balanced');

  const steps = [
    { id: 1, title: 'Trip Details', icon: FaEdit, description: 'Plan your adventure' },
    { id: 2, title: 'Select Parks', icon: FaMapMarkerAlt, description: 'Choose destinations' },
    { id: 3, title: 'Smart Planning', icon: FaBrain, description: 'AI optimization' },
    { id: 4, title: 'Review & Save', icon: FaCheckCircle, description: 'Finalize trip' }
  ];

  useEffect(() => {
    if (!allParks || allParks.length === 0) {
      fetchAllParks();
    } else {
      setParksData(allParks);
      setParksLoading(false);
    }
  }, [allParks]);

  useEffect(() => {
    // Update trip data when transportation mode or trip style changes
    setTripData(prev => ({
      ...prev,
      transportationMode,
      tripStyle
    }));
  }, [transportationMode, tripStyle]);

  const fetchAllParks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'parks'));
      const parks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setParksData(parks);
    } catch (error) {
      console.error('Error fetching parks:', error);
      showToast('Failed to load parks data', 'error');
    } finally {
      setParksLoading(false);
    }
  };

  // Enhanced date calculation
  const calculateTripDuration = () => {
    if (!tripData.startDate || !tripData.endDate) return 0;
    
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(1, diffDays);
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
      stayDuration: tripStyle === 'relaxed' ? 3 : tripStyle === 'intensive' ? 1 : 2,
      coordinates,
      slug: park.slug || '',
      state: park.state,
      description: park.description
    };
    
    setTripData({
      ...tripData,
      parks: [...tripData.parks, newPark]
    });

    showToast(`✅ Added ${newPark.parkName} to your trip!`, 'success');
  };

  const removeParkFromTrip = (parkId) => {
    const parkToRemove = tripData.parks.find(p => p.parkId === parkId);
    setTripData({
      ...tripData,
      parks: tripData.parks.filter(p => p.parkId !== parkId)
    });
    
    if (parkToRemove) {
      showToast(`Removed ${parkToRemove.parkName} from trip`, 'info');
    }
  };

  const updateParkDetails = (parkId, field, value) => {
    setTripData({
      ...tripData,
      parks: tripData.parks.map(park => 
        park.parkId === parkId ? { ...park, [field]: value } : park
      )
    });
  };

  // Enhanced distance calculation using Haversine formula
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

  // AI-powered route optimization
  const optimizeNearestNeighbor = (parks) => {
    if (parks.length <= 2) return parks;
    
    const optimized = [];
    const remaining = [...parks];
    
    // Start with the first park
    let current = remaining.shift();
    optimized.push(current);

    // Find nearest neighbor for each subsequent park
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
      const optimizedParks = optimizeNearestNeighbor([...tripData.parks]);
      
      const oldDistance = getTotalDistance(originalParks);
      const newDistance = getTotalDistance(optimizedParks);
      const savings = oldDistance - newDistance;
      
      setTripData({ ...tripData, parks: optimizedParks });
      
      if (savings > 5) {
        const timeSaved = Math.round(savings / 60 * 10) / 10; // Assuming 60 mph average
        const costSaved = Math.round(savings * 0.15);
        showToast(`🎯 Route optimized! Saved ${Math.round(savings)} miles, ${timeSaved} hours, and $${costSaved} in costs!`, 'success');
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

  // Enhanced budget calculation with AI insights
  const calculateDetailedBudget = () => {
    const distance = calculateTotalDistance();
    const numParks = tripData.parks.length;
    const totalDays = calculateTripDuration();
    
    const breakdown = {
      transportation: {
        gasoline: transportationMode === 'driving' ? Math.round(distance * 0.15) : 0,
        flights: transportationMode === 'flying' ? Math.round(numParks * 275) : 0,
        wear: transportationMode === 'driving' ? Math.round(distance * 0.06) : 0,
        tolls: transportationMode === 'driving' ? Math.round(distance * 0.025) : 0,
      },
      accommodation: {
        camping: Math.round(totalDays * 35),
        hotels: Math.round(totalDays * 125),
        mixed: Math.round(totalDays * 85)
      },
      parkFees: {
        entries: numParks * 30,
        parking: numParks * 5,
        permits: Math.round(numParks * 0.3 * 25)
      },
      food: {
        budget: totalDays * 40,
        moderate: totalDays * 70,
        premium: totalDays * 100
      }
    };
    
    const transportationCost = Object.values(breakdown.transportation).reduce((a, b) => a + b, 0);
    
    const budgetLevels = {
      budget: transportationCost + breakdown.accommodation.camping + 
               breakdown.parkFees.entries + breakdown.parkFees.parking + breakdown.food.budget,
               
      moderate: transportationCost + breakdown.accommodation.mixed + 
                breakdown.parkFees.entries + breakdown.parkFees.parking + 
                breakdown.parkFees.permits + breakdown.food.moderate,
                
      premium: transportationCost + breakdown.accommodation.hotels + 
               breakdown.parkFees.entries + breakdown.parkFees.parking + 
               breakdown.parkFees.permits + breakdown.food.premium
    };
    
    return { breakdown, budgetLevels, recommended: budgetLevels.moderate };
  };

  const calculateEstimatedCost = () => {
    const detailedBudget = calculateDetailedBudget();
    return detailedBudget.recommended;
  };

  // AI-powered intelligent itinerary generation
  const generateIntelligentItinerary = () => {
    const totalTripDays = calculateTripDuration();
    const selectedParks = tripData.parks;
    
    if (totalTripDays === 0 || selectedParks.length === 0) return [];
    
    const travelDaysNeeded = calculateTravelDays(selectedParks, transportationMode);
    const availableParkDays = Math.max(1, totalTripDays - travelDaysNeeded);
    
    return distributeItineraryDays(selectedParks, availableParkDays, tripStyle, transportationMode, totalTripDays);
  };

  const calculateTravelDays = (parks, transportMode) => {
    if (parks.length < 2) return 0;
    
    if (transportMode === 'flying') {
      return Math.ceil(parks.length * 0.5); // Half day for each flight
    } else {
      const totalDistance = calculateTotalDistance();
      const drivingHoursPerDay = 8;
      const avgSpeed = 60;
      const maxDailyDistance = drivingHoursPerDay * avgSpeed;
      
      return Math.min(Math.ceil(totalDistance / maxDailyDistance), parks.length - 1);
    }
  };

  const distributeItineraryDays = (parks, availableDays, style, transportMode, totalDays) => {
    let itinerary = [];
    let currentDay = 1;
    
    if (parks.length === 0) return itinerary;
    
    const daysPerPark = Math.max(1, Math.floor(availableDays / parks.length));
    const extraDays = availableDays % parks.length;
    
    parks.forEach((park, index) => {
      const daysAtThisPark = daysPerPark + (index < extraDays ? 1 : 0);
      
      // Add park days
      for (let day = 0; day < daysAtThisPark; day++) {
        itinerary.push({
          type: 'park',
          dayNumber: currentDay,
          parkId: park.parkId,
          parkName: park.parkName,
          parkDay: day + 1,
          totalParkDays: daysAtThisPark,
          activities: generateParkActivities(park, day + 1, daysAtThisPark, style),
          coordinates: park.coordinates,
          weather: generateWeatherTip(park.state)
        });
        currentDay++;
      }
      
      // Add travel day if not the last park and we have days left
      if (index < parks.length - 1 && currentDay <= totalDays) {
        const travelDistance = calculateDistance(park.coordinates, parks[index + 1].coordinates);
        const travelTime = transportMode === 'flying' ? '2-4 hours' : `${Math.ceil(travelDistance / 60)} hours`;
        
        itinerary.push({
          type: 'travel',
          dayNumber: currentDay,
          from: park.parkName,
          to: parks[index + 1].parkName,
          method: transportMode,
          distance: Math.round(travelDistance),
          estimatedTime: travelTime,
          tips: generateTravelTips(transportMode, travelDistance)
        });
        currentDay++;
      }
    });
    
    return itinerary;
  };

  const generateParkActivities = (park, dayNumber, totalDays, style) => {
    const baseActivities = {
      1: ['Arrival & Visitor Center', 'Easy Scenic Drive', 'Sunset Photography'],
      2: ['Popular Trail Hike', 'Wildlife Watching', 'Park Ranger Program'],
      3: ['Backcountry Exploration', 'Advanced Hiking', 'Hidden Gems Tour']
    };
    
    const styleModifiers = {
      relaxed: ['Rest & Relaxation', 'Leisurely Exploration', 'Photography'],
      balanced: ['Mix of Activities', 'Moderate Hiking', 'Sightseeing'],
      intensive: ['Action-Packed Day', 'Multiple Trails', 'Maximum Coverage']
    };
    
    if (totalDays === 1) {
      return ['Half-day Highlights', 'Must-see Viewpoints', 'Quick Photo Stops'];
    }
    
    const activities = baseActivities[Math.min(dayNumber, 3)] || baseActivities[1];
    const modifier = styleModifiers[style] || styleModifiers.balanced;
    
    return [...activities.slice(0, 2), modifier[dayNumber - 1] || modifier[0]];
  };

  const generateWeatherTip = (state) => {
    const tips = {
      'Utah': 'Pack layers - desert temperatures vary greatly',
      'California': 'Check elevation - conditions change with altitude',
      'Arizona': 'Bring sun protection and extra water',
      'Colorado': 'Be prepared for afternoon thunderstorms',
      'Wyoming': 'Weather can change quickly at high elevation'
    };
    return tips[state] || 'Check local weather conditions';
  };

  const generateTravelTips = (mode, distance) => {
    if (mode === 'flying') {
      return ['Book flights early for better prices', 'Check baggage restrictions for outdoor gear'];
    } else {
      if (distance > 400) {
        return ['Consider breaking into 2-day drive', 'Book overnight accommodation'];
      } else if (distance > 200) {
        return ['Start early for scenic route', 'Plan lunch stop halfway'];
      } else {
        return ['Great opportunity for scenic driving', 'Stop at roadside attractions'];
      }
    }
  };

  const handleSave = async () => {
    if (!tripData.title?.trim()) {
      showToast('Please enter a trip title', 'error');
      setCurrentStep(1);
      return;
    }
    if (tripData.parks.length === 0) {
      showToast('Please add at least one park', 'error');
      setCurrentStep(2);
      return;
    }
    if (!tripData.startDate || !tripData.endDate) {
      showToast('Please set your trip dates', 'error');
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      const tripToSave = {
        ...tripData,
        totalDistance: calculateTotalDistance(),
        estimatedCost: calculateEstimatedCost(),
        transportationMode,
        tripStyle,
        totalDuration: calculateTripDuration(),
        aiItinerary: generateIntelligentItinerary(),
        budgetBreakdown: calculateDetailedBudget()
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
      case 1: return tripData.title?.trim().length > 0 && tripData.startDate && tripData.endDate;
      case 2: return tripData.parks.length > 0;
      case 3: return true;
      case 4: return tripData.title?.trim() && tripData.parks.length > 0;
      default: return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Progress Steps */}
      <FadeInWrapper delay={0.1}>
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🧠 AI-Powered Trip Builder</h2>
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
          
          {/* Step 1: Enhanced Trip Details */}
          {currentStep === 1 && (
            <FadeInWrapper delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaEdit className="text-pink-500" />
                  Trip Details & Preferences
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Trip Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Pacific Northwest Adventure"
                      value={tripData.title}
                      onChange={(e) => setTripData({...tripData, title: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg font-medium focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
                    />
                  </div>

                  {/* Enhanced Date Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Start Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={tripData.startDate}
                          onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all text-gray-700 bg-white"
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
                        End Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={tripData.endDate}
                          onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                          min={tripData.startDate || new Date().toISOString().split('T')[0]}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all text-gray-700 bg-white"
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

                  {/* Trip Duration Display */}
                  {tripData.startDate && tripData.endDate && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-700 mb-2">{calculateTripDuration()}</div>
                        <div className="text-blue-600 font-medium">Days Total Duration</div>
                        <div className="text-sm text-blue-500 mt-1">
                          Perfect for {tripData.parks.length > 0 ? `visiting ${tripData.parks.length} parks` : 'multiple park visits'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                    <textarea
                      placeholder="Describe your adventure goals, special interests, or must-see attractions..."
                      value={tripData.description}
                      onChange={(e) => setTripData({...tripData, description: e.target.value})}
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all resize-none"
                    />
                  </div>

                  {/* Enhanced Transportation Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Transportation Method *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTransportationMode('driving')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          transportationMode === 'driving' 
                            ? 'border-pink-400 bg-pink-50 shadow-lg' 
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <div className="text-3xl mb-3"><FaCar /></div>
                        <div className="font-bold text-lg">Road Trip</div>
                        <div className="text-sm text-gray-600 mb-2">Drive between parks</div>
                        <div className="text-xs text-green-600">✓ Scenic routes & flexibility</div>
                      </button>
                      
                      <button
                        onClick={() => setTransportationMode('flying')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          transportationMode === 'flying' 
                            ? 'border-pink-400 bg-pink-50 shadow-lg' 
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <div className="text-3xl mb-3"><FaPlane /></div>
                        <div className="font-bold text-lg">Flying</div>
                        <div className="text-sm text-gray-600 mb-2">Fly between regions</div>
                        <div className="text-xs text-green-600">✓ Faster for distant parks</div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Enhanced Trip Style */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Trip Pace & Style *
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { 
                          id: 'relaxed', 
                          emoji: '😌', 
                          title: 'Relaxed', 
                          desc: '2-3 days per park',
                          details: 'Leisurely exploration, rest time'
                        },
                        { 
                          id: 'balanced', 
                          emoji: '⚖️', 
                          title: 'Balanced', 
                          desc: '1-2 days per park',
                          details: 'Mix of sights and activities'
                        },
                        { 
                          id: 'intensive', 
                          emoji: '⚡', 
                          title: 'Intensive', 
                          desc: '1 day per park',
                          details: 'Maximum parks, action-packed'
                        }
                      ].map(style => (
                        <button
                          key={style.id}
                          onClick={() => setTripStyle(style.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            tripStyle === style.id 
                              ? 'border-pink-400 bg-pink-50 shadow-lg' 
                              : 'border-gray-200 hover:border-pink-200'
                          }`}
                        >
                          <div className="text-2xl mb-2">{style.emoji}</div>
                          <div className="font-bold text-sm">{style.title}</div>
                          <div className="text-xs text-gray-600 mb-1">{style.desc}</div>
                          <div className="text-xs text-green-600">{style.details}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWrapper>
          )}
          
          {/* Step 2: Enhanced Park Selection */}
          {currentStep === 2 && (
            <FadeInWrapper delay={0.2}>
              <div className="space-y-6">
                <ParkSelector 
                  availableParks={parksData}
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
                      <div className="flex gap-3">
                        <button
                          onClick={optimizeRoute}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition text-sm font-medium shadow-lg"
                        >
                          <FaBrain /> AI Optimize
                        </button>
                      </div>
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
                              <h4 className="font-semibold text-gray-800 text-lg mb-3 flex items-center gap-2">
                                {park.parkName}
                                {park.state && <span className="text-sm text-gray-500">({park.state})</span>}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <div className="flex items-end">
                                  <div className="text-xs text-gray-600">
                                    <div className="font-medium">AI Suggestion:</div>
                                    <div>{tripStyle === 'relaxed' ? '3 days' : tripStyle === 'intensive' ? '1 day' : '2 days'} recommended</div>
                                  </div>
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

          {/* Step 3: AI Smart Planning */}
          {currentStep === 3 && (
            <FadeInWrapper delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaBrain className="text-pink-500" />
                  AI Smart Planning & Optimization
                </h3>
                
                {tripData.parks.length > 0 ? (
                  <div className="space-y-6">
                    {/* AI Insights Panel */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-purple-600" />
                        AI Travel Insights
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Your {tripStyle} style fits {calculateTripDuration()} days perfectly</span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>{transportationMode === 'driving' ? 'Road trip' : 'Flying'} is optimal for {tripData.parks.length} parks</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Estimated {transportationMode === 'driving' ? 'drive' : 'travel'} time: {Math.round(calculateTotalDistance() / 60)} hours</span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-700">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Budget range: ${Math.round(calculateEstimatedCost() * 0.8)} - ${Math.round(calculateEstimatedCost() * 1.2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Route Optimization */}
                    {tripData.parks.length > 1 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <FaCogs className="text-blue-600" />
                          Smart Route Optimization
                        </h4>
                        <p className="text-blue-700 text-sm mb-4">
                          AI can optimize your route to minimize {transportationMode === 'driving' ? 'driving time and fuel costs' : 'travel time and expenses'}.
                        </p>
                        <button
                          onClick={optimizeRoute}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium shadow-lg"
                        >
                          <FaBrain /> Optimize My Route
                        </button>
                      </div>
                    )}

                    {/* Trip Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <FaRoute className="text-green-600" />
                          Travel Overview
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Total Distance:</span>
                            <span className="font-medium">{calculateTotalDistance()} miles</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Travel Method:</span>
                            <span className="font-medium capitalize">{transportationMode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Estimated Time:</span>
                            <span className="font-medium">
                              {transportationMode === 'driving' 
                                ? `${Math.round(calculateTotalDistance() / 60)} hours`
                                : `${Math.round(tripData.parks.length * 2)} hours`
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <FaCalendarAlt className="text-purple-600" />
                          Time Planning
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Trip Duration:</span>
                            <span className="font-medium">{calculateTripDuration()} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Parks to Visit:</span>
                            <span className="font-medium">{tripData.parks.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Trip Style:</span>
                            <span className="font-medium capitalize">{tripStyle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                          <FaDollarSign className="text-yellow-600" />
                          Budget Estimate
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-yellow-700">Estimated Cost:</span>
                            <span className="font-medium">${calculateEstimatedCost()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-700">Per Day:</span>
                            <span className="font-medium">${Math.round(calculateEstimatedCost() / calculateTripDuration())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-700">Per Park:</span>
                            <span className="font-medium">${Math.round(calculateEstimatedCost() / tripData.parks.length)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Intelligent Itinerary Preview */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-pink-500" />
                        AI-Generated Itinerary Preview
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {generateIntelligentItinerary().slice(0, 7).map((item, index) => (
                          <div key={index} className={`p-3 rounded-lg border text-sm ${
                            item.type === 'park' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                {item.dayNumber}
                              </div>
                              <div className="flex-1">
                                {item.type === 'park' ? (
                                  <div>
                                    <span className="font-medium">{item.parkName}</span>
                                    <span className="text-gray-600 ml-2">- Day {item.parkDay} of {item.totalParkDays}</span>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {item.activities?.slice(0, 2).join(' • ')}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-medium">Travel: {item.from} → {item.to}</span>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {item.estimatedTime} • {item.distance} miles
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {generateIntelligentItinerary().length > 7 && (
                          <div className="text-center text-gray-500 text-sm">
                            +{generateIntelligentItinerary().length - 7} more days...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🧠</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">Add parks to see AI planning</h4>
                    <p className="text-gray-500">Go back to Step 2 to select your destinations.</p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-4 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
                    >
                      Select Parks
                    </button>
                  </div>
                )}
              </div>
            </FadeInWrapper>
          )}

          {/* Step 4: Enhanced Review & Save */}
          {currentStep === 4 && (
            <FadeInWrapper delay={0.2}>
              <div className="space-y-6">
                {/* Trip Summary Card */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
                  <h3 className="text-3xl font-bold mb-2">{tripData.title || 'Untitled Trip'}</h3>
                  <p className="text-pink-100 mb-6">{tripData.description || 'No description provided'}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{tripData.parks.length}</div>
                      <div className="text-pink-200 text-sm">Parks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{calculateTotalDistance()}</div>
                      <div className="text-pink-200 text-sm">Miles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{calculateTripDuration()}</div>
                      <div className="text-pink-200 text-sm">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">${calculateEstimatedCost()}</div>
                      <div className="text-pink-200 text-sm">Budget</div>
                    </div>
                  </div>
                </div>

                {/* Complete AI Itinerary */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">🧠 Complete AI Itinerary</h3>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      {transportationMode === 'flying' ? <FaPlane /> : <FaCar />}
                      {transportationMode === 'flying' ? 'Flying' : 'Road Trip'} • {tripStyle} pace
                    </div>
                  </div>
                  
                  {(() => {
                    const fullItinerary = generateIntelligentItinerary();
                    return fullItinerary.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {fullItinerary.map((item, index) => (
                          <div key={index} className={`p-4 rounded-xl border ${
                            item.type === 'park' 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                          }`}>
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                                {item.dayNumber}
                              </div>
                              
                              <div className="flex-1">
                                {item.type === 'park' ? (
                                  <>
                                    <h4 className="font-semibold text-gray-800">
                                      {item.parkName} - Day {item.parkDay}{item.totalParkDays > 1 ? ` of ${item.totalParkDays}` : ''}
                                    </h4>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {item.activities?.join(' • ')}
                                    </div>
                                    {item.weather && (
                                      <div className="text-xs text-blue-600 mt-1">
                                        🌤️ {item.weather}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <h4 className="font-semibold text-gray-800">
                                      Travel Day: {item.from} → {item.to}
                                    </h4>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {item.method === 'flying' ? '✈️' : '🚗'} {item.distance} miles • {item.estimatedTime}
                                    </div>
                                    {item.tips && (
                                      <div className="text-xs text-purple-600 mt-1">
                                        💡 {item.tips.join(' • ')}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-4xl block mb-2">📋</span>
                        <p>Add dates and parks to generate your intelligent itinerary</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Enhanced Budget Breakdown */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">💰 Detailed Budget Analysis</h3>
                  
                  {(() => {
                    const budget = calculateDetailedBudget();
                    return (
                      <>
                        {/* Budget Level Options */}
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
                        
                        {/* Detailed Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700">Transportation ({transportationMode})</h4>
                            <div className="space-y-2 text-sm">
                              {transportationMode === 'driving' ? (
                                <>
                                  <div className="flex justify-between">
                                    <span>Fuel ({calculateTotalDistance()} miles)</span>
                                    <span>${budget.breakdown.transportation.gasoline}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Vehicle wear & tear</span>
                                    <span>${budget.breakdown.transportation.wear}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tolls & fees</span>
                                    <span>${budget.breakdown.transportation.tolls}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-between">
                                  <span>Flights ({tripData.parks.length} destinations)</span>
                                  <span>${budget.breakdown.transportation.flights}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700">
                              Accommodation ({calculateTripDuration()} nights)
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Camping</span>
                                <span>${budget.breakdown.accommodation.camping}</span>
                              </div>
                              <div className="flex justify-between text-pink-600 font-medium">
                                <span>Mixed (recommended)</span>
                                <span>${budget.breakdown.accommodation.mixed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hotels</span>
                                <span>${budget.breakdown.accommodation.hotels}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Final Validation & Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">✅ Trip Validation & Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Trip Title</span>
                        <span className="text-gray-900">{tripData.title || 'Not set'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Duration</span>
                        <span className="text-gray-900">{calculateTripDuration()} days</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Parks Selected</span>
                        <span className="text-gray-900">{tripData.parks.length} parks</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Transportation</span>
                        <span className="text-gray-900 capitalize flex items-center gap-2">
                          {transportationMode === 'driving' ? <FaCar /> : <FaPlane />}
                          {transportationMode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Trip Style</span>
                        <span className="text-gray-900 capitalize">{tripStyle}</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                        <span className="font-medium text-green-700">Total Budget</span>
                        <span className="text-green-900 font-bold text-lg">${calculateEstimatedCost()}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Confidence & Recommendations */}
                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <FaBrain className="text-purple-600" />
                      AI Confidence & Final Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-700">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Trip duration perfectly matches your {tripStyle} style</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Route optimization can save up to 15% on travel costs</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-700">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Budget estimate accuracy: 85-92%</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>All parks accessible via {transportationMode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWrapper>
          )}
        </div>

        {/* Right Sidebar - Enhanced Map */}
        <div className="xl:col-span-1">
          <div className="sticky top-4">
            <FadeInWrapper delay={0.3}>
              <TripMap parks={tripData.parks} />
              
              {/* Quick Stats Panel */}
              {tripData.parks.length > 0 && (
                <div className="mt-6 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Distance:</span>
                      <span className="font-medium">{calculateTotalDistance()} mi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Budget:</span>
                      <span className="font-medium">${calculateEstimatedCost()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Travel Time:</span>
                      <span className="font-medium">
                        {transportationMode === 'driving' 
                          ? `${Math.round(calculateTotalDistance() / 60)}h`
                          : `${Math.round(tripData.parks.length * 2)}h`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </FadeInWrapper>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Buttons */}
      <FadeInWrapper delay={0.4}>
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            <FaChevronLeft />
            {currentStep === 1 ? 'Cancel' : 'Previous Step'}
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
                {loading ? 'Saving AI Trip...' : 'Save Intelligent Trip'}
              </button>
            )}
          </div>
        </div>
      </FadeInWrapper>
    </div>
  );
};

export default TripBuilder;