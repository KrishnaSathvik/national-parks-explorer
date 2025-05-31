// src/pages/TripPlanner.jsx - Quick Fix (Remove all enhanced imports)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TripBuilder from '../components/TripBuilder';
import TripList from '../components/TripList';
import FadeInWrapper from '../components/FadeInWrapper';
import { FaPlus, FaRoute, FaCalendarAlt, FaChartBar, FaStar, FaBrain } from 'react-icons/fa';

const TripPlanner = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [allParks, setAllParks] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('my-trips');

  const tabs = [
    { id: 'my-trips', title: 'My Trips', icon: FaRoute, description: 'Your planned adventures' },
    { id: 'templates', title: 'Templates', icon: FaStar, description: 'Pre-made trip ideas' },
    { id: 'analytics', title: 'Analytics', icon: FaChartBar, description: 'Your travel insights' },
    { id: 'recommendations', title: 'AI Suggestions', icon: FaBrain, description: 'Smart recommendations' }
  ];

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      // Fetch parks
      const parksSnapshot = await getDocs(collection(db, 'parks'));
      const parks = parksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllParks(parks);

      // Fetch trips
      if (currentUser) {
        const q = query(collection(db, 'trips'), where('userId', '==', currentUser.uid));
        const tripsSnapshot = await getDocs(q);
        const userTrips = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrips(userTrips);
      } else {
        const savedTrips = JSON.parse(localStorage.getItem('trips')) || [];
        setTrips(savedTrips);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
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
      transportationMode: 'driving',
      tripStyle: 'balanced',
      isPublic: false
    });
  };

  const saveTrip = async (tripData) => {
    if (!currentUser) {
      const newTrip = { id: Date.now().toString(), ...tripData, createdAt: new Date() };
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

  // Simple trip viewer modal component
  const SimpleTripViewer = ({ trip, onClose, onEdit }) => {
    if (!trip) return null;

    const formatDate = (dateString) => {
      if (!dateString) return 'Not set';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const calculateDuration = () => {
      if (!trip.startDate || !trip.endDate) return 0;
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = end.getTime() - start.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{trip.title}</h2>
                {trip.description && (
                  <p className="text-pink-100 mb-4">{trip.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  <span>🏞️ {trip.parks?.length || 0} parks</span>
                  <span>🛣️ {trip.totalDistance || 0} miles</span>
                  <span>💰 ${trip.estimatedCost || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(trip)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                >
                  ✏️
                </button>
                <button
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-pink-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-pink-600">{calculateDuration()}</div>
                <div className="text-pink-700 text-sm">Days</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-600">{trip.parks?.length || 0}</div>
                <div className="text-blue-700 text-sm">Parks</div>
              </div>
              <div className="bg-green-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{trip.totalDistance || 0}</div>
                <div className="text-green-700 text-sm">Miles</div>
              </div>
              <div className="bg-yellow-100 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-600">${trip.estimatedCost || 0}</div>
                <div className="text-yellow-700 text-sm">Budget</div>
              </div>
            </div>

            {/* Parks List */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Parks to Visit</h3>
              <div className="space-y-3">
                {trip.parks?.map((park, index) => (
                  <div key={park.parkId} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{park.parkName}</h4>
                      <div className="text-sm text-gray-600">
                        {park.visitDate && `Visit: ${formatDate(park.visitDate)}`} • 
                        {park.stayDuration} day{park.stayDuration !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )) || <p className="text-gray-500">No parks selected</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const parseCoordinates = (coordString) => {
    if (!coordString || !coordString.includes(',')) return { lat: 0, lng: 0 };
    const [lat, lng] = coordString.split(',').map(val => parseFloat(val.trim()));
    return { lat: lat || 0, lng: lng || 0 };
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
          
          {/* Enhanced Hero Header */}
          <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <FadeInWrapper delay={0.1}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text">
                      🧠 Intelligent Trip Planner
                    </h1>
                    <p className="text-xl text-pink-100 max-w-2xl">
                      AI-powered planning with smart recommendations, templates, and advanced analytics for your perfect adventure.
                    </p>
                  </div>
                  {currentTab === 'my-trips' && (
                    <button 
                      onClick={createNewTrip}
                      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <FaPlus className="group-hover:rotate-180 transition-transform duration-300" /> 
                      Create New Trip
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </button>
                  )}
                </div>
              </FadeInWrapper>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Enhanced Navigation Tabs */}
          <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`group flex-shrink-0 flex items-center gap-3 px-6 py-4 font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    <Icon className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <div className="text-left">
                      <div className="font-semibold">{tab.title}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {/* Enhanced Stats Overview - Only show for My Trips */}
            {currentTab === 'my-trips' && trips.length > 0 && !activeTrip && (
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
                      <FaCalendarAlt className="text-4xl text-blue-200 group-hover:bounce transition-transform" />
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
                      <span className="text-4xl text-green-200 group-hover:rotate-45 transition-transform">🛣️</span>
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
                      <span className="text-4xl text-yellow-200 group-hover:scale-110 transition-transform">💰</span>
                    </div>
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {/* Tab Content */}
            {currentTab === 'my-trips' && (
              <>
                {activeTrip ? (
                  <TripBuilder 
                    trip={activeTrip}
                    allParks={allParks}
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
                    onViewTrip={setViewingTrip}
                  />
                )}
              </>
            )}

            {currentTab === 'templates' && (
              <FadeInWrapper delay={0.2}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌟</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Trip Templates Coming Soon!</h3>
                    <p className="text-gray-600 mb-6">
                      We're working on expert-curated trip templates to help you plan amazing adventures quickly.
                    </p>
                    <button
                      onClick={createNewTrip}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition"
                    >
                      Create Custom Trip Instead
                    </button>
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {currentTab === 'analytics' && (
              <FadeInWrapper delay={0.2}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Analytics Dashboard Coming Soon!</h3>
                    <p className="text-gray-600 mb-6">
                      Get insights into your travel patterns, spending, and preferences with our upcoming analytics dashboard.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                        <div className="text-blue-500 text-2xl mb-2">📈</div>
                        <h4 className="font-semibold text-blue-800">Travel Trends</h4>
                        <p className="text-sm text-blue-700">Track your travel frequency and patterns</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <div className="text-green-500 text-2xl mb-2">💰</div>
                        <h4 className="font-semibold text-green-800">Budget Analysis</h4>
                        <p className="text-sm text-green-700">Understand your spending habits</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <div className="text-purple-500 text-2xl mb-2">🎯</div>
                        <h4 className="font-semibold text-purple-800">Recommendations</h4>
                        <p className="text-sm text-purple-700">Personalized park suggestions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {currentTab === 'recommendations' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🧠</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Recommendations Coming Soon!</h3>
                      <p className="text-gray-600 mb-6">
                        Our AI will analyze your preferences and suggest perfect parks for your next adventure.
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Start Section */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Started Today</h3>
                      <p className="text-gray-600">Create your first trip to unlock personalized recommendations</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setCurrentTab('templates');
                          showToast('🌟 Templates feature coming soon!', 'info');
                        }}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all text-center group"
                      >
                        <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">🌟</span>
                        <h4 className="font-semibold text-gray-800">Browse Templates</h4>
                        <p className="text-sm text-gray-600">Start with expert-curated trips</p>
                      </button>
                      
                      <button
                        onClick={createNewTrip}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
                      >
                        <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">🚀</span>
                        <h4 className="font-semibold text-gray-800">Create from Scratch</h4>
                        <p className="text-sm text-gray-600">Build your custom adventure</p>
                      </button>
                      
                      <button
                        onClick={() => {
                          setCurrentTab('analytics');
                          showToast('📊 Analytics coming soon!', 'info');
                        }}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-center group"
                      >
                        <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">📊</span>
                        <h4 className="font-semibold text-gray-800">View Analytics</h4>
                        <p className="text-sm text-gray-600">Understand your travel style</p>
                      </button>
                    </div>
                  </div>
                </div>
              </FadeInWrapper>
            )}
          </div>
        </div>
      </div>

      {/* Simple Trip Viewer Modal */}
      {viewingTrip && (
        <SimpleTripViewer
          trip={viewingTrip}
          onClose={() => setViewingTrip(null)}
          onEdit={(trip) => {
            setActiveTrip(trip);
            setViewingTrip(null);
            setCurrentTab('my-trips');
          }}
        />
      )}
    </div>
  );
};

export default TripPlanner;