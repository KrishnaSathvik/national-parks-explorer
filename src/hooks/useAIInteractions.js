// hooks/useAIInteractions.js - Hook for tracking user interactions
import { useCallback } from 'react';
import { useAI } from '../context/AIContext';

export const useAIInteractions = () => {
    const { recordInteraction, aiPersonalizationScore, learningProgress } = useAI();

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

    // Track time spent on park
    const trackTimeSpent = useCallback(async (parkId, seconds, timeData = {}) => {
        return await recordInteraction('timeSpent', parkId, {
            seconds,
            ...timeData,
            source: 'park_detail',
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

    // Track favorite toggle
    const trackFavoriteToggle = useCallback(async (parkId, isFavorited, favoriteData = {}) => {
        const type = isFavorited ? 'favorite_add' : 'favorite_remove';
        return await recordInteraction(type, parkId, {
            ...favoriteData,
            action: type,
            timestamp: Date.now()
        });
    }, [recordInteraction]);

    return {
        // Tracking functions
        trackParkView,
        trackParkClick,
        trackSearch,
        trackFeedback,
        trackTimeSpent,
        trackTripPlanning,
        trackFavoriteToggle,

        // AI status
        aiPersonalizationScore,
        learningProgress,

        // Helper functions
        isAILearning: aiPersonalizationScore > 0,
        getLearningLevel: () => learningProgress.level,
        getNextMilestone: () => learningProgress.nextMilestone
    };
};