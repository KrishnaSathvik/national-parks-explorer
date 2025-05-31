// src/components/EnhancedTripFeatures.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaBrain, 
  FaStar, 
  FaChartBar, 
  FaMapMarkerAlt, 
  FaRoute, 
  FaCalendarAlt, 
  FaDollarSign,
  FaEye,
  FaEdit,
  FaTimes,
  FaHeart,
  FaPlus,
  FaFire,
  FaLeaf,
  FaMountain,
  FaWater,
  FaTree,
  FaCamera,
  FaHiking,
  FaCampground
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import FadeInWrapper from './FadeInWrapper';
import TripMap from './TripMap';

// Smart Recommendations Component
export const SmartRecommendations = ({ userPreferences, selectedParks, allParks, onAddPark }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: 'all',
    activity: 'all',
    difficulty: 'all'
  });

  useEffect(() => {
    generateRecommendations();
  }, [selectedParks, allParks, filters]);

  const generateRecommendations = () => {
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const selectedParkIds = selectedParks.map(p => p.parkId);
      const availableParks = allParks.filter(park => !selectedParkIds.includes(park.id));
      
      // AI-like scoring algorithm
      const scoredParks = availableParks.map(park => {
        let score = Math.random() * 50 + 50; // Base score 50-100
        
        // Boost score based on filters
        if (filters.region !== 'all' && park.state?.toLowerCase().includes(filters.region)) {
          score += 20;
        }
        
        if (filters.activity !== 'all') {
          if (filters.activity === 'hiking' && park.description?.toLowerCase().includes('trail')) score += 15;
          if (filters.activity === 'photography' && park.description?.toLowerCase().includes('scenic')) score += 15;
          if (filters.activity === 'camping' && park.description?.toLowerCase().includes('camp')) score += 15;
        }
        
        // Boost popular parks
        if (park.name?.includes('Yellowstone') || park.name?.includes('Yosemite') || park.name?.includes('Grand Canyon')) {
          score += 10;
        }
        
        return {
          ...park,
          aiScore: Math.min(100, score),
          reasons: generateReasons(park, filters)
        };
      });
      
      // Sort by AI score and take top 8
      const topRecommendations = scoredParks
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 8);
      
      setRecommendations(topRecommendations);
      setLoading(false);
    }, 1000);
  };

  const generateReasons = (park, filters) => {
    const reasons = [];
    
    if (park.description?.toLowerCase().includes('scenic')) reasons.push('Spectacular scenery');
    if (park.description?.toLowerCase().includes('wildlife')) reasons.push('Amazing wildlife');
    if (park.description?.toLowerCase().includes('trail')) reasons.push('Great hiking trails');
    if (park.description?.toLowerCase().includes('historic')) reasons.push('Rich history');
    if (Math.random() > 0.5) reasons.push('Perfect for photography');
    if (Math.random() > 0.7) reasons.push('Less crowded gem');
    
    return reasons.slice(0, 3);
  };

  const getActivityIcon = (activity) => {
    switch(activity) {
      case 'hiking': return <FaHiking />;
      case 'photography': return <FaCamera />;
      case 'camping': return <FaCampground />;
      default: return <FaStar />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl text-white">
          <FaBrain className="text-xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">AI-Powered Recommendations</h3>
          <p className="text-gray-600">Discover parks perfect for your adventure style</p>
        </div>
      </div>

      {/* Smart Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
          <select
            value={filters.region}
            onChange={(e) => setFilters({...filters, region: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Regions</option>
            <option value="west">Western US</option>
            <option value="east">Eastern US</option>
            <option value="utah">Utah (Big 5)</option>
            <option value="california">California</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Activity</label>
          <select
            value={filters.activity}
            onChange={(e) => setFilters({...filters, activity: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Activities</option>
            <option value="hiking">Hiking & Trails</option>
            <option value="photography">Photography</option>
            <option value="camping">Camping</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Levels</option>
            <option value="easy">Beginner Friendly</option>
            <option value="moderate">Moderate Challenge</option>
            <option value="advanced">Advanced Adventure</option>
          </select>
        </div>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((park, index) => (
            <FadeInWrapper key={park.id} delay={index * 0.1}>
              <div className="group bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative p-6 pb-4">
                  {/* AI Score Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {Math.round(park.aiScore)}% Match
                  </div>
                  
                  {/* Park Icon */}
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mb-4">
                    🏞️
                  </div>
                  
                  <h4 className="font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {park.name || park.fullName}
                  </h4>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    📍 {park.state || 'Various States'}
                  </div>
                  
                  {/* AI Reasons */}
                  <div className="space-y-1 mb-4">
                    {park.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-purple-700">
                        <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => onAddPark(park)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FaPlus /> Add to Trip
                  </button>
                </div>
              </div>
            </FadeInWrapper>
          ))}
        </div>
      )}
      
      {recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h4 className="text-xl font-semibold text-gray-600 mb-2">No recommendations found</h4>
          <p className="text-gray-500">Try adjusting your filters to discover new parks!</p>
        </div>
      )}
    </div>
  );
};

