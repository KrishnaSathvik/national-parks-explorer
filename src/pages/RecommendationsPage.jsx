import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FadeInWrapper from '../components/FadeInWrapper';
import {
  FaBrain,
  FaStar,
  FaMapMarkerAlt,
  FaRoute,
  FaEye,
  FaHeart,
  FaCalendarAlt,
  FaUser,
  FaChartBar,
  FaCog,
  FaSync,
  FaFilter,
  FaGlobe,
  FaFire,
  FaLeaf,
  FaMountain,
  FaWater,
  FaCamera,
  FaHiking,
  FaCampground,
  FaArrowRight,
  FaLightbulb,
  FaTarget,
  FaMagic,
  FaRocket
} from 'react-icons/fa';

// ===== RECOMMENDATION ENGINE =====
class RecommendationEngine {
  static generateAdvancedRecommendations(parks, favorites, userTrips = [], preferences = {}) {
    const recommendations = [];
    
    // 1. Collaborative Filtering - Similar Users
    const similarUserRecs = this.generateSimilarUserRecommendations(parks, favorites);
    recommendations.push(...similarUserRecs);
    
    // 2. Content-Based Filtering - Park Features
    const contentBasedRecs = this.generateContentBasedRecommendations(parks, favorites);
    recommendations.push(...contentBasedRecs);
    
    // 3. Seasonal Intelligence
    const seasonalRecs = this.generateSeasonalRecommendations(parks);
    recommendations.push(...seasonalRecs);
    
    // 4. Geographic Clustering
    const geographicRecs = this.generateGeographicRecommendations(parks, favorites);
    recommendations.push(...geographicRecs);
    
    // 5. Trending Parks
    const trendingRecs = this.generateTrendingRecommendations(parks);
    recommendations.push(...trendingRecs);
    
    // 6. Hidden Gems
    const hiddenGemRecs = this.generateHiddenGemRecommendations(parks, favorites);
    recommendations.push(...hiddenGemRecs);
    
    return this.rankAndDeduplicateRecommendations(recommendations, favorites);
  }
  
  static generateSimilarUserRecommendations(parks, favorites) {
    if (favorites.length === 0) return [];
    
    // Simulate finding users with similar tastes
    const favoriteParks = parks.filter(park => favorites.includes(park.id));
    const favoriteStates = [...new Set(favoriteParks.flatMap(p => 
      p.state?.split(',').map(s => s.trim()) || []
    ))];
    
    return parks
      .filter(park => !favorites.includes(park.id))
      .filter(park => favoriteStates.some(state => park.state?.includes(state)))
      .slice(0, 4)
      .map(park => ({
        ...park,
        recommendationType: 'similar-users',
        confidence: 92 + Math.floor(Math.random() * 6),
        reason: `Popular with users who also love ${favoriteParks[0]?.name}`,
        category: 'Similar Taste',
        icon: '👥',
        color: 'from-blue-500 to-cyan-500'
      }));
  }
  
  static generateContentBasedRecommendations(parks, favorites) {
    const favoriteParks = parks.filter(park => favorites.includes(park.id));
    if (favoriteParks.length === 0) return [];
    
    // Analyze favorite park features
    const features = this.extractParkFeatures(favoriteParks);
    
    return parks
      .filter(park => !favorites.includes(park.id))
      .map(park => ({
        ...park,
        similarity: this.calculateFeatureSimilarity(park, features)
      }))
      .filter(park => park.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
      .map(park => ({
        ...park,
        recommendationType: 'content-based',
        confidence: Math.round(park.similarity * 100),
        reason: this.generateContentBasedReason(park, features),
        category: 'Similar Features',
        icon: '🔍',
        color: 'from-purple-500 to-pink-500'
      }));
  }
  
  static generateSeasonalRecommendations(parks) {
    const currentSeason = this.getCurrentSeason();
    
    return parks
      .filter(park => park.bestSeason?.toLowerCase() === currentSeason.toLowerCase())
      .slice(0, 4)
      .map(park => ({
        ...park,
        recommendationType: 'seasonal',
        confidence: 88 + Math.floor(Math.random() * 10),
        reason: `Perfect timing for ${currentSeason.toLowerCase()} activities`,
        category: `${currentSeason} Perfection`,
        icon: this.getSeasonIcon(currentSeason),
        color: this.getSeasonColor(currentSeason)
      }));
  }
  
  static generateGeographicRecommendations(parks, favorites) {
    const favoriteParks = parks.filter(park => favorites.includes(park.id));
    if (favoriteParks.length === 0) return [];
    
    // Find parks in nearby states or regions
    const favoriteStates = [...new Set(favoriteParks.flatMap(p => 
      p.state?.split(',').map(s => s.trim()) || []
    ))];
    
    const nearbyStates = this.getNearbyStates(favoriteStates);
    
    return parks
      .filter(park => !favorites.includes(park.id))
      .filter(park => nearbyStates.some(state => park.state?.includes(state)))
      .slice(0, 3)
      .map(park => ({
        ...park,
        recommendationType: 'geographic',
        confidence: 85 + Math.floor(Math.random() * 10),
        reason: 'Close to your favorite regions - perfect for road trips',
        category: 'Nearby Adventures',
        icon: '🗺️',
        color: 'from-green-500 to-emerald-500'
      }));
  }
  
  static generateTrendingRecommendations(parks) {
    // Simulate trending parks based on popularity indicators
    const trendingParks = parks
      .filter(park => ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Arches'].some(popular => 
        park.name?.includes(popular)
      ))
      .slice(0, 3);
    
    return trendingParks.map(park => ({
      ...park,
      recommendationType: 'trending',
      confidence: 95 + Math.floor(Math.random() * 5),
      reason: 'Trending now - most searched and visited',
      category: 'Hot Right Now',
      icon: '🔥',
      color: 'from-red-500 to-orange-500'
    }));
  }
  
