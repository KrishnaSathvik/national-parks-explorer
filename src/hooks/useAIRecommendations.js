// hooks/useAIRecommendations.js - Custom hook for AI recommendations
import { useState, useEffect, useCallback } from 'react';
import { useAI } from '../context/AIContext';
import { useAuth } from '../context/AuthContext';

export const useAIRecommendations = (parks, favorites) => {
    const { currentUser } = useAuth();
    const {
        recommendations,
        isGeneratingRecommendations,
        generateRecommendations,
        recordInteraction,
        getRecommendationsByCategory
    } = useAI();

    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Generate recommendations when dependencies change
    useEffect(() => {
        if (currentUser && parks && parks.length > 0) {
            generateRecommendations(parks, favorites);
        }
    }, [currentUser, parks, favorites, generateRecommendations]);

    // Filter recommendations based on active category and search
    const filteredRecommendations = useCallback(() => {
        let filtered = getRecommendationsByCategory(activeCategory);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(rec =>
                rec.name?.toLowerCase().includes(query) ||
                rec.description?.toLowerCase().includes(query) ||
                rec.state?.toLowerCase().includes(query) ||
                rec.category?.toLowerCase().includes(query) ||
                rec.reason?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [getRecommendationsByCategory, activeCategory, searchQuery]);

    // Get available categories
    const getCategories = useCallback(() => {
        // ✅ FIX: Add null safety for recommendations
        if (!recommendations || recommendations.length === 0) {
            return [{ name: 'All', count: 0 }];
        }

        const categories = [...new Set(recommendations.map(r => r.category))];
        return [
            { name: 'All', count: recommendations.length },
            ...categories.map(cat => ({
                name: cat,
                count: recommendations.filter(r => r.category === cat).length,
                icon: recommendations.find(r => r.category === cat)?.icon || '✨',
                color: recommendations.find(r => r.category === cat)?.color || 'from-purple-500 to-pink-500'
            }))
        ];
    }, [recommendations]);

    // Handle user interactions with recommendations
    const handleRecommendationInteraction = useCallback(async (type, recommendation, additionalData = {}) => {
        // ✅ FIX: Add null safety for recommendation
        if (!recommendation || !recommendation.id) {
            console.warn('⚠️ Cannot record interaction: invalid recommendation');
            return;
        }

        await recordInteraction(type, recommendation.id, {
            ...additionalData,
            recommendationId: recommendation.id,
            recommendationType: recommendation.recommendationType,
            category: recommendation.category,
            confidence: recommendation.confidence
        });
    }, [recordInteraction]);

    // Refresh recommendations
    const refreshRecommendations = useCallback(async () => {
        if (parks && favorites) {
            return await generateRecommendations(parks, favorites, true);
        }
        return [];
    }, [parks, favorites, generateRecommendations]);

    // Get recommendation stats
    const getStats = useCallback(() => {
        // ✅ FIX: Add null safety for recommendations
        if (!recommendations || recommendations.length === 0) {
            return {
                totalRecommendations: 0,
                categories: 0,
                avgConfidence: 0,
                hasPersonalizedRecs: false
            };
        }

        const avgConfidence = Math.round(
            recommendations.reduce((sum, r) => sum + (r.confidence || 0), 0) / recommendations.length
        );

        const hasPersonalizedRecs = recommendations.some(r =>
            ['behavioral', 'preference-based', 'collaborative'].includes(r.recommendationType)
        );

        return {
            totalRecommendations: recommendations.length,
            categories: new Set(recommendations.map(r => r.category)).size,
            avgConfidence,
            hasPersonalizedRecs
        };
    }, [recommendations]);

    return {
        // Data
        recommendations: filteredRecommendations(),
        allRecommendations: recommendations || [], // ✅ FIX: Provide default array
        categories: getCategories(),
        stats: getStats(),

        // State
        isLoading: isGeneratingRecommendations,
        activeCategory,
        searchQuery,

        // Actions
        setActiveCategory,
        setSearchQuery,
        handleRecommendationInteraction,
        refreshRecommendations,

        // Helpers
        hasRecommendations: (recommendations && recommendations.length > 0), // ✅ FIX: Add null safety
        hasResults: filteredRecommendations().length > 0
    };
};

// Move this export to module level (outside of any function)
export const useAIInteractions = () => {
    const { recordInteraction, aiPersonalizationScore, learningProgress } = useAI();

    const handleInteraction = useCallback(async (type, itemId, data = {}) => {
        return await recordInteraction(type, itemId, data);
    }, [recordInteraction]);

    // Track park view
    const trackParkView = useCallback(async (parkId, viewData = {}) => {
        return await recordInteraction('view', parkId, {
            ...viewData,
            source: 'park_detail',
            timestamp: Date.now()
        });
    }, [recordInteraction]);

    // Track park click
    const trackParkClick = useCallback(async (parkId, clickData = {}) => {
        return await recordInteraction('click', parkId, {
            ...clickData,
            source: 'recommendation_card',
            timestamp: Date.now()
        });
    }, [recordInteraction]);

    // Track search query
    const trackSearch = useCallback(async (query, searchData = {}) => {
        return await recordInteraction('search', null, {
            query,
            ...searchData,
            source: 'smart_search',
            timestamp: Date.now()
        });
    }, [recordInteraction]);

    // Track like/dislike
    const trackFeedback = useCallback(async (parkId, isLike, feedbackData = {}) => {
        const type = isLike ? 'like' : 'dislike';
        return await recordInteraction(type, parkId, {
            ...feedbackData,
            feedback_type: type,
            timestamp: Date.now()
        });
    }, [recordInteraction]);

    // Track trip planning
    const trackTripPlanning = useCallback(async (parkId, planData = {}) => {
        return await recordInteraction('planTrip', parkId, {
            ...planData,
            source: 'trip_planner',
            timestamp: Date.now()
        });
    }, [recordInteraction]);

    return {
        recordInteraction: handleInteraction,
        trackParkView,
        trackParkClick,
        trackSearch,
        trackFeedback,
        trackTripPlanning,

        // ✅ FIX: Add null safety for AI status
        aiPersonalizationScore: aiPersonalizationScore || 0,
        learningProgress: learningProgress || {
            level: 'Beginner',
            nextMilestone: 'Start interacting',
            progressPercentage: 0
        }
    };
};