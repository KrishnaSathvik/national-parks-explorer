// services/aiRecommendationService.js
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    increment,
    writeBatch
} from 'firebase/firestore';
import { db, logAnalyticsEvent, handleFirebaseError } from '../firebase';

// ===== USER INTERACTION TRACKING =====
export class UserInteractionService {

    // Track user interactions for AI learning
    static async recordInteraction(userId, interactionData) {
        try {
            if (!userId || !interactionData) {
                throw new Error('Missing userId or interactionData');
            }

            const { type, parkId, data = {} } = interactionData;

            // Create interaction document
            const interactionRef = doc(collection(db, 'userInteractions'));

            const interaction = {
                userId,
                type, // 'click', 'like', 'dislike', 'timeSpent', 'search', 'view', 'planTrip'
                parkId,
                data,
                timestamp: serverTimestamp(),
                sessionId: this.getSessionId(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };

            await setDoc(interactionRef, interaction);

            // Update user's interaction summary
            await this.updateUserInteractionSummary(userId, type, parkId, data);

            // Log analytics
            logAnalyticsEvent('user_interaction_recorded', {
                interaction_type: type,
                park_id: parkId,
                user_id: userId
            });

            console.log('✅ Interaction recorded:', type, parkId);
            return true;

        } catch (error) {
            console.error('❌ Failed to record interaction:', error);
            handleFirebaseError(error, 'recordInteraction');
            return false;
        }
    }

    // Update user's interaction summary for quick AI access
    static async updateUserInteractionSummary(userId, type, parkId, data) {
        try {
            const userStatsRef = doc(db, 'userStats', userId);
            const userStatsSnap = await getDoc(userStatsRef);

            let currentStats = {
                totalInteractions: 0,
                clickCount: 0,
                likeCount: 0,
                dislikeCount: 0,
                searchCount: 0,
                planTripCount: 0,
                viewCount: 0,
                totalTimeSpent: 0,
                favoriteStates: {},
                preferredActivities: {},
                lastActiveDate: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (userStatsSnap.exists()) {
                currentStats = { ...currentStats, ...userStatsSnap.data() };
            }

            // Update based on interaction type
            const updates = {
                totalInteractions: increment(1),
                lastActiveDate: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            switch (type) {
                case 'click':
                    updates.clickCount = increment(1);
                    break;
                case 'like':
                    updates.likeCount = increment(1);
                    break;
                case 'dislike':
                    updates.dislikeCount = increment(1);
                    break;
                case 'search':
                    updates.searchCount = increment(1);
                    // Track search terms
                    if (data.query) {
                        updates[`searchTerms.${data.query.toLowerCase().replace(/[^a-z0-9]/g, '_')}`] = increment(1);
                    }
                    break;
                case 'timeSpent':
                    updates.totalTimeSpent = increment(data.seconds || 0);
                    break;
                case 'planTrip':
                    updates.planTripCount = increment(1);
                    break;
                case 'view':
                    updates.viewCount = increment(1);
                    break;
            }

            await updateDoc(userStatsRef, updates);

        } catch (error) {
            // If document doesn't exist, create it
            if (error.code === 'not-found') {
                await setDoc(doc(db, 'userStats', userId), {
                    totalInteractions: 1,
                    clickCount: type === 'click' ? 1 : 0,
                    likeCount: type === 'like' ? 1 : 0,
                    dislikeCount: type === 'dislike' ? 1 : 0,
                    searchCount: type === 'search' ? 1 : 0,
                    planTripCount: type === 'planTrip' ? 1 : 0,
                    viewCount: type === 'view' ? 1 : 0,
                    totalTimeSpent: type === 'timeSpent' ? (data.seconds || 0) : 0,
                    favoriteStates: {},
                    preferredActivities: {},
                    createdAt: serverTimestamp(),
                    lastActiveDate: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            } else {
                throw error;
            }
        }
    }

    // Get user's interaction history for AI analysis
    static async getUserInteractionHistory(userId, limit_count = 100) {
        try {
            const interactionsRef = collection(db, 'userInteractions');
            const q = query(
                interactionsRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(limit_count)
            );

            const snapshot = await getDocs(q);
            const interactions = [];

            snapshot.forEach(doc => {
                interactions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return interactions;
        } catch (error) {
            console.error('❌ Failed to get user interaction history:', error);
            return [];
        }
    }

    // Get user interaction summary
    static async getUserInteractionSummary(userId) {
        try {
            const userStatsRef = doc(db, 'userStats', userId);
            const userStatsSnap = await getDoc(userStatsRef);

            if (!userStatsSnap.exists()) {
                return null;
            }

            return userStatsSnap.data();
        } catch (error) {
            console.error('❌ Failed to get user interaction summary:', error);
            return null;
        }
    }

    // Generate session ID for tracking user sessions
    static getSessionId() {
        let sessionId = sessionStorage.getItem('aiSessionId');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('aiSessionId', sessionId);
        }
        return sessionId;
    }
}

// ===== USER PREFERENCES SERVICE =====
export class UserPreferencesService {

    // Save user preferences from the wizard
    static async saveUserPreferences(userId, preferences) {
        try {
            if (!userId || !preferences) {
                throw new Error('Missing userId or preferences');
            }

            const userPrefsRef = doc(db, 'userPreferences', userId);

            const preferencesData = {
                ...preferences,
                version: 1, // For future preference migrations
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            };

            await setDoc(userPrefsRef, preferencesData, { merge: true });

            // Log analytics
            logAnalyticsEvent('user_preferences_updated', {
                user_id: userId,
                activities_count: preferences.activities?.length || 0,
                landscapes_count: preferences.landscapes?.length || 0,
                difficulty: preferences.difficulty,
                mood: preferences.mood
            });

            console.log('✅ User preferences saved');
            return true;

        } catch (error) {
            console.error('❌ Failed to save user preferences:', error);
            handleFirebaseError(error, 'saveUserPreferences');
            return false;
        }
    }

    // Get user preferences
    static async getUserPreferences(userId) {
        try {
            const userPrefsRef = doc(db, 'userPreferences', userId);
            const userPrefsSnap = await getDoc(userPrefsRef);

            if (!userPrefsSnap.exists()) {
                return null;
            }

            return userPrefsSnap.data();
        } catch (error) {
            console.error('❌ Failed to get user preferences:', error);
            return null;
        }
    }

    // Update specific preference
    static async updatePreference(userId, key, value) {
        try {
            const userPrefsRef = doc(db, 'userPreferences', userId);

            await updateDoc(userPrefsRef, {
                [key]: value,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('❌ Failed to update preference:', error);
            return false;
        }
    }
}

// ===== AI RECOMMENDATION SERVICE =====
export class AIRecommendationService {

    // Generate AI recommendations using Firebase data
    static async generateRecommendations(userId, parks, favorites = []) {
        try {
            console.log('🧠 Generating AI recommendations for user:', userId);

            // Get user data for AI analysis
            const [userPreferences, userInteractions, userStats] = await Promise.all([
                UserPreferencesService.getUserPreferences(userId),
                UserInteractionService.getUserInteractionHistory(userId, 50),
                UserInteractionService.getUserInteractionSummary(userId)
            ]);

            // Get community data for collaborative filtering
            const communityInsights = await this.getCommunityInsights();

            // Enhanced recommendation engine with Firebase data
            const recommendations = await this.runAdvancedAI({
                userId,
                parks,
                favorites,
                userPreferences,
                userInteractions,
                userStats,
                communityInsights
            });

            // Save recommendations to Firebase for caching
            await this.saveRecommendations(userId, recommendations);

            // Log analytics
            logAnalyticsEvent('ai_recommendations_generated', {
                user_id: userId,
                recommendations_count: recommendations.length,
                user_preferences_exist: !!userPreferences,
                interaction_count: userInteractions?.length || 0
            });

            return recommendations;

        } catch (error) {
            console.error('❌ Failed to generate AI recommendations:', error);
            handleFirebaseError(error, 'generateRecommendations');
            return [];
        }
    }

    // Advanced AI algorithm using Firebase data
    static async runAdvancedAI({ userId, parks, favorites, userPreferences, userInteractions, userStats, communityInsights }) {
        const recommendations = [];

        // 1. Behavioral Analysis based on Firebase interactions
        if (userInteractions && userInteractions.length > 0) {
            const behaviorRecs = this.generateBehavioralRecommendations(parks, userInteractions, favorites);
            recommendations.push(...behaviorRecs);
        }

        // 2. Preference-based recommendations
        if (userPreferences) {
            const prefRecs = this.generatePreferenceBasedRecommendations(parks, userPreferences, favorites);
            recommendations.push(...prefRecs);
        }

        // 3. Collaborative filtering using community data
        if (communityInsights) {
            const collabRecs = this.generateCollaborativeRecommendations(parks, userStats, communityInsights, favorites);
            recommendations.push(...collabRecs);
        }

        // 4. Contextual recommendations (weather, season, time)
        const contextRecs = this.generateContextualRecommendations(parks, userPreferences);
        recommendations.push(...contextRecs);

        // 5. Discovery recommendations (new experiences)
        const discoveryRecs = this.generateDiscoveryRecommendations(parks, userInteractions, favorites);
        recommendations.push(...discoveryRecs);

        // Remove duplicates and rank
        return this.rankAndDeduplicateRecommendations(recommendations, favorites, userStats);
    }

    // Generate recommendations based on user interactions from Firebase
    static generateBehavioralRecommendations(parks, userInteractions, favorites) {
        // Analyze user behavior patterns
        const clickedParks = userInteractions
            .filter(interaction => interaction.type === 'click' || interaction.type === 'view')
            .map(interaction => interaction.parkId);

        const likedParks = userInteractions
            .filter(interaction => interaction.type === 'like')
            .map(interaction => interaction.parkId);

        const searchTerms = userInteractions
            .filter(interaction => interaction.type === 'search')
            .map(interaction => interaction.data?.query)
            .filter(Boolean);

        // Find patterns in user behavior
        const behaviorPatterns = this.analyzeBehaviorPatterns(parks, clickedParks, likedParks, searchTerms);

        return parks
            .filter(park => !favorites.includes(park.id) && !clickedParks.includes(park.id))
            .map(park => ({
                ...park,
                behaviorScore: this.calculateBehaviorMatch(park, behaviorPatterns)
            }))
            .filter(park => park.behaviorScore > 0.6)
            .slice(0, 5)
            .map(park => ({
                ...park,
                recommendationType: 'behavioral',
                confidence: Math.round(park.behaviorScore * 100),
                reason: `Based on your browsing patterns and interests`,
                category: 'Learned from Your Behavior',
                icon: '🧠',
                color: 'from-indigo-600 to-purple-600',
                source: 'firebase_interactions'
            }));
    }

    // Generate recommendations based on user preferences from Firebase
    static generatePreferenceBasedRecommendations(parks, userPreferences, favorites) {
        const { activities = [], landscapes = [], difficulty = 'any', mood = 'adventure' } = userPreferences;

        return parks
            .filter(park => !favorites.includes(park.id))
            .map(park => ({
                ...park,
                preferenceScore: this.calculatePreferenceMatch(park, userPreferences)
            }))
            .filter(park => park.preferenceScore > 0.7)
            .slice(0, 6)
            .map(park => ({
                ...park,
                recommendationType: 'preference-based',
                confidence: Math.round(park.preferenceScore * 100),
                reason: `Perfect match for your ${activities.slice(0, 2).join(' and ')} preferences`,
                category: 'Your Perfect Match',
                icon: '🎯',
                color: 'from-emerald-500 to-teal-500',
                source: 'firebase_preferences'
            }));
    }

    // Generate collaborative filtering recommendations
    static generateCollaborativeRecommendations(parks, userStats, communityInsights, favorites) {
        if (!userStats || !communityInsights) return [];

        // Find users with similar preferences
        const similarUsers = this.findSimilarUsers(userStats, communityInsights.userProfiles);

        // Get parks liked by similar users
        const recommendedParkIds = this.getParksFromSimilarUsers(similarUsers, communityInsights.userFavorites);

        return parks
            .filter(park => recommendedParkIds.includes(park.id) && !favorites.includes(park.id))
            .slice(0, 4)
            .map(park => ({
                ...park,
                recommendationType: 'collaborative',
                confidence: 85 + Math.floor(Math.random() * 10),
                reason: `Popular with users who share your interests`,
                category: 'Community Favorites',
                icon: '👥',
                color: 'from-blue-500 to-cyan-500',
                source: 'firebase_community'
            }));
    }

    // Generate contextual recommendations
    static generateContextualRecommendations(parks, userPreferences) {
        const currentSeason = this.getCurrentSeason();
        const currentWeather = this.getWeatherContext();

        return parks
            .filter(park => park.bestSeason?.toLowerCase() === currentSeason.toLowerCase())
            .slice(0, 4)
            .map(park => ({
                ...park,
                recommendationType: 'contextual',
                confidence: 88 + Math.floor(Math.random() * 8),
                reason: `Perfect timing for ${currentSeason.toLowerCase()} activities`,
                category: `${currentSeason} Perfect`,
                icon: this.getSeasonIcon(currentSeason),
                color: this.getSeasonColor(currentSeason),
                source: 'contextual_ai'
            }));
    }

    // Generate discovery recommendations
    static generateDiscoveryRecommendations(parks, userInteractions, favorites) {
        // Find parks user hasn't interacted with
        const interactedParkIds = userInteractions?.map(i => i.parkId) || [];

        return parks
            .filter(park =>
                !favorites.includes(park.id) &&
                !interactedParkIds.includes(park.id)
            )
            .slice(0, 3)
            .map(park => ({
                ...park,
                recommendationType: 'discovery',
                confidence: 78 + Math.floor(Math.random() * 15),
                reason: `Discover something completely new`,
                category: 'New Horizons',
                icon: '🌟',
                color: 'from-pink-500 to-rose-500',
                source: 'discovery_ai'
            }));
    }

    // Save recommendations to Firebase for caching
    static async saveRecommendations(userId, recommendations) {
        try {
            const recommendationsRef = doc(db, 'userRecommendations', userId);

            await setDoc(recommendationsRef, {
                recommendations,
                generatedAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                version: 1
            });

        } catch (error) {
            console.error('❌ Failed to save recommendations:', error);
        }
    }

    // Get cached recommendations from Firebase
    static async getCachedRecommendations(userId) {
        try {
            const recommendationsRef = doc(db, 'userRecommendations', userId);
            const recommendationsSnap = await getDoc(recommendationsRef);

            if (!recommendationsSnap.exists()) {
                return null;
            }

            const data = recommendationsSnap.data();

            // Check if recommendations are still valid (not expired)
            if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
                console.log('📅 Cached recommendations expired');
                return null;
            }

            return data.recommendations;
        } catch (error) {
            console.error('❌ Failed to get cached recommendations:', error);
            return null;
        }
    }

    // Get community insights for collaborative filtering
    static async getCommunityInsights() {
        try {
            // Get aggregated community data
            const communityRef = doc(db, 'communityInsights', 'global');
            const communitySnap = await getDoc(communityRef);

            if (!communitySnap.exists()) {
                // Generate initial community insights
                return await this.generateCommunityInsights();
            }

            const data = communitySnap.data();

            // Check if data is fresh (updated within last 6 hours)
            if (data.updatedAt && data.updatedAt.toDate() < new Date(Date.now() - 6 * 60 * 60 * 1000)) {
                console.log('🔄 Community insights outdated, refreshing...');
                return await this.generateCommunityInsights();
            }

            return data;
        } catch (error) {
            console.error('❌ Failed to get community insights:', error);
            return null;
        }
    }

    // Generate community insights from user data
    static async generateCommunityInsights() {
        try {
            // This would typically be done by a Cloud Function
            // For now, return simulated data
            const insights = {
                userProfiles: {},
                userFavorites: {},
                popularParks: [],
                trendingSearches: [],
                updatedAt: serverTimestamp()
            };

            // Save to Firebase
            const communityRef = doc(db, 'communityInsights', 'global');
            await setDoc(communityRef, insights);

            return insights;
        } catch (error) {
            console.error('❌ Failed to generate community insights:', error);
            return null;
        }
    }

    // Helper methods for AI calculations
    static analyzeBehaviorPatterns(parks, clickedParks, likedParks, searchTerms) {
        // Analyze patterns in user behavior
        const clickedParkData = parks.filter(p => clickedParks.includes(p.id));
        const likedParkData = parks.filter(p => likedParks.includes(p.id));

        return {
            preferredStates: this.extractStates(clickedParkData.concat(likedParkData)),
            searchKeywords: searchTerms.flatMap(term => term.toLowerCase().split(' ')),
            preferredFeatures: this.extractFeatures(likedParkData)
        };
    }

    static calculateBehaviorMatch(park, patterns) {
        let score = 0.5; // Base score

        // State matching
        if (patterns.preferredStates.includes(park.state)) {
            score += 0.2;
        }

        // Search keyword matching
        const parkText = `${park.name} ${park.description} ${park.highlights}`.toLowerCase();
        const keywordMatches = patterns.searchKeywords.filter(keyword =>
            parkText.includes(keyword)
        ).length;

        if (keywordMatches > 0) {
            score += Math.min(keywordMatches * 0.1, 0.3);
        }

        return Math.min(score, 1);
    }

    static calculatePreferenceMatch(park, preferences) {
        const { activities, landscapes, difficulty, mood } = preferences;
        let score = 0;
        let maxScore = 0;

        const parkText = `${park.description} ${park.highlights}`.toLowerCase();

        // Activity matching
        if (activities && activities.length > 0) {
            maxScore += 0.4;
            const activityMatches = activities.filter(activity =>
                parkText.includes(activity.toLowerCase())
            ).length;
            score += (activityMatches / activities.length) * 0.4;
        }

        // Landscape matching
        if (landscapes && landscapes.length > 0) {
            maxScore += 0.3;
            const landscapeMatches = landscapes.filter(landscape =>
                parkText.includes(landscape.toLowerCase())
            ).length;
            score += (landscapeMatches / landscapes.length) * 0.3;
        }

        // Difficulty matching
        if (difficulty && difficulty !== 'any') {
            maxScore += 0.2;
            if (parkText.includes(difficulty)) {
                score += 0.2;
            }
        }

        // Mood matching
        if (mood) {
            maxScore += 0.1;
            const moodKeywords = {
                relaxation: ['peaceful', 'quiet', 'serene'],
                adventure: ['challenging', 'exciting', 'thrilling'],
                discovery: ['hidden', 'unique', 'rare'],
                social: ['family', 'group', 'popular'],
                photography: ['scenic', 'beautiful', 'stunning']
            };

            const keywords = moodKeywords[mood] || [];
            const moodMatches = keywords.filter(keyword => parkText.includes(keyword)).length;
            if (moodMatches > 0) {
                score += 0.1;
            }
        }

        return maxScore > 0 ? score / maxScore : 0;
    }

    static findSimilarUsers(userStats, communityProfiles) {
        // Simplified similarity calculation
        return Object.keys(communityProfiles).slice(0, 10);
    }

    static getParksFromSimilarUsers(similarUsers, userFavorites) {
        // Get parks favorited by similar users
        const parkCounts = {};

        similarUsers.forEach(userId => {
            const favorites = userFavorites[userId] || [];
            favorites.forEach(parkId => {
                parkCounts[parkId] = (parkCounts[parkId] || 0) + 1;
            });
        });

        // Return parks favorited by multiple similar users
        return Object.keys(parkCounts)
            .filter(parkId => parkCounts[parkId] >= 2)
            .slice(0, 10);
    }

    static extractStates(parks) {
        return [...new Set(parks.map(p => p.state).filter(Boolean))];
    }

    static extractFeatures(parks) {
        const features = [];
        parks.forEach(park => {
            const text = `${park.description} ${park.highlights}`.toLowerCase();
            if (text.includes('hiking')) features.push('hiking');
            if (text.includes('water')) features.push('water');
            if (text.includes('mountain')) features.push('mountain');
        });
        return [...new Set(features)];
    }

    static getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'Spring';
        if (month >= 5 && month <= 7) return 'Summer';
        if (month >= 8 && month <= 10) return 'Fall';
        return 'Winter';
    }

    static getWeatherContext() {
        return 'sunny'; // Would integrate with weather API
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

    static rankAndDeduplicateRecommendations(recommendations, favorites, userStats) {
        // Remove duplicates and favorites
        const seen = new Set(favorites);
        const unique = recommendations.filter(rec => {
            if (seen.has(rec.id)) return false;
            seen.add(rec.id);
            return true;
        });

        // Enhanced ranking based on user stats
        return unique
            .map(rec => ({
                ...rec,
                finalScore: this.calculateFinalScore(rec, userStats)
            }))
            .sort((a, b) => b.finalScore - a.finalScore)
            .slice(0, 16);
    }

    static calculateFinalScore(recommendation, userStats) {
        let score = recommendation.confidence || 80;

        // Boost based on recommendation type and user activity
        const typeBoosts = {
            'behavioral': 15,
            'preference-based': 12,
            'collaborative': 10,
            'contextual': 8,
            'discovery': 6
        };

        score += typeBoosts[recommendation.recommendationType] || 0;

        // Boost based on user engagement level
        if (userStats) {
            const engagementLevel = (userStats.totalInteractions || 0) / 10;
            score += Math.min(engagementLevel, 10);
        }

        return Math.min(score, 100);
    }
}

// ===== WEATHER SERVICE (for contextual recommendations) =====
export class WeatherService {
    static async getCurrentWeather(lat, lon) {
        try {
            // Would integrate with weather API like OpenWeatherMap
            // For now, return simulated data
            return {
                temperature: 72,
                condition: 'sunny',
                humidity: 45,
                windSpeed: 8,
                visibility: 10
            };
        } catch (error) {
            console.error('❌ Failed to get weather data:', error);
            return null;
        }
    }

    static async getWeatherForecast(lat, lon, days = 7) {
        try {
            // Would integrate with weather API
            return Array.from({ length: days }, (_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
                temperature: 70 + Math.random() * 20,
                condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
                precipitation: Math.random() * 0.5
            }));
        } catch (error) {
            console.error('❌ Failed to get weather forecast:', error);
            return [];
        }
    }
}

// ===== ANALYTICS SERVICE =====
export class AIAnalyticsService {
    static async trackRecommendationPerformance(userId, recommendationId, action) {
        try {
            const performanceRef = doc(collection(db, 'recommendationPerformance'));

            await setDoc(performanceRef, {
                userId,
                recommendationId,
                action, // 'view', 'click', 'like', 'dislike', 'plan_trip'
                timestamp: serverTimestamp()
            });

            // Log analytics
            logAnalyticsEvent('recommendation_performance', {
                user_id: userId,
                recommendation_id: recommendationId,
                action: action
            });

        } catch (error) {
            console.error('❌ Failed to track recommendation performance:', error);
        }
    }

    static async getRecommendationMetrics(timeframe = 'week') {
        try {
            // Get performance metrics for recommendations
            const metricsRef = collection(db, 'recommendationPerformance');
            const startDate = new Date();

            if (timeframe === 'week') {
                startDate.setDate(startDate.getDate() - 7);
            } else if (timeframe === 'month') {
                startDate.setMonth(startDate.getMonth() - 1);
            }

            const q = query(
                metricsRef,
                where('timestamp', '>=', startDate),
                orderBy('timestamp', 'desc')
            );

            const snapshot = await getDocs(q);
            const metrics = [];

            snapshot.forEach(doc => {
                metrics.push(doc.data());
            });

            return this.aggregateMetrics(metrics);
        } catch (error) {
            console.error('❌ Failed to get recommendation metrics:', error);
            return null;
        }
    }

    static aggregateMetrics(metrics) {
        const aggregated = {
            totalInteractions: metrics.length,
            clickThroughRate: 0,
            likeRate: 0,
            planTripRate: 0,
            byRecommendationType: {}
        };

        const actions = metrics.map(m => m.action);
        const views = actions.filter(a => a === 'view').length;
        const clicks = actions.filter(a => a === 'click').length;
        const likes = actions.filter(a => a === 'like').length;
        const planTrips = actions.filter(a => a === 'plan_trip').length;

        if (views > 0) {
            aggregated.clickThroughRate = (clicks / views) * 100;
            aggregated.likeRate = (likes / views) * 100;
            aggregated.planTripRate = (planTrips / views) * 100;
        }

        return aggregated;
    }
}

// ===== BATCH OPERATIONS SERVICE =====
export class BatchOperationsService {
    static async batchUpdateUserData(userId, updates) {
        try {
            const batch = writeBatch(db);

            // Update user preferences
            if (updates.preferences) {
                const prefsRef = doc(db, 'userPreferences', userId);
                batch.set(prefsRef, updates.preferences, { merge: true });
            }

            // Update user stats
            if (updates.stats) {
                const statsRef = doc(db, 'userStats', userId);
                batch.update(statsRef, updates.stats);
            }

            // Add interactions
            if (updates.interactions && updates.interactions.length > 0) {
                updates.interactions.forEach(interaction => {
                    const interactionRef = doc(collection(db, 'userInteractions'));
                    batch.set(interactionRef, {
                        userId,
                        ...interaction,
                        timestamp: serverTimestamp()
                    });
                });
            }

            await batch.commit();
            console.log('✅ Batch update completed');
            return true;

        } catch (error) {
            console.error('❌ Batch update failed:', error);
            handleFirebaseError(error, 'batchUpdateUserData');
            return false;
        }
    }
}

// ===== MAIN AI SERVICE FACADE =====
export class FirebaseAIService {

    // Initialize AI services for a user
    static async initializeForUser(userId) {
        try {
            console.log('🤖 Initializing AI services for user:', userId);

            // Check if user has preferences
            const preferences = await UserPreferencesService.getUserPreferences(userId);
            const stats = await UserInteractionService.getUserInteractionSummary(userId);

            // Set up analytics user
            logAnalyticsEvent('ai_service_initialized', {
                user_id: userId,
                has_preferences: !!preferences,
                has_stats: !!stats
            });

            return {
                hasPreferences: !!preferences,
                hasStats: !!stats,
                isNewUser: !preferences && !stats
            };

        } catch (error) {
            console.error('❌ Failed to initialize AI services:', error);
            return { hasPreferences: false, hasStats: false, isNewUser: true };
        }
    }

    // Get comprehensive AI recommendations
    static async getSmartRecommendations(userId, parks, favorites = [], forceRefresh = false) {
        try {
            console.log('🧠 Getting smart recommendations for user:', userId);

            // Check for cached recommendations first (unless force refresh)
            if (!forceRefresh) {
                const cached = await AIRecommendationService.getCachedRecommendations(userId);
                if (cached && cached.length > 0) {
                    console.log('⚡ Using cached recommendations');
                    return cached;
                }
            }

            // Generate fresh recommendations
            const recommendations = await AIRecommendationService.generateRecommendations(
                userId,
                parks,
                favorites
            );

            console.log('✅ Generated', recommendations.length, 'AI recommendations');
            return recommendations;

        } catch (error) {
            console.error('❌ Failed to get smart recommendations:', error);
            handleFirebaseError(error, 'getSmartRecommendations');
            return [];
        }
    }

    // Record user interaction with detailed context
    static async recordInteraction(userId, type, parkId, additionalData = {}) {
        try {
            const interactionData = {
                type,
                parkId,
                data: {
                    ...additionalData,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now(),
                    sessionId: UserInteractionService.getSessionId()
                }
            };

            await UserInteractionService.recordInteraction(userId, interactionData);

            // Track recommendation performance if applicable
            if (additionalData.recommendationId) {
                await AIAnalyticsService.trackRecommendationPerformance(
                    userId,
                    additionalData.recommendationId,
                    type
                );
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to record interaction:', error);
            return false;
        }
    }

    // Save user preferences from wizard
    static async savePreferences(userId, preferences) {
        try {
            const success = await UserPreferencesService.saveUserPreferences(userId, preferences);

            if (success) {
                // Invalidate cached recommendations to force refresh
                const recommendationsRef = doc(db, 'userRecommendations', userId);
                await updateDoc(recommendationsRef, {
                    expiresAt: new Date(0) // Force expiration
                });
            }

            return success;
        } catch (error) {
            console.error('❌ Failed to save preferences:', error);
            return false;
        }
    }

    // Get user's AI profile summary
    static async getUserAIProfile(userId) {
        try {
            const [preferences, stats, recentInteractions] = await Promise.all([
                UserPreferencesService.getUserPreferences(userId),
                UserInteractionService.getUserInteractionSummary(userId),
                UserInteractionService.getUserInteractionHistory(userId, 10)
            ]);

            return {
                preferences,
                stats,
                recentInteractions,
                aiPersonalizationScore: this.calculatePersonalizationScore(preferences, stats),
                learningProgress: this.calculateLearningProgress(stats, recentInteractions)
            };

        } catch (error) {
            console.error('❌ Failed to get user AI profile:', error);
            return null;
        }
    }

    // Calculate how personalized the AI is for this user
    static calculatePersonalizationScore(preferences, stats) {
        let score = 0;

        // Preferences contribution (0-40 points)
        if (preferences) {
            score += 20; // Base for having preferences
            if (preferences.activities && preferences.activities.length > 0) score += 10;
            if (preferences.landscapes && preferences.landscapes.length > 0) score += 5;
            if (preferences.difficulty && preferences.difficulty !== 'any') score += 3;
            if (preferences.mood) score += 2;
        }

        // Interaction history contribution (0-60 points)
        if (stats) {
            const interactions = stats.totalInteractions || 0;
            score += Math.min(interactions * 2, 30); // Up to 30 points for interactions

            if (stats.likeCount > 0) score += 10;
            if (stats.searchCount > 0) score += 10;
            if (stats.planTripCount > 0) score += 10;
        }

        return Math.min(score, 100);
    }

    // Calculate learning progress
    static calculateLearningProgress(stats, recentInteractions) {
        const progress = {
            level: 'Beginner',
            nextMilestone: 'Make 5 interactions',
            progressPercentage: 0
        };

        const totalInteractions = stats?.totalInteractions || 0;
        const recentActivity = recentInteractions?.length || 0;

        if (totalInteractions >= 50) {
            progress.level = 'Expert';
            progress.nextMilestone = 'AI fully personalized';
            progress.progressPercentage = 100;
        } else if (totalInteractions >= 20) {
            progress.level = 'Advanced';
            progress.nextMilestone = `${50 - totalInteractions} interactions to Expert`;
            progress.progressPercentage = 80;
        } else if (totalInteractions >= 10) {
            progress.level = 'Intermediate';
            progress.nextMilestone = `${20 - totalInteractions} interactions to Advanced`;
            progress.progressPercentage = 60;
        } else if (totalInteractions >= 5) {
            progress.level = 'Learning';
            progress.nextMilestone = `${10 - totalInteractions} interactions to Intermediate`;
            progress.progressPercentage = 40;
        } else {
            progress.progressPercentage = Math.min((totalInteractions / 5) * 40, 40);
        }

        return progress;
    }

    // Clean up old data (can be called periodically)
    static async cleanupOldData(userId, daysToKeep = 90) {
        try {
            const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

            // This would typically be done by a Cloud Function
            // For now, just log the intention
            console.log('🧹 Would cleanup data older than:', cutoffDate);

            return true;
        } catch (error) {
            console.error('❌ Failed to cleanup old data:', error);
            return false;
        }
    }
}