// Trip Templates Component
export const TripTemplates = ({ onSelectTemplate, allParks }) => {
  const templates = [
    {
      id: 'utah-big5',
      title: 'Utah\'s Big 5 National Parks',
      description: 'Experience all five magnificent Utah national parks in one epic adventure',
      duration: '10-14 days',
      difficulty: 'Moderate',
      season: 'Spring/Fall',
      image: '🏜️',
      parks: [
        { name: 'Arches National Park', days: 2 },
        { name: 'Canyonlands National Park', days: 2 },
        { name: 'Capitol Reef National Park', days: 2 },
        { name: 'Bryce Canyon National Park', days: 2 },
        { name: 'Zion National Park', days: 3 }
      ],
      highlights: ['Delicate Arch', 'Mesa Arch', 'Narrows', 'Bryce Amphitheater'],
      estimatedCost: '$2500'
    },
    {
      id: 'california-classics',
      title: 'California National Parks Tour',
      description: 'From desert to mountains, explore California\'s diverse landscapes',
      duration: '12-16 days',
      difficulty: 'Moderate to Advanced',
      season: 'Year-round',
      image: '🌲',
      parks: [
        { name: 'Yosemite National Park', days: 4 },
        { name: 'Sequoia National Park', days: 2 },
        { name: 'Kings Canyon National Park', days: 2 },
        { name: 'Death Valley National Park', days: 2 },
        { name: 'Joshua Tree National Park', days: 2 }
      ],
      highlights: ['Half Dome', 'General Sherman Tree', 'Badwater Basin', 'Joshua Tree Forest'],
      estimatedCost: '$3200'
    },
    {
      id: 'southwest-loop',
      title: 'Southwest Desert Loop',
      description: 'A classic road trip through the American Southwest\'s most iconic parks',
      duration: '14-18 days',
      difficulty: 'Moderate',
      season: 'Fall/Winter/Spring',
      image: '🌵',
      parks: [
        { name: 'Grand Canyon National Park', days: 3 },
        { name: 'Zion National Park', days: 3 },
        { name: 'Bryce Canyon National Park', days: 2 },
        { name: 'Arches National Park', days: 2 },
        { name: 'Monument Valley', days: 1 },
        { name: 'Antelope Canyon', days: 1 }
      ],
      highlights: ['South Rim Sunrise', 'Angels Landing', 'Delicate Arch', 'Monument Valley Sunset'],
      estimatedCost: '$3800'
    },
    {
      id: 'pacific-northwest',
      title: 'Pacific Northwest Wonders',
      description: 'Explore lush forests, rugged coastlines, and volcanic peaks',
      duration: '10-12 days',
      difficulty: 'Moderate',
      season: 'Summer',
      image: '🌲',
      parks: [
        { name: 'Olympic National Park', days: 3 },
        { name: 'Mount Rainier National Park', days: 2 },
        { name: 'North Cascades National Park', days: 2 },
        { name: 'Crater Lake National Park', days: 3 }
      ],
      highlights: ['Hoh Rainforest', 'Mount Rainier Summit', 'Crater Lake Blue', 'Ruby Beach'],
      estimatedCost: '$2800'
    },
    {
      id: 'eastern-classics',
      title: 'Eastern US National Parks',
      description: 'Discover the natural beauty and history of America\'s eastern parks',
      duration: '12-14 days',
      difficulty: 'Easy to Moderate',
      season: 'Fall (Peak Colors)',
      image: '🍂',
      parks: [
        { name: 'Great Smoky Mountains National Park', days: 3 },
        { name: 'Shenandoah National Park', days: 2 },
        { name: 'Mammoth Cave National Park', days: 1 },
        { name: 'Hot Springs National Park', days: 1 },
        { name: 'Congaree National Park', days: 1 }
      ],
      highlights: ['Cataract Falls', 'Skyline Drive', 'Mammoth Cave Tour', 'Fall Foliage'],
      estimatedCost: '$2200'
    },
    {
      id: 'alaska-adventure',
      title: 'Alaska Wilderness Adventure',
      description: 'Experience the last frontier\'s untamed wilderness and wildlife',
      duration: '14-21 days',
      difficulty: 'Advanced',
      season: 'Summer Only',
      image: '🏔️',
      parks: [
        { name: 'Denali National Park', days: 4 },
        { name: 'Glacier Bay National Park', days: 3 },
        { name: 'Kenai Fjords National Park', days: 2 },
        { name: 'Katmai National Park', days: 3 }
      ],
      highlights: ['Denali Summit', 'Glacier Calving', 'Brown Bears', 'Northern Lights'],
      estimatedCost: '$6500'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🌟 Curated Trip Templates</h3>
        <p className="text-gray-600">Expert-designed adventures to inspire your next journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {templates.map((template, index) => (
          <FadeInWrapper key={template.id} delay={index * 0.1}>
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
              
              {/* Template Header */}
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl mb-2">{template.image}</div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {template.duration}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold mb-2">{template.title}</h4>
                  <p className="text-white/90 text-sm">{template.description}</p>
                </div>
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
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-pink-500" />
                    Parks Included
                  </h5>
                  <div className="space-y-2">
                    {template.parks.slice(0, 3).map((park, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{park.name}</span>
                        <span className="text-gray-500">{park.days} days</span>
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
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
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

                {/* Best Season */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaCalendarAlt />
                    <span className="font-medium text-sm">Best Season: {template.season}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaStar /> Use This Template
                </button>
              </div>
            </div>
          </FadeInWrapper>
        ))}
      </div>
    </div>
  );
};

// Advanced Analytics Component
export const TripAnalytics = ({ trips }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    generateAnalytics();
  }, [trips, timeRange]);

  const generateAnalytics = () => {
    const filteredTrips = filterTripsByTimeRange(trips, timeRange);
    
    const data = {
      tripsByMonth: generateTripsByMonth(filteredTrips),
      costAnalysis: generateCostAnalysis(filteredTrips),
      parkPopularity: generateParkPopularity(filteredTrips),
      tripStats: generateTripStats(filteredTrips),
      travelPatterns: generateTravelPatterns(filteredTrips)
    };
    
    setAnalyticsData(data);
  };

  const filterTripsByTimeRange = (trips, range) => {
    if (range === 'all') return trips;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch(range) {
      case '3months':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return trips;
    }
    
    return trips.filter(trip => new Date(trip.createdAt) >= cutoff);
  };

  const generateTripsByMonth = (trips) => {
    const months = {};
    trips.forEach(trip => {
      if (trip.startDate) {
        const month = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months[month] = (months[month] || 0) + 1;
      }
    });
    
    return Object.entries(months).map(([month, count]) => ({ month, trips: count }));
  };

  const generateCostAnalysis = (trips) => {
    return trips.map(trip => ({
      name: trip.title?.substring(0, 15) + '...' || 'Untitled',
      cost: trip.estimatedCost || 0,
      parks: trip.parks?.length || 0,
      duration: trip.totalDuration || 0
    }));
  };

  const generateParkPopularity = (trips) => {
    const parkCounts = {};
    trips.forEach(trip => {
      trip.parks?.forEach(park => {
        parkCounts[park.parkName] = (parkCounts[park.parkName] || 0) + 1;
      });
    });
    
    return Object.entries(parkCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.substring(0, 20), value }));
  };

  const generateTripStats = (trips) => {
    const totalTrips = trips.length;
    const totalCost = trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0);
    const totalParks = trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0);
    const totalDistance = trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0);
    const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;
    const avgParks = totalTrips > 0 ? totalParks / totalTrips : 0;
    
    return {
      totalTrips,
      totalCost,
      totalParks,
      totalDistance,
      avgCost,
      avgParks
    };
  };

  const generateTravelPatterns = (trips) => {
    const patterns = {
      transportMode: { driving: 0, flying: 0 },
      tripStyle: { relaxed: 0, balanced: 0, intensive: 0 },
      season: { spring: 0, summer: 0, fall: 0, winter: 0 }
    };
    
    trips.forEach(trip => {
      if (trip.transportationMode) patterns.transportMode[trip.transportationMode]++;
      if (trip.tripStyle) patterns.tripStyle[trip.tripStyle]++;
      
      if (trip.startDate) {
        const month = new Date(trip.startDate).getMonth();
        if (month >= 2 && month <= 4) patterns.season.spring++;
        else if (month >= 5 && month <= 7) patterns.season.summer++;
        else if (month >= 8 && month <= 10) patterns.season.fall++;
        else patterns.season.winter++;
      }
    });
    
    return patterns;
  };

  const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (trips.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">No Analytics Available</h3>
        <p className="text-gray-600">Create some trips to see your travel analytics and insights!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 Advanced Trip Analytics</h3>
          <p className="text-gray-600">Insights and patterns from your travel planning</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="all">All Time</option>
          <option value="1year">Past Year</option>
          <option value="6months">Past 6 Months</option>
          <option value="3months">Past 3 Months</option>
        </select>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {analyticsData.tripStats && Object.entries({
          'Total Trips': analyticsData.tripStats.totalTrips,
          'Total Parks': analyticsData.tripStats.totalParks,
          'Total Miles': analyticsData.tripStats.totalDistance?.toLocaleString(),
          'Total Budget': `$${analyticsData.tripStats.totalCost?.toLocaleString()}`,
          'Avg Cost': `$${Math.round(analyticsData.tripStats.avgCost)?.toLocaleString()}`,
          'Avg Parks': Math.round(analyticsData.tripStats.avgParks * 10) / 10
        }).map(([key, value], index) => (
          <div key={key} className={`bg-gradient-to-br ${
            ['from-pink-500 to-rose-500', 'from-purple-500 to-indigo-500', 'from-blue-500 to-cyan-500', 
             'from-green-500 to-emerald-500', 'from-yellow-500 to-orange-500', 'from-red-500 to-pink-500'][index]
          } p-4 rounded-xl text-white shadow-lg`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-white/80 text-sm">{key}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trip Costs Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-green-500" />
            Trip Cost Analysis
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.costAnalysis || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, 'Cost']} />
              <Bar dataKey="cost" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Parks Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            Most Popular Parks
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.parkPopularity || []} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trips by Month */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-500" />
            Trips by Month
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.tripsByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="trips" stroke="#06b6d4" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Travel Patterns */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaRoute className="text-orange-500" />
            Travel Patterns
          </h4>
          <div className="space-y-6">
            {analyticsData.travelPatterns && Object.entries(analyticsData.travelPatterns).map(([category, data]) => (
              <div key={category}>
                <h5 className="font-semibold text-gray-700 mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1')}</h5>
                <div className="flex gap-2">
                  {Object.entries(data).map(([key, value], index) => (
                    <div key={key} className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                        {value}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
        <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
          <FaBrain className="text-purple-600" />
          Smart Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>You've planned {analyticsData.tripStats?.totalTrips || 0} trips covering {analyticsData.tripStats?.totalParks || 0} parks</span>
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Your average trip costs ${Math.round(analyticsData.tripStats?.avgCost || 0)} and visits {Math.round(analyticsData.tripStats?.avgParks || 0)} parks</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Total travel distance planned: {analyticsData.tripStats?.totalDistance?.toLocaleString() || 0} miles</span>
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Most popular park in your trips: {analyticsData.parkPopularity?.[0]?.name || 'None yet'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trip Viewer Modal Component
export const TripViewer = ({ trip, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', title: 'Overview', icon: FaEye },
    { id: 'itinerary', title: 'Itinerary', icon: FaCalendarAlt },
    { id: 'map', title: 'Route Map', icon: FaRoute },
    { id: 'budget', title: 'Budget', icon: FaDollarSign }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const generateItinerary = () => {
    const duration = calculateDuration();
    if (duration === 0 || !trip.parks?.length) return [];

    let itinerary = [];
    let currentDay = 1;
    
    trip.parks.forEach((park, index) => {
      const daysAtPark = park.stayDuration || 2;
      
      for (let day = 0; day < daysAtPark; day++) {
        itinerary.push({
          day: currentDay,
          type: 'park',
          location: park.parkName,
          parkDay: day + 1,
          totalParkDays: daysAtPark,
          activities: day === 0 ? ['Arrival & Setup', 'Visitor Center'] : 
                     day === daysAtPark - 1 ? ['Final Exploration', 'Departure Prep'] :
                     ['Hiking & Exploration', 'Photography']
        });
        currentDay++;
      }
      
      if (index < trip.parks.length - 1 && currentDay <= duration) {
        itinerary.push({
          day: currentDay,
          type: 'travel',
          from: park.parkName,
          to: trip.parks[index + 1].parkName,
          activities: ['Travel Day', 'Scenic Route Driving']
        });
        currentDay++;
      }
    });
    
    return itinerary;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{trip.title}</h2>
              {trip.description && (
                <p className="text-pink-100 mb-4">{trip.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt />
                  <span>{trip.parks?.length || 0} parks</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRoute />
                  <span>{trip.totalDistance || 0} miles</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaDollarSign />
                  <span>${trip.estimatedCost || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(trip)}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
              >
                <FaEdit />
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                    activeTab === tab.id
                      ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600'
                  }`}
                >
                  <Icon /> {tab.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">{calculateDuration()}</div>
                  <div className="text-pink-100 text-sm">Days</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">{trip.parks?.length || 0}</div>
                  <div className="text-blue-100 text-sm">Parks</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">{trip.totalDistance || 0}</div>
                  <div className="text-green-100 text-sm">Miles</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl text-white text-center">
                  <div className="text-2xl font-bold">${trip.estimatedCost || 0}</div>
                  <div className="text-yellow-100 text-sm">Budget</div>
                </div>
              </div>

              {/* Parks List */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Parks to Visit</h3>
                <div className="space-y-3">
                  {trip.parks?.map((park, index) => (
                    <div key={park.parkId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
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
          )}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Day-by-Day Itinerary</h3>
              {generateItinerary().map((item, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  item.type === 'park' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                      {item.day}
                    </div>
                    <div className="flex-1">
                      {item.type === 'park' ? (
                        <>
                          <h4 className="font-semibold text-gray-800">
                            {item.location} - Day {item.parkDay} of {item.totalParkDays}
                          </h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.activities.join(' • ')}
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="font-semibold text-gray-800">
                            Travel: {item.from} → {item.to}
                          </h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.activities.join(' • ')}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Trip Route Map</h3>
              <div className="h-96">
                <TripMap parks={trip.parks || []} />
              </div>
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Budget Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4">Transportation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Fuel/Travel Costs:</span>
                      <span className="font-medium">${Math.round((trip.totalDistance || 0) * 0.15)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vehicle Wear:</span>
                      <span className="font-medium">${Math.round((trip.totalDistance || 0) * 0.05)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">Accommodation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lodging ({calculateDuration()} nights):</span>
                      <span className="font-medium">${calculateDuration() * 85}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4">Park Fees</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Entry Fees:</span>
                      <span className="font-medium">${(trip.parks?.length || 0) * 30}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-4">Food & Misc</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Meals ({calculateDuration()} days):</span>
                      <span className="font-medium">${calculateDuration() * 65}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl text-white text-center">
                <div className="text-3xl font-bold">${trip.estimatedCost || 0}</div>
                <div className="text-green-100">Total Estimated Cost</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Trip List Component
export const EnhancedTripList = ({ trips, onEditTrip, onDeleteTrip, onViewTrip }) => {
  const [sortBy, setSortBy] = useState('created');
  const [filterBy, setFilterBy] = useState('all');
  
  const handleDeleteTrip = (tripId, tripTitle) => {
    if (window.confirm(`Are you sure you want to delete "${tripTitle}"?`)) {
      onDeleteTrip(tripId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Duration not set';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
    ];
    return gradients[index % gradients.length];
  };

  const sortedTrips = [...trips].sort((a, b) => {
    switch(sortBy) {
      case 'date':
        return new Date(b.startDate || 0) - new Date(a.startDate || 0);
      case 'cost':
        return (b.estimatedCost || 0) - (a.estimatedCost || 0);
      case 'parks':
        return (b.parks?.length || 0) - (a.parks?.length || 0);
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  if (trips.length === 0) {
    return (
      <div className="text-center py-20">
        <FadeInWrapper delay={0.1}>
          <div className="max-w-lg mx-auto">
            <div className="relative mb-8">
              <div className="text-8xl mb-4">🗺️</div>
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce">✨</div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No trips planned yet</h3>
            <p className="text-lg text-gray-600 mb-8">
              Create your first trip to start planning your ultimate national parks adventure!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-200">
                <div className="text-pink-500 text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-pink-800 mb-1">Smart Planning</h4>
                <p className="text-sm text-pink-700">Optimize routes and estimate costs automatically</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                <div className="text-blue-500 text-2xl mb-2">🗺️</div>
                <h4 className="font-semibold text-blue-800 mb-1">Visual Routes</h4>
                <p className="text-sm text-blue-700">See your journey on interactive maps</p>
              </div>
            </div>
          </div>
        </FadeInWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="created">Sort by Created</option>
            <option value="date">Sort by Trip Date</option>
            <option value="cost">Sort by Cost</option>
            <option value="parks">Sort by Parks Count</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
        </div>
      </div>

      {/* Trip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sortedTrips.map((trip, index) => (
          <FadeInWrapper key={trip.id} delay={index * 0.1}>
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              
              {/* Card Header with Gradient */}
              <div className={`bg-gradient-to-r ${getRandomGradient(index)} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold line-clamp-2 group-hover:text-pink-100 transition-colors">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                      <FaHeart className="text-red-300" />
                      <span>Trip</span>
                    </div>
                  </div>
                  
                  {trip.description && (
                    <p className="text-white/90 text-sm line-clamp-2 mb-4">
                      {trip.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-white/80" />
                      <span>{trip.parks?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRoute className="text-white/80" />
                      <span>{getDuration(trip.startDate, trip.endDate)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-gray-800">{trip.totalDistance || 0}</div>
                    <div className="text-xs text-gray-500 font-medium">MILES</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-gray-800">${trip.estimatedCost || 0}</div>
                    <div className="text-xs text-gray-500 font-medium">BUDGET</div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCalendarAlt className="text-blue-500 text-sm" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Trip Dates</span>
                  </div>
                  <div className="text-sm font-medium text-blue-800">
                    {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                  </div>
                </div>

                {/* Parks Preview */}
                {trip.parks && trip.parks.length > 0 && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl mb-6 border border-pink-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMapMarkerAlt className="text-pink-500 text-sm" />
                      <span className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Parks to Visit</span>
                    </div>
                    <div className="text-sm font-medium text-pink-800 line-clamp-2">
                      {trip.parks.slice(0, 2).map(park => park.parkName).join(', ')}
                      {trip.parks.length > 2 && (
                        <span className="text-pink-600"> +{trip.parks.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewTrip(trip)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaEye /> View Trip
                  </button>
                  <button
                    onClick={() => onEditTrip(trip)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id, trip.title)}
                    className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 group"
                  >
                    <FaTrash className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </FadeInWrapper>
        ))}
      </div>
    </div>
  );
};

export default EnhancedTripFeatures;