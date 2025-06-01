// src/pages/TripPlanner.jsx - Improved version with mobile fixes
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TripBuilder from '../components/TripBuilder';
import TripList from '../components/TripList';
import TripViewer from '../components/TripViewer';
import FadeInWrapper from '../components/FadeInWrapper';
import { FaPlus, FaRoute, FaCalendarAlt, FaChartBar, FaStar, FaBrain, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

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
    { id: 'suggestions', title: 'Suggestions', icon: FaBrain, description: 'Smart recommendations' }
  ];

  // Simple trip templates
  const tripTemplates = [
    {
      id: 'utah-big5',
      title: 'Utah\'s Big 5 National Parks',
      description: 'Experience all five magnificent Utah national parks in one epic adventure',
      duration: '10-14 days',
      difficulty: 'Moderate',
      estimatedCost: '$2500',
      image: '🏜️',
      parks: ['Arches National Park', 'Canyonlands National Park', 'Capitol Reef National Park', 'Bryce Canyon National Park', 'Zion National Park'],
      highlights: ['Delicate Arch', 'Mesa Arch', 'Narrows', 'Bryce Amphitheater']
    },
    {
      id: 'california-classics',
      title: 'California National Parks Tour',
      description: 'From desert to mountains, explore California\'s diverse landscapes',
      duration: '12-16 days',
      difficulty: 'Moderate to Advanced',
      estimatedCost: '$3200',
      image: '🌲',
      parks: ['Yosemite National Park', 'Sequoia National Park', 'Kings Canyon National Park', 'Death Valley National Park', 'Joshua Tree National Park'],
      highlights: ['Half Dome', 'General Sherman Tree', 'Badwater Basin', 'Joshua Tree Forest']
    },
    {
      id: 'yellowstone-tetons',
      title: 'Yellowstone & Grand Teton Adventure',
      description: 'Wildlife, geysers, and mountain peaks in America\'s first national park',
      duration: '7-10 days',
      difficulty: 'Easy to Moderate',
      estimatedCost: '$1800',
      image: '🦌',
      parks: ['Yellowstone National Park', 'Grand Teton National Park'],
      highlights: ['Old Faithful', 'Grand Prismatic', 'Jackson Lake', 'Wildlife Viewing']
    },
    {
      id: 'southwest-loop',
      title: 'Southwest Desert Loop',
      description: 'A classic road trip through iconic southwestern parks',
      duration: '14-18 days',
      difficulty: 'Moderate',
      estimatedCost: '$3800',
      image: '🌵',
      parks: ['Grand Canyon National Park', 'Zion National Park', 'Bryce Canyon National Park', 'Arches National Park'],
      highlights: ['South Rim Sunrise', 'Angels Landing', 'Delicate Arch', 'Sunset Point']
    }
  ];

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
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
        // Load from localStorage if not logged in
        const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
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
      isPublic: false
    });
    setCurrentTab('my-trips'); // Switch to trips tab when creating
  };

  // Enhanced template system in TripPlanner.jsx

