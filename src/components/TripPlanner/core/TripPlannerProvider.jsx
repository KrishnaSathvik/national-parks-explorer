// src/components/TripPlanner/core/TripPlannerProvider.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
    updateDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../../../firebase';
import {
    validateTrip,
    createEmptyTrip,
    generateTripItinerary,
    createTripFromTemplate
} from '../../../utils/tripPlanner/tripHelpers';
import {
    calculateEstimatedCost,
    calculateTripDuration,
    calculateTotalDistance,
    optimizeTripRoute
} from '../../../utils/tripPlanner/tripCalculations';

// Trip Planner State
const initialState = {
    // Core data
    trips: [],
    currentTrip: null,
    allParks: [],

    // UI state
    isLoading: false,
    isBuilding: false,
    isViewing: false,
    currentStep: 1,

    // Errors and validation
    errors: {},
    lastError: null,

    // Features
    templates: [],
    analytics: null,

    // Settings
    preferences: {
        autoOptimize: true,
        smartSuggestions: true,
        budgetAlerts: true
    }
};

// Action types
const actionTypes = {
    SET_LOADING: 'SET_LOADING',
    SET_TRIPS: 'SET_TRIPS',
    ADD_TRIP: 'ADD_TRIP',
    UPDATE_TRIP: 'UPDATE_TRIP',
    DELETE_TRIP: 'DELETE_TRIP',
    SET_CURRENT_TRIP: 'SET_CURRENT_TRIP',
    SET_ALL_PARKS: 'SET_ALL_PARKS',
    SET_BUILDING: 'SET_BUILDING',
    SET_VIEWING: 'SET_VIEWING',
    SET_CURRENT_STEP: 'SET_CURRENT_STEP',
    SET_ERRORS: 'SET_ERRORS',
    CLEAR_ERRORS: 'CLEAR_ERRORS',
    SET_TEMPLATES: 'SET_TEMPLATES',
    SET_ANALYTICS: 'SET_ANALYTICS',
    UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
    SET_ERROR: 'SET_ERROR'
};

// Reducer
const tripPlannerReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case actionTypes.SET_TRIPS:
            return { ...state, trips: action.payload };

        case actionTypes.ADD_TRIP:
            return { ...state, trips: [...state.trips, action.payload] };

        case actionTypes.UPDATE_TRIP:
            return {
                ...state,
                trips: state.trips.map(trip =>
                    trip.id === action.payload.id ? action.payload : trip
                ),
                currentTrip: state.currentTrip?.id === action.payload.id ? action.payload : state.currentTrip
            };

        case actionTypes.DELETE_TRIP:
            return {
                ...state,
                trips: state.trips.filter(trip => trip.id !== action.payload),
                currentTrip: state.currentTrip?.id === action.payload ? null : state.currentTrip
            };

        case actionTypes.SET_CURRENT_TRIP:
            return { ...state, currentTrip: action.payload };

        case actionTypes.SET_ALL_PARKS:
            return { ...state, allParks: action.payload };

        case actionTypes.SET_BUILDING:
            return { ...state, isBuilding: action.payload };

        case actionTypes.SET_VIEWING:
            return { ...state, isViewing: action.payload };

        case actionTypes.SET_CURRENT_STEP:
            return { ...state, currentStep: action.payload };

        case actionTypes.SET_ERRORS:
            return { ...state, errors: action.payload };

        case actionTypes.CLEAR_ERRORS:
            return { ...state, errors: {} };

        case actionTypes.SET_TEMPLATES:
            return { ...state, templates: action.payload };

        case actionTypes.SET_ANALYTICS:
            return { ...state, analytics: action.payload };

        case actionTypes.UPDATE_PREFERENCES:
            return {
                ...state,
                preferences: { ...state.preferences, ...action.payload }
            };

        case actionTypes.SET_ERROR:
            return { ...state, lastError: action.payload };

        default:
            return state;
    }
};

// Context
const TripPlannerContext = createContext();

