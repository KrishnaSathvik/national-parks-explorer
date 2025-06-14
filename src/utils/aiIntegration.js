// utils/aiIntegration.js - Utility functions for AI integration
export class AIIntegrationUtils {

    // Enhanced park data with AI-friendly features
    static enhanceParkDataForAI(park) {
        const enhanced = { ...park };

        // Extract features for AI analysis
        const description = (park.description || '').toLowerCase();
        const highlights = (park.highlights || '').toLowerCase();
        const fullText = `${description} ${highlights}`;

        // Add AI-friendly features
        enhanced.aiFeatures = {
            hasHiking: fullText.includes('hik') || fullText.includes('trail'),
            hasWater: fullText.includes('water') || fullText.includes('lake') || fullText.includes('river'),
            hasMountains: fullText.includes('mountain') || fullText.includes('peak'),
            hasDesert: fullText.includes('desert'),
            hasForest: fullText.includes('forest') || fullText.includes('tree'),
            hasWildlife: fullText.includes('wildlife') || fullText.includes('animal'),
            hasCamping: fullText.includes('camp'),
            hasPhotography: fullText.includes('scenic') || fullText.includes('photo'),
            difficulty: this.extractDifficulty(fullText),
            activities: this.extractActivities(fullText),
            landscapes: this.extractLandscapes(fullText)
        };

        return enhanced;
    }

    // Extract difficulty level from text
    static extractDifficulty(text) {
        if (text.includes('challenging') || text.includes('difficult') || text.includes('strenuous')) {
            return 'hard';
        } else if (text.includes('moderate') || text.includes('intermediate')) {
            return 'moderate';
        } else if (text.includes('easy') || text.includes('accessible')) {
            return 'easy';
        }
        return 'unknown';
    }

    // Extract activities from text
    static extractActivities(text) {
        const activities = [];

        if (text.includes('hik')) activities.push('hiking');
        if (text.includes('photo') || text.includes('scenic')) activities.push('photography');
        if (text.includes('wildlife') || text.includes('animal')) activities.push('wildlife');
        if (text.includes('camp')) activities.push('camping');
        if (text.includes('climb')) activities.push('climbing');
        if (text.includes('swim') || text.includes('water')) activities.push('water');
        if (text.includes('cycl') || text.includes('bike')) activities.push('cycling');
        if (text.includes('star') || text.includes('night')) activities.push('stargazing');

        return activities;
    }

    // Extract landscape types from text
    static extractLandscapes(text) {
        const landscapes = [];

        if (text.includes('mountain') || text.includes('peak')) landscapes.push('mountains');
        if (text.includes('desert')) landscapes.push('desert');
        if (text.includes('forest') || text.includes('tree')) landscapes.push('forest');
        if (text.includes('coast') || text.includes('ocean')) landscapes.push('coast');
        if (text.includes('canyon')) landscapes.push('canyon');
        if (text.includes('lake')) landscapes.push('lake');
        if (text.includes('prairie') || text.includes('grass')) landscapes.push('prairie');
        if (text.includes('volcano')) landscapes.push('volcano');

        return landscapes;
    }

    // Process parks array for AI
    static enhanceParksForAI(parks) {
        return parks.map(park => this.enhanceParkDataForAI(park));
    }

