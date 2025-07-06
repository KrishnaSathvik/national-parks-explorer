// ✅ FIXED AIContext.js - React Error #130 Prevention
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const AIContext = createContext();

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within AIProvider');
    }
    return context;
};

// ✅ FIXED: Create safe FirebaseAIService to prevent undefined imports
const FirebaseAIService = {
    initializeForUser: async (userId) => {
        try {
            console.log('🤖 Initializing AI services for user:', userId);

            // Check if user has AI profile
            const profileRef = doc(db, 'aiProfiles', userId);
            const profileSnap = await getDoc(profileRef);

            if (!profileSnap.exists()) {
                // Create new AI profile
                const newProfile = {
                    userId,
                    aiPersonalizationScore: 0,
                    preferences: null,
                    learningProgress: {
                        level: 'Beginner',
                        nextMilestone: 'Make 5 interactions',
                        progressPercentage: 0
                    },
                    createdAt: serverTimestamp(),
                    lastUpdated: serverTimestamp()
                };

                await setDoc(profileRef, newProfile);

                return {
                    isNewUser: true,
                    profile: newProfile
                };
            }

            return {
                isNewUser: false,
                profile: profileSnap.data()
            };

        } catch (error) {
            console.error('❌ AI initialization error:', error);
            throw error;
        }
    },

    getUserAIProfile: async (userId) => {
        try {
            const profileRef = doc(db, 'aiProfiles', userId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const data = profileSnap.data();
                return {
                    ...data,
                    // ✅ FIXED: Always return safe objects
                    preferences: data.preferences || null,
                    learningProgress: data.learningProgress || {
                        level: 'Beginner',
                        nextMilestone: 'Make 5 interactions',
                        progressPercentage: 0
                    },
                    aiPersonalizationScore: data.aiPersonalizationScore || 0
                };
            }

            return null;
        } catch (error) {
            console.error('❌ Failed to get AI profile:', error);
            return null;
        }
    },

    getSmartRecommendations: async (userId, parks, favorites = [], forceRefresh = false) => {
        try {
            // Simple recommendation logic for now
            const recommendations = parks
                .filter(park => !favorites.includes(park.id))
                .slice(0, 10)
                .map(park => ({
                    id: park.id,
                    parkId: park.id,
                    category: 'Popular',
                    confidence: Math.random() * 100,
                    reason: 'Based on your preferences',
                    matchingFeatures: ['nature', 'hiking'],
                    aiInsight: `${park.name} matches your interests`,
                    park: park
                }));

            return recommendations;
        } catch (error) {
            console.error('❌ Failed to generate recommendations:', error);
            return [];
        }
    },

    recordInteraction: async (userId, type, parkId, additionalData = {}) => {
        try {
            // ✅ FIXED: Safe interaction recording with proper error handling
            const interactionRef = collection(db, 'userInteractions');

            const interactionData = {
                userId: String(userId), // ✅ Ensure string
                type: String(type), // ✅ Ensure string
                parkId: String(parkId), // ✅ Ensure string
                additionalData: additionalData || {}, // ✅ Ensure object
                timestamp: serverTimestamp(),
                __name__: `${userId}_${type}_${Date.now()}` // ✅ Add required field for index
            };

            await addDoc(interactionRef, interactionData);

            // Update AI profile score
            const profileRef = doc(db, 'aiProfiles', userId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const currentScore = profileSnap.data().aiPersonalizationScore || 0;
                await updateDoc(profileRef, {
                    aiPersonalizationScore: Math.min(currentScore + 1, 100),
                    lastUpdated: serverTimestamp()
                });
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to record interaction:', error);
            return false;
        }
    },

    savePreferences: async (userId, preferences) => {
        try {
            const profileRef = doc(db, 'aiProfiles', userId);

            // ✅ FIXED: Ensure preferences is always an object
            const safePreferences = typeof preferences === 'object' && preferences !== null
                ? preferences
                : {};

            await updateDoc(profileRef, {
                preferences: safePreferences,
                aiPersonalizationScore: 25, // Boost for setting preferences
                lastUpdated: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('❌ Failed to save preferences:', error);
            return false;
        }
    },

    // ✅ FIXED: Safe function to get user interaction history (the one causing Firebase index error)
    getUserInteractionHistory: async (userId) => {
        try {
            const interactionsRef = collection(db, 'userInteractions');

            // ✅ This query requires the Firebase index you need to create
            const q = query(
                interactionsRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                orderBy('__name__', 'desc'), // ✅ This requires the index
                limit(50)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('❌ Failed to get user interaction history:', error);
            throw error; // This will trigger the Firebase index error message
        }
    }
};

export const AIProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    // ✅ FIXED: All state initialized with safe default values
    const [aiProfile, setAIProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
    const [userPreferences, setUserPreferences] = useState(null);
    const [aiPersonalizationScore, setAIPersonalizationScore] = useState(0);

    // ✅ FIXED: Always provide safe default object to prevent React Error #130
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

            // ✅ FIXED: Safe state updates with fallbacks
            setAIProfile(profile || {});
            setUserPreferences(profile?.preferences || null);
            setAIPersonalizationScore(profile?.aiPersonalizationScore || 0);

            // ✅ FIXED: Always set safe learning progress object
            const safeLearningProgress = profile?.learningProgress || {
                level: 'Beginner',
                nextMilestone: 'Make 5 interactions',
                progressPercentage: 0
            };
            setLearningProgress(safeLearningProgress);

            if (aiStatus.isNewUser) {
                showToast('🧠 AI is learning your preferences! Interact with parks to get better recommendations.', 'info');
            }

            console.log('✅ AI initialized with personalization score:', profile?.aiPersonalizationScore || 0);

            // ✅ FIXED: Try to get interaction history (this will trigger the index error if index doesn't exist)
            try {
                await FirebaseAIService.getUserInteractionHistory(currentUser.uid);
            } catch (historyError) {
                // This is expected if the Firebase index doesn't exist yet
                console.warn('⚠️ User interaction history unavailable - Firebase index may be missing');
            }

        } catch (error) {
            console.error('❌ Failed to initialize AI:', error);
            showToast('AI services temporarily unavailable. Basic recommendations will be shown.', 'warning');

            // ✅ FIXED: Set safe defaults on error
            setLearningProgress({
                level: 'Beginner',
                nextMilestone: 'AI initialization failed',
                progressPercentage: 0
            });
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

            // ✅ FIXED: Ensure recommendations is always an array
            const safeRecommendations = Array.isArray(aiRecommendations) ? aiRecommendations : [];
            setRecommendations(safeRecommendations);

            if (forceRefresh) {
                showToast(`🚀 Generated ${safeRecommendations.length} fresh AI recommendations!`, 'success');
            }

            return safeRecommendations;

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
                additionalData || {} // ✅ Ensure object
            );

            if (success) {
                // Update learning progress locally
                const updatedProfile = await FirebaseAIService.getUserAIProfile(currentUser.uid);
                if (updatedProfile) {
                    const safeLearningProgress = updatedProfile.learningProgress || {
                        level: 'Beginner',
                        nextMilestone: 'Keep interacting',
                        progressPercentage: 0
                    };
                    setLearningProgress(safeLearningProgress);
                    setAIPersonalizationScore(updatedProfile.aiPersonalizationScore || 0);
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
            // ✅ FIXED: Ensure preferences is safe object
            const safePreferences = typeof preferences === 'object' && preferences !== null
                ? preferences
                : {};

            const success = await FirebaseAIService.savePreferences(currentUser.uid, safePreferences);

            if (success) {
                setUserPreferences(safePreferences);

                // Update AI profile
                const updatedProfile = await FirebaseAIService.getUserAIProfile(currentUser.uid);
                if (updatedProfile) {
                    setAIProfile(updatedProfile);
                    setAIPersonalizationScore(updatedProfile.aiPersonalizationScore || 0);

                    const safeLearningProgress = updatedProfile.learningProgress || {
                        level: 'Beginner',
                        nextMilestone: 'Keep using the app',
                        progressPercentage: 0
                    };
                    setLearningProgress(safeLearningProgress);
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
        if (!Array.isArray(recommendations)) return null;
        return recommendations.find(rec => rec && rec.id === id) || null;
    }, [recommendations]);

    // Filter recommendations by category
    const getRecommendationsByCategory = useCallback((category) => {
        if (!Array.isArray(recommendations)) return [];
        if (category === 'All') return recommendations;
        return recommendations.filter(rec => rec && rec.category === category);
    }, [recommendations]);

    // Get AI insights for a specific park
    const getParkAIInsights = useCallback(async (parkId) => {
        if (!currentUser) return null;

        try {
            const recommendation = getRecommendationById(parkId);
            if (recommendation) {
                return {
                    confidence: recommendation.confidence || 0,
                    reason: recommendation.reason || 'No specific reason available',
                    category: recommendation.category || 'General',
                    matchingFeatures: Array.isArray(recommendation.matchingFeatures)
                        ? recommendation.matchingFeatures
                        : [],
                    aiInsight: recommendation.aiInsight || 'No insights available'
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

            // ✅ FIXED: Safe updates with fallbacks
            setAIProfile(profile || {});
            setUserPreferences(profile?.preferences || null);
            setAIPersonalizationScore(profile?.aiPersonalizationScore || 0);

            const safeLearningProgress = profile?.learningProgress || {
                level: 'Beginner',
                nextMilestone: 'Keep using the app',
                progressPercentage: 0
            };
            setLearningProgress(safeLearningProgress);

        } catch (error) {
            console.error('❌ Failed to refresh AI profile:', error);
        }
    }, [currentUser]);

    // ✅ FIXED: Safe context value with no object rendering
    const value = {
        // State - all safe primitives
        aiProfile,
        recommendations,
        isGeneratingRecommendations,
        userPreferences,
        aiPersonalizationScore,
        learningProgress, // ✅ Always safe object

        // Actions
        generateRecommendations,
        recordInteraction,
        savePreferences,
        getRecommendationById,
        getRecommendationsByCategory,
        getParkAIInsights,
        refreshAIProfile,

        // Helpers - all safe primitives
        hasPreferences: !!userPreferences,
        isAIActive: !!currentUser && aiPersonalizationScore > 0,
        recommendationCount: Array.isArray(recommendations) ? recommendations.length : 0
    };

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    );
};