const createTripFromTemplate = async (template) => {
  try {
    // First, find matching parks from our parks database
    const templateParks = [];
    
    for (const templateParkName of template.parks) {
      // Search for the park in our database
      const matchingPark = allParks.find(park => 
        park.name?.toLowerCase().includes(templateParkName.toLowerCase().split(' ')[0]) ||
        park.fullName?.toLowerCase().includes(templateParkName.toLowerCase().split(' ')[0])
      );
      
      if (matchingPark) {
        // Parse coordinates
        let coordinates = { lat: 0, lng: 0 };
        if (matchingPark.coordinates && matchingPark.coordinates.includes(',')) {
          const [lat, lng] = matchingPark.coordinates.split(',').map(val => parseFloat(val.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = { lat, lng };
          }
        }

        templateParks.push({
          parkId: matchingPark.id,
          parkName: matchingPark.name || matchingPark.fullName,
          visitDate: '', // User can still customize dates
          stayDuration: Math.ceil(parseInt(template.duration.split('-')[0]) / template.parks.length), // Distribute days evenly
          coordinates,
          state: matchingPark.state,
          description: matchingPark.description
        });
      } else {
        // If park not found in database, create a placeholder
        templateParks.push({
          parkId: `template-${Date.now()}-${templateParkName.replace(/\s+/g, '-').toLowerCase()}`,
          parkName: templateParkName,
          visitDate: '',
          stayDuration: 2,
          coordinates: { lat: 0, lng: 0 },
          state: '',
          description: `${templateParkName} from ${template.title} template`
        });
      }
    }

    const newTrip = {
      title: template.title,
      description: template.description,
      parks: templateParks, // Pre-populated with parks!
      startDate: '',
      endDate: '',
      transportationMode: 'driving',
      isPublic: false,
      templateId: template.id,
      totalDistance: 0,
      estimatedCost: parseInt(template.estimatedCost.replace('$', '').replace(',', '')) || 0
    };

    setActiveTrip(newTrip);
    setCurrentTab('my-trips');
    showToast(`🌟 ${template.title} template loaded with ${templateParks.length} parks! Just add your dates and you're ready to go!`, 'success');
  } catch (error) {
    console.error('Error creating trip from template:', error);
    showToast('Failed to load template. Please try again.', 'error');
  }
};

  // Fixed saveTrip function in TripPlanner.jsx

  const cleanDataForFirebase = (data) => {
    // Remove undefined values and clean the data
    const cleaned = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Clean arrays (like parks array)
          cleaned[key] = value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return cleanDataForFirebase(item);
            }
            return item;
          });
        } else if (typeof value === 'object' && value !== null) {
          // Clean nested objects (like coordinates)
          cleaned[key] = cleanDataForFirebase(value);
        } else {
          cleaned[key] = value;
        }
      }
    });
    
    return cleaned;
  };

  const saveTrip = async (tripData) => {
    try {
      if (!currentUser) {
        // Save to localStorage if not logged in
        const newTrip = { 
          id: Date.now().toString(), 
          ...tripData, 
          createdAt: new Date().toISOString(),
          userId: 'local' 
        };
        const updatedTrips = [...trips, newTrip];
        setTrips(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));
        showToast('💖 Trip saved locally! Log in to sync across devices', 'info');
        setActiveTrip(null);
        return newTrip;
      }

      // Clean the data to remove undefined values
      const cleanedTripData = cleanDataForFirebase({
        title: tripData.title || '',
        description: tripData.description || '',
        parks: tripData.parks || [],
        startDate: tripData.startDate || '',
        endDate: tripData.endDate || '',
        transportationMode: tripData.transportationMode || 'driving',
        totalDistance: tripData.totalDistance || 0,
        estimatedCost: tripData.estimatedCost || 0,
        totalDuration: tripData.totalDuration || 0,
        isPublic: tripData.isPublic || false,
        templateId: tripData.templateId || null,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (tripData.id) {
        // Update existing trip
        await updateDoc(doc(db, 'trips', tripData.id), {
          ...cleanedTripData,
          updatedAt: new Date()
        });
        const updatedTrips = trips.map(t => t.id === tripData.id ? { ...cleanedTripData, id: tripData.id } : t);
        setTrips(updatedTrips);
        showToast('✅ Trip updated successfully!', 'success');
      } else {
        // Create new trip
        const docRef = await addDoc(collection(db, 'trips'), cleanedTripData);
        const savedTrip = { id: docRef.id, ...cleanedTripData };
        setTrips([...trips, savedTrip]);
        showToast('✅ Trip saved successfully!', 'success');
      }
      
      setActiveTrip(null);
      return cleanedTripData;
    } catch (error) {
      console.error('Save error:', error);
      showToast('❌ Failed to save trip: ' + error.message, 'error');
      throw error;
    }
  };

  const editTrip = (trip) => {
    setActiveTrip(trip);
    setViewingTrip(null);
    setCurrentTab('my-trips');
  };

  const deleteTrip = async (tripId) => {
    try {
      if (!currentUser) {
        // Delete from localStorage
        const updatedTrips = trips.filter(t => t.id !== tripId);
        setTrips(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));
        showToast('Trip deleted', 'info');
        return;
      }

      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(trips.filter(t => t.id !== tripId));
      showToast('Trip deleted', 'info');
    } catch (error) {
      console.error('Error deleting trip:', error);
      showToast('Failed to delete trip', 'error');
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty.toLowerCase().includes('easy')) return 'text-green-600 bg-green-100';
    if (difficulty.toLowerCase().includes('moderate')) return 'text-yellow-600 bg-yellow-100';
    if (difficulty.toLowerCase().includes('advanced')) return 'text-red-600 bg-red-100';
    return 'text-blue-600 bg-blue-100';
  };


  const generateSmartSuggestions = () => {
  if (trips.length === 0) return [];
  
  const suggestions = [];
  
  // Analyze user's trip patterns
  const userParks = trips.flatMap(trip => trip.parks?.map(p => p.parkName) || []);
  const userStates = [...new Set(trips.flatMap(trip => trip.parks?.map(p => p.state).filter(Boolean) || []))];
  const avgTripCost = trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0) / trips.length;
  const avgTripDuration = trips.reduce((sum, trip) => sum + (trip.totalDuration || 0), 0) / trips.length;
  const preferredTransport = trips.filter(t => t.transportationMode === 'driving').length > trips.filter(t => t.transportationMode === 'flying').length ? 'driving' : 'flying';
  
  // Suggestion 1: Complete park series
  if (userStates.includes('Utah') && userParks.length >= 2) {
    const utahParks = ['Arches', 'Bryce Canyon', 'Canyonlands', 'Capitol Reef', 'Zion'];
    const visitedUtah = userParks.filter(park => utahParks.some(up => park.includes(up)));
    const missingUtah = utahParks.filter(up => !userParks.some(park => park.includes(up)));
    
    if (missingUtah.length > 0 && missingUtah.length < 4) {
      suggestions.push({
        type: 'complete_series',
        title: 'Complete Utah\'s Big 5',
        description: `You've visited ${visitedUtah.length} Utah parks. Complete the collection!`,
        actionText: 'Plan Utah Trip',
        parks: missingUtah.map(park => `${park} National Park`),
        estimatedDays: missingUtah.length * 2,
        estimatedCost: Math.round(avgTripCost * (missingUtah.length / 3)),
        confidence: 95,
        icon: '🏜️',
        reason: `Based on your ${visitedUtah.length} Utah park visits`
      });
    }
  }
  
  // Suggestion 2: Similar regions
  if (userStates.includes('California')) {
    const californiaParks = userParks.filter(park => 
      ['Yosemite', 'Sequoia', 'Kings Canyon', 'Death Valley', 'Joshua Tree'].some(cp => park.includes(cp))
    );
    
    if (californiaParks.length >= 1 && !userParks.some(park => park.includes('Death Valley'))) {
      suggestions.push({
        type: 'region_expansion',
        title: 'Desert Adventure Awaits',
        description: 'Explore California\'s stunning desert landscapes',
        actionText: 'Plan Desert Trip',
        parks: ['Death Valley National Park', 'Joshua Tree National Park'],
        estimatedDays: 4,
        estimatedCost: Math.round(avgTripCost * 0.8),
        confidence: 88,
        icon: '🌵',
        reason: 'Perfect addition to your California adventures'
      });
    }
  }
  
  // Suggestion 3: Budget-based suggestions
  if (avgTripCost > 3000) {
    suggestions.push({
      type: 'budget_optimization',
      title: 'Budget-Friendly Adventure',
      description: 'Great parks without breaking the bank',
      actionText: 'Plan Budget Trip',
      parks: ['Great Smoky Mountains NP', 'Hot Springs NP', 'Congaree NP'],
      estimatedDays: 6,
      estimatedCost: 1200,
      confidence: 82,
      icon: '💰',
      reason: 'Mix it up with some affordable eastern parks'
    });
  }
  
  // Suggestion 4: Transportation-based
  if (preferredTransport === 'driving' && !userParks.some(park => park.includes('Yellowstone'))) {
    suggestions.push({
      type: 'transport_optimized',
      title: 'Ultimate Road Trip Destination',
      description: 'Perfect for road trip enthusiasts like you',
      actionText: 'Plan Road Trip',
      parks: ['Yellowstone National Park', 'Grand Teton National Park'],
      estimatedDays: Math.round(avgTripDuration),
      estimatedCost: Math.round(avgTripCost),
      confidence: 90,
      icon: '🦌',
      reason: 'Ideal for scenic driving adventures'
    });
  }
  
  // Suggestion 5: Seasonal recommendations
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 4) { // Spring
    suggestions.push({
      type: 'seasonal',
      title: 'Perfect Spring Destinations',
      description: 'Beautiful weather and fewer crowds',
      actionText: 'Plan Spring Trip',
      parks: ['Zion National Park', 'Arches National Park'],
      estimatedDays: 5,
      estimatedCost: Math.round(avgTripCost * 0.9),
      confidence: 85,
      icon: '🌸',
      reason: 'Great weather for hiking right now'
    });
  }
  
  return suggestions.slice(0, 4); // Return top 4 suggestions
};

