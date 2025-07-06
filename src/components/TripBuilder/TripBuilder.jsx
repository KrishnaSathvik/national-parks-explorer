// ✅ FIXED TripBuilder.jsx - React Error #130 Resolved
import React, { useState, useEffect } from 'react';
import { FaTimes, FaRoute, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { useTripPlanner } from '../TripPlanner/core/TripPlannerProvider';
import TripStepBasics from './steps/TripStepBasics';
import TripStepParks from './steps/TripStepParks';
import TripStepReview from './steps/TripStepReview';
import LoadingSpinner from '../shared/ui/LoadingStates';
import { validateTrip } from '../../utils/tripPlanner/tripHelpers';

// ✅ FIXED: Create missing components inline to prevent undefined rendering

// ✅ FIXED: TripStepDetails component (was missing and causing React Error #130)
const TripStepDetails = ({ tripData, setTripData, errors, dismissError }) => {
  const [localData, setLocalData] = useState({
    title: tripData.title || '',
    description: tripData.description || '',
    startDate: tripData.startDate || '',
    endDate: tripData.endDate || '',
    transportationMode: tripData.transportationMode || 'driving'
  });

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    setTripData(newData);
  };

  return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Details</h2>
          <p className="text-gray-600">Let's start with the basics of your adventure</p>
        </div>

        {/* Trip Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Title *
          </label>
          <input
              type="text"
              value={localData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Utah's Big 5 Adventure"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
          />
          {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
              value={localData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your trip..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
                type="date"
                value={localData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 ${
                    errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
            />
            {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
                type="date"
                value={localData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 ${
                    errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
            />
            {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Transportation Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transportation Method *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => handleChange('transportationMode', 'driving')}
                className={`p-4 border rounded-xl text-left transition-all ${
                    localData.transportationMode === 'driving'
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="font-semibold">🚗 Road Trip</div>
              <div className="text-sm text-gray-600">Drive to all destinations</div>
            </button>

            <button
                type="button"
                onClick={() => handleChange('transportationMode', 'flying')}
                className={`p-4 border rounded-xl text-left transition-all ${
                    localData.transportationMode === 'flying'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="font-semibold">✈️ Flying</div>
              <div className="text-sm text-gray-600">Fly + rental cars</div>
            </button>
          </div>
          {errors.transportationMode && (
              <p className="mt-1 text-sm text-red-600">{errors.transportationMode}</p>
          )}
        </div>
      </div>
  );
};

// ✅ FIXED: MobileStatsCard component (was missing)
const MobileStatsCard = ({ value, label, color }) => {
  return (
      <div className="text-center">
        <div className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
  );
};

// ✅ FIXED: TripStatsCard component (was missing)
const TripStatsCard = ({ value, label, color }) => {
  return (
      <div className="text-center">
        <div className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
  );
};

// ✅ FIXED: MobileErrorToast component (was missing)
const MobileErrorToast = ({ error, onDismiss, isVisible }) => {
  if (!isVisible || !error) return null;

  return (
      <div className="fixed top-4 left-4 right-4 z-50 lg:hidden">
        <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{error.message}</span>
          </div>
          <button
              onClick={onDismiss}
              className="text-white hover:text-red-200 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>
  );
};

// ✅ MAIN TripBuilder Component - Now with all dependencies resolved
const TripBuilder = ({ trip, allParks }) => {
  const {
    currentTrip,
    updateCurrentTrip,
    saveTrip,
    stopBuilding,
    currentStep,
    nextStep,
    previousStep,
    goToStep,
    errors,
    clearErrors,
    isLoading
  } = useTripPlanner();

  const [localErrors, setLocalErrors] = useState({});

  // Enhanced step configuration
  const steps = [
    {
      id: 1,
      title: 'Details',
      icon: FaInfoCircle,
      description: 'Basic trip information',
      component: 'details'
    },
    {
      id: 2,
      title: 'Parks',
      icon: FaRoute,
      description: 'Select your destinations',
      component: 'parks'
    },
    {
      id: 3,
      title: 'Review',
      icon: FaCheckCircle,
      description: 'Finalize your trip',
      component: 'review'
    }
  ];

  // Initialize with trip data if provided
  useEffect(() => {
    if (trip && (!currentTrip || currentTrip.id !== trip.id)) {
      updateCurrentTrip(trip);
    }
  }, [trip, currentTrip, updateCurrentTrip]);

  const dismissError = (field) => {
    setLocalErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    clearErrors();
  };

  const validateCurrentStep = (step) => {
    if (!currentTrip) return false;

    const validation = validateTrip(currentTrip);
    const newErrors = {};

    if (step === 1) {
      if (!currentTrip.title?.trim()) newErrors.title = 'Trip title is required';
      if (!currentTrip.startDate) newErrors.startDate = 'Start date is required';
      if (!currentTrip.endDate) newErrors.endDate = 'End date is required';
      if (currentTrip.startDate && currentTrip.endDate && new Date(currentTrip.startDate) >= new Date(currentTrip.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (!currentTrip.transportationMode) newErrors.transportationMode = 'Please select transportation method';
    }

    if (step === 2 && (!currentTrip.parks || currentTrip.parks.length === 0)) {
      newErrors.parks = 'Please select at least one park';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(currentStep)) {
      nextStep();
    }
  };

  const handleSave = async () => {
    if (!currentTrip || !validateCurrentStep(1) || !validateCurrentStep(2)) {
      return;
    }

    try {
      await saveTrip(currentTrip);
      stopBuilding();
    } catch (err) {
      console.error('Failed to save trip:', err);
      setLocalErrors({ save: 'Failed to save trip. Please try again.' });
    }
  };

  const combinedErrors = { ...errors, ...localErrors };

  if (!currentTrip) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Trip Builder...</h2>
            <p className="text-gray-600">Please wait while we set up your trip planning experience.</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {/* ✅ FIXED: Error toast now uses properly defined component */}
        {Object.keys(combinedErrors).length > 0 && (
            <MobileErrorToast
                error={{
                  type: 'validation',
                  message: Object.values(combinedErrors)[0]
                }}
                onDismiss={() => dismissError(Object.keys(combinedErrors)[0])}
                isVisible={true}
            />
        )}

        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                    onClick={stopBuilding}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    disabled={isLoading}
                >
                  <FaTimes />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Trip Builder</h1>
                  <p className="text-sm text-gray-600">
                    {currentTrip.title || 'New Trip'} • Step {currentStep} of {steps.length}
                  </p>
                </div>
              </div>

              {/* Step Progress Indicator */}
              <div className="hidden md:flex items-center gap-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const isClickable = currentStep >= step.id || isCompleted;

                  return (
                      <div key={step.id} className="flex items-center">
                        <button
                            onClick={() => isClickable && goToStep(step.id)}
                            disabled={!isClickable || isLoading}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'bg-pink-500 text-white shadow-lg'
                                    : isCompleted
                                        ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
                                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            } ${isClickable && !isActive ? 'hover:shadow-md transform hover:-translate-y-0.5' : ''}`}
                        >
                          <Icon className="text-sm" />
                          <span className="text-sm font-medium">{step.title}</span>
                        </button>
                        {index < steps.length - 1 && (
                            <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>
                        )}
                      </div>
                  );
                })}
              </div>

              {/* Mobile Step Indicator */}
              <div className="md:hidden">
              <span className="text-sm font-medium text-gray-600">
                {currentStep}/{steps.length}
              </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Stats Bar */}
        {currentTrip.parks && currentTrip.parks.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
              <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="grid grid-cols-4 gap-3">
                  <TripStatsCard
                      value={`${Math.round(currentTrip.totalDistance || 0)} mi`}
                      label="Distance"
                      color="from-blue-500 to-cyan-500"
                  />
                  <MobileStatsCard
                      value={`$${Math.round(currentTrip.estimatedCost || 0).toLocaleString()}`}
                      label="Budget"
                      color="from-green-500 to-emerald-500"
                  />
                  <MobileStatsCard
                      value={`${currentTrip.totalDuration || 1} days`}
                      label="Duration"
                      color="from-purple-500 to-pink-500"
                  />
                  <MobileStatsCard
                      value={`${currentTrip.parks.length}`}
                      label="Parks"
                      color="from-orange-500 to-red-500"
                  />
                </div>
              </div>
            </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Step Content */}
            <div className="p-6">
              {/* ✅ FIXED: Now using properly defined TripStepDetails component */}
              {currentStep === 1 && (
                  <TripStepDetails
                      tripData={currentTrip}
                      setTripData={updateCurrentTrip}
                      errors={combinedErrors}
                      dismissError={dismissError}
                  />
              )}
              {currentStep === 2 && (
                  <TripStepParks
                      tripData={currentTrip}
                      setTripData={updateCurrentTrip}
                      allParks={allParks}
                  />
              )}
              {currentStep === 3 && (
                  <TripStepReview tripData={currentTrip} />
              )}
            </div>

            {/* Enhanced Navigation */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                    onClick={previousStep}
                    disabled={currentStep === 1 || isLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        currentStep === 1 || isLoading
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md transform hover:-translate-y-0.5'
                    }`}
                >
                  ← Back
                </button>

                <div className="text-center flex-1 mx-4">
                  <div className="text-sm text-gray-600">
                    {steps.find(s => s.id === currentStep)?.description}
                  </div>
                </div>

                {currentStep < steps.length ? (
                    <button
                        onClick={handleNextStep}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                      ) : (
                          <>
                            Continue →
                          </>
                      )}
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                      ) : (
                          <>
                            <FaCheckCircle />
                            Save Trip
                          </>
                      )}
                    </button>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              Step {currentStep} Tips
            </h3>
            <div className="text-sm text-blue-700">
              {currentStep === 1 && (
                  <ul className="space-y-1">
                    <li>• Choose meaningful trip titles to easily find them later</li>
                    <li>• Consider weather and park seasons when selecting dates</li>
                    <li>• Road trips work best for parks within 500 miles of each other</li>
                  </ul>
              )}
              {currentStep === 2 && (
                  <ul className="space-y-1">
                    <li>• Select parks in a logical geographic order for efficient routing</li>
                    <li>• Allow 2-3 days minimum for larger parks like Yellowstone</li>
                    <li>• Use the search to find parks by state or features</li>
                  </ul>
              )}
              {currentStep === 3 && (
                  <ul className="space-y-1">
                    <li>• Review your itinerary for optimal park order</li>
                    <li>• Budget estimates include accommodation, food, and park fees</li>
                    <li>• Save your trip to access it anytime and share with others</li>
                  </ul>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default TripBuilder;