// src/pages/TripPlanner.jsx - Enhanced with all new features
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TripBuilder from '../components/TripBuilder';
import FadeInWrapper from '../components/FadeInWrapper';
import { 
  SmartRecommendations, 
  TripTemplates, 
  TripAnalytics, 
  TripViewer, 
  EnhancedTripList 
} from '../components/EnhancedTripFeatures';
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

  const selectTemplate = (template) => {
    // Convert template to trip format
    const templateTrip = {
      title: template.title,
      description: template.description,
      parks: template.parks.map(park => {
        const foundPark = allParks.find(p => p.name === park.name || p.fullName === park.name);
        return {
          parkId: foundPark?.id || `template-${park.name}`,
          parkName: park.name,
          visitDate: '',
          stayDuration: park.days,
          coordinates: foundPark ? parseCoordinates(foundPark.coordinates) : { lat: 0, lng: 0 },
          slug: foundPark?.slug || ''
        };
      }),
      startDate: '',
      endDate: '',
      transportationMode: 'driving',
      tripStyle: 'balanced',
      isPublic: false
    };
    
    setActiveTrip(templateTrip);
    setCurrentTab('my-trips');
    showToast(`🌟 ${template.title} template loaded! Customize your dates and details.`, 'success');
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
                  <EnhancedTripList 
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
                <TripTemplates 
                  onSelectTemplate={selectTemplate}
                  allParks={allParks}
                />
              </FadeInWrapper>
            )}

            {currentTab === 'analytics' && (
              <FadeInWrapper delay={0.2}>
                <TripAnalytics trips={trips} />
              </FadeInWrapper>
            )}

            {currentTab === 'recommendations' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-8">
                  <SmartRecommendations
                    userPreferences={{
                      tripStyle: 'balanced',
                      transportationMode: 'driving'
                    }}
                    selectedParks={[]}
                    allParks={allParks}
                    onAddPark={(park) => {
                      // Create a new trip with the recommended park
                      const newTrip = {
                        title: `${park.name || park.fullName} Adventure`,
                        description: `Explore the beauty of ${park.name || park.fullName}`,
                        parks: [{
                          parkId: park.id,
                          parkName: park.name || park.fullName,
                          visitDate: '',
                          stayDuration: 2,
                          coordinates: parseCoordinates(park.coordinates),
                          slug: park.slug
                        }],
                        startDate: '',
                        endDate: '',
                        transportationMode: 'driving',
                        tripStyle: 'balanced',
                        isPublic: false
                      };
                      setActiveTrip(newTrip);
                      setCurrentTab('my-trips');
                      showToast(`🧠 Created trip with ${park.name || park.fullName}! Add more parks and set your dates.`, 'success');
                    }}
                  />
                  
                  {/* Quick Start Section */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Started with AI</h3>
                      <p className="text-gray-600">Tell us about your preferences to get personalized recommendations</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setCurrentTab('templates');
                          showToast('🌟 Check out our curated trip templates!', 'info');
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
                          showToast('📊 Explore your travel patterns!', 'info');
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

      {/* Trip Viewer Modal */}
      {viewingTrip && (
        <TripViewer
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