  static generateHiddenGemRecommendations(parks, favorites) {
    // Find lesser-known parks (not in common favorites)
    const popularParks = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Bryce Canyon'];
    
    return parks
      .filter(park => !favorites.includes(park.id))
      .filter(park => !popularParks.some(popular => park.name?.includes(popular)))
      .slice(0, 3)
      .map(park => ({
        ...park,
        recommendationType: 'hidden-gem',
        confidence: 78 + Math.floor(Math.random() * 15),
        reason: 'Hidden gem with fewer crowds and unique experiences',
        category: 'Hidden Gems',
        icon: '💎',
        color: 'from-indigo-500 to-purple-500'
      }));
  }
  
  // Helper methods
  static extractParkFeatures(parks) {
    const features = {
      hasWater: 0,
      hasMountains: 0,
      hasDesert: 0,
      hasForest: 0,
      hasWildlife: 0,
      hasHiking: 0
    };
    
    parks.forEach(park => {
      const desc = (park.description || '').toLowerCase();
      if (desc.includes('water') || desc.includes('lake') || desc.includes('river')) features.hasWater++;
      if (desc.includes('mountain') || desc.includes('peak')) features.hasMountains++;
      if (desc.includes('desert')) features.hasDesert++;
      if (desc.includes('forest') || desc.includes('tree')) features.hasForest++;
      if (desc.includes('wildlife') || desc.includes('animal')) features.hasWildlife++;
      if (desc.includes('hiking') || desc.includes('trail')) features.hasHiking++;
    });
    
    return features;
  }
  
  static calculateFeatureSimilarity(park, targetFeatures) {
    const desc = (park.description || '').toLowerCase();
    let similarity = 0;
    let totalFeatures = 0;
    
    Object.keys(targetFeatures).forEach(feature => {
      if (targetFeatures[feature] > 0) {
        totalFeatures++;
        const featureWords = {
          hasWater: ['water', 'lake', 'river', 'ocean'],
          hasMountains: ['mountain', 'peak', 'summit'],
          hasDesert: ['desert', 'sand', 'dune'],
          hasForest: ['forest', 'tree', 'woodland'],
          hasWildlife: ['wildlife', 'animal', 'bear', 'deer'],
          hasHiking: ['hiking', 'trail', 'walk']
        };
        
        if (featureWords[feature]?.some(word => desc.includes(word))) {
          similarity++;
        }
      }
    });
    
    return totalFeatures > 0 ? similarity / totalFeatures : 0;
  }
  
  static generateContentBasedReason(park, features) {
    const reasons = [];
    const desc = (park.description || '').toLowerCase();
    
    if (features.hasWater > 0 && desc.includes('water')) reasons.push('water features');
    if (features.hasMountains > 0 && desc.includes('mountain')) reasons.push('mountain scenery');
    if (features.hasHiking > 0 && desc.includes('hiking')) reasons.push('hiking opportunities');
    
    return reasons.length > 0 
      ? `Similar ${reasons.slice(0, 2).join(' and ')} to your favorites`
      : 'Matches your preferred park style';
  }
  
