import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TripOptimizer } from '../utils/TripOptimizer';
import TripMap from './TripMap';
import FadeInWrapper from './FadeInWrapper';
import { 
  FaRoute, 
  FaSave, 
  FaTimes, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaEdit,
  FaCheckCircle,
  FaCar,
  FaPlane,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaPlus,
  FaTrash,
  FaMagic,
  FaSort,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';

const TripBuilder = ({ trip, allParks, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [tripData, setTripData] = useState(trip);
  const [parksData, setParksData] = useState(allParks || []);
  const [loading, setLoading] = useState(false);
  const [parksLoading, setParksLoading] = useState(!allParks);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [routeAnalysis, setRouteAnalysis] = useState(null);

  // Park search state
  const [parkSearch, setParkSearch] = useState('');
  const [showParkDropdown, setShowParkDropdown] = useState(false);

  const steps = [
    { id: 1, title: 'Trip Details', icon: FaEdit, description: 'Basic information' },
    { id: 2, title: 'Select Parks', icon: FaMapMarkerAlt, description: 'Choose destinations' },
    { id: 3, title: 'Review & Save', icon: FaCheckCircle, description: 'Finalize your trip' }
  ];

  // WITH THIS:
  useEffect(() => {
    if (!allParks || allParks.length === 0) {
      fetchAllParks();
    } else {
      setParksData(allParks);
      setParksLoading(false);
    }
      // Don't auto-advance if trip has preloaded parks - let user start at step 1
    }, [allParks]);    

  // Analyze route whenever parks change
  useEffect(() => {
    if (tripData.parks.length >= 2) {
      const analysis = TripOptimizer.analyzeRoute(tripData.parks);
      setRouteAnalysis(analysis);
    } else {
      setRouteAnalysis(null);
    }
  }, [tripData.parks]);

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

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!tripData.title?.trim()) newErrors.title = 'Trip title is required';
      if (!tripData.startDate) newErrors.startDate = 'Start date is required';
      if (!tripData.endDate) newErrors.endDate = 'End date is required';
      if (tripData.startDate && tripData.endDate && new Date(tripData.startDate) >= new Date(tripData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (!tripData.transportationMode) newErrors.transportationMode = 'Please select transportation method';
    }
    
    if (step === 2) {
      if (!tripData.parks || tripData.parks.length === 0) {
        newErrors.parks = 'Please select at least one park';
      } else {
        // Validate that parks have required data
        const invalidParks = tripData.parks.filter(park => 
          !park.parkName || !park.stayDuration || park.stayDuration < 1
        );
        if (invalidParks.length > 0) {
          newErrors.parks = 'All parks must have valid names and stay durations';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTripDuration = useCallback(() => {
    if (!tripData.startDate || !tripData.endDate) return 0;
    
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays + 1);
  }, [tripData.startDate, tripData.endDate]);

  // Distance calculation
  const calculateDistance = useCallback((coord1, coord2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const calculateTotalDistance = useCallback(() => {
    return TripOptimizer.calculateTotalDistance(tripData.parks);
  }, [tripData.parks]);

  const calculateEstimatedCost = useCallback(() => {
    const duration = calculateTripDuration();
    const distance = calculateTotalDistance();
    const numParks = tripData.parks.length;
    
    // Accommodation: nights = days - 1 (unless single day trip)
    const nights = Math.max(0, duration - 1);
    
    const costs = {
      accommodation: nights * 85, // $85/night
      transportation: tripData.transportationMode === 'flying' 
        ? numParks * 275 // $275 per flight
        : distance * 0.20, // $0.20/mile for gas + wear
      parkFees: numParks * 30, // $30/park entrance
      food: duration * 55, // $55/day meals
    };
    
    return Math.round(costs.accommodation + costs.transportation + costs.parkFees + costs.food);
  }, [calculateTripDuration, calculateTotalDistance, tripData.parks.length, tripData.transportationMode]);

  // Route optimization functions
  const optimizeRoute = useCallback(() => {
    if (tripData.parks.length < 3) {
      showToast('Need at least 3 parks to optimize route', 'info');
      return;
    }

    const currentDistance = calculateTotalDistance();
    const optimizedParks = TripOptimizer.optimizeRoute(tripData.parks);
    
    setTripData({
      ...tripData,
      parks: optimizedParks
    });

    // Calculate savings after state update
    setTimeout(() => {
      const newDistance = TripOptimizer.calculateTotalDistance(optimizedParks);
      const savings = currentDistance - newDistance;
      
      if (savings > 0) {
        showToast(`Route optimized! Saved ${Math.round(savings)} miles`, 'success');
      } else {
        showToast('Route was already optimal!', 'info');
      }
    }, 100);
  }, [tripData.parks, calculateTotalDistance, showToast]);

  const sortParksByDate = useCallback(() => {
    const parksWithDates = tripData.parks.filter(park => park.visitDate);
    const parksWithoutDates = tripData.parks.filter(park => !park.visitDate);
    
    if (parksWithDates.length === 0) {
      showToast('Add visit dates to parks for date-based sorting', 'info');
      return;
    }

    const sortedParks = [
      ...parksWithDates.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate)),
      ...parksWithoutDates
    ];

    setTripData({
      ...tripData,
      parks: sortedParks
    });

    showToast('Parks sorted by visit dates!', 'success');
  }, [tripData.parks, showToast]);

  const getOptimizationPotential = useMemo(() => {
    if (tripData.parks.length < 3) return null;
    
    const currentDistance = calculateTotalDistance();
    const optimizedParks = TripOptimizer.optimizeRoute([...tripData.parks]);
    const optimizedDistance = TripOptimizer.calculateTotalDistance(optimizedParks);
    const savings = currentDistance - optimizedDistance;
    
    return {
      currentDistance,
      optimizedDistance,
      savings: Math.max(0, savings),
      canOptimize: savings > 10
    };
  }, [tripData.parks, calculateTotalDistance]);

  // Park management functions
  const parseCoordinates = (coordString) => {
    // Handle different coordinate formats
    if (!coordString) return { lat: 0, lng: 0 };
    
    // If already an object with lat/lng
    if (typeof coordString === 'object' && coordString.lat && coordString.lng) {
      return { 
        lat: parseFloat(coordString.lat) || 0, 
        lng: parseFloat(coordString.lng) || 0 
      };
    }
    
    // If string format "lat,lng"
    if (typeof coordString === 'string' && coordString.includes(',')) {
      const [lat, lng] = coordString.split(',').map(val => parseFloat(val.trim()));
      return { lat: lat || 0, lng: lng || 0 };
    }
    
    return { lat: 0, lng: 0 };
  };

  const addParkToTrip = (park) => {
    const coordinates = parseCoordinates(park.coordinates);

    const newPark = {
      parkId: park.id,
      parkName: park.name || park.fullName,
      visitDate: '',
      stayDuration: 2,
      coordinates,
      state: park.state,
      description: park.description
    };
    
    setTripData({
      ...tripData,
      parks: [...tripData.parks, newPark]
    });

    setParkSearch('');
    setShowParkDropdown(false);
    showToast(`Added ${newPark.parkName} to your trip!`, 'success');
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
    const updatedParks = tripData.parks.map(park => {
      if (park.parkId === parkId) {
        const updatedPark = { ...park, [field]: value };
        
        // Validate stay duration
        if (field === 'stayDuration') {
          updatedPark.stayDuration = Math.max(1, Math.min(14, parseInt(value) || 1));
        }
        
        return updatedPark;
      }
      return park;
    });
    
    setTripData({
      ...tripData,
      parks: updatedParks
    });
  };

  // Park search and filtering
  const getFilteredParks = () => {
    if (!parkSearch.trim()) return [];
    
    const selectedParkIds = tripData.parks.map(p => p.parkId);
    const searchLower = parkSearch.toLowerCase();
    
    return parksData
      .filter(park => !selectedParkIds.includes(park.id))
      .filter(park =>
        park.name?.toLowerCase().includes(searchLower) ||
        park.fullName?.toLowerCase().includes(searchLower) ||
        park.state?.toLowerCase().includes(searchLower)
      )
      .slice(0, 8);
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        // Clear any remaining errors when moving forward
        setErrors({});
        showToast(`Step ${currentStep + 1} completed!`, 'success');
      }
    } else {
      showToast('Please fix the errors before continuing', 'error');
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSave = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    setLoading(true);
    try {
      // Validate total days match park durations
      const parkDaysTotal = tripData.parks.reduce((sum, park) => sum + (park.stayDuration || 1), 0);
      const tripDaysTotal = calculateTripDuration();

      // Warn if significant mismatch
      if (Math.abs(parkDaysTotal - tripDaysTotal) > 2) {
        const shouldContinue = window.confirm(
          `Total park days (${parkDaysTotal}) don't match trip duration (${tripDaysTotal}). Save anyway?`
        );
        if (!shouldContinue) {
          setLoading(false);
          return;
        }
      }

      const tripToSave = {
        ...tripData,
        totalDistance: calculateTotalDistance(),
        estimatedCost: calculateEstimatedCost(),
        totalDuration: calculateTripDuration(),
        updatedAt: new Date()
      };
      
      await onSave(tripToSave);
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save trip', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Progress Steps */}
      <FadeInWrapper delay={0.1}>
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Enhanced Trip Builder</h2>
            <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
          </div>
          
          {/* Mobile-friendly step indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-pink-500 border-pink-500 text-white shadow-lg' 
                        : isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <FaCheckCircle /> : <Icon />}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs md:text-sm font-medium ${
                        isActive ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 hidden md:block">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-8 md:w-16 mx-2 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </FadeInWrapper>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Step 1: Trip Details */}
          {currentStep === 1 && (
            <FadeInWrapper delay={0.2}>
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaEdit className="text-pink-500" />
                  Trip Details
                </h3>
                
                <div className="space-y-6">
                  {/* Trip Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Trip Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Pacific Northwest Adventure"
                      value={tripData.title}
                      onChange={(e) => {
                        setTripData({...tripData, title: e.target.value});
                        if (errors.title) setErrors({...errors, title: ''});
                      }}
                      className={`w-full p-4 border-2 rounded-xl text-base font-medium focus:outline-none transition-all min-h-[48px] ${
                        errors.title 
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Date Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Start Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={tripData.startDate}
                          onChange={(e) => {
                            setTripData({...tripData, startDate: e.target.value});
                            if (errors.startDate) setErrors({...errors, startDate: ''});
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-all text-gray-700 bg-white min-h-[48px] ${
                            errors.startDate 
                              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
                          }`}
                        />
                        <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.startDate && (
                        <p className="mt-2 text-sm text-red-600">{errors.startDate}</p>
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
                          onChange={(e) => {
                            setTripData({...tripData, endDate: e.target.value});
                            if (errors.endDate) setErrors({...errors, endDate: ''});
                          }}
                          min={tripData.startDate || new Date().toISOString().split('T')[0]}
                          className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-all text-gray-700 bg-white min-h-[48px] ${
                            errors.endDate 
                              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
                          }`}
                        />
                        <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.endDate && (
                        <p className="mt-2 text-sm text-red-600">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Trip Duration Display */}
                  {tripData.startDate && tripData.endDate && !errors.endDate && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">
                          {calculateTripDuration()}
                        </div>
                        <div className="text-blue-600 font-medium">Days Total Duration</div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="Describe your adventure goals and interests..."
                      value={tripData.description}
                      onChange={(e) => setTripData({...tripData, description: e.target.value})}
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all resize-none"
                    />
                  </div>

                  {/* Transportation Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Transportation Method *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setTripData({...tripData, transportationMode: 'driving'})}
                        className={`p-4 md:p-6 rounded-xl border-2 transition-all text-left min-h-[100px] ${
                          tripData.transportationMode === 'driving' 
                            ? 'border-pink-400 bg-pink-50 shadow-lg' 
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <div className="text-2xl md:text-3xl mb-3"><FaCar /></div>
                        <div className="font-bold text-base md:text-lg">Road Trip</div>
                        <div className="text-sm text-gray-600 mb-2">Drive between parks</div>
                        <div className="text-xs text-green-600">✓ Scenic routes & flexibility</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setTripData({...tripData, transportationMode: 'flying'})}
                        className={`p-4 md:p-6 rounded-xl border-2 transition-all text-left min-h-[100px] ${
                          tripData.transportationMode === 'flying' 
                            ? 'border-pink-400 bg-pink-50 shadow-lg' 
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <div className="text-2xl md:text-3xl mb-3"><FaPlane /></div>
                        <div className="font-bold text-base md:text-lg">Flying</div>
                        <div className="text-sm text-gray-600 mb-2">Fly between regions</div>
                        <div className="text-xs text-green-600">✓ Faster for distant parks</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWrapper>
          )}
          
          {/* Step 2: Park Selection */}
          {currentStep === 2 && (
            <FadeInWrapper delay={0.2}>
              <div className="space-y-6">
                {/* Park Search */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaMapMarkerAlt className="text-pink-500" />
                    Select Parks
                  </h3>
                  
                  <div className="relative mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search for national parks..."
                        value={parkSearch}
                        onChange={(e) => {
                          setParkSearch(e.target.value);
                          setShowParkDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowParkDropdown(parkSearch.length > 0)}
                        onBlur={() => setTimeout(() => setShowParkDropdown(false), 200)}
                        className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all min-h-[48px]"
                      />
                      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showParkDropdown && getFilteredParks().length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto z-20 mt-2">
                        <div className="p-2">
                          {getFilteredParks().map(park => (
                            <button
                              key={park.id}
                              onClick={() => addParkToTrip(park)}
                              className="w-full p-3 hover:bg-pink-50 cursor-pointer rounded-lg transition-all text-left flex items-center gap-3"
                            >
                              <div className="text-xl">🏞️</div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">
                                  {park.name || park.fullName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {park.state}
                                </div>
                              </div>
                              <FaPlus className="text-pink-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {errors.parks && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errors.parks}</p>
                    </div>
                  )}
                </div>

                {/* Selected Parks */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <FaRoute className="text-pink-500" />
                      Selected Parks ({tripData.parks.length})
                    </h3>
                  </div>
                  
                  {tripData.parks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl md:text-6xl mb-4">🏞️</div>
                      <h4 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No parks selected yet</h4>
                      <p className="text-gray-500">Search and add parks above to start planning!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tripData.parks.map((park, index) => (
                        <div key={park.parkId} className="bg-gradient-to-r from-gray-50 to-pink-50 p-4 md:p-6 rounded-xl border border-gray-200">
                          <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-base md:text-lg mb-3">
                                {park.parkName}
                                {park.state && <span className="text-sm text-gray-500 ml-2">({park.state})</span>}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Visit Date</label>
                                  <input
                                    type="date"
                                    value={park.visitDate}
                                    onChange={(e) => updateParkDetails(park.parkId, 'visitDate', e.target.value)}
                                    min={tripData.startDate || new Date().toISOString().split('T')[0]}
                                    max={tripData.endDate || undefined}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm min-h-[44px]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Stay Duration</label>
                                  <select
                                    value={park.stayDuration}
                                    onChange={(e) => updateParkDetails(park.parkId, 'stayDuration', parseInt(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm min-h-[44px]"
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
                              className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Route Optimization Panel */}
                {tripData.parks.length >= 2 && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <FaMagic className="text-purple-500" />
                      Route Optimization
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Current Route Stats */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-700">Current Route</span>
                          <span className="text-lg font-bold text-blue-800">
                            {calculateTotalDistance()} miles
                          </span>
                        </div>
                        <div className="text-xs text-blue-600">
                          Total driving distance between parks
                        </div>
                      </div>

                      {/* Route Analysis */}
                      {routeAnalysis && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FaChartLine className="text-orange-600" />
                            <span className="text-sm font-medium text-orange-700">Route Analysis</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <div className="font-bold text-orange-800">{routeAnalysis.averageDistance}</div>
                              <div className="text-orange-600">Avg Distance</div>
                            </div>
                            <div>
                              <div className="font-bold text-orange-800">{routeAnalysis.longestSegment}</div>
                              <div className="text-orange-600">Longest Leg</div>
                            </div>
                            <div>
                              <div className="font-bold text-orange-800">{routeAnalysis.shortestSegment}</div>
                              <div className="text-orange-600">Shortest Leg</div>
                            </div>
                            <div>
                              <div className="font-bold text-orange-800">{routeAnalysis.efficiency}</div>
                              <div className="text-orange-600">Efficiency</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Optimization Suggestion */}
                      {getOptimizationPotential?.canOptimize && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-green-700">Potential Savings</span>
                            <span className="text-lg font-bold text-green-800">
                              -{Math.round(getOptimizationPotential.savings)} miles
                            </span>
                          </div>
                          <div className="text-xs text-green-600">
                            Optimize route to reduce driving distance
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={optimizeRoute}
                          disabled={tripData.parks.length < 3}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        >
                          <FaRoute />
                          {tripData.parks.length < 3 ? 'Need 3+ Parks' : 'Optimize Route'}
                        </button>
                        
                        <button
                          onClick={sortParksByDate}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        >
                          <FaSort />
                          Sort by Dates
                        </button>
                      </div>

                      {/* Optimization Tips */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <div className="text-yellow-600 text-xl">💡</div>
                          <div>
                            <div className="font-medium text-yellow-800 mb-1">Optimization Tips</div>
                            <div className="text-yellow-700 text-sm space-y-1">
                              <div>• Add more parks for better optimization</div>
                              <div>• Set visit dates for chronological sorting</div>
                              <div>• Consider your starting location when planning</div>
                              {routeAnalysis?.recommendations?.map((rec, index) => (
                                <div key={index}>• {rec}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FadeInWrapper>
          )}

          {/* Step 3: Review & Save */}
          {currentStep === 3 && (
            <FadeInWrapper delay={0.2}>
              <div className="space-y-6">
                {/* Trip Summary */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl p-6 md:p-8 shadow-xl">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{tripData.title}</h3>
                  {tripData.description && (
                    <p className="text-pink-100 mb-6">{tripData.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold">${calculateEstimatedCost()}</div>
                      <div className="text-pink-200 text-sm">Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold">{calculateTotalDistance()}</div>
                      <div className="text-pink-200 text-sm">Miles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold">{calculateTripDuration()}</div>
                      <div className="text-pink-200 text-sm">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold">{tripData.parks.length}</div>
                      <div className="text-pink-200 text-sm">Parks</div>
                    </div>
                  </div>
                </div>

                {/* Budget Breakdown */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">💰 Budget Breakdown</h3>
                  
                  {(() => {
                    const duration = calculateTripDuration();
                    const distance = calculateTotalDistance();
                    const numParks = tripData.parks.length;
                    const nights = Math.max(0, duration - 1);
                    
                    const costs = {
                      accommodation: nights * 85,
                      transportation: tripData.transportationMode === 'flying' 
                        ? numParks * 275 
                        : distance * 0.20,
                      parkFees: numParks * 30,
                      food: duration * 55,
                    };
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-700">Accommodation</h4>
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">{nights} nights × $85</span>
                              <span className="font-bold text-blue-800">${costs.accommodation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-700">Transportation</h4>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-green-700">
                                {tripData.transportationMode === 'flying' 
                                  ? `${numParks} flights × $275`
                                  : `${distance} miles × $0.20`
                                }
                              </span>
                              <span className="font-bold text-green-800">${Math.round(costs.transportation)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-700">Park Fees</h4>
                          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-purple-700">{numParks} parks × $30</span>
                              <span className="font-bold text-purple-800">${costs.parkFees}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-700">Food & Meals</h4>
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-orange-700">{duration} days × $55</span>
                              <span className="font-bold text-orange-800">${costs.food}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl text-white text-center">
                    <div className="text-2xl md:text-3xl font-bold">${calculateEstimatedCost()}</div>
                    <div className="text-green-100">Total Estimated Cost</div>
                  </div>
                </div>

                {/* Parks Summary */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">🏞️ Your Itinerary</h3>
                  
                  <div className="space-y-4">
                    {tripData.parks.map((park, index) => (
                      <div key={park.parkId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{park.parkName}</h4>
                          <div className="text-sm text-gray-600">
                            {park.visitDate && `${new Date(park.visitDate).toLocaleDateString()} • `}
                            {park.stayDuration} day{park.stayDuration !== 1 ? 's' : ''}
                            {park.state && ` • ${park.state}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {tripData.parks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Go back to Step 2 to select parks for your trip.</p>
                    </div>
                  )}
                </div>
              </div>
            </FadeInWrapper>
          )}
        </div>

        {/* Right Sidebar - Map */}
        <div className="xl:col-span-1">
          <div className="sticky top-4">
            <FadeInWrapper delay={0.3}>
              <TripMap 
                parks={tripData.parks} 
                transportationMode={tripData.transportationMode}
              />
              
              {/* Enhanced Quick Stats Panel */}
              {tripData.parks.length > 0 && (
                <div className="mt-6 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3">Enhanced Stats</h4>
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
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{calculateTripDuration()} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium">{Math.max(0, calculateTripDuration() - 1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transportation:</span>
                      <span className="font-medium capitalize flex items-center gap-1">
                        {tripData.transportationMode === 'flying' ? <FaPlane /> : <FaCar />}
                        {tripData.transportationMode}
                      </span>
                    </div>
                    {routeAnalysis && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route Efficiency:</span>
                        <span className={`font-medium ${routeAnalysis.efficiency === 'Good' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {routeAnalysis.efficiency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FadeInWrapper>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <FadeInWrapper delay={0.4}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium min-h-[48px]"
          >
            <FaChevronLeft />
            {currentStep === 1 ? 'Cancel' : 'Previous Step'}
          </button>

          <div className="flex items-center gap-4">
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition font-medium shadow-lg min-h-[48px]"
              >
                Next Step
                <FaChevronRight />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg min-h-[48px]"
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