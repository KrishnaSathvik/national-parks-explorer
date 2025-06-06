// pages/EnhancedRecommendationsPage.js - Updated to use AI services
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAI } from '../context/AIContext'; // NEW
import { useAIRecommendations, useAIInteractions } from '../hooks/useAIRecommendations'; // NEW
import { AIStatusIndicator } from '../components/AIStatusIndicator'; // NEW
import FadeInWrapper from '../components/FadeInWrapper';


const EnhancedRecommendationsPage = ({ parks, favorites, toggleFavorite }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // NEW: Use AI hooks instead of local state
  const {
    savePreferences,
    userPreferences,
    hasPreferences,
    isAIActive
  } = useAI();

  const {
    recommendations,
    categories,
    stats,
    isLoading,
    activeCategory,
    searchQuery,
    setActiveCategory,
    setSearchQuery,
    handleRecommendationInteraction,
    refreshRecommendations,
    hasRecommendations,
    hasResults
  } = useAIRecommendations(parks, favorites);

  const {
    trackParkClick,
    trackSearch,
    trackFeedback,
    trackTripPlanning,
    aiPersonalizationScore,
    learningProgress
  } = useAIInteractions();

  const [showPreferenceWizard, setShowPreferenceWizard] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Handle preference wizard completion
  const handlePreferencesUpdate = async (newPreferences) => {
    const success = await savePreferences(newPreferences);
    if (success) {
      setShowPreferenceWizard(false);
      // Recommendations will auto-refresh due to AI context
    }
  };

  // Handle smart search with AI tracking
  const handleSmartSearch = async (query) => {
    setSearchQuery(query);
    await trackSearch(query, { source: 'smart_search' });
    showToast(`🔍 Searching: "${query}"`, 'info');
  };

  // Handle voice search simulation
  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        const voiceQueries = [
          "Show me peaceful mountain parks",
          "Best parks for photography",
          "Family friendly hiking trails"
        ];
        const query = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
        handleSmartSearch(query);
      }, 3000);
    }
  };

  // Enhanced interaction handlers with AI tracking
  const handleViewPark = async (park) => {
    await trackParkClick(park.id, { source: 'recommendation_card' });
    navigate(`/park/${park.slug}`);
  };

  const handlePlanTrip = async (park) => {
    await trackTripPlanning(park.id, { source: 'recommendation_card' });
    navigate('/trip-planner', { state: { selectedPark: park } });
    showToast(`Added ${park.name} to trip planner!`, 'success');
  };

  const handleLikeRecommendation = async (parkId) => {
    await trackFeedback(parkId, true, { source: 'recommendation_feedback' });
    showToast('👍 Thanks! This helps our AI learn your preferences', 'success');
  };

  const handleDislikeRecommendation = async (parkId) => {
    await trackFeedback(parkId, false, { source: 'recommendation_feedback' });
    showToast('👎 Thanks for the feedback! AI will adjust future recommendations', 'info');
  };

  const handleShareRecommendation = (park) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out ${park.name}!`,
        text: `AI recommended this amazing park: ${park.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Check out ${park.name}! ${window.location.href}`);
      showToast('📋 Recommendation link copied to clipboard!', 'success');
    }
  };

  // Enhanced stats with AI data
  const enhancedStats = {
    ...stats,
    personalizedScore: aiPersonalizationScore,
    learningLevel: learningProgress.level
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">

            {/* Enhanced Hero Section with AI Status */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>

              <div className="relative z-10">
                <FadeInWrapper delay={0.1}>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                    <div>
                      <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                        🧠 Next-Gen AI Recommendations
                      </h1>
                      <p className="text-xl text-purple-100 max-w-2xl mb-4">
                        Advanced machine learning that learns from your behavior to suggest perfect national park experiences.
                      </p>

                      {/* AI Status indicators */}
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/30 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm">AI Learning Active</span>
                        </div>
                        {isAIActive && (
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/30 flex items-center gap-2">
                              <span className="text-sm">Personalization: {aiPersonalizationScore}%</span>
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                          onClick={() => setShowPreferenceWizard(true)}
                          className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <span>{hasPreferences ? 'Update' : 'Setup'} AI Preferences</span>
                      </button>

                      <button
                          onClick={refreshRecommendations}
                          disabled={isLoading}
                          className="group inline-flex items-center gap-3 px-6 py-3 bg-white text-purple-600 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
                      >
                        {isLoading ? 'Learning...' : 'Refresh AI'}
                      </button>
                    </div>
                  </div>
                </FadeInWrapper>
              </div>
            </div>

            {/* Enhanced Stats Dashboard with AI metrics */}
            <div className="p-8">
              <FadeInWrapper delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      label: 'AI Recommendations',
                      value: enhancedStats.totalRecommendations,
                      icon: '🎯',
                      color: 'from-purple-500 to-pink-500',
                      description: 'Smart suggestions',
                      trend: enhancedStats.hasPersonalizedRecs ? '+25%' : 'Getting smarter'
                    },
                    {
                      label: 'Learning Accuracy',
                      value: `${enhancedStats.avgConfidence}%`,
                      icon: '🧠',
                      color: 'from-blue-500 to-cyan-500',
                      description: 'AI confidence',
                      trend: '+8%'
                    },
                    {
                      label: 'Personalization',
                      value: `${enhancedStats.personalizedScore}%`,
                      icon: '👤',
                      color: 'from-green-500 to-emerald-500',
                      description: 'Your AI profile',
                      trend: enhancedStats.learningLevel
                    },
                    {
                      label: 'Categories',
                      value: enhancedStats.categories,
                      icon: '📊',
                      color: 'from-orange-500 to-red-500',
                      description: 'Recommendation types',
                      trend: 'Active'
                    }
                  ].map((stat, index) => (
                      <FadeInWrapper key={stat.label} delay={index * 0.1}>
                        <div className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
                          <div className="absolute top-2 right-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                            {stat.trend}
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="text-3xl">{stat.icon}</div>
                            <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                              AI
                            </div>
                          </div>

                          <div className="text-3xl font-bold mb-1">{stat.value}</div>
                          <div className="text-white/90 font-medium text-sm">{stat.label}</div>
                          <div className="text-white/70 text-xs mt-1">{stat.description}</div>
                        </div>
                      </FadeInWrapper>
                  ))}
                </div>
              </FadeInWrapper>

              {/* AI Status Indicator */}
              {isAIActive && (
                  <FadeInWrapper delay={0.25}>
                    <AIStatusIndicator />
                  </FadeInWrapper>
              )}

              {/* Smart Search Component */}
              <SmartSearch
                  onSearch={handleSmartSearch}
                  onVoiceSearch={handleVoiceSearch}
                  isListening={isListening}
              />

              {/* Loading/Content States */}
              {isLoading ? (
                  <FadeInWrapper delay={0.3}>
                    <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                      <div className="relative mb-8">
                        <div className="text-8xl mb-4">🧠</div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-4">AI is Analyzing Your Digital Footprint</h3>
                      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Our advanced algorithms are processing your preferences, behavioral patterns, and contextual data to generate hyper-personalized recommendations...
                      </p>
                    </div>
                  </FadeInWrapper>
              ) : (
                  <>
                    {/* Enhanced Category Filter */}
                    <FadeInWrapper delay={0.4}>
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800">Filter by Intelligence Type</h3>
                          <div className="text-sm text-gray-500">
                            {hasResults ? recommendations.length : 0} of {stats.totalRecommendations} recommendations
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {categories.map(category => (
                              <button
                                  key={category.name}
                                  onClick={() => setActiveCategory(category.name)}
                                  className={`group px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                      activeCategory === category.name
                                          ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                                          : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                  }`}
                              >
                                <span className="text-lg">{category.icon}</span>
                                <span>{category.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    activeCategory === category.name
                                        ? 'bg-white/20'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                            {category.count}
                          </span>
                              </button>
                          ))}
                        </div>
                      </div>
                    </FadeInWrapper>

                    {/* Enhanced Recommendations Grid */}
                    <FadeInWrapper delay={0.5}>
                      {hasResults ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recommendations.map((recommendation) => (
                                <EnhancedRecommendationCard
                                    key={`${recommendation.id}-${recommendation.recommendationType}`}
                                    recommendation={recommendation}
                                    onView={() => handleViewPark(recommendation)}
                                    onPlanTrip={() => handlePlanTrip(recommendation)}
                                    onToggleFavorite={() => toggleFavorite(recommendation.id)}
                                    onLike={() => handleLikeRecommendation(recommendation.id)}
                                    onDislike={() => handleDislikeRecommendation(recommendation.id)}
                                    onShare={() => handleShareRecommendation(recommendation)}
                                    onInteraction={handleRecommendationInteraction}
                                    isFavorite={favorites.includes(recommendation.id)}
                                    currentUser={currentUser}
                                />
                            ))}
                          </div>
                      ) : (
                          /* Enhanced No Results State */
                          <div className="text-center py-16">
                            <div className="text-8xl mb-6">🤖</div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4">
                              {searchQuery ? 'No matches found' : 'No recommendations for this category'}
                            </h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                              {searchQuery
                                  ? `Try a different search term or clear your search to see all recommendations`
                                  : `Try selecting a different category or update your preferences to get better recommendations`
                              }
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              {searchQuery ? (
                                  <button
                                      onClick={() => setSearchQuery('')}
                                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium"
                                  >
                                    Clear Search
                                  </button>
                              ) : (
                                  <button
                                      onClick={() => setActiveCategory('All')}
                                      className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-medium"
                                  >
                                    View All Recommendations
                                  </button>
                              )}

                              <button
                                  onClick={() => setShowPreferenceWizard(true)}
                                  className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all font-medium"
                              >
                                Update Preferences
                              </button>
                            </div>
                          </div>
                      )}
                    </FadeInWrapper>
                  </>
              )}
            </div>
          </div>
        </div>

        {/* Preference Wizard Modal */}
        {showPreferenceWizard && (
            <PreferenceWizard
                onComplete={handlePreferencesUpdate}
                currentPreferences={userPreferences}
            />
        )}
      </div>
  );
};

// Updated Enhanced Recommendation Card to use Firebase AI data
const EnhancedRecommendationCard = ({
                                      recommendation,
                                      onView,
                                      onPlanTrip,
                                      onToggleFavorite,
                                      onLike,
                                      onDislike,
                                      onShare,
                                      isFavorite,
                                      currentUser,
                                      onInteraction
                                    }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRating, setUserRating] = useState(null);

  const handleCardClick = () => {
    onInteraction('click', recommendation, { source: 'card_click' });
    onView();
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLike();
    setUserRating('like');
  };

  const handleDislike = (e) => {
    e.stopPropagation();
    onDislike();
    setUserRating('dislike');
  };

  return (
      <FadeInWrapper delay={Math.random() * 0.5}>
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">

          {/* Enhanced header with real AI data */}
          <div className={`bg-gradient-to-r ${recommendation.color} p-6 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>

            {/* Real AI confidence badge */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/30">
              🧠 AI: {recommendation.confidence}%
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{recommendation.icon}</span>
                  <div>
                    <div className="font-bold text-lg">{recommendation.category}</div>
                    <div className="text-sm opacity-90">
                      {recommendation.recommendationType?.replace('-', ' ').toUpperCase()}
                    </div>
                    {recommendation.source && (
                        <div className="text-xs opacity-75">
                          Source: {recommendation.source.replace('firebase_', '').replace('_', ' ')}
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 line-clamp-2">
                {recommendation.name}
              </h3>

              <div className="flex items-center gap-2 text-sm opacity-90 mb-3">
                <FaMapMarkerAlt />
                <span>{recommendation.state}</span>
              </div>

              {/* Enhanced stats with Firebase data */}
              <div className="flex items-center gap-4 text-sm">
                {recommendation.entryFee && (
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-xs" />
                      <span>${recommendation.entryFee}</span>
                    </div>
                )}
                {recommendation.socialStats && (
                    <div className="flex items-center gap-1">
                      <FaStar className="text-xs" />
                      <span>{recommendation.socialStats.rating?.toFixed(1)}</span>
                    </div>
                )}
                {recommendation.bestTimeToVisit && (
                    <div className="flex items-center gap-1">
                      <FaClock className="text-xs" />
                      <span>Best now</span>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced content with Firebase AI insights */}
          <div className="p-6">
            {/* Real AI Reason from Firebase */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg text-white text-sm">
                  🎯
                </div>
                <div className="flex-1">
                  <div className="font-medium text-purple-800 mb-1">Why This Matches You</div>
                  <div className="text-sm text-purple-700">{recommendation.reason}</div>

                  {/* Firebase AI insights */}
                  {recommendation.aiInsight && (
                      <div className="text-xs text-purple-600 mt-2 italic">
                        💡 {recommendation.aiInsight}
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* Firebase-powered matching features */}
            <div className="space-y-3 mb-4">
              {recommendation.matchingFeatures && recommendation.matchingFeatures.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">MATCHING YOUR INTERESTS</div>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.matchingFeatures.slice(0, 3).map((feature, index) => (
                          <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      ✓ {feature}
                    </span>
                      ))}
                    </div>
                  </div>
              )}

              {recommendation.whatsNew && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">NEW EXPERIENCES FOR YOU</div>
                    <div className="text-sm text-gray-600">{recommendation.whatsNew}</div>
                  </div>
              )}

              {recommendation.skillsYoullGain && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">SKILLS YOU'LL DEVELOP</div>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.skillsYoullGain.slice(0, 2).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      📈 {skill}
                    </span>
                      ))}
                    </div>
                  </div>
              )}
            </div>

            {/* Enhanced expandable details */}
            {isExpanded && (
                <FadeInWrapper>
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    {recommendation.description && (
                        <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                    )}

                    {/* Firebase community stats */}
                    {recommendation.socialStats && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <div className="text-xs font-medium text-gray-500 mb-2">COMMUNITY INSIGHTS</div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="text-center">
                              <div className="font-semibold">{recommendation.socialStats.reviews}</div>
                              <div className="text-gray-500">Reviews</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{recommendation.socialStats.rating?.toFixed(1)}⭐</div>
                              <div className="text-gray-500">Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{recommendation.socialStats.photos}</div>
                              <div className="text-gray-500">Photos</div>
                            </div>
                          </div>
                        </div>
                    )}

                    {/* AI technical details */}
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                      <div className="font-medium mb-1">🤖 AI Technical Details</div>
                      <div className="space-y-1">
                        <div>Algorithm: {recommendation.recommendationType?.toUpperCase()}</div>
                        <div>Confidence Score: {recommendation.confidence}%</div>
                        <div>Data Source: {recommendation.source || 'Multi-source analysis'}</div>
                        {recommendation.finalScore && (
                            <div>Priority Score: {Math.round(recommendation.finalScore)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeInWrapper>
            )}

            {/* Action buttons with Firebase tracking */}
            <div className="space-y-3">
              {/* Primary actions */}
              <div className="flex gap-2">
                <button
                    onClick={handleCardClick}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <FaEye /> Explore
                </button>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanTrip();
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <FaRoute /> Plan Trip
                </button>
              </div>

              {/* Secondary actions */}
              <div className="flex gap-2">
                {currentUser && (
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite();
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 ${
                            isFavorite
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <FaHeart />
                      {isFavorite ? 'Saved' : 'Save'}
                    </button>
                )}

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all text-sm"
                >
                  {isExpanded ? 'Less' : 'More'}
                </button>

                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare();
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all text-sm"
                >
                  <FaShareAlt />
                </button>
              </div>

              {/* Firebase AI Learning feedback */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Help AI learn:</span>
                <div className="flex gap-2">
                  <button
                      onClick={handleLike}
                      className={`p-2 rounded-lg transition-all text-xs ${
                          userRating === 'like'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                      }`}
                      title="This recommendation was helpful"
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                      onClick={handleDislike}
                      className={`p-2 rounded-lg transition-all text-xs ${
                          userRating === 'dislike'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'
                      }`}
                      title="This recommendation wasn't helpful"
                  >
                    <FaThumbsDown />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );
};

export default EnhancedRecommendationsPage;