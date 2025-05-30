// src/pages/TripPlanner.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TripBuilder from '../components/TripBuilder';
import TripList from '../components/TripList';
import FadeInWrapper from '../components/FadeInWrapper';
import { FaPlus, FaRoute, FaCalendarAlt } from 'react-icons/fa';

const TripPlanner = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserTrips();
    } else {
      // Load from localStorage for non-logged users
      const savedTrips = JSON.parse(localStorage.getItem('trips')) || [];
      setTrips(savedTrips);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUserTrips = async () => {
    try {
      const q = query(
        collection(db, 'trips'), 
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const userTrips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(userTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      showToast('Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createNewTrip = () => {
    setActiveTrip({
      title: '',
      description: '',
      parks: [],
      startDate: '',
      endDate: '',
      isPublic: false
    });
  };

  const saveTrip = async (tripData) => {
    if (!currentUser) {
      // Save to localStorage for non-logged users
      const newTrip = { id: Date.now().toString(), ...tripData };
      const updatedTrips = [...trips, newTrip];
      setTrips(updatedTrips);
      localStorage.setItem('trips', JSON.stringify(updatedTrips));
      showToast('💖 Trip saved locally! Log in to sync across devices', 'info');
      return newTrip;
    }

    try {
      const tripToSave = {
        ...tripData,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'trips'), tripToSave);
      const savedTrip = { id: docRef.id, ...tripToSave };
      setTrips([...trips, savedTrip]);
      showToast('✅ Trip saved successfully!', 'success');
      return savedTrip;
    } catch (error) {
      console.error('Error saving trip:', error);
      showToast('❌ Failed to save trip', 'error');
      throw error;
    }
  };

  const deleteTrip = async (tripId) => {
    if (!currentUser) {
      const updatedTrips = trips.filter(t => t.id !== tripId);
      setTrips(updatedTrips);
      localStorage.setItem('trips', JSON.stringify(updatedTrips));
      showToast('Trip deleted', 'info');
      return;
    }

    try {
      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(trips.filter(t => t.id !== tripId));
      showToast('Trip deleted', 'info');
    } catch (error) {
      console.error('Error deleting trip:', error);
      showToast('Failed to delete trip', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-md px-4 py-6 rounded-2xl shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <div className="bg-white/90 backdrop-blur-md px-4 py-6 rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-600 flex items-center gap-2 text-center sm:text-left">
            🗺️ Trip Planner
          </h1>
          <button 
            onClick={createNewTrip}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition font-medium"
          >
            <FaPlus /> Create New Trip
          </button>
        </div>

        {/* Stats */}
        {trips.length > 0 && !activeTrip && (
          <FadeInWrapper delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                <div className="flex items-center gap-3">
                  <FaRoute className="text-pink-600 text-xl" />
                  <div>
                    <div className="text-2xl font-bold text-pink-700">{trips.length}</div>
                    <div className="text-sm text-pink-600">Total Trips</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-600 text-xl" />
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      {trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-blue-600">Parks to Visit</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">🛣️</span>
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0))}
                    </div>
                    <div className="text-sm text-green-600">Total Miles</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInWrapper>
        )}

        {/* Main Content */}
        {activeTrip ? (
          <TripBuilder 
            trip={activeTrip}
            onSave={async (savedTrip) => {
              await saveTrip(savedTrip);
              setActiveTrip(null);
            }}
            onCancel={() => setActiveTrip(null)}
          />
        ) : (
          <TripList 
            trips={trips}
            onEditTrip={setActiveTrip}
            onDeleteTrip={deleteTrip}
          />
        )}
      </div>
    </div>
  );
};

export default TripPlanner;