// utils/firebaseIntegration.js - Helper functions for integrating with existing code
import EnhancedRecommendationsPage from "../pages/RecommendationsPage";

export class FirebaseIntegration {

    // Initialize Firebase AI for existing users
    static async migrateExistingUser(userId, existingFavorites = [], existingTrips = []) {
        try {
            console.log('🔄 Migrating existing user to AI system:', userId);

            // Initialize AI services
            const aiStatus = await FirebaseAIService.initializeForUser(userId);

            // Migrate existing favorites as interactions
            if (existingFavorites.length > 0) {
                const interactions = existingFavorites.map(parkId => ({
                    type: 'like',
                    parkId,
                    data: { source: 'migration', migrated: true }
                }));

                await BatchOperationsService.batchUpdateUserData(userId, { interactions });
            }

            // Migrate existing trips as plan_trip interactions
            if (existingTrips.length > 0) {
                const tripInteractions = existingTrips.map(trip => ({
                    type: 'planTrip',
                    parkId: trip.parkId,
                    data: { source: 'migration', tripData: trip }
                }));

                await BatchOperationsService.batchUpdateUserData(userId, {
                    interactions: tripInteractions
                });
            }

            console.log('✅ User migration completed');
            return aiStatus;

        } catch (error) {
            console.error('❌ User migration failed:', error);
            return { hasPreferences: false, hasStats: false, isNewUser: true };
        }
    }

    // Enhance existing park data with AI features
    static enhanceParksData(parks) {
        return parks.map(park => {
            const enhanced = AIIntegrationUtils.enhanceParkDataForAI(park);

            // Add Firebase-specific enhancements
            enhanced.firebaseId = park.id;
            enhanced.slug = park.slug || park.name?.toLowerCase().replace(/[^a-z0-9]/g, '-');
            enhanced.searchableText = `${park.name} ${park.description} ${park.highlights} ${park.state}`.toLowerCase();

            return enhanced;
        });
    }

    // Update existing favorites system to work with AI
    static async syncFavoritesWithAI(userId, favorites, parks) {
        try {
            // Record favorite actions as AI interactions
            for (const parkId of favorites) {
                await FirebaseAIService.recordInteraction(userId, 'like', parkId, {
                    source: 'existing_favorite',
                    timestamp: Date.now()
                });
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to sync favorites with AI:', error);
            return false;
        }
    }

    // Create AI-powered search suggestions
    static generateSmartSearchSuggestions(userPreferences, userInteractions) {
        return AIIntegrationUtils.generateSearchSuggestions(userInteractions, userPreferences);
    }

    // Get AI insights for existing park detail pages
    static async getAIInsightsForPark(userId, parkId) {
        try {
            const recommendations = await AIRecommendationService.getCachedRecommendations(userId);
            const recommendation = recommendations?.find(r => r.id === parkId);

            if (recommendation) {
                return {
                    confidence: recommendation.confidence,
                    reason: recommendation.reason,
                    category: recommendation.category,
                    aiInsight: recommendation.aiInsight,
                    matchingFeatures: recommendation.matchingFeatures || [],
                    recommendationType: recommendation.recommendationType
                };
            }

            return null;
        } catch (error) {
            console.error('❌ Failed to get AI insights for park:', error);
            return null;
        }
    }
}

// Example of how to update your existing park detail page
export const EnhancedParkDetailPage = ({ park, isFavorite, onToggleFavorite }) => {
    const { currentUser } = useAuth();
    const { getParkAIInsights } = useAI();
    const { trackParkView, trackTimeSpent } = useAIInteractions();

    const [aiInsights, setAIInsights] = useState(null);
    const [viewStartTime] = useState(Date.now());

    // Track park view and get AI insights
    useEffect(() => {
        if (currentUser && park) {
            // Track view
            trackParkView(park.id, { source: 'park_detail' });

            // Get AI insights
            getParkAIInsights(park.id).then(setAIInsights);
        }

        // Track time spent when component unmounts
        return () => {
            if (currentUser && park) {
                const timeSpent = Math.round((Date.now() - viewStartTime) / 1000);
                trackTimeSpent(park.id, timeSpent, { source: 'park_detail' });
            }
        };
    }, [currentUser, park, trackParkView, getParkAIInsights, trackTimeSpent, viewStartTime]);

    return (
        <div className="park-detail-page">
            {/* Your existing park detail content */}

            {/* Add AI insights section */}
            {aiInsights && (
                <div className="mt-8 bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-500 p-3 rounded-xl text-white">
                            <FaBrain />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-purple-800">AI Insights</h3>
                            <p className="text-purple-600">Why our AI thinks you'll love this park</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg">
                            <div className="font-medium text-purple-800 mb-2">
                                AI Confidence: {aiInsights.confidence}%
                            </div>
                            <div className="text-purple-700">{aiInsights.reason}</div>
                        </div>

                        {aiInsights.matchingFeatures?.length > 0 && (
                            <div className="bg-white p-4 rounded-lg">
                                <div className="font-medium text-purple-800 mb-2">Matches Your Interests:</div>
                                <div className="flex flex-wrap gap-2">
                                    {aiInsights.matchingFeatures.map((feature, index) => (
                                        <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      ✓ {feature}
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Integration checklist
export const IntegrationChecklist = {
    steps: [
        {
            step: 1,
            title: "Add AI Provider to App.js",
            description: "Wrap your app with AIProvider after AuthProvider",
            code: `<AIProvider><YourApp /></AIProvider>`,
            status: "required"
        },
        {
            step: 2,
            title: "Create Firebase AI Services",
            description: "Add the aiRecommendationService.js file to your services folder",
            files: ["services/aiRecommendationService.js"],
            status: "required"
        },
        {
            step: 3,
            title: "Add AI Context and Hooks",
            description: "Add AIContext.js and AI hooks to your project",
            files: ["context/AIContext.js", "hooks/useAIRecommendations.js"],
            status: "required"
        },
        {
            step: 4,
            title: "Update Recommendations Page",
            description: "Replace existing recommendations with EnhancedRecommendationsPage",
            files: ["pages/EnhancedRecommendationsPage.js"],
            status: "required"
        },
        {
            step: 5,
            title: "Add AI Components",
            description: "Add AIStatusIndicator and other AI components",
            files: ["components/AIStatusIndicator.js", "components/RecommendationInsights.js"],
            status: "recommended"
        },
        {
            step: 6,
            title: "Migrate Existing Users",
            description: "Run migration for existing users with favorites and trips",
            code: `FirebaseIntegration.migrateExistingUser(userId, favorites, trips)`,
            status: "recommended"
        },
        {
            step: 7,
            title: "Enhance Park Detail Pages",
            description: "Add AI insights to existing park detail pages",
            code: `const insights = await getParkAIInsights(parkId)`,
            status: "optional"
        },
        {
            step: 8,
            title: "Add Analytics Tracking",
            description: "Ensure Firebase Analytics is tracking AI interactions",
            status: "optional"
        }
    ]
};

export default {
    EnhancedRecommendationsPage,
    EnhancedRecommendationCard,
    FirebaseIntegration,
    EnhancedParkDetailPage,
    IntegrationChecklist
};