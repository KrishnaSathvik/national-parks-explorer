// ============================================
// src/hooks/useTripPlanner.js
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { validateTrip, createEmptyTrip } from '../utils/tripHelpers';
import { calculateEstimatedCost, calculateTripDuration } from '../utils/tripPlanner/tripCalculations';

export const useTripPlanner = () => {
    const { currentUser } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch trips from Firestore or localStorage
    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (!currentUser) {
                // Load from localStorage for non-authenticated users
                const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
                setTrips(savedTrips);
                return;
            }

            // Load from Firestore for authenticated users
            const q = query(
                collection(db, 'trips'),
                where('userId', '==', currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const userTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setTrips(userTrips);
        } catch (err) {
            console.error('Error fetching trips:', err);
            setError('Failed to load trips');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Save trip to Firestore or localStorage
    const saveTrip = useCallback(async (tripData) => {
        try {
            // Validate trip data
            const validation = validateTrip(tripData);
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors)[0]);
            }

            // Calculate dynamic fields
            const enhancedTripData = {
                ...tripData,
                estimatedCost: calculateEstimatedCost(tripData),
                totalDuration: calculateTripDuration(tripData.startDate, tripData.endDate),
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
                    ? trips.map(t => t.id === tripData.id ? newTrip : t)
                    : [...trips, newTrip];

                setTrips(updatedTrips);
                localStorage.setItem('trips', JSON.stringify(updatedTrips));
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
                setTrips(prev => prev.map(t => t.id === tripData.id ? updatedTrip : t));
                return updatedTrip;
            } else {
                // Create new trip
                const docRef = await addDoc(collection(db, 'trips'), firestoreData);
                const newTrip = { id: docRef.id, ...firestoreData };
                setTrips(prev => [...prev, newTrip]);
                return newTrip;
            }
        } catch (err) {
            console.error('Error saving trip:', err);
            throw new Error(`Failed to save trip: ${err.message}`);
        }
    }, [currentUser, trips]);

    // Delete trip
    const deleteTrip = useCallback(async (tripId) => {
        try {
            if (!currentUser) {
                // Remove from localStorage
                const updatedTrips = trips.filter(t => t.id !== tripId);
                setTrips(updatedTrips);
                localStorage.setItem('trips', JSON.stringify(updatedTrips));
                return;
            }

            // Remove from Firestore
            await deleteDoc(doc(db, 'trips', tripId));
            setTrips(prev => prev.filter(t => t.id !== tripId));
        } catch (err) {
            console.error('Error deleting trip:', err);
            throw new Error('Failed to delete trip');
        }
    }, [currentUser, trips]);

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
        } catch (err) {
            console.error('Error duplicating trip:', err);
            throw new Error('Failed to duplicate trip');
        }
    }, [saveTrip]);

    // Initialize trips on mount
    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    return {
        trips,
        loading,
        error,
        saveTrip,
        deleteTrip,
        duplicateTrip,
        refetchTrips: fetchTrips,
        createEmptyTrip
    };
};