    // Create search query suggestions based on user interactions
    static generateSearchSuggestions(userInteractions, userPreferences) {
        const suggestions = [];

        // Base suggestions
        const baseSuggestions = [
            "Parks like Yellowstone but less crowded",
            "Best photography spots in California",
            "Family-friendly hiking trails",
            "Hidden gems for camping",
            "Winter activities in national parks"
        ];

        suggestions.push(...baseSuggestions);

        // Personalized suggestions based on preferences
        if (userPreferences) {
            const { activities = [], landscapes = [], mood } = userPreferences;

            if (activities.includes('hiking')) {
                suggestions.push("Best hiking trails for beginners");
                suggestions.push("Challenging mountain hikes");
            }

            if (activities.includes('photography')) {
                suggestions.push("Parks with stunning sunrise views");
                suggestions.push("Best wildlife photography locations");
            }

            if (landscapes.includes('desert')) {
                suggestions.push("Most beautiful desert landscapes");
                suggestions.push("Desert parks with unique rock formations");
            }

            if (mood === 'relaxation') {
                suggestions.push("Peaceful parks for meditation");
                suggestions.push("Quiet spots away from crowds");
            }
        }

        // Suggestions based on interactions
        if (userInteractions && userInteractions.length > 0) {
            const searchedTerms = userInteractions
                .filter(i => i.type === 'search')
                .map(i => i.data?.query)
                .filter(Boolean);

            // Add variations of previously searched terms
            searchedTerms.forEach(term => {
                suggestions.push(`${term} with fewer crowds`);
                suggestions.push(`${term} for beginners`);
            });
        }
        // Remove duplicates and limit
        return [...new Set(suggestions)].slice(0, 8);
    }

// Format recommendation data for display
    static formatRecommendationForDisplay(recommendation) {
        return {
            ...recommendation,
            formattedConfidence: `${recommendation.confidence}%`,
            formattedCategory: recommendation.category?.replace(/([A-Z])/g, ' $1').trim(),
            displayReason: this.truncateReason(recommendation.reason, 100),
            hasAIInsights: !!(recommendation.aiInsight || recommendation.matchingFeatures),
            badgeColor: this.getCategoryBadgeColor(recommendation.category),
            priorityScore: this.calculateDisplayPriority(recommendation)
        };
    }

// Truncate reason text for display
    static truncateReason(reason, maxLength) {
        if (!reason || reason.length <= maxLength) return reason;
        return reason.substring(0, maxLength).trim() + '...';
    }

// Get badge color for category
    static getCategoryBadgeColor(category) {
        const colorMap = {
            'Learned from Your Behavior': 'bg-indigo-100 text-indigo-800',
            'Your Perfect Match': 'bg-emerald-100 text-emerald-800',
            'Community Favorites': 'bg-blue-100 text-blue-800',
            'Perfect Timing': 'bg-orange-100 text-orange-800',
            'New Horizons': 'bg-pink-100 text-pink-800',
            'Level Up': 'bg-purple-100 text-purple-800',
            'Hidden Gems': 'bg-yellow-100 text-yellow-800',
            'Seasonal Perfect': 'bg-green-100 text-green-800'
        };

        return colorMap[category] || 'bg-gray-100 text-gray-800';
    }

// Calculate display priority for sorting
    static calculateDisplayPriority(recommendation) {
        let priority = recommendation.confidence || 0;

        // Boost certain recommendation types
        const typeBoosts = {
            'behavioral': 20,
            'preference-based': 15,
            'collaborative': 10,
            'contextual': 8,
            'discovery': 5
        };

        priority += typeBoosts[recommendation.recommendationType] || 0;

        // Boost if has additional AI insights
        if (recommendation.aiInsight) priority += 5;
        if (recommendation.matchingFeatures?.length > 0) priority += 3;

        return priority;
    }

// Generate personalized park descriptions
    static generatePersonalizedDescription(park, userPreferences, userInteractions) {
        const baseDescription = park.description || '';
        let personalizedElements = [];

        // Add personalized highlights based on user preferences
        if (userPreferences) {
            const { activities = [], landscapes = [], mood } = userPreferences;

            // Activity-based personalization
            if (activities.includes('hiking') && baseDescription.toLowerCase().includes('trail')) {
                personalizedElements.push('🥾 Perfect for your love of hiking');
            }

            if (activities.includes('photography') && baseDescription.toLowerCase().includes('scenic')) {
                personalizedElements.push('📸 Amazing photography opportunities await');
            }

            if (activities.includes('wildlife') && baseDescription.toLowerCase().includes('animal')) {
                personalizedElements.push('🦌 Great wildlife viewing matches your interests');
            }

            // Landscape-based personalization
            if (landscapes.includes('mountains') && baseDescription.toLowerCase().includes('mountain')) {
                personalizedElements.push('⛰️ Mountain scenery you love');
            }

            if (landscapes.includes('water') && baseDescription.toLowerCase().includes('lake')) {
                personalizedElements.push('🏞️ Beautiful water features');
            }

            // Mood-based personalization
            if (mood === 'relaxation' && baseDescription.toLowerCase().includes('peaceful')) {
                personalizedElements.push('🧘‍♀️ Perfect for relaxation and peace');
            }

            if (mood === 'adventure' && baseDescription.toLowerCase().includes('challenging')) {
                personalizedElements.push('🚀 Exciting adventures match your mood');
            }
        }

        // Add interaction-based personalization
        if (userInteractions && userInteractions.length > 0) {
            const searchedTerms = userInteractions
                .filter(i => i.type === 'search')
                .map(i => i.data?.query)
                .filter(Boolean);

            searchedTerms.forEach(term => {
                if (baseDescription.toLowerCase().includes(term.toLowerCase())) {
                    personalizedElements.push(`🔍 Matches your search for "${term}"`);
                }
            });
        }

        return {
            originalDescription: baseDescription,
            personalizedElements: personalizedElements.slice(0, 3), // Limit to 3 elements
            hasPersonalization: personalizedElements.length > 0
        };
    }

// Calculate park compatibility score
    static calculateParkCompatibility(park, userProfile) {
        const { preferences = {}, interactions = [], stats = {} } = userProfile;
        let compatibilityScore = 0;
        let maxScore = 0;

        const parkText = `${park.name} ${park.description} ${park.highlights}`.toLowerCase();

        // Preference compatibility (40% of score)
        if (preferences.activities) {
            maxScore += 40;
            const matchingActivities = preferences.activities.filter(activity =>
                parkText.includes(activity.toLowerCase())
            );
            compatibilityScore += (matchingActivities.length / preferences.activities.length) * 40;
        }

        // Interaction history compatibility (30% of score)
        if (interactions.length > 0) {
            maxScore += 30;
            const likedParks = interactions.filter(i => i.type === 'like').map(i => i.parkId);
            const likedFeatures = this.extractCommonFeatures(likedParks, [park]);
            compatibilityScore += likedFeatures.similarity * 30;
        }

        // User stats compatibility (30% of score)
        if (stats.preferredActivities) {
            maxScore += 30;
            const userTopActivities = Object.keys(stats.preferredActivities)
                .sort((a, b) => stats.preferredActivities[b] - stats.preferredActivities[a])
                .slice(0, 3);

            const matchingTopActivities = userTopActivities.filter(activity =>
                parkText.includes(activity)
            );
            compatibilityScore += (matchingTopActivities.length / userTopActivities.length) * 30;
        }

        return maxScore > 0 ? (compatibilityScore / maxScore) * 100 : 0;
    }

// Extract common features from user's liked parks
    static extractCommonFeatures(likedParkIds, allParks) {
        const likedParks = allParks.filter(park => likedParkIds.includes(park.id));

        if (likedParks.length === 0) {
            return { features: [], similarity: 0 };
        }

        const commonFeatures = {
            hasHiking: 0,
            hasWater: 0,
            hasMountains: 0,
            hasDesert: 0,
            hasForest: 0,
            hasWildlife: 0,
            hasCamping: 0,
            hasPhotography: 0
        };

        likedParks.forEach(park => {
            const text = `${park.description} ${park.highlights}`.toLowerCase();
            if (text.includes('hik') || text.includes('trail')) commonFeatures.hasHiking++;
            if (text.includes('water') || text.includes('lake')) commonFeatures.hasWater++;
            if (text.includes('mountain')) commonFeatures.hasMountains++;
            if (text.includes('desert')) commonFeatures.hasDesert++;
            if (text.includes('forest')) commonFeatures.hasForest++;
            if (text.includes('wildlife')) commonFeatures.hasWildlife++;
            if (text.includes('camp')) commonFeatures.hasCamping++;
            if (text.includes('scenic') || text.includes('photo')) commonFeatures.hasPhotography++;
        });

        // Normalize features
        Object.keys(commonFeatures).forEach(feature => {
            commonFeatures[feature] = commonFeatures[feature] / likedParks.length;
        });

        return {
            features: commonFeatures,
            similarity: Object.values(commonFeatures).reduce((sum, val) => sum + val, 0) / Object.keys(commonFeatures).length
        };
    }

// Generate AI-powered park recommendations explanation
    static generateRecommendationExplanation(park, userProfile, recommendationType) {
        const explanations = {
            behavioral: [
                `Based on your browsing patterns, you tend to spend more time on parks similar to ${park.name}`,
                `Your interaction history suggests you'll enjoy the ${this.extractPrimaryFeature(park)} at ${park.name}`,
                `You've shown interest in parks with similar features to ${park.name}`
            ],

            'preference-based': [
                `This perfectly matches your stated preferences for ${this.getUserTopPreferences(userProfile)}`,
                `${park.name} aligns with your preferred activities and landscapes`,
                `Your preference profile strongly suggests you'll love ${park.name}`
            ],

            collaborative: [
                `Users with similar tastes have highly rated ${park.name}`,
                `People who like your favorite parks also recommend ${park.name}`,
                `${park.name} is popular among users with preferences similar to yours`
            ],

            contextual: [
                `Perfect timing to visit ${park.name} based on current season and conditions`,
                `${park.name} is at its best right now for your preferred activities`,
                `Current weather and seasonal conditions make ${park.name} ideal`
            ],

            discovery: [
                `${park.name} offers new experiences different from your usual preferences`,
                `Expand your horizons with the unique features of ${park.name}`,
                `${park.name} provides adventures you haven't explored yet`
            ]
        };

        const typeExplanations = explanations[recommendationType] || explanations.behavioral;
        return typeExplanations[Math.floor(Math.random() * typeExplanations.length)];
    }

// Extract primary feature of a park
    static extractPrimaryFeature(park) {
        const text = `${park.description} ${park.highlights}`.toLowerCase();

        if (text.includes('mountain')) return 'mountain scenery';
        if (text.includes('water') || text.includes('lake')) return 'water features';
        if (text.includes('desert')) return 'desert landscapes';
        if (text.includes('forest')) return 'forest environments';
        if (text.includes('wildlife')) return 'wildlife opportunities';
        if (text.includes('hik')) return 'hiking trails';
        if (text.includes('scenic')) return 'scenic beauty';

        return 'natural beauty';
    }

// Get user's top preferences summary
    static getUserTopPreferences(userProfile) {
        const { preferences = {} } = userProfile;
        const summary = [];

        if (preferences.activities && preferences.activities.length > 0) {
            summary.push(preferences.activities.slice(0, 2).join(' and '));
        }

        if (preferences.landscapes && preferences.landscapes.length > 0) {
            summary.push(preferences.landscapes.slice(0, 2).join(' and '));
        }

        return summary.join(' in ') || 'outdoor activities';
    }

// Generate smart filters based on user behavior
    static generateSmartFilters(userProfile, allParks) {
        const filters = {
            recommended: [],
            popular: [],
            hidden: []
        };

        // Recommended filters based on user preferences
        if (userProfile.preferences) {
            const { activities = [], landscapes = [], difficulty } = userProfile.preferences;

            activities.forEach(activity => {
                filters.recommended.push({
                    name: `Best for ${activity}`,
                    filter: (park) => {
                        const text = `${park.description} ${park.highlights}`.toLowerCase();
                        return text.includes(activity.toLowerCase());
                    },
                    icon: this.getActivityIcon(activity),
                    count: 0
                });
            });

            landscapes.forEach(landscape => {
                filters.recommended.push({
                    name: `${landscape} landscapes`,
                    filter: (park) => {
                        const text = `${park.description} ${park.highlights}`.toLowerCase();
                        return text.includes(landscape.toLowerCase());
                    },
                    icon: this.getLandscapeIcon(landscape),
                    count: 0
                });
            });

            if (difficulty && difficulty !== 'any') {
                filters.recommended.push({
                    name: `${difficulty} difficulty`,
                    filter: (park) => {
                        const text = `${park.description} ${park.highlights}`.toLowerCase();
                        return text.includes(difficulty.toLowerCase());
                    },
                    icon: this.getDifficultyIcon(difficulty),
                    count: 0
                });
            }
        }

        // Popular filters based on community data
        filters.popular = [
            {
                name: 'Most visited',
                filter: (park) => ['Yellowstone', 'Yosemite', 'Grand Canyon'].some(popular =>
                    park.name?.includes(popular)
                ),
                icon: '🔥',
                count: 0
            },
            {
                name: 'Family friendly',
                filter: (park) => {
                    const text = `${park.description} ${park.highlights}`.toLowerCase();
                    return text.includes('family') || text.includes('easy') || text.includes('accessible');
                },
                icon: '👨‍👩‍👧‍👦',
                count: 0
            },
            {
                name: 'Photography hotspots',
                filter: (park) => {
                    const text = `${park.description} ${park.highlights}`.toLowerCase();
                    return text.includes('scenic') || text.includes('photo') || text.includes('view');
                },
                icon: '📸',
                count: 0
            }
        ];

        // Hidden gems filters
        filters.hidden = [
            {
                name: 'Hidden gems',
                filter: (park) => {
                    const popularParks = ['Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion'];
                    return !popularParks.some(popular => park.name?.includes(popular));
                },
                icon: '💎',
                count: 0
            },
            {
                name: 'Less crowded',
                filter: (park) => {
                    const text = `${park.description} ${park.highlights}`.toLowerCase();
                    return text.includes('quiet') || text.includes('peaceful') || text.includes('remote');
                },
                icon: '🤫',
                count: 0
            }
        ];

        // Calculate counts for each filter
        Object.keys(filters).forEach(category => {
            filters[category].forEach(filter => {
                filter.count = allParks.filter(filter.filter).length;
            });
        });

        return filters;
    }

// Get icon for activity
    static getActivityIcon(activity) {
        const icons = {
            hiking: '🥾',
            photography: '📸',
            wildlife: '🦌',
            camping: '⛺',
            climbing: '🧗‍♂️',
            water: '🏊‍♂️',
            cycling: '🚴‍♂️',
            stargazing: '⭐'
        };
        return icons[activity] || '🏃‍♂️';
    }

// Get icon for landscape
    static getLandscapeIcon(landscape) {
        const icons = {
            mountains: '⛰️',
            desert: '🏜️',
            forest: '🌲',
            coast: '🌊',
            canyon: '🏔️',
            lake: '🏞️',
            prairie: '🌾',
            volcano: '🌋'
        };
        return icons[landscape] || '🏞️';
    }

// Get icon for difficulty
    static getDifficultyIcon(difficulty) {
        const icons = {
            easy: '🚶‍♂️',
            moderate: '🥾',
            hard: '🏔️'
        };
        return icons[difficulty] || '🎯';
    }

// Create AI-powered park comparison
    static compareParksByAI(parks, userProfile) {
        return parks.map(park => ({
            ...park,
            aiScore: this.calculateParkCompatibility(park, userProfile),
            personalizedDescription: this.generatePersonalizedDescription(park, userProfile.preferences, userProfile.interactions),
            recommendationStrength: this.calculateRecommendationStrength(park, userProfile),
            uniqueSellingPoints: this.extractUniqueSellingPoints(park, parks)
        }));
    }

// Calculate recommendation strength
    static calculateRecommendationStrength(park, userProfile) {
        const compatibility = this.calculateParkCompatibility(park, userProfile);

        if (compatibility >= 80) return 'Excellent Match';
        if (compatibility >= 60) return 'Great Match';
        if (compatibility >= 40) return 'Good Match';
        if (compatibility >= 20) return 'Fair Match';
        return 'Potential Interest';
    }

// Extract unique selling points of a park
    static extractUniqueSellingPoints(park, allParks) {
        const points = [];
        const parkText = `${park.description} ${park.highlights}`.toLowerCase();

        // Check for unique features
        const uniqueFeatures = [
            { keyword: 'geyser', point: 'Unique geothermal features' },
            { keyword: 'sequoia', point: 'Giant ancient trees' },
            { keyword: 'arch', point: 'Natural rock formations' },
            { keyword: 'canyon', point: 'Dramatic canyon views' },
            { keyword: 'glacier', point: 'Glacial landscapes' },
            { keyword: 'hot spring', point: 'Natural hot springs' },
            { keyword: 'waterfall', point: 'Stunning waterfalls' },
            { keyword: 'volcano', point: 'Volcanic landscapes' }
        ];

        uniqueFeatures.forEach(feature => {
            if (parkText.includes(feature.keyword)) {
                points.push(feature.point);
            }
        });

        // Add accessibility points
        if (parkText.includes('accessible') || parkText.includes('easy')) {
            points.push('Accessible for all visitors');
        }

        // Add seasonal points
        if (parkText.includes('year-round')) {
            points.push('Great year-round destination');
        }

        return points.slice(0, 3); // Limit to top 3 points
    }

// Generate AI insights for park recommendations
    static generateAIInsights(recommendations, userProfile) {
        const insights = {
            totalRecommendations: recommendations.length,
            personalizedCount: recommendations.filter(r => r.recommendationType === 'preference-based' || r.recommendationType === 'behavioral').length,
            avgConfidence: Math.round(recommendations.reduce((sum, r) => sum + (r.confidence || 0), 0) / recommendations.length),
            topCategories: this.getTopCategories(recommendations),
            learningStatus: this.calculateLearningStatus(userProfile),
            improvementTips: this.generateImprovementTips(userProfile, recommendations)
        };

        return insights;
    }

// Get top recommendation categories
    static getTopCategories(recommendations) {
        const categoryCount = {};
        recommendations.forEach(rec => {
            categoryCount[rec.category] = (categoryCount[rec.category] || 0) + 1;
        });

        return Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category, count]) => ({ category, count }));
    }

