// TripBuilder.jsx (Refactored container)
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import TripStepDetails from './TripStepDetails';
import TripStepParks from './TripStepParks';
import TripStepReview from './TripStepReview';
import MobileStatsCard from './TripStatsCard';
import MobileErrorDisplay from './MobileErrorDisplay';
import { calculateTripDuration, calculateTotalDistance, calculateEstimatedCost } from '../../utils/tripCalculations';

const TripBuilder = ({ trip, allParks, onSave, onCancel }) => {
  const { showToast } = useToast();
  const [tripData, setTripData] = useState(trip);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Details' },
    { id: 2, title: 'Parks' },
    { id: 3, title: 'Review' }
  ];

  useEffect(() => {
    const newTotalDistance = calculateTotalDistance(tripData.parks);
    const newEstimatedCost = calculateEstimatedCost(tripData);
    const newTotalDuration = calculateTripDuration(tripData.startDate, tripData.endDate);

    setTripData(prev => ({
      ...prev,
      totalDistance: newTotalDistance,
      estimatedCost: newEstimatedCost,
      totalDuration: newTotalDuration
    }));
  }, [tripData.parks, tripData.startDate, tripData.endDate, tripData.transportationMode]);

  const dismissError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

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
    if (step === 2 && (!tripData.parks || tripData.parks.length === 0)) {
      newErrors.parks = 'Please select at least one park';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      showToast(`Step ${currentStep} completed`, 'success');
    } else {
      showToast('Please fix the errors before continuing', 'error');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }
    try {
      await onSave(tripData);
    } catch (err) {
      console.error(err);
      showToast('Failed to save trip', 'error');
    }
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <MobileErrorDisplay errors={errors} onDismiss={dismissError} />

        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
                onClick={onCancel}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Trip Builder</h1>
          </div>
          <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
        </div>

        {tripData.parks.length > 0 && (
            <div className="bg-white border-b px-4 py-3 grid grid-cols-4 gap-2">
              <MobileStatsCard value={`${tripData.totalDistance} mi`} label="Distance" color="from-blue-500 to-cyan-500" />
              <MobileStatsCard value={`$${tripData.estimatedCost}`} label="Budget" color="from-green-500 to-emerald-500" />
              <MobileStatsCard value={`${tripData.totalDuration} days`} label="Duration" color="from-purple-500 to-pink-500" />
              <MobileStatsCard value={`${tripData.parks.length}`} label="Parks" color="from-orange-500 to-red-500" />
            </div>
        )}

        <div className="px-4 py-6 max-w-4xl mx-auto">
          {currentStep === 1 && (
              <TripStepDetails tripData={tripData} setTripData={setTripData} errors={errors} dismissError={dismissError} />
          )}
          {currentStep === 2 && (
              <TripStepParks tripData={tripData} setTripData={setTripData} allParks={allParks} showToast={showToast} />
          )}
          {currentStep === 3 && (
              <TripStepReview tripData={tripData} />
          )}

          <div className="mt-8 flex justify-between">
            <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-medium"
            >
              Back
            </button>
            {currentStep < 3 ? (
                <button
                    onClick={nextStep}
                    className="px-6 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 font-semibold"
                >
                  Continue
                </button>
            ) : (
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 font-semibold"
                >
                  Save Trip
                </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default TripBuilder;