  static getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }
  
  static getSeasonIcon(season) {
    const icons = { Spring: '🌸', Summer: '☀️', Fall: '🍂', Winter: '❄️' };
    return icons[season] || '🌟';
  }
  
  static getSeasonColor(season) {
    const colors = {
      Spring: 'from-green-500 to-emerald-500',
      Summer: 'from-yellow-500 to-orange-500',
      Fall: 'from-orange-500 to-red-500',
      Winter: 'from-blue-500 to-cyan-500'
    };
    return colors[season] || 'from-gray-500 to-gray-600';
  }
  
  static getNearbyStates(states) {
    const stateMap = {
      'California': ['Nevada', 'Arizona', 'Oregon'],
      'Utah': ['Colorado', 'Arizona', 'Nevada', 'Wyoming'],
      'Colorado': ['Utah', 'Wyoming', 'New Mexico'],
      'Arizona': ['Utah', 'Nevada', 'California', 'New Mexico'],
      'Wyoming': ['Colorado', 'Utah', 'Montana'],
      'Montana': ['Wyoming', 'Idaho'],
      'Washington': ['Oregon'],
      'Oregon': ['California', 'Washington']
    };
    
    return [...new Set(states.flatMap(state => stateMap[state] || []))];
  }
  
  static rankAndDeduplicateRecommendations(recommendations, favorites) {
    // Remove duplicates and favorites
    const seen = new Set(favorites);
    const unique = recommendations.filter(rec => {
      if (seen.has(rec.id)) return false;
      seen.add(rec.id);
      return true;
    });
    
    // Sort by confidence and category diversity
    return unique
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 16); // Top 16 recommendations
  }
}

