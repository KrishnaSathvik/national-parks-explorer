// src/components/TripViewer/hooks/useTripViewer.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTripPlanner } from '../../TripPlanner/core/TripPlannerProvider';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { generateTripItinerary, shareTrip, exportTripToJSON } from '../../../utils/tripPlanner/tripHelpers';
import { getTravelStats, generateSmartInsights } from '../../../utils/tripPlanner/TripAnalytics';

/**
 * Enhanced hook for managing TripViewer state and actions
 * Provides comprehensive trip viewing functionality with analytics and sharing
 */
export const useTripViewer = (initialTrip = null) => {
    // Core state
    const [currentTrip, setCurrentTrip] = useState(initialTrip);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewerErrors, setViewerErrors] = useState({});

    // Advanced state
    const [viewHistory, setViewHistory] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [shareHistory, setShareHistory] = useState([]);
    const [viewStartTime, setViewStartTime] = useState(null);
    const [interactionData, setInteractionData] = useState({
        tabViews: {},
        timeSpent: 0,
        actionsPerformed: []
    });

    // Context hooks
    const {
        startViewing,
        stopViewing,
        isViewing,
        startBuilding,
        duplicateTrip,
        deleteTrip: deleteTripFromProvider,
        saveTrip,
        trips
    } = useTripPlanner();

    const { showToast, showTripToast, showSuccessToast, showErrorToast } = useToast();
    const { currentUser } = useAuth();

    // Available tabs configuration
    const availableTabs = useMemo(() => [
        {
            id: 'overview',
            title: 'Overview',
            description: 'Trip summary and details',
            requiredData: ['title'],
            analytics: true
        },
        {
            id: 'itinerary',
            title: 'Itinerary',
            description: 'Day-by-day schedule',
            requiredData: ['parks', 'startDate'],
            analytics: true
        },
        {
            id: 'map',
            title: 'Route Map',
            description: 'Interactive trip route',
            requiredData: ['parks'],
            analytics: true
        },
        {
            id: 'budget',
            title: 'Budget',
            description: 'Cost breakdown and analysis',
            requiredData: ['estimatedCost'],
            analytics: true
        }
    ], []);

    // Computed trip data
    const tripData = useMemo(() => {
        if (!currentTrip) return null;

        return {
            // Basic info
            title: currentTrip.title || 'Untitled Trip',
            description: currentTrip.description || '',

            // Timing
            startDate: currentTrip.startDate,
            endDate: currentTrip.endDate,
            totalDuration: currentTrip.totalDuration || 1,

            // Locations
            parks: currentTrip.parks || [],
            parksCount: currentTrip.parks?.length || 0,
            statesCovered: [...new Set(currentTrip.parks?.map(p => p.state).filter(Boolean))] || [],

            // Logistics
            totalDistance: Math.round(currentTrip.totalDistance || 0),
            estimatedCost: Math.round(currentTrip.estimatedCost || 0),
            transportationMode: currentTrip.transportationMode || 'driving',

            // Preferences
            preferences: currentTrip.preferences || {},

            // Status
            isComplete: !!(currentTrip.title && currentTrip.parks?.length > 0 && currentTrip.startDate),
            createdAt: currentTrip.createdAt,
            updatedAt: currentTrip.updatedAt
        };
    }, [currentTrip]);

    // Generated trip content
    const tripContent = useMemo(() => {
        if (!currentTrip) return null;

        return {
            itinerary: generateTripItinerary(currentTrip),
            insights: generateSmartInsights([currentTrip]),
            stats: getTravelStats([currentTrip]),
            validParks: currentTrip.parks?.filter(park =>
                park.coordinates &&
                typeof park.coordinates === 'object' ?
                    (park.coordinates.lat && park.coordinates.lng) :
                    (typeof park.coordinates === 'string' && park.coordinates.includes(','))
            ) || []
        };
    }, [currentTrip]);

    // Tab availability based on data
    const availableTabsList = useMemo(() => {
        if (!tripData) return [];

        return availableTabs.filter(tab => {
            if (!tab.requiredData) return true;

            return tab.requiredData.every(field => {
                if (field === 'parks') return tripData.parksCount > 0;
                if (field === 'startDate') return !!tripData.startDate;
                if (field === 'estimatedCost') return tripData.estimatedCost > 0;
                if (field === 'title') return !!tripData.title;
                return !!tripData[field];
            });
        });
    }, [tripData, availableTabs]);

    // Initialize viewer
    const initializeViewer = useCallback((trip) => {
        if (!trip) {
            setViewerErrors({ general: 'No trip data provided' });
            return false;
        }

        try {
            setCurrentTrip(trip);
            setActiveTab('overview');
            setViewStartTime(Date.now());
            setInteractionData({
                tabViews: { overview: 1 },
                timeSpent: 0,
                actionsPerformed: []
            });

            // Add to view history
            setViewHistory(prev => {
                const newHistory = prev.filter(h => h.tripId !== trip.id);
                return [{
                    tripId: trip.id,
                    title: trip.title,
                    viewedAt: new Date(),
                    duration: 0
                }, ...newHistory].slice(0, 10);
            });

            // Use provider action if available
            if (startViewing) {
                startViewing(trip);
            }

            showTripToast(`Viewing "${trip.title || 'Untitled Trip'}"`, {
                duration: 2000,
                icon: '👁️'
            });

            return true;
        } catch (error) {
            console.error('Error initializing viewer:', error);
            setViewerErrors({ general: 'Failed to load trip data' });
            showErrorToast('Failed to load trip data');
            return false;
        }
    }, [startViewing, showTripToast, showErrorToast]);

    // Close viewer
    const closeViewer = useCallback(() => {
        // Calculate viewing duration
        if (viewStartTime) {
            const duration = Date.now() - viewStartTime;
            setInteractionData(prev => ({ ...prev, timeSpent: duration }));

            // Update view history with duration
            setViewHistory(prev =>
                prev.map(h =>
                    h.tripId === currentTrip?.id
                        ? { ...h, duration }
                        : h
                )
            );
        }

        // Reset state
        setCurrentTrip(null);
        setActiveTab('overview');
        setIsFullscreen(false);
        setViewerErrors({});
        setViewStartTime(null);

        // Use provider action if available
        if (stopViewing) {
            stopViewing();
        }
    }, [currentTrip?.id, viewStartTime, stopViewing]);

    // Switch tabs with analytics
    const switchTab = useCallback((tabId) => {
        if (!availableTabsList.find(tab => tab.id === tabId)) {
            showErrorToast(`Tab "${tabId}" is not available for this trip`);
            return false;
        }

        setActiveTab(tabId);

        // Track tab interaction
        setInteractionData(prev => ({
            ...prev,
            tabViews: {
                ...prev.tabViews,
                [tabId]: (prev.tabViews[tabId] || 0) + 1
            },
            actionsPerformed: [
                ...prev.actionsPerformed,
                { action: 'tab_switch', tab: tabId, timestamp: Date.now() }
            ]
        }));

        return true;
    }, [availableTabsList, showErrorToast]);

    // Edit trip
    const editTrip = useCallback(() => {
        if (!currentTrip) return;

        try {
            if (startBuilding) {
                startBuilding(currentTrip);
                closeViewer();
                showTripToast('Opening trip editor...', { icon: '✏️' });
            } else {
                showErrorToast('Trip editing is not available');
            }
        } catch (error) {
            console.error('Error starting edit:', error);
            showErrorToast('Failed to open trip editor');
        }
    }, [currentTrip, startBuilding, closeViewer, showTripToast, showErrorToast]);

    // Duplicate trip
    const duplicateCurrentTrip = useCallback(async () => {
        if (!currentTrip || !duplicateTrip) return;

        try {
            setIsLoading(true);
            const newTrip = await duplicateTrip(currentTrip);

            if (newTrip) {
                showSuccessToast(`Trip duplicated as "${newTrip.title}"`, {
                    actionLabel: 'View Copy',
                    onActionClick: () => initializeViewer(newTrip)
                });
            }
        } catch (error) {
            console.error('Error duplicating trip:', error);
            showErrorToast('Failed to duplicate trip');
        } finally {
            setIsLoading(false);
        }
    }, [currentTrip, duplicateTrip, showSuccessToast, showErrorToast, initializeViewer]);

    // Delete trip
    const deleteCurrentTrip = useCallback(async () => {
        if (!currentTrip || !deleteTripFromProvider) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${currentTrip.title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setIsLoading(true);
            await deleteTripFromProvider(currentTrip.id);
            closeViewer();
            showSuccessToast('Trip deleted successfully');
        } catch (error) {
            console.error('Error deleting trip:', error);
            showErrorToast('Failed to delete trip');
        } finally {
            setIsLoading(false);
        }
    }, [currentTrip, deleteTripFromProvider, closeViewer, showSuccessToast, showErrorToast]);

    // Share trip
    const shareCurrentTrip = useCallback(async (method = 'native') => {
        if (!currentTrip) return;

        try {
            setIsLoading(true);

            const result = await shareTrip(currentTrip);

            if (result.success) {
                // Track share action
                setShareHistory(prev => [{
                    tripId: currentTrip.id,
                    method: result.method,
                    sharedAt: new Date(),
                    title: currentTrip.title
                }, ...prev].slice(0, 20));

                setInteractionData(prev => ({
                    ...prev,
                    actionsPerformed: [
                        ...prev.actionsPerformed,
                        { action: 'share', method: result.method, timestamp: Date.now() }
                    ]
                }));

                showSuccessToast(`Trip shared via ${result.method}!`, { icon: '🔗' });
            }

            return result;
        } catch (error) {
            console.error('Error sharing trip:', error);
            showErrorToast('Failed to share trip');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, [currentTrip, showSuccessToast, showErrorToast]);

    // Export trip
    const exportCurrentTrip = useCallback(async (format = 'json') => {
        if (!currentTrip) return;

        try {
            setIsLoading(true);

            const exportData = exportTripToJSON(currentTrip);
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentTrip.title || 'trip'}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Track export action
            setInteractionData(prev => ({
                ...prev,
                actionsPerformed: [
                    ...prev.actionsPerformed,
                    { action: 'export', format, timestamp: Date.now() }
                ]
            }));

            showSuccessToast('Trip exported successfully!', { icon: '📄' });
            return true;
        } catch (error) {
            console.error('Error exporting trip:', error);
            showErrorToast('Failed to export trip');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [currentTrip, showSuccessToast, showErrorToast]);

    // Bookmark trip
    const toggleBookmark = useCallback(() => {
        if (!currentTrip) return;

        setBookmarks(prev => {
            const isBookmarked = prev.some(b => b.tripId === currentTrip.id);

            if (isBookmarked) {
                showToast('Bookmark removed', 'info', { icon: '🔖' });
                return prev.filter(b => b.tripId !== currentTrip.id);
            } else {
                showToast('Trip bookmarked', 'success', { icon: '🔖' });
                return [{
                    tripId: currentTrip.id,
                    title: currentTrip.title,
                    bookmarkedAt: new Date()
                }, ...prev];
            }
        });
    }, [currentTrip, showToast]);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => {
            const newState = !prev;

            setInteractionData(prevData => ({
                ...prevData,
                actionsPerformed: [
                    ...prevData.actionsPerformed,
                    { action: 'fullscreen_toggle', enabled: newState, timestamp: Date.now() }
                ]
            }));

            return newState;
        });
    }, []);

    // Clear errors
    const clearErrors = useCallback(() => {
        setViewerErrors({});
    }, []);

    // Check if trip is bookmarked
    const isBookmarked = useMemo(() => {
        if (!currentTrip) return false;
        return bookmarks.some(b => b.tripId === currentTrip.id);
    }, [currentTrip, bookmarks]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (viewStartTime && currentTrip) {
                const duration = Date.now() - viewStartTime;
                // Could send analytics data here if needed
            }
        };
    }, [viewStartTime, currentTrip]);

    return {
        // Core state
        currentTrip,
        tripData,
        tripContent,
        activeTab,
        isFullscreen,
        isLoading,
        errors: viewerErrors,
        isViewing,

        // Tab management
        availableTabs: availableTabsList,
        switchTab,

        // Trip actions
        initializeViewer,
        closeViewer,
        editTrip,
        duplicateCurrentTrip,
        deleteCurrentTrip,
        shareCurrentTrip,
        exportCurrentTrip,

        // UI actions
        toggleFullscreen,
        toggleBookmark,
        clearErrors,

        // Analytics & history
        viewHistory,
        shareHistory,
        interactionData,
        isBookmarked,

        // Utility functions
        canEdit: !!currentUser,
        canShare: true,
        canExport: true,
        canDelete: !!currentUser && currentTrip?.userId === currentUser.uid,
        hasValidData: !!tripData?.isComplete
    };
};