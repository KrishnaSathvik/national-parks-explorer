// ✨ FIXED App.jsx - Safe Toast Hook Usage
import React, {lazy, Suspense, useCallback, useEffect, useState} from "react";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {createPerformanceTrace, db, handleFirebaseError, logAnalyticsEvent, messaging, performance} from './firebase';
import {onMessage} from 'firebase/messaging';
import InstallButton from './components/InstallButton';
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import PrivateRoute from "./components/PrivateRoute";
import Favorites from "./pages/Favorites";
import useIsMobile from "./hooks/useIsMobile";
import BottomNav from "./components/BottomNav";
import AppIntegration from './components/AppIntegration';
import {enhanceParkData} from './utils/parkDataHelpers';
import {SkeletonCard, SkeletonHero} from "./components/SkeletonLoader";
import FadeInWrapper from "./components/FadeInWrapper";

import {
    arrayRemove,
    arrayUnion,
    collection,
    disableNetwork,
    doc,
    enableNetwork,
    getDoc,
    getDocs,
    setDoc,
    updateDoc
} from "firebase/firestore";
import {useAuth} from "./context/AuthContext";
// ✅ FIX: Move toast imports inside the component that needs them
import Layout from "./components/Layout";

// ✅ Enhanced lazy-loaded pages with loading fallbacks
const Home = lazy(() => import("./pages/Home"));
const ParkDetails = lazy(() => import("./pages/ParkDetails"));
const MapPage = lazy(() => import("./pages/MapPage"));
const CalendarView = lazy(() => import("./pages/CalendarView"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const UserAccount = lazy(() => import("./pages/UserAccount"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));
const SeasonalPage = lazy(() => import("./pages/SeasonalPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));

// ✅ Enhanced admin lazy-loaded components
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminRoute = lazy(() => import("./admin/AdminRoute"));
const AdminPage = lazy(() => import("./admin/AdminPage"));
const AdminBlogEditor = lazy(() => import("./admin/AdminBlogEditor"));
const EditBlog = lazy(() => import("./admin/EditBlog"));

// Enhanced Error Boundary Component
class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false, error: null, errorInfo: null};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to analytics
        if (typeof logAnalyticsEvent === 'function') {
            logAnalyticsEvent('app_error', {
                error_message: error.message,
                error_stack: error.stack,
                component_stack: errorInfo.componentStack
            });
        }

        console.error('🔥 App Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-4">🚨</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please refresh the page to continue.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Show Error Details (Development)
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  {this.state.error && this.state.error.toString()}
                                    <br/>
                                    {this.state.errorInfo.componentStack}
                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Enhanced Loading Component with multiple states
const AppLoadingFallback = ({type = "page"}) => {
    const {isMobile} = useIsMobile();

    const loadingComponents = {
        page: (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <FadeInWrapper>
                        <SkeletonHero/>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {Array.from({length: isMobile ? 3 : 6}).map((_, i) => (
                                <SkeletonCard key={i}/>
                            ))}
                        </div>
                    </FadeInWrapper>
                </div>
            </div>
        ),
        component: (
            <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    <span className="text-gray-600">Loading...</span>
                </div>
            </div>
        ),
        minimal: (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse">
                    <div className="text-4xl mb-4">🏞️</div>
                    <div className="text-lg text-gray-600">Loading National Parks Explorer...</div>
                </div>
            </div>
        )
    };

    return loadingComponents[type] || loadingComponents.page;
};

function App() {
    // ✅ FIX: Import toast hooks inside the component
    const {useToast, useAppToasts} = React.useMemo(() => {
        try {
            const toastModule = require("./context/ToastContext");
            return {
                useToast: toastModule.useToast,
                useAppToasts: toastModule.useAppToasts
            };
        } catch (error) {
            console.warn('Toast context not available:', error);
            return {
                useToast: () => ({
                    showToast: (message, type) => console.log(`Toast: ${message} (${type})`),
                    showOfflineToast: () => console.log('Offline'),
                    showOnlineToast: () => console.log('Online')
                }),
                useAppToasts: () => ({
                    favorite: (message) => console.log(`Favorite: ${message}`)
                })
            };
        }
    }, []);

    // ✅ FIX: Now safely use the hooks
    const {showToast, showOfflineToast, showOnlineToast} = useToast();
    const {favorite: showFavoriteToast} = useAppToasts();

    // Enhanced state management
    const [parks, setParks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [appState, setAppState] = useState({
        isLoading: true,
        isOnline: navigator.onLine,
        hasError: false,
        retryCount: 0
    });

    // Enhanced hooks
    const {currentUser, isAdmin, loading: authLoading} = useAuth();
    const {
        isMobile,
        shouldOptimize,
        isSlowNetwork,
        hasTouch,
        networkType
    } = useIsMobile();

    const location = useLocation();
    const navigate = useNavigate();

    // Enhanced navigation logic
    const hiddenRoutes = ["/login", "/signup", "/admin/login"];
    const shouldHideBottomNav =
        hiddenRoutes.some(path => location.pathname.startsWith(path)) ||
        (location.pathname === "/" && !currentUser);

    // Performance monitoring
    useEffect(() => {
        const trace = createPerformanceTrace('app_initialization');
        trace?.start();

        return () => {
            trace?.stop();
        };
    }, []);

    // Enhanced parks data fetching with retry logic
    const fetchParks = useCallback(async (retryCount = 0) => {
        const maxRetries = 3;

        try {
            setAppState(prev => ({...prev, isLoading: true, hasError: false}));

            console.log('🔄 Fetching parks data...');
            const snapshot = await getDocs(collection(db, "parks"));
            const rawData = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

            // Enhanced park data processing
            const enhancedData = rawData.map(park => enhanceParkData(park));

            // Sort parks for better user experience
            const sortedParks = enhancedData.sort((a, b) => {
                // Prioritize parks with more complete data
                const scoreA = (a.description ? 1 : 0) + (a.coordinates ? 1 : 0) + (a.bestSeason ? 1 : 0);
                const scoreB = (b.description ? 1 : 0) + (b.coordinates ? 1 : 0) + (b.bestSeason ? 1 : 0);

                if (scoreA !== scoreB) return scoreB - scoreA;
                return a.name.localeCompare(b.name);
            });

            setParks(sortedParks);
            setAppState(prev => ({...prev, isLoading: false, retryCount: 0}));

            console.log('✅ Enhanced parks data loaded:', sortedParks.length, 'parks');

            // Analytics tracking
            logAnalyticsEvent('parks_data_loaded', {
                parks_count: sortedParks.length,
                load_time: performance.now(),
                network_type: networkType,
                retry_count: retryCount
            });

        } catch (error) {
            console.error('❌ Error fetching parks:', error);

            const friendlyError = handleFirebaseError(error, 'parks data loading');

            if (retryCount < maxRetries) {
                console.log(`🔄 Retrying parks fetch (${retryCount + 1}/${maxRetries})`);
                setTimeout(() => {
                    fetchParks(retryCount + 1);
                }, Math.pow(2, retryCount) * 1000); // Exponential backoff

                setAppState(prev => ({...prev, retryCount: retryCount + 1}));
            } else {
                setAppState(prev => ({...prev, isLoading: false, hasError: true}));
                showToast(friendlyError.message, "error");
            }
        }
    }, [showToast, networkType]);

    // Enhanced favorites management
    const fetchFavorites = useCallback(async () => {
        if (!currentUser) {
            const localFavs = JSON.parse(localStorage.getItem("favorites")) || [];
            setFavorites(localFavs);
            return;
        }

        try {
            const userRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                setFavorites(userData.favoriteParks || []);
            } else {
                console.log("Creating user document for:", currentUser.email);
                await setDoc(userRef, {
                    favoriteParks: [],
                    favoriteEvents: [],
                    createdAt: new Date(),
                    preferences: {
                        theme: 'light',
                        notifications: true
                    }
                });
                setFavorites([]);
            }
        } catch (error) {
            const friendlyError = handleFirebaseError(error, 'favorites loading');
            console.error("🔥 Favorites error:", friendlyError);

            // Don't show error for permission issues in development
            if (error.code !== 'permission-denied') {
                showToast(friendlyError.message, "warning");
            }
        }
    }, [currentUser, showToast]);

    // Enhanced favorites toggle with analytics
    const toggleFavorite = useCallback(async (id) => {
        const isFavorite = favorites.includes(id);
        const updatedFavorites = isFavorite
            ? favorites.filter((f) => f !== id)
            : [...favorites, id];

        setFavorites(updatedFavorites);

        // Find park name for better toast message
        const park = parks.find(p => p.id === id);
        const parkName = park?.name || 'park';

        if (!currentUser) {
            localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
            showToast("🔐 Sign in to sync favorites across devices", "info");
            return;
        }

        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                favoriteParks: isFavorite ? arrayRemove(id) : arrayUnion(id),
                lastActivity: new Date()
            });

            // Enhanced toast messages
            if (isFavorite) {
                showFavoriteToast(`💔 Removed ${parkName} from favorites`);
            } else {
                showFavoriteToast(`❤️ Added ${parkName} to favorites!`);
            }

            // Analytics tracking
            logAnalyticsEvent(isFavorite ? 'favorite_removed' : 'favorite_added', {
                park_id: id,
                park_name: parkName,
                total_favorites: updatedFavorites.length
            });

        } catch (error) {
            // Revert state on error
            setFavorites(favorites);

            const friendlyError = handleFirebaseError(error, 'favorite update');
            showToast(friendlyError.message, "error");
        }
    }, [favorites, parks, currentUser, showToast, showFavoriteToast]);

    // Initial data fetch
    useEffect(() => {
        fetchParks();
    }, [fetchParks]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // Show loading state while auth is loading or parks are loading
    if (authLoading || (appState.isLoading && parks.length === 0)) {
        return <AppLoadingFallback type="minimal"/>;
    }

    return (
        <AppErrorBoundary>
            <div className="font-sans bg-gray-50 min-h-screen">
                <ScrollToTop />
                <Layout>
                    <div className="main-scroll">
                        <Suspense fallback={<AppLoadingFallback type="page"/>}>
                            <Routes>
                                {/* ✅ Public Routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/blog" element={<Blog />} />
                                <Route path="/blog/:slug" element={<BlogPost />} />
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/favorites" element={<Favorites />} />
                                <Route path="/integrations" element={<AppIntegration />} />

                                {/* ✅ Enhanced root route with better UX */}
                                <Route
                                    path="/"
                                    element={
                                        currentUser ? (
                                            <PrivateRoute>
                                                <Home
                                                    parks={parks}
                                                    favorites={favorites}
                                                    toggleFavorite={toggleFavorite}
                                                    isLoading={appState.isLoading}
                                                    hasError={appState.hasError}
                                                    onRetry={() => fetchParks()}
                                                />
                                            </PrivateRoute>
                                        ) : (
                                            <Signup />
                                        )
                                    }
                                />

                                {/* ✅ Enhanced Protected Routes */}
                                <Route
                                    path="/park/:slug"
                                    element={
                                        <PrivateRoute>
                                            <Suspense fallback={<AppLoadingFallback type="page"/>}>
                                                <ParkDetails/>
                                            </Suspense>
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/map"
                                    element={
                                        <PrivateRoute>
                                            <Suspense fallback={<AppLoadingFallback type="component"/>}>
                                                <MapPage/>
                                            </Suspense>
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/seasonal"
                                    element={
                                        <PrivateRoute>
                                            <SeasonalPage
                                                parks={parks}
                                                favorites={favorites}
                                                toggleFavorite={toggleFavorite}
                                            />
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/recommendations"
                                    element={
                                        <PrivateRoute>
                                            <RecommendationsPage
                                                parks={parks}
                                                favorites={favorites}
                                                toggleFavorite={toggleFavorite}
                                            />
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/calendar"
                                    element={
                                        <PrivateRoute>
                                            <CalendarView />
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/account"
                                    element={
                                        <PrivateRoute>
                                            <UserAccount />
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/trip-planner"
                                    element={
                                        <PrivateRoute>
                                            <TripPlanner />
                                        </PrivateRoute>
                                    }
                                />

                                {/* ✅ Enhanced Admin Routes */}
                                <Route
                                    path="/admin"
                                    element={
                                        <AdminRoute>
                                            <AdminPage />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/blog-editor"
                                    element={
                                        <AdminRoute>
                                            <AdminBlogEditor />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/editor"
                                    element={
                                        <AdminRoute>
                                            <AdminBlogEditor />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/edit-blog/:id"
                                    element={
                                        <AdminRoute>
                                            <EditBlog />
                                        </AdminRoute>
                                    }
                                />

                                {/* ✅ Catch-all route for 404 */}
                                <Route
                                    path="*"
                                    element={
                                        <div
                                            className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-6xl mb-4">🏞️</div>
                                                <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                                                <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                                                <button
                                                    onClick={() => navigate('/')}
                                                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200"
                                                >
                                                    Go Home
                                                </button>
                                            </div>
                                        </div>
                                    }
                                />
                            </Routes>
                        </Suspense>
                    </div>
                </Layout>

                <ScrollToTopButton />
                <InstallButton />

                {/* ✅ Enhanced bottom navigation with better logic */}
                {isMobile && !shouldHideBottomNav && (
                    <FadeInWrapper delay={0.3}>
                        <BottomNav/>
                    </FadeInWrapper>
                )}
            </div>
        </AppErrorBoundary>
    );
}

export default App;