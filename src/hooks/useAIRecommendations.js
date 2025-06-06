// hooks/useAIRecommendations.js - Custom hook for AI recommendations
import { useState, useEffect, useCallback } from 'react';
import { useAI } from '../context/AIContext';
import { useAuth } from '../context/AuthContext';

// Move this export to module level (outside of any function)
export const useAIInteractions = () => {
    const { recordInteraction } = useAI();

    const handleInteraction = useCallback(async (type, itemId, data = {}) => {
        return await recordInteraction(type, itemId, data);
    }, [recordInteraction]);

    return {
        recordInteraction: handleInteraction
    };
};

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
        if (recommendations.length === 0) {
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
        allRecommendations: recommendations,
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
        hasRecommendations: recommendations.length > 0,
        hasResults: filteredRecommendations().length > 0
    };
};