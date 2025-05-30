// src/pages/TripPlanner.jsx - Enhanced Version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TripBuilder from '../components/TripBuilder';
import TripList from '../components/TripList';
import FadeInWrapper from '../components/FadeInWrapper';
import { FaPlus, FaRoute, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaClock } from 'react-icons/fa';

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <FadeInWrapper delay={0.1}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text">
                      🗺️ Trip Planner
                    </h1>
                    <p className="text-xl text-pink-100 max-w-2xl">
                      Plan your perfect national parks adventure with intelligent routing, cost estimation, and beautiful visualizations.
                    </p>
                  </div>
                  <button 
                    onClick={createNewTrip}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FaPlus className="group-hover:rotate-180 transition-transform duration-300" /> 
                    Create New Trip
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                </div>
              </FadeInWrapper>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl"></div>
            </div>
          </div>

          <div className="p-8">
            {/* Enhanced Stats Cards */}
            {trips.length > 0 && !activeTrip && (
              <FadeInWrapper delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="group bg-gradient-to-br from-pink-500 to-rose-500 p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{trips.length}</div>
                        <div className="text-pink-100 font-medium">Total Trips</div>
                      </div>
                      <FaRoute className="text-4xl text-pink-200 group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          {trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)}
                        </div>
                        <div className="text-blue-100 font-medium">Parks to Visit</div>
                      </div>
                      <FaMapMarkerAlt className="text-4xl text-blue-200 group-hover:bounce transition-transform" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                        </div>
                        <div className="text-green-100 font-medium">Total Miles</div>
                      </div>
                      <FaClock className="text-4xl text-green-200 group-hover:rotate-45 transition-transform" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                        </div>
                        <div className="text-yellow-100 font-medium">Total Budget</div>
                      </div>
                      <FaDollarSign className="text-4xl text-yellow-200 group-hover:scale-110 transition-transform" />
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
      </div>
    </div>
  );
};

export default TripPlanner;