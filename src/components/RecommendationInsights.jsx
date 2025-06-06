// components/RecommendationInsights.js - Component to show AI insights
import React, { useState } from 'react';
import {
    FaLightbulb,
    FaChevronDown,
    FaChevronUp,
    FaBrain,
    FaTarget,
    FaUsers,
    FaClock,
    FaStar,
    FaEye,
    FaChartLine,
    FaMagic,
    FaInfoCircle
} from 'react-icons/fa';

export const RecommendationInsights = ({ recommendation, showTechnicalDetails = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!recommendation.aiInsight && !recommendation.matchingFeatures?.length && !recommendation.reason) {
        return null;
    }

    // Get insight icon based on recommendation type
    const getInsightIcon = (type) => {
        const icons = {
            'behavioral': <FaBrain className="text-indigo-600" />,
            'preference-based': <FaTarget className="text-emerald-600" />,
            'collaborative': <FaUsers className="text-blue-600" />,
            'contextual': <FaClock className="text-orange-600" />,
            'discovery': <FaMagic className="text-pink-600" />,
            'social': <FaUsers className="text-purple-600" />
        };
        return icons[type] || <FaLightbulb className="text-purple-600" />;
    };

    // Get confidence color
    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return 'text-green-600 bg-green-100';
        if (confidence >= 75) return 'text-blue-600 bg-blue-100';
        if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    };

    // Format recommendation type for display
    const formatRecommendationType = (type) => {
        return type?.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || 'AI Analysis';
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mt-4">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left group"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        {getInsightIcon(recommendation.recommendationType)}
                    </div>
                    <div>
                        <span className="font-semibold text-purple-800 text-lg">AI Insights</span>
                        <div className="text-sm text-purple-600">
                            {formatRecommendationType(recommendation.recommendationType)} • {recommendation.confidence}% confidence
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                        {recommendation.confidence}% match
                    </div>
                    {isExpanded ?
                        <FaChevronUp className="text-purple-600 group-hover:text-purple-800 transition-colors" /> :
                        <FaChevronDown className="text-purple-600 group-hover:text-purple-800 transition-colors" />
                    }
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-200">

                    {/* Main AI Reason */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/50">
                        <div className="flex items-start gap-3">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg text-white flex-shrink-0 mt-1">
                                <FaTarget className="text-sm" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-purple-800 mb-2">Why This Matches You</div>
                                <div className="text-purple-700 leading-relaxed">{recommendation.reason}</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insight */}
                    {recommendation.aiInsight && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <FaLightbulb className="text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-blue-800 mb-1">💡 AI Deep Analysis</div>
                                    <div className="text-blue-700 text-sm italic leading-relaxed">
                                        {recommendation.aiInsight}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Matching Features */}
                    {recommendation.matchingFeatures?.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/50">
                            <div className="flex items-center gap-2 mb-3">
                                <FaStar className="text-green-600" />
                                <span className="font-semibold text-green-800">Matching Your Interests</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recommendation.matchingFeatures.map((feature, index) => (
                                    <span
                                        key={index}
                                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200 hover:bg-green-200 transition-colors"
                                    >
                    ✓ {feature}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* What's New */}
                    {recommendation.whatsNew && (
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <FaMagic className="text-pink-600 mt-1 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-pink-800 mb-1">🌟 New Experiences for You</div>
                                    <div className="text-pink-700 text-sm leading-relaxed">{recommendation.whatsNew}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Skills You'll Gain */}
                    {recommendation.skillsYoullGain?.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/50">
                            <div className="flex items-center gap-2 mb-3">
                                <FaChartLine className="text-blue-600" />
                                <span className="font-semibold text-blue-800">Skills You'll Develop</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recommendation.skillsYoullGain.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                                    >
                    📈 {skill}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Challenge Level */}
                    {recommendation.challengeLevel && (
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FaTarget className="text-orange-600" />
                                <span className="font-semibold text-orange-800">Challenge Level</span>
                            </div>
                            <div className="text-orange-700 text-sm">{recommendation.challengeLevel}</div>
                        </div>
                    )}

                    {/* Best Time to Visit */}
                    {recommendation.bestTimeToVisit && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FaClock className="text-green-600" />
                                <span className="font-semibold text-green-800">Optimal Timing</span>
                            </div>
                            <div className="text-green-700 text-sm">{recommendation.bestTimeToVisit}</div>
                        </div>
                    )}

                    {/* Social Stats */}
                    {recommendation.socialStats && (
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/50">
                            <div className="flex items-center gap-2 mb-3">
                                <FaUsers className="text-purple-600" />
                                <span className="font-semibold text-purple-800">Community Insights</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-xl font-bold text-purple-900">{recommendation.socialStats.reviews}</div>
                                    <div className="text-xs text-purple-600">Reviews</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-purple-900">
                                        {recommendation.socialStats.rating?.toFixed(1)}⭐
                                    </div>
                                    <div className="text-xs text-purple-600">Rating</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-purple-900">{recommendation.socialStats.photos}</div>
                                    <div className="text-xs text-purple-600">Photos</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Technical Details */}
                    {showTechnicalDetails && (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <FaInfoCircle className="text-gray-600" />
                                <span className="font-semibold text-gray-800">Technical Details</span>
                            </div>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Algorithm:</span>
                                    <span className="font-mono">{recommendation.recommendationType?.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Confidence Score:</span>
                                    <span className="font-mono">{recommendation.confidence}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Data Source:</span>
                                    <span className="font-mono">{recommendation.source?.replace('firebase_', '') || 'Multi-source'}</span>
                                </div>
                                {recommendation.finalScore && (
                                    <div className="flex justify-between">
                                        <span>Priority Score:</span>
                                        <span className="font-mono">{Math.round(recommendation.finalScore)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Category:</span>
                                    <span>{recommendation.category}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mood Match */}
                    {recommendation.moodMatch && (
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-violet-600">✨</div>
                                <span className="font-semibold text-violet-800">Mood Alignment</span>
                            </div>
                            <div className="text-violet-700 text-sm">{recommendation.moodMatch}</div>
                        </div>
                    )}

                    {/* Action Suggestion */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <FaEye className="text-indigo-600" />
                            <span className="font-semibold text-indigo-800">Recommendation</span>
                        </div>
                        <div className="text-indigo-700 text-sm">
                            Based on this {recommendation.confidence}% AI match, we highly recommend exploring this park.
                            {recommendation.confidence >= 85 ? " This is an excellent match for your preferences!" :
                                recommendation.confidence >= 70 ? " This should align well with your interests." :
                                    " This could be a great new experience for you."}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simplified version for smaller cards
export const MiniRecommendationInsights = ({ recommendation }) => {
    return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
                <FaLightbulb className="text-purple-600 text-sm" />
                <span className="font-medium text-purple-800 text-sm">AI Insights</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {recommendation.confidence}%
        </span>
            </div>

            <div className="text-sm text-purple-700 mb-2">
                {recommendation.reason}
            </div>

            {recommendation.matchingFeatures?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {recommendation.matchingFeatures.slice(0, 3).map((feature, index) => (
                        <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
              ✓ {feature}
            </span>
                    ))}
                    {recommendation.matchingFeatures.length > 3 && (
                        <span className="text-xs text-purple-600">
              +{recommendation.matchingFeatures.length - 3} more
            </span>
                    )}
                </div>
            )}
        </div>
    );
};

// Insight summary for overview pages
export const InsightSummary = ({ recommendations }) => {
    const totalRecommendations = recommendations.length;
    const avgConfidence = Math.round(
        recommendations.reduce((sum, r) => sum + (r.confidence || 0), 0) / totalRecommendations
    );
    const topCategories = [...new Set(recommendations.map(r => r.category))].slice(0, 3);

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl text-white">
                    <FaBrain />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-purple-800">AI Analysis Summary</h3>
                    <p className="text-purple-600">Insights from your personalized recommendations</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-900">{totalRecommendations}</div>
                    <div className="text-sm text-purple-600">AI Recommendations</div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-900">{avgConfidence}%</div>
                    <div className="text-sm text-purple-600">Avg Confidence</div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-900">{topCategories.length}</div>
                    <div className="text-sm text-purple-600">Categories</div>
                </div>
            </div>

            <div className="mt-4 text-sm text-purple-700">
                <strong>Top recommendation types:</strong> {topCategories.join(', ')}
            </div>
        </div>
    );
};

export default RecommendationInsights;