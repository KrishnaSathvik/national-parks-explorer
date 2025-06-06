// tripPlannerHelpers.js (refactored helper utilities)

import { calculateEstimatedCost, calculateTripDuration } from './tripCalculations';

export const createEmptyTrip = () => ({
  id: null,
  title: '',
  startDate: '',
  endDate: '',
  parks: [],
  totalDistance: 0,
  estimatedCost: 0,
  totalDuration: 1,
  transportationMode: '',
});

export const createTripFromTemplate = (template) => {
  const duration = calculateTripDuration(template.startDate, template.endDate);
  return {
    id: null,
    title: template.title,
    startDate: template.startDate,
    endDate: template.endDate,
    parks: [...template.parks],
    transportationMode: template.transportationMode,
    totalDistance: template.totalDistance || 0,
    estimatedCost: calculateEstimatedCost(template),
    totalDuration: duration
  };
};

export const parseTripFromFirestore = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    transportationMode: data.transportationMode || '',
    parks: data.parks || [],
    totalDistance: data.totalDistance || 0,
    estimatedCost: data.estimatedCost || 0,
    totalDuration: data.totalDuration || 1,
  };
};

export const isTripComplete = (trip) => {
  return !!(
      trip.title?.trim() &&
      trip.startDate &&
      trip.endDate &&
      trip.parks?.length > 0 &&
      trip.transportationMode
  );
};