// ===== RECOMMENDATION CATEGORIES =====
const RecommendationCategories = ({ recommendations, onCategorySelect, activeCategory }) => {
  const categories = useMemo(() => {
    const cats = [...new Set(recommendations.map(r => r.category))];
    return [{ name: 'All', count: recommendations.length }, ...cats.map(cat => ({
      name: cat,
      count: recommendations.filter(r => r.category === cat).length
    }))];
  }, [recommendations]);

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map(category => (
        <button
          key={category.name}
          onClick={() => onCategorySelect(category.name)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeCategory === category.name
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-pink-50 hover:border-pink-300'
          }`}
        >
          {category.name} ({category.count})
        </button>
      ))}
    </div>
  );
};

// ===== RECOMMENDATION CARD =====
const RecommendationCard = ({ recommendation, onView, onPlanTrip, onToggleFavorite, isFavorite, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <FadeInWrapper delay={Math.random() * 0.5}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        {/* Header with confidence and category */}
        <div className={`bg-gradient-to-r ${recommendation.color} p-4 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{recommendation.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{recommendation.category}</div>
                  <div className="text-xs opacity-90">{recommendation.recommendationType}</div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                {recommendation.confidence}% Match
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-2 line-clamp-1">
              {recommendation.name}
            </h3>
            
            <div className="flex items-center gap-2 text-sm opacity-90">
              <FaMapMarkerAlt />
              <span>{recommendation.state}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* AI Reason */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <FaBrain className="text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-purple-800 text-sm mb-1">AI Insight</div>
                <div className="text-purple-700 text-sm">{recommendation.reason}</div>
              </div>
            </div>
          </div>

          {/* Park Details */}
          <div className="space-y-2 mb-4">
            {recommendation.entryFee && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Entry: ${recommendation.entryFee}
                </span>
              </div>
            )}
            
            {recommendation.bestSeason && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  Best: {recommendation.bestSeason}
                </span>
              </div>
            )}
            
            {recommendation.highlight && (
              <div className="text-sm text-gray-600">
                <span className="font-medium text-purple-600">Highlight:</span> {recommendation.highlight}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => onView(recommendation)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
              >
                <FaEye /> Explore
              </button>
              <button
                onClick={() => onPlanTrip(recommendation)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
              >
                <FaRoute /> Plan Trip
              </button>
            </div>
            
            {currentUser && (
              <button
                onClick={() => onToggleFavorite(recommendation.id)}
                className={`w-full py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 ${
                  isFavorite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaHeart />
                {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            )}
          </div>
        </div>
      </div>
    </FadeInWrapper>
  );
};

// ===== MAIN RECOMMENDATIONS PAGE =====
const RecommendationsPage = ({ parks, favorites, toggleFavorite }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    activities: [],
    preferredStates: [],
    budgetRange: 'any'
  });

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Generate recommendations on component mount
  useEffect(() => {
    generateRecommendations();
  }, [parks, favorites]);

  const generateRecommendations = async () => {
    setLoading(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const recs = RecommendationEngine.generateAdvancedRecommendations(
      parks, 
      favorites, 
      [], // userTrips - could be passed from props
      userPreferences
    );
    
    setRecommendations(recs);
    setLoading(false);
  };

  const handleRefreshRecommendations = async () => {
    setRefreshing(true);
    await generateRecommendations();
    setRefreshing(false);
    showToast('🧠 AI recommendations refreshed!', 'success');
  };

  const handleViewPark = (park) => {
    navigate(`/park/${park.slug}`);
  };

  const handlePlanTrip = (park) => {
    navigate('/trip-planner', { state: { selectedPark: park } });
    showToast(`Added ${park.name} to trip planner!`, 'success');
  };

  const filteredRecommendations = activeCategory === 'All' 
    ? recommendations 
    : recommendations.filter(r => r.category === activeCategory);

  const stats = {
    totalRecommendations: recommendations.length,
    categories: [...new Set(recommendations.map(r => r.category))].length,
    avgConfidence: recommendations.length > 0 
      ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)
      : 0,
    personalizedCount: recommendations.filter(r => r.recommendationType === 'similar-users' || r.recommendationType === 'content-based').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <FadeInWrapper delay={0.1}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                  <div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                      🧠 Smart AI Recommendations
                    </h1>
                    <p className="text-xl text-purple-100 max-w-2xl">
                      Advanced machine learning algorithms analyze your preferences to suggest perfect national park experiences.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleRefreshRecommendations}
                      disabled={refreshing}
                      className="group inline-flex items-center gap-3 px-6 py-3 bg-white text-purple-600 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
                    >
                      <FaSync className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                      {refreshing ? 'Refreshing...' : 'Refresh AI'}
                    </button>
                  </div>
                </div>
              </FadeInWrapper>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="p-8">
            <FadeInWrapper delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { 
                    label: 'AI Recommendations', 
                    value: stats.totalRecommendations, 
                    icon: '🎯', 
                    color: 'from-purple-500 to-pink-500',
                    description: 'Personalized suggestions'
                  },
                  { 
                    label: 'Categories', 
                    value: stats.categories, 
                    icon: '📊', 
                    color: 'from-blue-500 to-cyan-500',
                    description: 'Recommendation types'
                  },
                  { 
                    label: 'Avg Confidence', 
                    value: `${stats.avgConfidence}%`, 
                    icon: '✨', 
                    color: 'from-green-500 to-emerald-500',
                    description: 'AI accuracy score'
                  },
                  { 
                    label: 'Personalized', 
                    value: stats.personalizedCount, 
                    icon: '👤', 
                    color: 'from-orange-500 to-red-500',
                    description: 'Based on your taste'
                  }
                ].map((stat, index) => (
                  <FadeInWrapper key={stat.label} delay={index * 0.1}>
                    <div className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-3xl">{stat.icon}</div>
                        <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                          AI
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-white/90 font-medium">{stat.label}</div>
                      <div className="text-white/70 text-xs mt-1">{stat.description}</div>
                    </div>
                  </FadeInWrapper>
                ))}
              </div>
            </FadeInWrapper>

            {/* Loading State */}
            {loading ? (
              <FadeInWrapper delay={0.3}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">AI is Analyzing Your Preferences</h3>
                  <p className="text-gray-600 mb-6">Processing your favorites and generating personalized recommendations...</p>
                  <div className="flex justify-center space-x-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </FadeInWrapper>
            ) : (
              <>
                {/* Category Filter */}
                <FadeInWrapper delay={0.4}>
                  <RecommendationCategories
                    recommendations={recommendations}
                    onCategorySelect={setActiveCategory}
                    activeCategory={activeCategory}
                  />
                </FadeInWrapper>

                {/* Recommendations Grid */}
                <FadeInWrapper delay={0.5}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRecommendations.map((recommendation, index) => (
                      <RecommendationCard
                        key={`${recommendation.id}-${recommendation.recommendationType}`}
                        recommendation={recommendation}
                        onView={handleViewPark}
                        onPlanTrip={handlePlanTrip}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={favorites.includes(recommendation.id)}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                </FadeInWrapper>

                {/* No Recommendations State */}
                {filteredRecommendations.length === 0 && (
                  <FadeInWrapper delay={0.5}>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🤖</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No recommendations for this category</h3>
                      <p className="text-gray-500 mb-4">Try selecting a different category or refreshing the AI recommendations</p>
                      <button
                        onClick={() => setActiveCategory('All')}
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                      >
                        View All Recommendations
                      </button>
                    </div>
                  </FadeInWrapper>
                )}

                {/* AI Insights Panel */}
                <FadeInWrapper delay={0.6}>
                  <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl text-white">
                        <FaLightbulb className="text-xl" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-purple-800">How Our AI Works</h3>
                        <p className="text-purple-600">Understanding your personalized recommendations</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="text-3xl mb-3">🔍</div>
                        <h4 className="font-semibold text-purple-800 mb-2">Content Analysis</h4>
                        <p className="text-sm text-purple-600">Analyzes park features, activities, and characteristics you enjoy</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="text-3xl mb-3">👥</div>
                        <h4 className="font-semibold text-purple-800 mb-2">Collaborative Filtering</h4>
                        <p className="text-sm text-purple-600">Finds parks loved by users with similar preferences to yours</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="text-3xl mb-3">🌍</div>
                        <h4 className="font-semibold text-purple-800 mb-2">Geographic Intelligence</h4>
                        <p className="text-sm text-purple-600">Considers location, climate, and seasonal factors for perfect timing</p>
                      </div>
                    </div>
                  </div>
                </FadeInWrapper>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;