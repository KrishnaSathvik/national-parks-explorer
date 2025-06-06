// Enhanced TripPlanner.jsx - Fixed Mobile Issues
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TripBuilder from '../components/TripBuilder/TripBuilder';
import TripList from '../components/TripList';
import TripViewer from '../components/TripViewer/TripViewer';
import FadeInWrapper from '../components/FadeInWrapper';
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaRoute,
  FaCalendarAlt,
  FaChartBar,
  FaStar,
  FaBrain,
  FaMapMarkerAlt,
  FaDollarSign,
  FaArrowLeft,
  FaClock,
  FaHiking,
  FaCamera,
  FaInfoCircle,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

// Enhanced Toast Component for Mobile
const EnhancedToast = ({ message, type, onClose, actionLabel, onActionClick, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return Math.max(0, newProgress);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch(type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'trip':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'trip':
        return <FaRoute className="text-purple-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  if (!isVisible) return null;

  return (
      <div className={`fixed top-4 left-4 right-4 z-50 rounded-xl border shadow-lg transform transition-all duration-300 overflow-hidden ${getToastStyles()}`}>
        {/* Progress bar */}
        <div
            className="h-1 bg-current opacity-20 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
        ></div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-relaxed">{message}</p>
              {actionLabel && onActionClick && (
                  <button
                      onClick={onActionClick}
                      className="mt-2 text-xs underline hover:no-underline font-medium"
                  >
                    {actionLabel}
                  </button>
              )}
            </div>
            <button
                onClick={() => {
                  setIsVisible(false);
                  onClose?.();
                }}
                className="p-1 hover:bg-black/10 rounded transition-colors flex-shrink-0"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      </div>
  );
};

const TripPlanner = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [allParks, setAllParks] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('my-trips');
  const [toasts, setToasts] = useState([]);

  // Enhanced toast system
  const showEnhancedToast = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      ...options
    };

    setToasts(prev => [...prev, toast]);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Tab configuration with better mobile descriptions
  const tabs = [
    {
      id: 'my-trips',
      title: 'My Trips',
      icon: FaRoute,
      description: 'Your adventures',
      mobileTitle: 'Trips'
    },
    {
      id: 'templates',
      title: 'Templates',
      icon: FaStar,
      description: 'Pre-built guides',
      mobileTitle: 'Templates'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: FaChartBar,
      description: 'Travel insights',
      mobileTitle: 'Stats'
    }
  ];

  // Enhanced detailed trip templates with proper mobile formatting
  const detailedTemplates = [
    {
      id: 'utah-big5',
      title: 'Utah\'s Big 5 National Parks',
      subtitle: 'Complete Utah Adventure',
      description: 'Experience all five magnificent Utah national parks in one epic 12-day adventure',
      duration: 12,
      difficulty: 'Moderate',
      estimatedCost: 2800,
      season: 'Spring/Fall',
      image: '🏜️',
      region: 'Utah',
      highlights: ['Delicate Arch', 'The Narrows', 'Bryce Amphitheater', 'Capitol Reef Scenic Drive'],
      transportation: {
        arrival: 'Salt Lake City Airport',
        drivingTime: 'Road trip between parks',
        rentalCarRequired: true
      },
      parks: [
        { name: 'Arches National Park', days: 2, state: 'Utah' },
        { name: 'Canyonlands National Park', days: 2, state: 'Utah' },
        { name: 'Capitol Reef National Park', days: 2, state: 'Utah' },
        { name: 'Bryce Canyon National Park', days: 3, state: 'Utah' },
        { name: 'Zion National Park', days: 3, state: 'Utah' }
      ],
      budgetBreakdown: {
        accommodation: { nights: 11, rate: 120, total: 1320 },
        transportation: { rental: 350, gas: 400, total: 750 },
        food: { daily: 60, days: 12, total: 720 },
        activities: { parkFees: 150, gear: 80, total: 230 },
        total: 3020
      }
    },
    // ... other templates
  ];

  // Initialize data
  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (location.state?.preloadedTrip) {
      setActiveTrip(location.state.preloadedTrip);
      setCurrentTab('my-trips');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch parks data
      const parksSnapshot = await getDocs(collection(db, 'parks'));
      const parks = parksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllParks(parks);

      // Fetch trips data
      if (currentUser) {
        const q = query(collection(db, 'trips'), where('userId', '==', currentUser.uid));
        const tripsSnapshot = await getDocs(q);
        const userTrips = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrips(userTrips);
      } else {
        const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
        setTrips(savedTrips);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showEnhancedToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced template creation with proper park mapping
  const createTripFromDetailedTemplate = async (template) => {
    try {
      setLoading(true);

      // Calculate start and end dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // 30 days from now
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + template.duration);

      // Map template parks to actual park data
      const templateParks = [];
      let currentDate = new Date(startDate);

      for (const templatePark of template.parks) {
        // Find matching park in database
        const matchingPark = allParks.find(park => {
          const dbName = (park.name || park.fullName || '').toLowerCase();
          const templateName = templatePark.name.toLowerCase();
          return dbName.includes(templateName.split(' ')[0]) ||
              templateName.includes(dbName.split(' ')[0]);
        });

        if (matchingPark) {
          // Parse coordinates properly
          let coordinates = { lat: 0, lng: 0 };
          if (matchingPark.coordinates) {
            if (typeof matchingPark.coordinates === 'string' && matchingPark.coordinates.includes(',')) {
              const [lat, lng] = matchingPark.coordinates.split(',').map(val => parseFloat(val.trim()));
              if (!isNaN(lat) && !isNaN(lng)) {
                coordinates = { lat, lng };
              }
            } else if (matchingPark.coordinates.lat && matchingPark.coordinates.lng) {
              coordinates = {
                lat: parseFloat(matchingPark.coordinates.lat),
                lng: parseFloat(matchingPark.coordinates.lng)
              };
            }
          }

          templateParks.push({
            parkId: matchingPark.id,
            parkName: matchingPark.name || matchingPark.fullName,
            visitDate: currentDate.toISOString().split('T')[0],
            stayDuration: templatePark.days || 2,
            coordinates,
            state: templatePark.state || matchingPark.state,
            description: matchingPark.description || ''
          });

          // Advance date for next park
          currentDate.setDate(currentDate.getDate() + (templatePark.days || 2));
        } else {
          console.warn(`Park not found in database: ${templatePark.name}`);
        }
      }

      // Create the trip object
      const newTrip = {
        title: template.title,
        description: template.description,
        parks: templateParks,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        transportationMode: template.transportation.rentalCarRequired ? 'driving' : 'flying',
        isPublic: false,
        templateId: template.id,
        totalDistance: 0, // Will be calculated in TripBuilder
        estimatedCost: template.estimatedCost,
        totalDuration: template.duration,
        templateData: {
          budgetBreakdown: template.budgetBreakdown,
          season: template.season,
          difficulty: template.difficulty
        }
      };

      setActiveTrip(newTrip);
      setCurrentTab('my-trips');
      showEnhancedToast(
          `${template.title} template loaded with ${templateParks.length} parks!`,
          'trip',
          {
            actionLabel: 'Start Planning',
            duration: 4000
          }
      );

    } catch (error) {
      console.error('Error creating trip from template:', error);
      showEnhancedToast('Failed to load template. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced save function with proper validation
  const saveTrip = async (tripData) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!tripData.title?.trim()) {
        throw new Error('Trip title is required');
      }

      if (!tripData.parks || tripData.parks.length === 0) {
        throw new Error('Please add at least one park to your trip');
      }

      // Clean and validate the trip data
      const cleanedTripData = {
        title: tripData.title.trim(),
        description: tripData.description?.trim() || '',
        parks: tripData.parks.map(park => ({
          parkId: park.parkId,
          parkName: park.parkName,
          visitDate: park.visitDate || '',
          stayDuration: parseInt(park.stayDuration) || 1,
          coordinates: park.coordinates || { lat: 0, lng: 0 },
          state: park.state || '',
          description: park.description || ''
        })),
        startDate: tripData.startDate || '',
        endDate: tripData.endDate || '',
        transportationMode: tripData.transportationMode || 'driving',
        totalDistance: Number(tripData.totalDistance) || 0,
        estimatedCost: Number(tripData.estimatedCost) || 0,
        totalDuration: Number(tripData.totalDuration) || 0,
        isPublic: Boolean(tripData.isPublic),
        templateId: tripData.templateId || null,
        templateData: tripData.templateData || null
      };

      if (!currentUser) {
        // Save to localStorage for non-authenticated users
        const newTrip = {
          id: Date.now().toString(),
          ...cleanedTripData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'local'
        };
        const updatedTrips = [...trips, newTrip];
        setTrips(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));

        showEnhancedToast(
            'Trip saved locally! Sign in to sync across devices',
            'success',
            {
              actionLabel: 'Sign In',
              duration: 6000
            }
        );
        setActiveTrip(null);
        return newTrip;
      }

      // Save to Firestore for authenticated users
      const firestoreData = {
        ...cleanedTripData,
        userId: currentUser.uid,
        createdAt: tripData.id ? undefined : new Date(),
        updatedAt: new Date()
      };

      if (tripData.id) {
        // Update existing trip
        await updateDoc(doc(db, 'trips', tripData.id), firestoreData);
        const updatedTrips = trips.map(t =>
            t.id === tripData.id ? { ...firestoreData, id: tripData.id } : t
        );
        setTrips(updatedTrips);
        showEnhancedToast('Trip updated successfully!', 'success');
      } else {
        // Create new trip
        const docRef = await addDoc(collection(db, 'trips'), firestoreData);
        const savedTrip = { id: docRef.id, ...firestoreData };
        setTrips([...trips, savedTrip]);
        showEnhancedToast('Trip saved successfully!', 'success');
      }

      setActiveTrip(null);
      return cleanedTripData;

    } catch (error) {
      console.error('Save error:', error);
      showEnhancedToast(`Save failed: ${error.message}`, 'error');
      throw error;
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
      isPublic: false,
      totalDistance: 0,
      estimatedCost: 0,
      totalDuration: 0
    });
    setCurrentTab('my-trips');
  };

  const editTrip = (trip) => {
    setActiveTrip(trip);
    setViewingTrip(null);
    setCurrentTab('my-trips');
  };

  const deleteTrip = async (tripId) => {
    try {
      if (!currentUser) {
        const updatedTrips = trips.filter(t => t.id !== tripId);
        setTrips(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));
        showEnhancedToast('Trip deleted', 'info');
        return;
      }

      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(trips.filter(t => t.id !== tripId));
      showEnhancedToast('Trip deleted', 'info');
    } catch (error) {
      console.error('Error deleting trip:', error);
      showEnhancedToast('Failed to delete trip', 'error');
    }
  };

  // Template card component with mobile optimization
  const TemplateCard = ({ template }) => {
    const getDifficultyColor = (difficulty) => {
      if (difficulty.toLowerCase().includes('easy')) return 'text-green-600 bg-green-100';
      if (difficulty.toLowerCase().includes('moderate')) return 'text-yellow-600 bg-yellow-100';
      if (difficulty.toLowerCase().includes('advanced')) return 'text-red-600 bg-red-100';
      return 'text-blue-600 bg-blue-100';
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
          {/* Header - Mobile optimized */}
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-6 text-white">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl mb-2">{template.image}</div>
              <div className="text-right">
                <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-1">
                  {template.duration} days
                </div>
                <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs">
                  {template.season}
                </div>
              </div>
            </div>

            <h4 className="text-lg sm:text-xl font-bold mb-1 line-clamp-2">{template.title}</h4>
            <p className="text-sm text-purple-100 mb-2 hidden sm:block">{template.subtitle}</p>
            <p className="text-white/90 text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">{template.description}</p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Stats Grid - Mobile optimized */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </div>
                <div className="text-xs text-gray-500 mt-1">Difficulty</div>
              </div>

              <div className="text-center">
                <div className="font-bold text-gray-800 text-sm sm:text-base">{template.parks.length}</div>
                <div className="text-xs text-gray-500">Parks</div>
              </div>

              <div className="text-center">
                <div className="font-bold text-green-600 text-sm sm:text-base">${template.estimatedCost.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Est. Cost</div>
              </div>
            </div>

            {/* Highlights - Mobile optimized */}
            <div className="mb-4 sm:mb-6">
              <h5 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <FaStar className="text-yellow-500" />
                Highlights
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                {template.highlights.slice(0, 4).map((highlight, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-medium">
                      {highlight}
                    </div>
                ))}
              </div>
            </div>

            {/* Parks List - Collapsible on mobile */}
            <div className="mb-4 sm:mb-6">
              <h5 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <FaMapMarkerAlt className="text-green-500" />
                Parks Included
              </h5>
              <div className="space-y-1 sm:space-y-2">
                {template.parks.slice(0, 3).map((park, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-700 truncate mr-2">{park.name}</span>
                      <span className="text-gray-500 flex-shrink-0">{park.days} day{park.days > 1 ? 's' : ''}</span>
                    </div>
                ))}
                {template.parks.length > 3 && (
                    <div className="text-xs sm:text-sm text-gray-500">
                      +{template.parks.length - 3} more parks...
                    </div>
                )}
              </div>
            </div>

            {/* Action Button - Mobile optimized */}
            <button
                onClick={() => createTripFromDetailedTemplate(template)}
                disabled={loading}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <FaStar />
              {loading ? 'Loading...' : 'Use This Template'}
            </button>
          </div>
        </div>
    );
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 sm:h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[1,2,3].map(i => (
                      <div key={i} className="h-48 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
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
        {/* Enhanced Toast Notifications */}
        {toasts.map(toast => (
            <EnhancedToast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => dismissToast(toast.id)}
                actionLabel={toast.actionLabel}
                onActionClick={toast.onActionClick}
                duration={toast.duration}
            />
        ))}

        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">

            {/* Hero Header - Mobile optimized */}
            <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-4 sm:p-6 md:p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <FadeInWrapper delay={0.1}>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-4">
                        🗺️ Trip Planner
                      </h1>
                      <p className="text-sm sm:text-lg md:text-xl text-pink-100 max-w-2xl">
                        Plan your perfect national parks adventure with detailed guides and smart recommendations.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Link
                          to="/"
                          className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 text-sm sm:text-base"
                      >
                        <FaArrowLeft />
                        <span className="hidden sm:inline">Back to Explore</span>
                        <span className="sm:hidden">Back</span>
                      </Link>
                      {(currentTab === 'my-trips' && !activeTrip) && (
                          <button
                              onClick={createNewTrip}
                              className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white text-purple-600 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            <FaPlus className="group-hover:rotate-180 transition-transform duration-300" />
                            <span className="hidden sm:inline">Create New Trip</span>
                            <span className="sm:hidden">New Trip</span>
                          </button>
                      )}
                    </div>
                  </div>
                </FadeInWrapper>
              </div>
            </div>

            {/* Navigation Tabs - Mobile optimized */}
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
                            className={`group flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 sm:px-4 md:px-6 py-3 md:py-4 font-medium transition-all duration-300 min-w-max ${
                                isActive
                                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                            }`}
                        >
                          <Icon className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                          <div className="text-left">
                            <div className="font-semibold text-xs sm:text-sm md:text-base">
                              <span className="hidden sm:inline">{tab.title}</span>
                              <span className="sm:hidden">{tab.mobileTitle}</span>
                            </div>
                            <div className="text-xs text-gray-500 hidden md:block">{tab.description}</div>
                          </div>
                        </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8">
              {/* Stats Overview - Mobile optimized */}
              {currentTab === 'my-trips' && trips.length > 0 && !activeTrip && (
                  <FadeInWrapper delay={0.2}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
                      <div className="group bg-gradient-to-br from-pink-500 to-rose-500 p-3 sm:p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold">{trips.length}</div>
                            <div className="text-pink-100 font-medium text-xs sm:text-sm md:text-base">Total Trips</div>
                          </div>
                          <FaRoute className="text-lg sm:text-2xl md:text-4xl text-pink-200 group-hover:rotate-12 transition-transform" />
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-blue-500 to-cyan-500 p-3 sm:p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                              {trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)}
                            </div>
                            <div className="text-blue-100 font-medium text-xs sm:text-sm md:text-base">Parks to Visit</div>
                          </div>
                          <FaMapMarkerAlt className="text-lg sm:text-2xl md:text-4xl text-blue-200 group-hover:bounce transition-transform" />
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-green-500 to-emerald-500 p-3 sm:p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                              {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                            </div>
                            <div className="text-green-100 font-medium text-xs sm:text-sm md:text-base">Total Miles</div>
                          </div>
                          <span className="text-lg sm:text-2xl md:text-4xl text-green-200 group-hover:rotate-45 transition-transform">🛣️</span>
                        </div>
                      </div>

                      <div className="group bg-gradient-to-br from-yellow-500 to-orange-500 p-3 sm:p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                              ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                            </div>
                            <div className="text-yellow-100 font-medium text-xs sm:text-sm md:text-base">Total Budget</div>
                          </div>
                          <FaDollarSign className="text-lg sm:text-2xl md:text-4xl text-yellow-200 group-hover:scale-110 transition-transform" />
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

              {currentTab === 'templates' && (
                  <FadeInWrapper delay={0.2}>
                    <div className="space-y-6 md:space-y-8">
                      <div className="text-center mb-6 md:mb-8">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">🌟 Expert Trip Templates</h3>
                        <p className="text-sm sm:text-base text-gray-600">
                          Carefully crafted adventures with detailed itineraries and budget breakdowns
                        </p>
                      </div>

                      {/* Templates Grid - Mobile optimized */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {detailedTemplates.map((template, index) => (
                            <FadeInWrapper key={template.id} delay={index * 0.1}>
                              <TemplateCard template={template} />
                            </FadeInWrapper>
                        ))}
                      </div>
                    </div>
                  </FadeInWrapper>
              )}

              {/* Analytics Tab - Mobile optimized */}
              {currentTab === 'analytics' && (
                  <FadeInWrapper delay={0.2}>
                    <div className="space-y-6 md:space-y-8">
                      {trips.length === 0 ? (
                          <div className="text-center py-12 md:py-20">
                            <div className="text-4xl md:text-6xl mb-4">📊</div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">No Analytics Available</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6">Create some trips to see detailed analytics and insights!</p>
                            <button
                                onClick={createNewTrip}
                                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition text-sm sm:text-base"
                            >
                              Create Your First Trip
                            </button>
                          </div>
                      ) : (
                          <>
                            <div className="text-center mb-6 md:mb-8">
                              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">📊 Your Travel Analytics</h3>
                              <p className="text-sm sm:text-base text-gray-600">Insights from your {trips.length} planned trip{trips.length !== 1 ? 's' : ''}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
                              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 sm:p-4 md:p-6 rounded-2xl text-white text-center">
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{trips.length}</div>
                                <div className="text-blue-100 text-xs sm:text-sm">Total Trips</div>
                              </div>
                              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-2xl text-white text-center">
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                                  {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                                </div>
                                <div className="text-purple-100 text-xs sm:text-sm">Total Miles</div>
                              </div>
                              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 sm:p-4 md:p-6 rounded-2xl text-white text-center col-span-2 md:col-span-1">
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                                  ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                                </div>
                                <div className="text-yellow-100 text-xs sm:text-sm">Total Budget</div>
                              </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100">
                              <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-6">Trip Breakdown</h4>
                              <div className="space-y-4">
                                {trips.map((trip, index) => (
                                    <div key={trip.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r ${
                                            ['from-pink-500 to-rose-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-indigo-500'][index % 4]
                                        } flex-shrink-0`}></div>
                                        <div className="min-w-0 flex-1">
                                          <h5 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{trip.title}</h5>
                                          <div className="text-xs sm:text-sm text-gray-600">
                                            {trip.parks?.length || 0} parks • {trip.totalDistance || 0} miles
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <div className="font-semibold text-gray-800 text-sm sm:text-base">${trip.estimatedCost || 0}</div>
                                        <div className="text-xs sm:text-sm text-gray-600">Budget</div>
                                      </div>
                                    </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                                <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Transportation Preferences</h4>
                                <div className="space-y-3">
                                  {(() => {
                                    const driving = trips.filter(t => t.transportationMode === 'driving').length;
                                    const flying = trips.filter(t => t.transportationMode === 'flying').length;
                                    const total = driving + flying || 1;

                                    return (
                                        <>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm sm:text-base">🚗 Road Trips</span>
                                            <span className="font-semibold text-sm sm:text-base">{Math.round((driving / total) * 100)}%</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${(driving / total) * 100}%` }}
                                            ></div>
                                          </div>

                                          <div className="flex items-center justify-between">
                                            <span className="text-sm sm:text-base">✈️ Flight Trips</span>
                                            <span className="font-semibold text-sm sm:text-base">{Math.round((flying / total) * 100)}%</span>
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

                              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                                <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Popular Destinations</h4>
                                <div className="space-y-3">
                                  {(() => {
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
                                            <p className="text-sm">No park visits planned yet</p>
                                          </div>
                                      );
                                    }

                                    const maxCount = Math.max(...topParks.map(([,count]) => count));

                                    return topParks.map(([parkName, count]) => (
                                        <div key={parkName} className="space-y-1">
                                          <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                      {parkName.length > 20 ? parkName.substring(0, 20) + '...' : parkName}
                                    </span>
                                            <span className="text-xs sm:text-sm font-semibold">{count}</span>
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

                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                              <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
                                <FaBrain className="text-purple-600" />
                                Smart Travel Insights
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                                    <span>Average trip cost: ${Math.round((trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)) / trips.length).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                                    <span>Average parks per trip: {Math.round((trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)) / trips.length * 10) / 10}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                                    <span>Most expensive trip: ${Math.max(...trips.map(t => t.estimatedCost || 0)).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                                    <span>Longest trip: {Math.max(...trips.map(t => t.totalDistance || 0)).toLocaleString()} miles</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                      )}
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