// Updated Smart Suggestions component
const SmartSuggestionsTab = () => {
  const suggestions = generateSmartSuggestions();
  
  const createTripFromSuggestion = (suggestion) => {
    // Find actual parks in database
    const suggestedParks = [];
    
    suggestion.parks.forEach(parkName => {
      const matchingPark = allParks.find(park => 
        park.name?.toLowerCase().includes(parkName.toLowerCase().split(' ')[0]) ||
        park.fullName?.toLowerCase().includes(parkName.toLowerCase().split(' ')[0])
      );
      
      if (matchingPark) {
        let coordinates = { lat: 0, lng: 0 };
        if (matchingPark.coordinates && matchingPark.coordinates.includes(',')) {
          const [lat, lng] = matchingPark.coordinates.split(',').map(val => parseFloat(val.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = { lat, lng };
          }
        }

        suggestedParks.push({
          parkId: matchingPark.id,
          parkName: matchingPark.name || matchingPark.fullName,
          visitDate: '',
          stayDuration: Math.ceil(suggestion.estimatedDays / suggestion.parks.length),
          coordinates,
          state: matchingPark.state,
          description: matchingPark.description
        });
      }
    });

    const newTrip = {
      title: suggestion.title,
      description: suggestion.description,
      parks: suggestedParks,
      startDate: '',
      endDate: '',
      transportationMode: 'driving',
      estimatedCost: suggestion.estimatedCost,
      totalDuration: suggestion.estimatedDays,
      isPublic: false,
      suggestionType: suggestion.type
    };

    setActiveTrip(newTrip);
    setCurrentTab('my-trips');
    showToast(`🧠 Smart suggestion applied! ${suggestedParks.length} parks added based on your travel patterns.`, 'success');
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
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          
          {/* Enhanced Hero Header */}
          <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-6 md:p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <FadeInWrapper delay={0.1}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text">
                      🧠 Trip Planner
                    </h1>
                    <p className="text-lg md:text-xl text-pink-100 max-w-2xl">
                      Plan your perfect national parks adventure with smart tools and beautiful visualizations.
                    </p>
                  </div>
                  {(currentTab === 'my-trips' && !activeTrip) && (
                    <button 
                      onClick={createNewTrip}
                      className="group relative inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-purple-600 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-h-[48px]"
                    >
                      <FaPlus className="group-hover:rotate-180 transition-transform duration-300" /> 
                      <span className="hidden sm:inline">Create New Trip</span>
                      <span className="sm:hidden">New Trip</span>
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

          {/* Mobile-Optimized Navigation Tabs */}
          <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`group flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 font-medium transition-all duration-300 min-w-max ${
                        isActive
                          ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <Icon className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <div className="text-left">
                        <div className="font-semibold text-sm md:text-base">{tab.title}</div>
                        <div className="text-xs text-gray-500 hidden md:block">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* Enhanced Stats Overview - Only show for My Trips */}
            {currentTab === 'my-trips' && trips.length > 0 && !activeTrip && (
              <FadeInWrapper delay={0.2}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="group bg-gradient-to-br from-pink-500 to-rose-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">{trips.length}</div>
                        <div className="text-pink-100 font-medium text-sm md:text-base">Total Trips</div>
                      </div>
                      <FaRoute className="text-2xl md:text-4xl text-pink-200 group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-blue-500 to-cyan-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">
                          {trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)}
                        </div>
                        <div className="text-blue-100 font-medium text-sm md:text-base">Parks to Visit</div>
                      </div>
                      <FaMapMarkerAlt className="text-2xl md:text-4xl text-blue-200 group-hover:bounce transition-transform" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-green-500 to-emerald-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">
                          {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                        </div>
                        <div className="text-green-100 font-medium text-sm md:text-base">Total Miles</div>
                      </div>
                      <span className="text-2xl md:text-4xl text-green-200 group-hover:rotate-45 transition-transform">🛣️</span>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-yellow-500 to-orange-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">
                          ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                        </div>
                        <div className="text-yellow-100 font-medium text-sm md:text-base">Total Budget</div>
                      </div>
                      <FaDollarSign className="text-2xl md:text-4xl text-yellow-200 group-hover:scale-110 transition-transform" />
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
                    onSave={saveTrip}
                    onCancel={() => setActiveTrip(null)}
                  />
                ) : (
                  <TripList 
                    trips={trips}
                    onEditTrip={editTrip}
                    onDeleteTrip={deleteTrip}
                    onViewTrip={setViewingTrip}
                  />
                )}
              </>
            )}

            {/* Templates Tab */}
            {currentTab === 'templates' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-6 md:space-y-8">
                  <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🌟 Trip Templates</h3>
                    <p className="text-gray-600">Expert-designed adventures to inspire your next journey</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {tripTemplates.map((template, index) => (
                      <FadeInWrapper key={template.id} delay={index * 0.1}>
                        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                          
                          {/* Template Header */}
                          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
                            <div className="flex items-start justify-between mb-4">
                              <div className="text-3xl md:text-4xl mb-2">{template.image}</div>
                              <div className="bg-white/20 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                                {template.duration}
                              </div>
                            </div>
                            
                            <h4 className="text-lg md:text-xl font-bold mb-2">{template.title}</h4>
                            <p className="text-white/90 text-sm md:text-base">{template.description}</p>
                          </div>

                          {/* Template Body */}
                          <div className="p-6">
                            {/* Template Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="text-center">
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                                  {template.difficulty}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Difficulty</div>
                              </div>
                              
                              <div className="text-center">
                                <div className="font-bold text-gray-800">{template.parks.length}</div>
                                <div className="text-xs text-gray-500">Parks</div>
                              </div>
                              
                              <div className="text-center">
                                <div className="font-bold text-green-600">{template.estimatedCost}</div>
                                <div className="text-xs text-gray-500">Est. Cost</div>
                              </div>
                            </div>

                            {/* Parks List */}
                            <div className="mb-6">
                              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                                <FaMapMarkerAlt className="text-pink-500" />
                                Parks Included
                              </h5>
                              <div className="space-y-2">
                                {template.parks.slice(0, 3).map((park, idx) => (
                                  <div key={idx} className="text-sm text-gray-700">
                                    • {park}
                                  </div>
                                ))}
                                {template.parks.length > 3 && (
                                  <div className="text-sm text-gray-500">
                                    +{template.parks.length - 3} more parks...
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Highlights */}
                            <div className="mb-6">
                              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                                <FaStar className="text-yellow-500" />
                                Must-See Highlights
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {template.highlights.slice(0, 3).map((highlight, idx) => (
                                  <span key={idx} className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() => createTripFromTemplate(template)}
                              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[48px]"
                            >
                              <FaStar /> Use This Template
                            </button>
                          </div>
                        </div>
                      </FadeInWrapper>
                    ))}
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {/* Analytics Tab */}
            {currentTab === 'analytics' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-6 md:space-y-8">
                  {trips.length === 0 ? (
                    <div className="text-center py-12 md:py-20">
                      <div className="text-4xl md:text-6xl mb-4">📊</div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Analytics Available</h3>
                      <p className="text-gray-600 mb-6">Create some trips to see your travel analytics and insights!</p>
                      <button
                        onClick={createNewTrip}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition min-h-[48px]"
                      >
                        Create Your First Trip
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6 md:mb-8">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">📊 Your Travel Analytics</h3>
                        <p className="text-gray-600">Insights from your {trips.length} planned trip{trips.length !== 1 ? 's' : ''}</p>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 md:p-6 rounded-2xl text-white text-center">
                          <div className="text-2xl md:text-3xl font-bold">{trips.length}</div>
                          <div className="text-blue-100 text-sm">Total Trips</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-6 rounded-2xl text-white text-center">
                          <div className="text-2xl md:text-3xl font-bold">
                            {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                          </div>
                          <div className="text-purple-100 text-sm">Total Miles</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 md:p-6 rounded-2xl text-white text-center col-span-2 md:col-span-1">
                          <div className="text-2xl md:text-3xl font-bold">
                            ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                          </div>
                          <div className="text-yellow-100 text-sm">Total Budget</div>
                        </div>
                      </div>

                      {/* Trip Breakdown */}
                      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                        <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-6">Trip Breakdown</h4>
                        <div className="space-y-4">
                          {trips.map((trip, index) => (
                            <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                              <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                                  ['from-pink-500 to-rose-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-indigo-500'][index % 4]
                                }`}></div>
                                <div>
                                  <h5 className="font-semibold text-gray-800">{trip.title}</h5>
                                  <div className="text-sm text-gray-600">
                                    {trip.parks?.length || 0} parks • {trip.totalDistance || 0} miles
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-800">${trip.estimatedCost || 0}</div>
                                <div className="text-sm text-gray-600">Budget</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Travel Preferences */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">Transportation Preferences</h4>
                          <div className="space-y-3">
                            {(() => {
                              const driving = trips.filter(t => t.transportationMode === 'driving').length;
                              const flying = trips.filter(t => t.transportationMode === 'flying').length;
                              const total = driving + flying || 1;
                              
                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span>🚗 Road Trips</span>
                                    </div>
                                    <span className="font-semibold">{Math.round((driving / total) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(driving / total) * 100}%` }}
                                    ></div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span>✈️ Flight Trips</span>
                                    </div>
                                    <span className="font-semibold">{Math.round((flying / total) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(flying / total) * 100}%` }}
                                    ></div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">Popular Destinations</h4>
                          <div className="space-y-3">
                            {(() => {
                              // Get most visited parks
                              const parkCounts = {};
                              trips.forEach(trip => {
                                trip.parks?.forEach(park => {
                                  parkCounts[park.parkName] = (parkCounts[park.parkName] || 0) + 1;
                                });
                              });
                              
                              const topParks = Object.entries(parkCounts)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 5);
                              
                              if (topParks.length === 0) {
                                return (
                                  <div className="text-center py-4 text-gray-500">
                                    <p>No park visits planned yet</p>
                                  </div>
                                );
                              }
                              
                              const maxCount = Math.max(...topParks.map(([,count]) => count));
                              
                              return topParks.map(([parkName, count]) => (
                                <div key={parkName} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                      {parkName.length > 20 ? parkName.substring(0, 20) + '...' : parkName}
                                    </span>
                                    <span className="text-sm font-semibold">{count}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(count / maxCount) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Insights */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                          <FaBrain className="text-purple-600" />
                          Smart Travel Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Average trip cost: ${Math.round((trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)) / trips.length)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Average parks per trip: {Math.round((trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)) / trips.length * 10) / 10}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Most expensive trip: ${Math.max(...trips.map(t => t.estimatedCost || 0))}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Longest trip: {Math.max(...trips.map(t => t.totalDistance || 0))} miles</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </FadeInWrapper>
            )}

            {/* Suggestions Tab */}
            {currentTab === 'suggestions' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-6 md:space-y-8">
                  if (trips.length === 0) {
                      return (
                        <div className="text-center py-20">
                          <div className="text-6xl mb-4">🧠</div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Your First Trip</h3>
                          <p className="text-gray-600 mb-6">
                            Once you create a few trips, our AI will analyze your preferences and suggest personalized adventures.
                          </p>
                          <button
                            onClick={createNewTrip}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition min-h-[48px]"
                          >
                            Start Planning
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">🧠 Personalized Trip Suggestions</h3>
                          <p className="text-gray-600">
                            Based on your {trips.length} trip{trips.length !== 1 ? 's' : ''} and travel patterns
                          </p>
                        </div>

                        {suggestions.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">🤔</div>
                            <h4 className="text-xl font-semibold text-gray-600 mb-2">Need More Data</h4>
                            <p className="text-gray-500 mb-6">
                              Plan a few more trips so our AI can better understand your preferences and suggest amazing adventures!
                            </p>
                            <button
                              onClick={createNewTrip}
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
                            >
                              Plan Another Trip
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {suggestions.map((suggestion, index) => (
                              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                  <span className="text-4xl">{suggestion.icon}</span>
                                  <div className="text-right">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                      {suggestion.confidence}% Match
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 capitalize">{suggestion.type.replace('_', ' ')}</div>
                                  </div>
                                </div>
                                
                                <h4 className="text-xl font-bold text-gray-800 mb-2">{suggestion.title}</h4>
                                <p className="text-gray-600 mb-4">{suggestion.description}</p>
                                
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                  <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                      <div className="font-bold text-gray-800">{suggestion.parks.length}</div>
                                      <div className="text-xs text-gray-500">Parks</div>
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-800">{suggestion.estimatedDays}</div>
                                      <div className="text-xs text-gray-500">Days</div>
                                    </div>
                                    <div>
                                      <div className="font-bold text-green-600">${suggestion.estimatedCost}</div>
                                      <div className="text-xs text-gray-500">Budget</div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-700 mb-2">Suggested Parks:</h5>
                                  <div className="space-y-1">
                                    {suggestion.parks.map((park, idx) => (
                                      <div key={idx} className="text-sm text-gray-600">• {park}</div>
                                    ))}
                                  </div>
                                </div>

                                <div className="text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded-lg mb-4">
                                  🧠 {suggestion.reason}
                                </div>
                                
                                <button
                                  onClick={() => createTripFromSuggestion(suggestion)}
                                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 min-h-[48px]"
                                >
                                  <span>✨</span> {suggestion.actionText}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  };

                        {/* Smart Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(() => {
                            // Generate recommendations based on user's trip patterns
                            const userParks = trips.flatMap(trip => trip.parks?.map(p => p.parkName) || []);
                            const hasUtahParks = userParks.some(park => park?.includes('Zion') || park?.includes('Bryce') || park?.includes('Arches'));
                            const hasCaliforniaParks = userParks.some(park => park?.includes('Yosemite') || park?.includes('Sequoia'));
                            const prefersDriving = trips.filter(t => t.transportationMode === 'driving').length > trips.filter(t => t.transportationMode === 'flying').length;
                            
                            const recommendations = [];
                            
                            if (hasUtahParks && !userParks.some(park => park?.includes('Capitol Reef'))) {
                              recommendations.push({
                                title: 'Complete Utah\'s Big 5',
                                description: 'You\'ve been to some Utah parks! Complete the Big 5 collection.',
                                park: 'Capitol Reef National Park',
                                reason: 'Based on your Utah park visits',
                                icon: '🏜️',
                                confidence: 92
                              });
                            }
                            
                            if (hasCaliforniaParks && !userParks.some(park => park?.includes('Joshua Tree'))) {
                              recommendations.push({
                                title: 'Desert Adventure Awaits',
                                description: 'Explore California\'s unique desert landscape.',
                                park: 'Joshua Tree National Park',
                                reason: 'Complements your California trips',
                                icon: '🌵',
                                confidence: 88
                              });
                            }
                            
                            if (prefersDriving && !userParks.some(park => park?.includes('Yellowstone'))) {
                              recommendations.push({
                                title: 'Classic Road Trip Destination',
                                description: 'Perfect for road trip enthusiasts like you!',
                                park: 'Yellowstone National Park',
                                reason: 'Ideal for road trip adventures',
                                icon: '🦌',
                                confidence: 85
                              });
                            }
                            
                            // Add default recommendations if user doesn't have many trips
                            if (recommendations.length === 0) {
                              recommendations.push(
                                {
                                  title: 'Most Popular Choice',
                                  description: 'Start with America\'s most iconic park.',
                                  park: 'Grand Canyon National Park',
                                  reason: 'Perfect for first-time planners',
                                  icon: '🏞️',
                                  confidence: 95
                                },
                                {
                                  title: 'Adventure Paradise',
                                  description: 'Incredible hiking and stunning vistas.',
                                  park: 'Zion National Park',
                                  reason: 'Great for outdoor enthusiasts',
                                  icon: '⛰️',
                                  confidence: 90
                                },
                                {
                                  title: 'Natural Wonder',
                                  description: 'Geysers, wildlife, and pristine wilderness.',
                                  park: 'Yellowstone National Park',
                                  reason: 'Classic American experience',
                                  icon: '🦌',
                                  confidence: 87
                                }
                              );
                            }
                            
                            return recommendations.slice(0, 3).map((rec, index) => (
                              <div key={index} className="bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-3xl">{rec.icon}</span>
                                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {rec.confidence}% Match
                                  </div>
                                </div>
                                
                                <h4 className="font-bold text-gray-800 mb-2">{rec.title}</h4>
                                <h5 className="text-purple-600 font-semibold mb-2">{rec.park}</h5>
                                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                                
                                <div className="text-xs text-purple-700 bg-purple-100 px-3 py-1 rounded-full mb-4">
                                  🧠 {rec.reason}
                                </div>
                                
                                <button
                                  onClick={() => {
                                    createNewTrip();
                                    showToast(`🧠 AI suggests starting with ${rec.park}! Add it to your new trip.`, 'success');
                                  }}
                                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition text-sm font-medium min-h-[40px]"
                                >
                                  Plan Trip Here
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Quick Start Section */}
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                    <div className="text-center mb-6">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Quick Start Options</h3>
                      <p className="text-gray-600">Choose how you'd like to begin your next adventure</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setCurrentTab('templates');
                          showToast('🌟 Browse our expert-curated templates!', 'info');
                        }}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all text-center group min-h-[120px]"
                      >
                        <span className="text-3xl md:text-4xl block mb-2 group-hover:scale-110 transition-transform">🌟</span>
                        <h4 className="font-semibold text-gray-800">Browse Templates</h4>
                        <p className="text-sm text-gray-600">Start with expert-curated trips</p>
                      </button>
                      
                      <button
                        onClick={createNewTrip}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center group min-h-[120px]"
                      >
                        <span className="text-3xl md:text-4xl block mb-2 group-hover:scale-110 transition-transform">🚀</span>
                        <h4 className="font-semibold text-gray-800">Create from Scratch</h4>
                        <p className="text-sm text-gray-600">Build your custom adventure</p>
                      </button>
                      
                      <button
                        onClick={() => {
                          setCurrentTab('analytics');
                          showToast('📊 Check out your travel insights!', 'info');
                        }}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-center group min-h-[120px]"
                      >
                        <span className="text-3xl md:text-4xl block mb-2 group-hover:scale-110 transition-transform">📊</span>
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