// Calculate AI learning status
    static calculateLearningStatus(userProfile) {
        const { interactions = [], preferences = {}, stats = {} } = userProfile;

        const interactionCount = interactions.length;
        const hasPreferences = Object.keys(preferences).length > 0;
        const totalStats = stats.totalInteractions || 0;

        if (totalStats >= 50) {
            return { level: 'Expert', description: 'AI fully personalized', percentage: 100 };
        } else if (totalStats >= 20) {
            return { level: 'Advanced', description: 'High personalization', percentage: 80 };
        } else if (totalStats >= 10) {
            return { level: 'Learning', description: 'Good personalization', percentage: 60 };
        } else if (hasPreferences) {
            return { level: 'Beginner', description: 'Basic personalization', percentage: 40 };
        } else {
            return { level: 'New', description: 'Setup needed', percentage: 10 };
        }
    }

// Fix for the end of your aiIntegration.js file
// Replace lines 719-725 with this:

    static generateImprovementTips(userProfile, recommendations) {
        const tips = [];
        const { interactions = [], preferences = {}, stats = {} } = userProfile;

        // Preference tips
        if (!preferences || Object.keys(preferences).length === 0) {
            tips.push({
                type: 'setup',
                title: 'Set Your Preferences',
                description: 'Complete the AI preference wizard to get highly personalized recommendations',
                action: 'Open Preference Wizard',
                priority: 'high'
            });
        }

        // Interaction tips
        if (interactions.length < 10) {
            tips.push({
                type: 'interaction',
                title: 'Interact More',
                description: 'Like, view, and search for parks to help AI learn your preferences',
                action: 'Explore Parks',
                priority: 'medium'
            });
        }

        // Feedback tips
        const feedbackCount = interactions.filter(i => i.type === 'like' || i.type === 'dislike').length;
        if (feedbackCount < 5) {
            tips.push({
                type: 'feedback',
                title: 'Provide Feedback',
                description: 'Use the like/dislike buttons on recommendations to improve accuracy',
                action: 'Rate Recommendations',
                priority: 'medium'
            });
        }

        // Search tips
        const searchCount = interactions.filter(i => i.type === 'search').length;
        if (searchCount === 0) {
            tips.push({
                type: 'search',
                title: 'Try Smart Search',
                description: 'Use natural language to search for parks and help AI understand your interests',
                action: 'Use Smart Search',
                priority: 'low'
            });
        }

        return tips.sort((a, b) => {
            const priority = { high: 3, medium: 2, low: 1 };
            return priority[b.priority] - priority[a.priority];
        }).slice(0, 3);
    }
} // ← CLOSE THE CLASS HERE

// ===== EXPORTS ===== (Move exports OUTSIDE the class)
export { AIIntegrationUtils };

// Default export
export default AIIntegrationUtils;