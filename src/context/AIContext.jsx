// context/AIContext.js - AI-powered context for recommendations
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { AIRecommendationService } from '../services/aiRecommendationService';

const AIContext = createContext();

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within AIProvider');
    }
    return context;
};

export const AIProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    // AI State
    const [aiProfile, setAIProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
    const [userPreferences, setUserPreferences] = useState(null);
    const [aiPersonalizationScore, setAIPersonalizationScore] = useState(0);
    const [learningProgress, setLearningProgress] = useState({
        level: 'Beginner',
        nextMilestone: 'Make 5 interactions',
        progressPercentage: 0
    });

    // Initialize AI services when user changes
    useEffect(() => {
        if (currentUser) {
            initializeAI();
        } else {
            resetAIState();
        }
    }, [currentUser]);

    // Initialize AI services for current user
    const initializeAI = useCallback(async () => {
        try {
            console.log('🤖 Initializing AI for user:', currentUser?.uid);

            const aiStatus = await FirebaseAIService.initializeForUser(currentUser.uid);
            const profile = await FirebaseAIService.getUserAIProfile(currentUser.uid);

            setAIProfile(profile);
            setUserPreferences(profile?.preferences);
            setAIPersonalizationScore(profile?.aiPersonalizationScore || 0);
            setLearningProgress(profile?.learningProgress || learningProgress);

            if (aiStatus.isNewUser) {
                showToast('🧠 AI is learning your preferences! Interact with parks to get better recommendations.', 'info');
            }

            console.log('✅ AI initialized with personalization score:', profile?.aiPersonalizationScore);

        } catch (error) {
            console.error('❌ Failed to initialize AI:', error);
            showToast('AI services temporarily unavailable. Basic recommendations will be shown.', 'warning');
        }
    }, [currentUser, showToast]);

    // Reset AI state for logged out users
    const resetAIState = useCallback(() => {
        setAIProfile(null);
        setRecommendations([]);
        setUserPreferences(null);
        setAIPersonalizationScore(0);
        setLearningProgress({
            level: 'Beginner',
            nextMilestone: 'Sign in to start AI learning',
            progressPercentage: 0
        });
    }, []);

    // Generate AI recommendations
    const generateRecommendations = useCallback(async (parks, favorites = [], forceRefresh = false) => {
        if (!currentUser || !parks || parks.length === 0) {
            console.warn('⚠️ Cannot generate recommendations: missing user or parks data');
            return [];
        }

        try {
            setIsGeneratingRecommendations(true);

            console.log('🧠 Generating AI recommendations...');
            const aiRecommendations = await FirebaseAIService.getSmartRecommendations(
                currentUser.uid,
                parks,
                favorites,
                forceRefresh
            );

            setRecommendations(aiRecommendations);

            if (forceRefresh) {
                showToast(`🚀 Generated ${aiRecommendations.length} fresh AI recommendations!`, 'success');
            }

            return aiRecommendations;

        } catch (error) {
            console.error('❌ Failed to generate recommendations:', error);
            showToast('Failed to generate AI recommendations. Please try again.', 'error');
            return [];
        } finally {
            setIsGeneratingRecommendations(false);
        }
    }, [currentUser, showToast]);

    // Record user interaction for AI learning
    const recordInteraction = useCallback(async (type, parkId, additionalData = {}) => {
        if (!currentUser) return false;

        try {
            const success = await FirebaseAIService.recordInteraction(
                currentUser.uid,
                type,
                parkId,
                additionalData
            );

            if (success) {
                // Update learning progress locally
                const updatedProfile = await FirebaseAIService.getUserAIProfile(currentUser.uid);
                if (updatedProfile) {
                    setLearningProgress(updatedProfile.learningProgress);
                    setAIPersonalizationScore(updatedProfile.aiPersonalizationScore);
                }

                // Show learning feedback occasionally
                if (Math.random() < 0.1) { // 10% chance
                    showToast('🧠 AI is learning from your actions!', 'info');
                }
            }

            return success;
        } catch (error) {
            console.error('❌ Failed to record interaction:', error);
            return false;
        }
    }, [currentUser, showToast]);

    // Save user preferences from wizard
    const savePreferences = useCallback(async (preferences) => {
        if (!currentUser) return false;

        try {
            const success = await FirebaseAIService.savePreferences(currentUser.uid, preferences);

            if (success) {
                setUserPreferences(preferences);

                // Update AI profile
                const updatedProfile = await FirebaseAIService.getUserAIProfile(currentUser.uid);
                if (updatedProfile) {
                    setAIProfile(updatedProfile);
                    setAIPersonalizationScore(updatedProfile.aiPersonalizationScore);
                }

                showToast('🎯 AI preferences updated! Generating personalized recommendations...', 'success');
            }

            return success;
        } catch (error) {
            console.error('❌ Failed to save preferences:', error);
            showToast('Failed to save preferences. Please try again.', 'error');
            return false;
        }
    }, [currentUser, showToast]);

    // Get recommendation by ID
    const getRecommendationById = useCallback((id) => {
        return recommendations.find(rec => rec.id === id);
    }, [recommendations]);

    // Filter recommendations by category
    const getRecommendationsByCategory = useCallback((category) => {
        if (category === 'All') return recommendations;
        return recommendations.filter(rec => rec.category === category);
    }, [recommendations]);

    // Get AI insights for a specific park
    const getParkAIInsights = useCallback(async (parkId) => {
        if (!currentUser) return null;

        try {
            // This could be expanded to provide specific AI insights for a park
            const recommendation = getRecommendationById(parkId);
            if (recommendation) {
                return {
                    confidence: recommendation.confidence,
                    reason: recommendation.reason,
                    category: recommendation.category,
                    matchingFeatures: recommendation.matchingFeatures || [],
                    aiInsight: recommendation.aiInsight
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to get park AI insights:', error);
            return null;
        }
    }, [currentUser, getRecommendationById]);

    // Refresh AI profile data
    const refreshAIProfile = useCallback(async () => {
        if (!currentUser) return;

        try {
            const profile = await FirebaseAIService.getUserAIProfile(currentUser.uid);
            setAIProfile(profile);
            setUserPreferences(profile?.preferences);
            setAIPersonalizationScore(profile?.aiPersonalizationScore || 0);
            setLearningProgress(profile?.learningProgress || learningProgress);
        } catch (error) {
            console.error('❌ Failed to refresh AI profile:', error);
        }
    }, [currentUser]);

    const value = {
        // State
        aiProfile,
        recommendations,
        isGeneratingRecommendations,
        userPreferences,
        aiPersonalizationScore,
        learningProgress,

        // Actions
        generateRecommendations,
        recordInteraction,
        savePreferences,
        getRecommendationById,
        getRecommendationsByCategory,
        getParkAIInsights,
        refreshAIProfile,

        // Helpers
        hasPreferences: !!userPreferences,
        isAIActive: !!currentUser && aiPersonalizationScore > 0,
        recommendationCount: recommendations.length
    };

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    );
};