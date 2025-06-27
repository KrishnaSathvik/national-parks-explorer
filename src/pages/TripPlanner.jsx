// src/pages/TripPlanner.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaRoute,
  FaStar,
  FaChartBar,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaUsers,
  FaBrain,
  FaRocket
} from 'react-icons/fa';
import { TripPlannerProvider, useTripPlanner } from '../components/TripPlanner/core/TripPlannerProvider';
import TripBuilder from '../components/TripBuilder/TripBuilder';
import TripViewer from '../components/TripViewer/TripViewer';
import TripList from '../components/TripPlanner/TripManagement/TripList';
import TripTemplates from '../components/TripTemplates';
import TripAnalytics from '../components/TripAnalytics';
import FadeInWrapper from '../components/FadeInWrapper';
import LoadingSpinner from '../components/shared/ui/LoadingStates';

// Enhanced Templates Data
const ENHANCED_TEMPLATES = [
  {
    id: 'utah-big5',
    title: 'Utah\'s Big 5 National Parks',
    subtitle: 'Complete Utah Adventure',
    description: 'Experience all five magnificent Utah national parks in one epic 12-day adventure through diverse landscapes from red rock arches to towering hoodoos.',
    duration: 12,
    difficulty: 'Moderate',
    estimatedCost: 2800,
    season: 'Spring/Fall',
    image: '🏜️',
    region: 'Utah',
    highlights: [
      'Delicate Arch at golden hour',
      'The Narrows hiking experience',
      'Bryce Canyon amphitheater views',
      'Capitol Reef scenic drive',
      'Canyonlands mesa trails'
    ],
    transportation: {
      mode: 'driving',
      rentalCarRequired: true,
      arrival: 'Salt Lake City Airport',
      totalMiles: 1200
    },
    parks: [
      { name: 'Arches National Park', days: 2, state: 'Utah' },
      { name: 'Canyonlands National Park', days: 2, state: 'Utah' },
      { name: 'Capitol Reef National Park', days: 2, state: 'Utah' },
      { name: 'Bryce Canyon National Park', days: 3, state: 'Utah' },
      { name: 'Zion National Park', days: 3, state: 'Utah' }
    ],
    budgetBreakdown: {
      accommodation: 1320,
      transportation: 750,
      food: 720,
      activities: 210,
      total: 3000
    }
  },
  {
    id: 'california-classics',
    title: 'California National Parks Classic',
    subtitle: 'Golden State Giants',
    description: 'From giant sequoias to dramatic coastlines, explore California\'s most iconic national parks in this unforgettable 10-day journey.',
    duration: 10,
    difficulty: 'Moderate',
    estimatedCost: 3200,
    season: 'Year-round',
    image: '🌲',
    region: 'California',
    highlights: [
      'Giant sequoias in Sequoia NP',
      'Yosemite Valley waterfalls',
      'Death Valley stargazing',
      'Joshua Tree rock formations'
    ],
    transportation: {
      mode: 'driving',
      rentalCarRequired: true,
      arrival: 'Los Angeles Airport',
      totalMiles: 1400
    },
    parks: [
      { name: 'Joshua Tree National Park', days: 2, state: 'California' },
      { name: 'Death Valley National Park', days: 2, state: 'California' },
      { name: 'Sequoia National Park', days: 3, state: 'California' },
      { name: 'Yosemite National Park', days: 3, state: 'California' }
    ],
    budgetBreakdown: {
      accommodation: 1800,
      transportation: 600,
      food: 600,
      activities: 200,
      total: 3200
    }
  },
  {
    id: 'yellowstone-tetons',
    title: 'Yellowstone & Grand Teton Adventure',
    subtitle: 'Wyoming Wildlife & Wonders',
    description: 'Witness geysers, wildlife, and majestic mountain peaks in this classic Wyoming adventure through two of America\'s premier national parks.',
    duration: 8,
    difficulty: 'Easy to Moderate',
    estimatedCost: 2200,
    season: 'Summer',
    image: '🦌',
    region: 'Wyoming',
    highlights: [
      'Old Faithful geyser',
      'Grand Prismatic hot spring',
      'Teton Range photography',
      'Wildlife spotting'
    ],
    transportation: {
      mode: 'flying',
      rentalCarRequired: true,
      arrival: 'Jackson Hole Airport',
      totalMiles: 400
    },
    parks: [
      { name: 'Grand Teton National Park', days: 3, state: 'Wyoming' },
      { name: 'Yellowstone National Park', days: 5, state: 'Wyoming' }
    ],
    budgetBreakdown: {
      accommodation: 1200,
      transportation: 800,
      food: 480,
      activities: 120,
      total: 2600
    }
  },
  {
    id: 'southwest-circuit',
    title: 'Southwest Desert Circuit',
    subtitle: 'Desert Landscapes & Canyons',
    description: 'Explore the dramatic desert landscapes of the American Southwest, from slot canyons to massive rock formations.',
    duration: 14,
    difficulty: 'Moderate to Advanced',
    estimatedCost: 3500,
    season: 'Fall/Winter/Spring',
    image: '🏔️',
    region: 'Southwest',
    highlights: [
      'Antelope Canyon tours',
      'Four Corners monument',
      'Mesa Verde cliff dwellings',
      'Black Canyon dramatic views'
    ],
    transportation: {
      mode: 'driving',
      rentalCarRequired: true,
      arrival: 'Phoenix Airport',
      totalMiles: 2000
    },
    parks: [
      { name: 'Saguaro National Park', days: 2, state: 'Arizona' },
      { name: 'Petrified Forest National Park', days: 1, state: 'Arizona' },
      { name: 'Arches National Park', days: 2, state: 'Utah' },
      { name: 'Canyonlands National Park', days: 2, state: 'Utah' },
      { name: 'Mesa Verde National Park', days: 2, state: 'Colorado' },
      { name: 'Black Canyon of the Gunnison National Park', days: 2, state: 'Colorado' },
      { name: 'Great Sand Dunes National Park', days: 2, state: 'Colorado' }
    ],
    budgetBreakdown: {
      accommodation: 1950,
      transportation: 900,
      food: 840,
      activities: 310,
      total: 4000
    }
  }
];