// Provider Component
export const TripPlannerProvider = ({ children }) => {
    const [state, dispatch] = useReducer(tripPlannerReducer, initialState);
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    // Enhanced error handling
    const handleError = useCallback((error, context = '') => {
        console.error(`Trip Planner Error ${context}:`, error);
        const message = error.message || 'An unexpected error occurred';
        dispatch({ type: actionTypes.SET_ERROR, payload: { message, context, timestamp: new Date() } });
        showToast(message, 'error');
    }, [showToast]);

    // Fetch all parks
    const fetchParks = useCallback(async () => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            const snapshot = await getDocs(collection(db, 'parks'));
            const parks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort parks by name for consistent ordering
            const sortedParks = parks.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            dispatch({ type: actionTypes.SET_ALL_PARKS, payload: sortedParks });
        } catch (error) {
            handleError(error, 'fetching parks');
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    }, [handleError]);

    // Fetch user trips with real-time updates
    const fetchTrips = useCallback(() => {
        if (!currentUser) {
            // Load from localStorage for non-authenticated users
            const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
            dispatch({ type: actionTypes.SET_TRIPS, payload: savedTrips });
            return;
        }

        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });

            const q = query(
                collection(db, 'trips'),
                where('userId', '==', currentUser.uid)
            );

            // Set up real-time listener
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const trips = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
                    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt)
                }));

                // Sort by creation date (newest first)
                const sortedTrips = trips.sort((a, b) => b.createdAt - a.createdAt);

                dispatch({ type: actionTypes.SET_TRIPS, payload: sortedTrips });
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }, (error) => {
                handleError(error, 'fetching trips');
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            });

            return unsubscribe;
        } catch (error) {
            handleError(error, 'setting up trips listener');
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    }, [currentUser, handleError]);

    // Enhanced save trip with validation and optimization
    const saveTrip = useCallback(async (tripData) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });

            // Validate trip data
            const validation = validateTrip(tripData);
            if (!validation.isValid) {
                dispatch({ type: actionTypes.SET_ERRORS, payload: validation.errors });
                throw new Error(Object.values(validation.errors)[0]);
            }

            // Auto-optimize route if enabled
            let optimizedParks = tripData.parks;
            if (state.preferences.autoOptimize && tripData.parks.length > 2) {
                optimizedParks = optimizeTripRoute(tripData.parks);
                if (optimizedParks.length !== tripData.parks.length) {
                    showToast('Route optimized for better efficiency!', 'success');
                }
            }

            // Calculate dynamic fields
            const enhancedTripData = {
                ...tripData,
                parks: optimizedParks,
                estimatedCost: calculateEstimatedCost({ ...tripData, parks: optimizedParks }),
                totalDuration: calculateTripDuration(tripData.startDate, tripData.endDate),
                totalDistance: calculateTotalDistance(optimizedParks),
                updatedAt: new Date()
            };

            if (!currentUser) {
                // Save to localStorage
                const newTrip = {
                    id: tripData.id || Date.now().toString(),
                    ...enhancedTripData,
                    createdAt: tripData.createdAt || new Date(),
                    userId: 'local'
                };

                const updatedTrips = tripData.id
                    ? state.trips.map(t => t.id === tripData.id ? newTrip : t)
                    : [...state.trips, newTrip];

                localStorage.setItem('trips', JSON.stringify(updatedTrips));

                if (tripData.id) {
                    dispatch({ type: actionTypes.UPDATE_TRIP, payload: newTrip });
                } else {
                    dispatch({ type: actionTypes.ADD_TRIP, payload: newTrip });
                }

                showToast('Trip saved locally! Sign in to sync across devices', 'success');
                return newTrip;
            }

            // Save to Firestore
            const firestoreData = {
                ...enhancedTripData,
                userId: currentUser.uid,
                createdAt: tripData.createdAt || new Date()
            };

            if (tripData.id) {
                // Update existing trip
                await updateDoc(doc(db, 'trips', tripData.id), firestoreData);
                const updatedTrip = { id: tripData.id, ...firestoreData };
                dispatch({ type: actionTypes.UPDATE_TRIP, payload: updatedTrip });
                showToast('Trip updated successfully!', 'success');
                return updatedTrip;
            } else {
                // Create new trip
                const docRef = await addDoc(collection(db, 'trips'), firestoreData);
                const newTrip = { id: docRef.id, ...firestoreData };
                dispatch({ type: actionTypes.ADD_TRIP, payload: newTrip });
                showToast('Trip created successfully!', 'success');
                return newTrip;
            }
        } catch (error) {
            handleError(error, 'saving trip');
            throw error;
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    }, [currentUser, state.trips, state.preferences.autoOptimize, handleError, showToast]);

    // Delete trip
    const deleteTrip = useCallback(async (tripId) => {
        try {
            if (!currentUser) {
                const updatedTrips = state.trips.filter(t => t.id !== tripId);
                localStorage.setItem('trips', JSON.stringify(updatedTrips));
                dispatch({ type: actionTypes.DELETE_TRIP, payload: tripId });
                showToast('Trip deleted', 'info');
                return;
            }

            await deleteDoc(doc(db, 'trips', tripId));
            dispatch({ type: actionTypes.DELETE_TRIP, payload: tripId });
            showToast('Trip deleted', 'info');
        } catch (error) {
            handleError(error, 'deleting trip');
            throw error;
        }
    }, [currentUser, state.trips, handleError, showToast]);

    // Duplicate trip
    const duplicateTrip = useCallback(async (trip) => {
        try {
            const duplicatedTrip = {
                ...trip,
                id: null,
                title: `${trip.title} (Copy)`,
                createdAt: null,
                updatedAt: null
            };

            return await saveTrip(duplicatedTrip);
        } catch (error) {
            handleError(error, 'duplicating trip');
            throw error;
        }
    }, [saveTrip, handleError]);

    // Create trip from template
    const createFromTemplate = useCallback(async (template) => {
        try {
            const newTrip = createTripFromTemplate(template, state.allParks);
            dispatch({ type: actionTypes.SET_CURRENT_TRIP, payload: newTrip });
            dispatch({ type: actionTypes.SET_BUILDING, payload: true });
            showToast(`Template "${template.title}" loaded successfully!`, 'success');
            return newTrip;
        } catch (error) {
            handleError(error, 'creating trip from template');
            throw error;
        }
    }, [state.allParks, handleError, showToast]);

    // Trip builder actions
    const startBuilding = useCallback((trip = null) => {
        const newTrip = trip || createEmptyTrip();
        dispatch({ type: actionTypes.SET_CURRENT_TRIP, payload: newTrip });
        dispatch({ type: actionTypes.SET_BUILDING, payload: true });
        dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: 1 });
        dispatch({ type: actionTypes.CLEAR_ERRORS });
    }, []);

    const stopBuilding = useCallback(() => {
        dispatch({ type: actionTypes.SET_BUILDING, payload: false });
        dispatch({ type: actionTypes.SET_CURRENT_TRIP, payload: null });
        dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: 1 });
        dispatch({ type: actionTypes.CLEAR_ERRORS });
    }, []);

    const updateCurrentTrip = useCallback((updates) => {
        if (state.currentTrip) {
            const updatedTrip = { ...state.currentTrip, ...updates };

            // Auto-calculate fields if parks changed
            if (updates.parks) {
                updatedTrip.totalDistance = calculateTotalDistance(updates.parks);
                updatedTrip.estimatedCost = calculateEstimatedCost(updatedTrip);
            }

            // Auto-calculate duration if dates changed
            if (updates.startDate || updates.endDate) {
                updatedTrip.totalDuration = calculateTripDuration(
                    updatedTrip.startDate,
                    updatedTrip.endDate
                );
            }

            dispatch({ type: actionTypes.SET_CURRENT_TRIP, payload: updatedTrip });
        }
    }, [state.currentTrip]);

    const nextStep = useCallback(() => {
        const maxSteps = 6; // Updated for new step structure
        if (state.currentStep < maxSteps) {
            dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: state.currentStep + 1 });
        }
    }, [state.currentStep]);

    const previousStep = useCallback(() => {
        if (state.currentStep > 1) {
            dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: state.currentStep - 1 });
        }
    }, [state.currentStep]);

    const goToStep = useCallback((step) => {
        if (step >= 1 && step <= 6) {
            dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: step });
        }
    }, []);

    // Trip viewer actions
    const startViewing = useCallback((trip) => {
        dispatch({ type: actionTypes.SET_CURRENT_TRIP, payload: trip });
        dispatch({ type: actionTypes.SET_VIEWING, payload: true });
    }, []);

    const stopViewing = useCallback(() => {
        dispatch({ type: actionTypes.SET_VIEWING, payload: false });
        dispatch({ type: actionTypes.SET_CURRENT_TRIP, payload: null });
    }, []);

    // Analytics
    const generateAnalytics = useCallback(() => {
        if (state.trips.length === 0) {
            dispatch({ type: actionTypes.SET_ANALYTICS, payload: null });
            return;
        }

        const analytics = {
            totalTrips: state.trips.length,
            totalParks: state.trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0),
            totalDistance: state.trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0),
            totalCost: state.trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0),
            averageTripLength: state.trips.length > 0
                ? Math.round(state.trips.reduce((sum, trip) => sum + (trip.totalDuration || 0), 0) / state.trips.length)
                : 0,
            popularStates: getPopularStates(state.trips),
            transportationBreakdown: getTransportationBreakdown(state.trips),
            monthlyTrends: getMonthlyTrends(state.trips),
            costTrends: getCostTrends(state.trips)
        };

        dispatch({ type: actionTypes.SET_ANALYTICS, payload: analytics });
        return analytics;
    }, [state.trips]);

    // Helper functions for analytics
    const getPopularStates = (trips) => {
        const stateCounts = {};
        trips.forEach(trip => {
            trip.parks?.forEach(park => {
                const state = park.state;
                if (state) {
                    stateCounts[state] = (stateCounts[state] || 0) + 1;
                }
            });
        });

        return Object.entries(stateCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([state, count]) => ({ state, count }));
    };

    const getTransportationBreakdown = (trips) => {
        const modes = {};
        trips.forEach(trip => {
            const mode = trip.transportationMode || 'unspecified';
            modes[mode] = (modes[mode] || 0) + 1;
        });

        const total = trips.length || 1;
        return Object.entries(modes).map(([mode, count]) => ({
            mode,
            count,
            percentage: Math.round((count / total) * 100)
        }));
    };

    const getMonthlyTrends = (trips) => {
        const monthCounts = Array(12).fill(0);
        trips.forEach(trip => {
            if (trip.startDate) {
                const month = new Date(trip.startDate).getMonth();
                monthCounts[month]++;
            }
        });

        return monthCounts.map((count, index) => ({
            month: new Date(2024, index).toLocaleString('default', { month: 'short' }),
            count
        }));
    };

    const getCostTrends = (trips) => {
        return trips
            .filter(trip => trip.estimatedCost && trip.createdAt)
            .sort((a, b) => a.createdAt - b.createdAt)
            .map(trip => ({
                date: trip.createdAt,
                cost: trip.estimatedCost,
                title: trip.title
            }));
    };

    // Initialize data on mount
    useEffect(() => {
        fetchParks();
        const unsubscribe = fetchTrips();

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [fetchParks, fetchTrips]);

    // Auto-generate analytics when trips change
    useEffect(() => {
        generateAnalytics();
    }, [generateAnalytics]);

    // Context value
    const value = {
        // State
        ...state,

        // Core actions
        saveTrip,
        deleteTrip,
        duplicateTrip,

        // Builder actions
        startBuilding,
        stopBuilding,
        updateCurrentTrip,
        nextStep,
        previousStep,
        goToStep,

        // Viewer actions
        startViewing,
        stopViewing,

        // Template actions
        createFromTemplate,

        // Analytics
        generateAnalytics,

        // Utility actions
        fetchParks,
        fetchTrips,

        // Error handling
        clearErrors: () => dispatch({ type: actionTypes.CLEAR_ERRORS }),

        // Preferences
        updatePreferences: (prefs) => dispatch({
            type: actionTypes.UPDATE_PREFERENCES,
            payload: prefs
        })
    };

    return (
        <TripPlannerContext.Provider value={value}>
            {children}
        </TripPlannerContext.Provider>
    );
};

// Hook to use the context
export const useTripPlanner = () => {
    const context = useContext(TripPlannerContext);
    if (!context) {
        throw new Error('useTripPlanner must be used within TripPlannerProvider');
    }
    return context;
};