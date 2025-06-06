// components/AIStatusIndicator.js - Component to show AI learning status
import React from 'react';
import { useAI } from '../context/AIContext';
import { FaBrain, FaTrophy, FaChartBar, FaUser, FaRocket, FaCog } from 'react-icons/fa';

export const AIStatusIndicator = ({ compact = false, showDetails = true }) => {
    const { aiPersonalizationScore, learningProgress, isAIActive, recommendationCount } = useAI();

    if (!isAIActive) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-400 p-2 rounded-lg text-white">
                        <FaBrain />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-700">AI Learning Inactive</div>
                        <div className="text-sm text-gray-500">Sign in to start AI personalization</div>
                    </div>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <FaBrain className="text-xs" />
                <span>AI: {aiPersonalizationScore}%</span>
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
            </div>
        );
    }

    // Get progress color based on score
    const getProgressColor = (score) => {
        if (score >= 80) return 'from-green-500 to-emerald-500';
        if (score >= 60) return 'from-blue-500 to-cyan-500';
        if (score >= 40) return 'from-yellow-500 to-orange-500';
        if (score >= 20) return 'from-orange-500 to-red-500';
        return 'from-gray-400 to-gray-500';
    };

    // Get level icon
    const getLevelIcon = (level) => {
        const icons = {
            'Expert': <FaTrophy className="text-yellow-500" />,
            'Advanced': <FaRocket className="text-blue-500" />,
            'Intermediate': <FaChartBar className="text-green-500" />,
            'Learning': <FaBrain className="text-purple-500" />,
            'Beginner': <FaUser className="text-gray-500" />
        };
        return icons[level] || <FaBrain className="text-purple-500" />;
    };

    // Get status message
    const getStatusMessage = (score, level) => {
        if (score >= 90) return "AI is highly personalized for you!";
        if (score >= 70) return "AI knows your preferences well";
        if (score >= 50) return "AI is learning your taste";
        if (score >= 30) return "AI is getting to know you";
        if (score >= 10) return "AI is starting to learn";
        return "Help AI learn by interacting more";
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl text-white relative">
                        <FaBrain className="text-xl" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-purple-800">AI Learning Status</div>
                        <div className="text-purple-600">{getStatusMessage(aiPersonalizationScore, learningProgress.level)}</div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-3xl font-bold text-purple-800">{aiPersonalizationScore}%</div>
                    <div className="text-sm text-purple-600">Personalized</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        {getLevelIcon(learningProgress.level)}
                        <span className="font-semibold text-purple-700">{learningProgress.level}</span>
                    </div>
                    <span className="text-sm text-purple-600">{learningProgress.progressPercentage}%</span>
                </div>

                <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`bg-gradient-to-r ${getProgressColor(aiPersonalizationScore)} h-3 rounded-full transition-all duration-1000 ease-out relative`}
                        style={{ width: `${aiPersonalizationScore}%` }}
                    >
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Details */}
            {showDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Learning Level */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            {getLevelIcon(learningProgress.level)}
                            <span className="font-medium text-purple-800">Learning Level</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{learningProgress.level}</div>
                        <div className="text-xs text-purple-600">{learningProgress.nextMilestone}</div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <FaRocket className="text-pink-500" />
                            <span className="font-medium text-purple-800">Recommendations</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{recommendationCount}</div>
                        <div className="text-xs text-purple-600">AI-generated suggestions</div>
                    </div>

                    {/* Activity Status */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-medium text-purple-800">Status</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">Active</div>
                        <div className="text-xs text-purple-600">Learning from your actions</div>
                    </div>
                </div>
            )}

            {/* Next Milestone */}
            <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg border border-purple-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" />
                        <span className="font-medium text-purple-800">Next Milestone</span>
                    </div>
                    <span className="text-sm text-purple-600">{learningProgress.nextMilestone}</span>
                </div>
            </div>
        </div>
    );
};

// Compact version for headers/navbars
export const AIStatusBadge = () => {
    return <AIStatusIndicator compact={true} />;
};

// Detailed version for dashboard
export const AIStatusDashboard = () => {
    return <AIStatusIndicator compact={false} showDetails={true} />;
};

export default AIStatusIndicator;