// Main TripPlanner component wrapped with provider
const TripPlanner = () => {
  return (
      <TripPlannerProvider>
        <TripPlannerContent />
      </TripPlannerProvider>
  );
};

// Main content component
const TripPlannerContent = () => {
  const {
    isLoading,
    isBuilding,
    isViewing,
    currentTrip,
    trips,
    analytics,
    allParks
  } = useTripPlanner();

  const [currentTab, setCurrentTab] = useState('trips');

  // Tab configuration
  const tabs = [
    {
      id: 'trips',
      title: 'My Trips',
      icon: FaRoute,
      description: 'Your adventures',
      mobileTitle: 'Trips',
      component: TripList
    },
    {
      id: 'templates',
      title: 'Templates',
      icon: FaStar,
      description: 'Pre-built guides',
      mobileTitle: 'Templates',
      component: () => <TripTemplates templates={ENHANCED_TEMPLATES} />
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: FaChartBar,
      description: 'Travel insights',
      mobileTitle: 'Stats',
      component: () => <TripAnalytics trips={trips} />
    }
  ];

  // Show builder if building
  if (isBuilding && currentTrip) {
    return (
        <TripBuilder
            trip={currentTrip}
            allParks={allParks}
        />
    );
  }

  // Show viewer if viewing
  if (isViewing && currentTrip) {
    return (
        <TripViewer
            trip={currentTrip}
        />
    );
  }

  // Main loading state
  if (isLoading && trips.length === 0) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <LoadingSpinner size="xl" text="Initializing Trip Planner..." />
          </div>
        </div>
    );
  }

  const CurrentTabComponent = tabs.find(tab => tab.id === currentTab)?.component || TripList;

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">

            {/* Enhanced Hero Header */}
            <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-4 sm:p-6 md:p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>

              {/* Animated background elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-700"></div>

              <div className="relative z-10">
                <FadeInWrapper delay={0.1}>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 text-sm"
                        >
                          <FaArrowLeft />
                          <span className="hidden sm:inline">Back to Explore</span>
                          <span className="sm:hidden">Back</span>
                        </Link>
                      </div>

                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-4">
                        🗺️ Trip Planner
                      </h1>
                      <p className="text-sm sm:text-lg md:text-xl text-pink-100 max-w-2xl">
                        Plan your perfect national parks adventure with AI-powered recommendations, smart routing, and detailed insights.
                      </p>
                    </div>

                    {/* Quick Stats */}
                    {trips.length > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full lg:w-auto">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-xl lg:text-2xl font-bold">{trips.length}</div>
                            <div className="text-xs text-pink-100">Total Trips</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-xl lg:text-2xl font-bold">
                              {trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)}
                            </div>
                            <div className="text-xs text-purple-100">Parks Planned</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center col-span-2 lg:col-span-1">
                            <div className="text-xl lg:text-2xl font-bold">
                              {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                            </div>
                            <div className="text-xs text-blue-100">Total Miles</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center col-span-2 lg:col-span-1">
                            <div className="text-xl lg:text-2xl font-bold">
                              ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                            </div>
                            <div className="text-xs text-yellow-100">Total Budget</div>
                          </div>
                        </div>
                    )}
                  </div>
                </FadeInWrapper>
              </div>
            </div>

            {/* Enhanced Navigation Tabs */}
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
                            className={`group flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 sm:px-4 md:px-6 py-3 md:py-4 font-medium transition-all duration-300 min-w-max relative ${
                                isActive
                                    ? 'text-pink-600 bg-pink-50'
                                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                            }`}
                        >
                          {/* Active indicator */}
                          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 transition-all duration-300 ${
                              isActive ? 'opacity-100' : 'opacity-0'
                          }`}></div>

                          <Icon className={`transition-all duration-300 ${
                              isActive ? 'scale-110 text-pink-500' : 'group-hover:scale-110'
                          }`} />

                          <div className="text-left">
                            <div className="font-semibold text-xs sm:text-sm md:text-base">
                              <span className="hidden sm:inline">{tab.title}</span>
                              <span className="sm:hidden">{tab.mobileTitle}</span>
                            </div>
                            <div className="text-xs text-gray-500 hidden md:block">
                              {tab.description}
                            </div>
                          </div>
                        </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-8 min-h-[60vh]">
              <FadeInWrapper delay={0.2} key={currentTab}>
                <CurrentTabComponent />
              </FadeInWrapper>
            </div>

            {/* Enhanced Footer with Features Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <FaRocket className="text-pink-500" />
                  Coming Soon: AI-Powered Features
                </h3>
                <p className="text-gray-600 text-sm">
                  Enhanced trip planning with artificial intelligence and smart recommendations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <FaBrain className="text-2xl text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">Smart Recommendations</h4>
                  <p className="text-xs text-gray-600">AI-powered park suggestions based on your preferences</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <FaUsers className="text-2xl text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">Collaborative Planning</h4>
                  <p className="text-xs text-gray-600">Plan trips together with friends and family in real-time</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <FaMapMarkerAlt className="text-2xl text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">Dynamic Routing</h4>
                  <p className="text-xs text-gray-600">Optimal routes with real-time traffic and conditions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TripPlanner;