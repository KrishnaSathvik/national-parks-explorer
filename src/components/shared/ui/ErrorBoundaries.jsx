// src/components/shared/ui/ErrorBoundaries.jsx
import React, { Component } from 'react';
import { FaExclamationTriangle, FaRefresh, FaHome, FaBug, FaRoute, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Enhanced Error Boundary system for React components
 * Provides graceful error handling with context-aware recovery options
 */

// Base Error Boundary Class
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorId: Date.now().toString()
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Log error details
        this.setState({
            error,
            errorInfo,
            errorId: Date.now().toString()
        });

        // Send error to monitoring service if available
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Optional: Send to external error tracking
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: error.toString(),
                fatal: false
            });
        }
    }

    handleRetry = () => {
        const { maxRetries = 3 } = this.props;

        if (this.state.retryCount < maxRetries) {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: prevState.retryCount + 1
            }));
        }
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        });
    };

    render() {
        if (this.state.hasError) {
            const {
                fallback: Fallback,
                showDetails = false,
                context = 'application',
                maxRetries = 3
            } = this.props;

            if (Fallback) {
                return (
                    <Fallback
                        error={this.state.error}
                        errorInfo={this.state.errorInfo}
                        retry={this.handleRetry}
                        reset={this.handleReset}
                        retryCount={this.state.retryCount}
                        maxRetries={maxRetries}
                    />
                );
            }

            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    retry={this.handleRetry}
                    reset={this.handleReset}
                    retryCount={this.state.retryCount}
                    maxRetries={maxRetries}
                    showDetails={showDetails}
                    context={context}
                />
            );
        }

        return this.props.children;
    }
}

// Generic Error Fallback Component
const ErrorFallback = ({
                           error,
                           errorInfo,
                           retry,
                           reset,
                           retryCount,
                           maxRetries,
                           showDetails = false,
                           context = 'application'
                       }) => {
    const canRetry = retryCount < maxRetries;

    const getContextualContent = () => {
        switch (context) {
            case 'trip-viewer':
                return {
                    icon: FaRoute,
                    title: 'Trip Loading Error',
                    description: 'We encountered an issue loading your trip details. This might be due to missing data or a temporary glitch.',
                    suggestions: [
                        'Check your internet connection',
                        'Try refreshing the trip',
                        'Go back and select the trip again'
                    ]
                };
            case 'trip-builder':
                return {
                    icon: FaMapMarkerAlt,
                    title: 'Trip Planning Error',
                    description: 'Something went wrong while building your trip. Your progress might be saved, but some features may not be working.',
                    suggestions: [
                        'Save your current progress',
                        'Try refreshing the page',
                        'Start a new trip if the issue persists'
                    ]
                };
            case 'map':
                return {
                    icon: FaMapMarkerAlt,
                    title: 'Map Loading Error',
                    description: 'The interactive map failed to load. This could be due to network issues or browser compatibility.',
                    suggestions: [
                        'Check your internet connection',
                        'Try refreshing the page',
                        'Ensure JavaScript is enabled'
                    ]
                };
            default:
                return {
                    icon: FaExclamationTriangle,
                    title: 'Something went wrong',
                    description: 'An unexpected error occurred. This is usually temporary and can be resolved by refreshing.',
                    suggestions: [
                        'Try refreshing the page',
                        'Check your internet connection',
                        'Clear your browser cache if the issue persists'
                    ]
                };
        }
    };

    const contextContent = getContextualContent();
    const Icon = contextContent.icon;

    return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <Icon className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                {/* Error Message */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    {contextContent.title}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    {contextContent.description}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                    {canRetry && (
                        <button
                            onClick={retry}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <FaRefresh className="text-sm" />
                            Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                        </button>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                    >
                        <FaRefresh className="text-sm" />
                        Refresh Page
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                        <FaHome className="text-sm" />
                        Go Home
                    </button>
                </div>

                {/* Suggestions */}
                <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FaBug className="text-sm text-gray-600" />
                        Try these solutions:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        {contextContent.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-pink-500 mt-1">•</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Error Details (Development/Debug) */}
                {showDetails && error && (
                    <details className="text-left bg-red-50 border border-red-200 rounded-xl p-4">
                        <summary className="cursor-pointer font-semibold text-red-800 mb-2">
                            Technical Details
                        </summary>
                        <div className="text-sm">
                            <div className="mb-2">
                                <strong className="text-red-700">Error:</strong>
                                <pre className="mt-1 text-red-600 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {error.toString()}
                </pre>
                            </div>
                            {errorInfo && (
                                <div>
                                    <strong className="text-red-700">Stack Trace:</strong>
                                    <pre className="mt-1 text-red-600 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {/* Retry exhausted message */}
                {!canRetry && retryCount >= maxRetries && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                        <p className="text-yellow-800">
                            <strong>Multiple attempts failed.</strong> Please refresh the page or contact support if the issue persists.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Specialized Error Boundaries for different contexts

export const TripViewerErrorBoundary = ({ children, onError }) => (
    <ErrorBoundary
        context="trip-viewer"
        onError={onError}
        showDetails={process.env.NODE_ENV === 'development'}
    >
        {children}
    </ErrorBoundary>
);

export const TripBuilderErrorBoundary = ({ children, onError }) => (
    <ErrorBoundary
        context="trip-builder"
        onError={onError}
        maxRetries={5}
        showDetails={process.env.NODE_ENV === 'development'}
    >
        {children}
    </ErrorBoundary>
);

export const MapErrorBoundary = ({ children, onError }) => (
    <ErrorBoundary
        context="map"
        onError={onError}
        maxRetries={2}
        fallback={MapErrorFallback}
    >
        {children}
    </ErrorBoundary>
);

// Specialized fallback for map errors
const MapErrorFallback = ({ retry, retryCount, maxRetries }) => (
    <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
        <div className="text-center p-6">
            <FaMapMarkerAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Map Unavailable</h3>
            <p className="text-gray-500 text-sm mb-4">
                The interactive map failed to load. You can still view trip details in other tabs.
            </p>
            {retryCount < maxRetries && (
                <button
                    onClick={retry}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                    Retry Map Loading
                </button>
            )}
        </div>
    </div>
);

// Hook for handling async errors
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);

    const handleError = React.useCallback((error) => {
        console.error('Async error caught:', error);
        setError(error);
    }, []);

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { handleError, clearError, error };
};

// Error reporting utilities
export const reportError = (error, context = '', additionalData = {}) => {
    const errorReport = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        additionalData
    };

    // Log to console
    console.error('Error Report:', errorReport);

    // Send to external service (implement as needed)
    // Example: sendToErrorTracking(errorReport);

    return errorReport;
};

// Async component wrapper with error handling
export const withAsyncErrorHandling = (asyncComponent) => {
    return React.forwardRef((props, ref) => {
        const [error, setError] = React.useState(null);
        const [loading, setLoading] = React.useState(false);

        if (error) {
            throw error;
        }

        const handleAsyncError = (error) => {
            setLoading(false);
            setError(error);
        };

        const wrappedProps = {
            ...props,
            ref,
            onError: handleAsyncError,
            isLoading: loading,
            setLoading
        };

        return React.createElement(asyncComponent, wrappedProps);
    });
};

// Network error boundary
export const NetworkErrorBoundary = ({ children }) => {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="min-h-[400px] flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <FaExclamationTriangle className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        You're Offline
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Check your internet connection and try again. Some features may be limited while offline.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ErrorBoundary;