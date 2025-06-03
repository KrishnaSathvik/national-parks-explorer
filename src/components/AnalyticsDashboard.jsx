import React, { useState, useEffect, useMemo } from 'react';
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
  FaCampground,
  FaTrendingUp,
  FaTrendingDown,
  FaEquals,
  FaLightbulb,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaGlobe
} from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';
import FadeInWrapper from './FadeInWrapper';
import { TripAnalytics } from '../utils/TripAnalytics';

const AnalyticsDashboard = ({ trips, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', title: 'Overview', icon: FaChartBar },
    { id: 'preferences', title: 'Preferences', icon: FaHeart },
    { id: 'trends', title: 'Trends', icon: FaTrendingUp },
    { id: 'efficiency', title: 'Efficiency', icon: FaBrain },
    { id: 'recommendations', title: 'Insights', icon: FaLightbulb }
  ];

  // Color schemes for charts
  const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#84cc16', '#f97316'];
  const GRADIENT_COLORS = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500'
  ];

  // Filter trips by time range
  const filteredTrips = useMemo(() => {
    if (timeRange === 'all') return trips;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch(timeRange) {
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
    
    return trips.filter(trip => new Date(trip.createdAt || trip.startDate) >= cutoff);
  }, [trips, timeRange]);

  // Generate insights when trips or time range changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const analyticsData = TripAnalytics.generateInsights(filteredTrips);
      setInsights(analyticsData);
      setLoading(false);
    }, 500); // Simulate processing time

    return () => clearTimeout(timer);
  }, [filteredTrips]);

  // Loading state
  if (loading || !insights) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Your Travel Data</h3>
            <p className="text-gray-600">Generating personalized insights and recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  // No trips state
  if (trips.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Analytics Available</h3>
            <p className="text-gray-600 mb-6">Create some trips to see your travel analytics and insights!</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Trips', 
            value: filteredTrips.length, 
            icon: FaRoute, 
            color: 'from-pink-500 to-rose-500',
            description: 'Adventures planned'
          },
          { 
            label: 'Total Parks', 
            value: filteredTrips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0), 
            icon: FaMapMarkerAlt, 
            color: 'from-blue-500 to-cyan-500',
            description: 'Destinations visited'
          },
          { 
            label: 'Total Miles', 
            value: filteredTrips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0).toLocaleString(), 
            icon: FaGlobe, 
            color: 'from-green-500 to-emerald-500',
            description: 'Distance traveled'
          },
          { 
            label: 'Total Budget', 
            value: `${filteredTrips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0).toLocaleString()}`, 
            icon: FaDollarSign, 
            color: 'from-yellow-500 to-orange-500',
            description: 'Investment in adventures'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <FadeInWrapper key={metric.label} delay={index * 0.1}>
              <div className={`bg-gradient-to-br ${metric.color} p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="text-2xl opacity-80" />
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {timeRange === 'all' ? 'All Time' : timeRange.replace(/(\d+)/, '$1 ')}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm opacity-90">{metric.label}</div>
                <div className="text-xs opacity-70 mt-1">{metric.description}</div>
              </div>
            </FadeInWrapper>
          );
        })}
      </div>

      {/* Efficiency Score */}
      <FadeInWrapper delay={0.4}>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaBrain className="text-purple-500" />
            Travel Efficiency Score
          </h3>
          
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" data={[
                  { name: 'Efficiency', value: insights.efficiency.efficiencyScore, fill: '#8b5cf6' }
                ]}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8b5cf6" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{insights.efficiency.efficiencyScore}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">${insights.efficiency.costPerDay}</div>
                <div className="text-sm text-blue-700">Cost per Day</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{insights.efficiency.parksPerTrip}</div>
                <div className="text-sm text-green-700">Parks per Trip</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">${insights.efficiency.costPerPark}</div>
                <div className="text-sm text-purple-700">Cost per Park</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{insights.efficiency.milesPerDay}</div>
                <div className="text-sm text-orange-700">Miles per Day</div>
              </div>
            </div>
          </div>
        </div>
      </FadeInWrapper>

      {/* Quick Insights */}
      <FadeInWrapper delay={0.5}>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
          <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
            <FaLightbulb className="text-purple-600" />
            Quick Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>You've planned {filteredTrips.length} trips covering {insights.personalPreferences.topRegions.reduce((sum, region) => sum + region.count, 0)} park visits</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Average trip duration: {insights.personalPreferences.avgDuration} days</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Favorite region: {insights.personalPreferences.topRegions[0]?.region || 'No clear preference yet'}</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Average budget: ${insights.personalPreferences.avgBudget}</span>
              </div>
            </div>
          </div>
        </div>
      </FadeInWrapper>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Regional Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeInWrapper delay={0.1}>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" />
              Regional Preferences
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={insights.personalPreferences.topRegions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Visits' : name]} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeInWrapper>

        <FadeInWrapper delay={0.2}>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-green-500" />
              Seasonal Preferences
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={insights.personalPreferences.favoriteSeasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ season, percentage }) => `${season} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {insights.personalPreferences.favoriteSeasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </FadeInWrapper>
      </div>

      {/* Transportation & Park Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeInWrapper delay={0.3}>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaRoute className="text-purple-500" />
              Transportation Split
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Road Trips</span>
                  <span className="text-sm font-bold text-gray-800">{insights.personalPreferences.transportationSplit.driving}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${insights.personalPreferences.transportationSplit.driving}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Flying</span>
                  <span className="text-sm font-bold text-gray-800">{insights.personalPreferences.transportationSplit.flying}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${insights.personalPreferences.transportationSplit.flying}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </FadeInWrapper>

        <FadeInWrapper delay={0.4}>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaMountain className="text-orange-500" />
              Favorite Park Types
            </h3>
            <div className="space-y-3">
              {insights.personalPreferences.topParkTypes.map((parkType, index) => (
                <div key={parkType.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${GRADIENT_COLORS[index % GRADIENT_COLORS.length]}`}></div>
                    <span className="font-medium text-gray-700">{parkType.type}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{parkType.count} visits</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInWrapper>
      </div>

      {/* Budget Analysis */}
      <FadeInWrapper delay={0.5}>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-green-500" />
            Budget Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">${insights.personalPreferences.avgBudget}</div>
              <div className="text-sm text-green-700">Average Budget</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                ${insights.personalPreferences.budgetRange?.min || 0} - ${insights.personalPreferences.budgetRange?.max || 0}
              </div>
              <div className="text-sm text-blue-700">Budget Range</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">${insights.personalPreferences.budgetRange?.median || 0}</div>
              <div className="text-sm text-purple-700">Median Budget</div>
            </div>
          </div>
        </div>
      </FadeInWrapper>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Trip Frequency Trends */}
      <FadeInWrapper delay={0.1}>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaTrendingUp className="text-blue-500" />
            Trip Planning Frequency
            {insights.trendAnalysis.tripFrequency.trend !== 'insufficient data' && (
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                insights.trendAnalysis.tripFrequency.trend === 'increasing' 
                  ? 'bg-green-100 text-green-700'
                  : insights.trendAnalysis.tripFrequency.trend === 'decreasing'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {insights.trendAnalysis.tripFrequency.trend}
              </span>
            )}
          </h3>
          {insights.trendAnalysis.tripFrequency.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={insights.trendAnalysis.tripFrequency.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="trips" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Not enough data to show trends. Plan more trips to see patterns!</p>
            </div>
          )}
        </div>
      </FadeInWrapper>

      {/* Cost Evolution */}
      <FadeInWrapper delay={0.2}>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-green-500" />
            Budget Evolution
            {insights.trendAnalysis.costEvolution.trend !== 'insufficient data' && (
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                insights.trendAnalysis.costEvolution.trend === 'increasing' 
                  ? 'bg-red-100 text-red-700'
                  : insights.trendAnalysis.costEvolution.trend === 'decreasing'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {insights.trendAnalysis.costEvolution.trend}
              </span>
            )}
          </h3>
          {insights.trendAnalysis.costEvolution.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights.trendAnalysis.costEvolution.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}`, 'Average Cost']} />
                <Line type="monotone" dataKey="avgCost" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Plan trips across different years to see cost trends!</p>
            </div>
          )}
        </div>
      </FadeInWrapper>

      {/* Popular Parks */}
      <FadeInWrapper delay={0.3}>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            Your Most Visited Parks
          </h3>
          {insights.trendAnalysis.parkPopularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights.trendAnalysis.parkPopularity} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Visit parks multiple times to see your favorites!</p>
            </div>
          )}
        </div>
      </FadeInWrapper>
    </div>
  );

  const renderEfficiencyTab = () => (
    <div className="space-y-6">
      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Cost per Day', 
            value: `${insights.efficiency.costPerDay}`, 
            icon: FaDollarSign, 
            color: 'from-green-500 to-emerald-500',
            benchmark: 250,
            isGood: insights.efficiency.costPerDay < 250
          },
          { 
            label: 'Cost per Park', 
            value: `${insights.efficiency.costPerPark}`, 
            icon: FaMapMarkerAlt, 
            color: 'from-blue-500 to-cyan-500',
            benchmark: 500,
            isGood: insights.efficiency.costPerPark < 500
          },
          { 
            label: 'Miles per Day', 
            value: insights.efficiency.milesPerDay, 
            icon: FaRoute, 
            color: 'from-purple-500 to-pink-500',
            benchmark: 300,
            isGood: insights.efficiency.milesPerDay < 300
          },
          { 
            label: 'Parks per Trip', 
            value: insights.efficiency.parksPerTrip, 
            icon: FaCampground, 
            color: 'from-orange-500 to-red-500',
            benchmark: 2,
            isGood: insights.efficiency.parksPerTrip >= 2
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <FadeInWrapper key={metric.label} delay={index * 0.1}>
              <div className={`bg-gradient-to-br ${metric.color} p-6 rounded-xl text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className="text-2xl opacity-80" />
                  {metric.isGood ? (
                    <FaCheckCircle className="text-white opacity-80" />
                  ) : (
                    <FaExclamationCircle className="text-yellow-200" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm opacity-90">{metric.label}</div>
                <div className="text-xs opacity-70 mt-2">
                  Target: {typeof metric.benchmark === 'number' && metric.benchmark < 100 ? '' : '}{metric.benchmark}{metric.label.includes('Miles') ? ' mi' : ''}
                </div>
              </div>
            </FadeInWrapper>
          );
        })}
      </div>

      {/* Efficiency Score Breakdown */}
      <FadeInWrapper delay={0.4}>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaBrain className="text-purple-500" />
            Efficiency Analysis
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-purple-600 mb-2">{insights.efficiency.efficiencyScore}/100</div>
                <div className="text-gray-600">Overall Efficiency Score</div>
                <div className={`text-sm mt-1 ${
                  insights.efficiency.efficiencyScore >= 80 ? 'text-green-600' :
                  insights.efficiency.efficiencyScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {insights.efficiency.efficiencyScore >= 80 ? 'Excellent' :
                   insights.efficiency.efficiencyScore >= 60 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              
              {/* Score breakdown visualization */}
              <div className="space-y-3">
                {[
                  { label: 'Cost Efficiency', score: Math.min(100, insights.efficiency.costPerDay < 200 ? 85 : insights.efficiency.costPerDay < 300 ? 70 : 50) },
                  { label: 'Route Efficiency', score: Math.min(100, insights.efficiency.milesPerDay < 200 ? 85 : insights.efficiency.milesPerDay < 300 ? 70 : 50) },
                  { label: 'Park Coverage', score: Math.min(100, insights.efficiency.parksPerTrip >= 3 ? 85 : insights.efficiency.parksPerTrip >= 2 ? 70 : 50) }
                ].map((item, index) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.score >= 80 ? 'bg-green-500' :
                          item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Efficiency Recommendations</h4>
              <div className="space-y-3">
                {insights.efficiency.recommendations && insights.efficiency.recommendations.length > 0 ? (
                  insights.efficiency.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaLightbulb className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-700">{rec}</span>
                    </div>
                  ))
                ) : (
                  [
                    "Plan longer trips to reduce cost per day",
                    "Combine nearby parks in single trips",
                    "Consider camping to reduce accommodation costs",
                    "Optimize routes to minimize driving time"
                  ].map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaLightbulb className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-700">{rec}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeInWrapper>
    </div>
  );

  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      <FadeInWrapper delay={0.1}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl text-white">
          <h3 className="text-2xl font-bold mb-2">Personalized Recommendations</h3>
          <p className="text-purple-100">Based on your {filteredTrips.length} planned trips and travel patterns</p>
        </div>
      </FadeInWrapper>

      {insights.recommendations.length > 0 ? (
        <div className="space-y-4">
          {insights.recommendations.map((rec, index) => (
            <FadeInWrapper key={index} delay={index * 0.1}>
              <div className={`p-6 rounded-2xl border-l-4 ${
                rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {rec.type === 'budget' && <FaDollarSign />}
                      {rec.type === 'experience' && <FaHeart />}
                      {rec.type === 'exploration' && <FaGlobe />}
                      {rec.type === 'timing' && <FaCalendarAlt />}
                      {rec.type === 'efficiency' && <FaRoute />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{rec.title}</h4>
                      <div className={`text-xs font-medium uppercase tracking-wide ${
                        rec.priority === 'high' ? 'text-red-600' :
                        rec.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {rec.priority} Priority
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {rec.type}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{rec.description}</p>
                
                <div className="bg-white p-4 rounded-lg mb-3">
                  <div className="text-sm font-medium text-gray-600 mb-2">Expected Impact:</div>
                  <div className="text-green-700 font-medium">{rec.impact}</div>
                </div>
                
                {rec.actionItems && rec.actionItems.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Action Items:</div>
                    <ul className="space-y-1">
                      {rec.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </FadeInWrapper>
          ))}
        </div>
      ) : (
        <FadeInWrapper delay={0.2}>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">Great travel planning!</h4>
            <p className="text-gray-500">Your current travel patterns look optimized. Keep planning more trips for additional insights!</p>
          </div>
        </FadeInWrapper>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Travel Analytics Dashboard</h2>
              <p className="text-purple-100 mb-4">Insights from your {filteredTrips.length} planned trips</p>
              
              {/* Time Range Selector */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-purple-200">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all" style={{color: '#374151'}}>All Time</option>
                  <option value="1year" style={{color: '#374151'}}>Past Year</option>
                  <option value="6months" style={{color: '#374151'}}>Past 6 Months</option>
                  <option value="3months" style={{color: '#374151'}}>Past 3 Months</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
            >
              <FaTimes />
            </button>
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
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600'
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
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'trends' && renderTrendsTab()}
          {activeTab === 'efficiency' && renderEfficiencyTab()}
          {activeTab === 'recommendations' && renderRecommendationsTab()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;