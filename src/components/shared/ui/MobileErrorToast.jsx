// src/components/shared/ui/MobileErrorToast.jsx
import React, { useState, useEffect } from 'react';
import {
    FaTimes,
    FaExclamationTriangle,
    FaWifi,
    FaRoute,
    FaMapMarkerAlt,
    FaCloudUploadAlt,
    FaRedo,
    FaInfoCircle
} from 'react-icons/fa';

/**
 * Mobile-optimized error toast component
 * Handles different error types with appropriate actions and styling
 */

const MobileErrorToast = ({
                              error,
                              onDismiss,
                              onRetry,
                              isVisible = true,
                              autoHide = true,
                              duration = 6000
                          }) => {
    const [isShowing, setIsShowing] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            // Slight delay for entrance animation
            const timer = setTimeout(() => setIsShowing(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    useEffect(() => {
        if (autoHide && isVisible && duration > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoHide, duration]);

    const handleDismiss = () => {
        setIsDismissing(true);
        setTimeout(() => {
            onDismiss?.();
        }, 300);
    };

    const handleRetry = () => {
        setIsDismissing(true);
        setTimeout(() => {
            onRetry?.();
        }, 300);
    };

    if (!isVisible) return null;

    const getErrorConfig = () => {
        const type = error?.type || 'generic';

        const configs = {
            network: {
                icon: FaWifi,
                bgColor: 'bg-red-500',
                title: 'Connection Error',
                message: 'Please check your internet connection',
                actionLabel: 'Retry',
                showRetry: true
            },
            offline: {
                icon: FaWifi,
                bgColor: 'bg-orange-500',
                title: 'You\'re Offline',
                message: 'Some features may not work properly',
                actionLabel: 'Dismiss',
                showRetry: false
            },
            route: {
                icon: FaRoute,
                bgColor: 'bg-red-500',
                title: 'Route Error',
                message: 'Unable to calculate route',
                actionLabel: 'Try Again',
                showRetry: true
            },
            location: {
                icon: FaMapMarkerAlt,
                bgColor: 'bg-yellow-500',
                title: 'Location Access',
                message: 'Please enable location services',
                actionLabel: 'Settings',
                showRetry: false
            },
            upload: {
                icon: FaCloudUploadAlt,
                bgColor: 'bg-red-500',
                title: 'Upload Failed',
                message: 'Failed to save your changes',
                actionLabel: 'Retry',
                showRetry: true
            },
            validation: {
                icon: FaExclamationTriangle,
                bgColor: 'bg-orange-500',
                title: 'Invalid Data',
                message: 'Please check your input',
                actionLabel: 'Dismiss',
                showRetry: false
            },
            server: {
                icon: FaExclamationTriangle,
                bgColor: 'bg-red-500',
                title: 'Server Error',
                message: 'Something went wrong on our end',
                actionLabel: 'Retry',
                showRetry: true
            },
            generic: {
                icon: FaExclamationTriangle,
                bgColor: 'bg-red-500',
                title: 'Error',
                message: 'Something went wrong',
                actionLabel: 'Dismiss',
                showRetry: false
            }
        };

        return configs[type] || configs.generic;
    };

    const config = getErrorConfig();
    const IconComponent = config.icon;

    const getAnimationClasses = () => {
        if (isDismissing) {
            return 'translate-y-0 opacity-0 scale-95';
        }
        if (isShowing) {
            return 'translate-y-0 opacity-100 scale-100';
        }
        return '-translate-y-full opacity-0 scale-95';
    };

    return (
        <>
            {/* Backdrop for critical errors */}
            {error?.critical && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
            )}

            {/* Toast Container */}
            <div className={`
                fixed top-4 left-4 right-4 z-50
                transform transition-all duration-300 ease-out
                ${getAnimationClasses()}
            `}>
                <div className={`
                    ${config.bgColor} text-white
                    rounded-xl shadow-xl border-l-4 border-white/30
                    p-4 mx-auto max-w-sm
                    backdrop-blur-sm
                `}>
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <IconComponent className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">
                                {error?.title || config.title}
                            </h4>
                            <p className="text-sm opacity-90 leading-5">
                                {error?.message || config.message}
                            </p>

                            {/* Additional Details */}
                            {error?.details && (
                                <p className="text-xs mt-2 opacity-75">
                                    {error.details}
                                </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3">
                                {config.showRetry && onRetry && (
                                    <button
                                        onClick={handleRetry}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors"
                                    >
                                        <FaRedo className="w-3 h-3" />
                                        {error?.actionLabel || config.actionLabel}
                                    </button>
                                )}

                                <button
                                    onClick={handleDismiss}
                                    className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
                            aria-label="Close error"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress Bar for auto-hide */}
                    {autoHide && duration > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-xl overflow-hidden">
                            <div
                                className="h-full bg-white/40 transition-all ease-linear"
                                style={{
                                    animation: `shrink ${duration}ms linear forwards`
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// Compact Error Toast for less critical errors
export const CompactMobileErrorToast = ({
                                            message,
                                            onDismiss,
                                            type = 'error',
                                            isVisible = true
                                        }) => {
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsShowing(true);
            const timer = setTimeout(() => {
                onDismiss?.();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onDismiss]);

    if (!isVisible) return null;

    const typeConfig = {
        error: 'bg-red-500',
        warning: 'bg-orange-500',
        info: 'bg-blue-500'
    };

    return (
        <div className={`
            fixed bottom-4 left-4 right-4 z-50
            transform transition-all duration-300
            ${isShowing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}>
            <div className={`
                ${typeConfig[type]} text-white
                rounded-lg shadow-lg p-3 mx-auto max-w-sm
                flex items-center gap-3
            `}>
                <FaInfoCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm flex-1">{message}</span>
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 hover:bg-white/20 rounded p-1"
                >
                    <FaTimes className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

// Error Banner for persistent errors
export const MobileErrorBanner = ({
                                      error,
                                      onDismiss,
                                      onAction,
                                      isVisible = true
                                  }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-3 shadow-lg">
            <div className="flex items-center gap-3 max-w-sm mx-auto">
                <FaExclamationTriangle className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {error?.title || 'Error'}
                    </p>
                    {error?.message && (
                        <p className="text-xs opacity-90 truncate">
                            {error.message}
                        </p>
                    )}
                </div>

                {onAction && (
                    <button
                        onClick={onAction}
                        className="text-xs font-medium underline hover:no-underline"
                    >
                        Fix
                    </button>
                )}

                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 hover:bg-white/20 rounded p-1"
                >
                    <FaTimes className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

// Floating Action Button for error recovery
export const ErrorRecoveryFAB = ({
                                     onRetry,
                                     isVisible = true,
                                     isLoading = false
                                 }) => {
    if (!isVisible) return null;

    return (
        <button
            onClick={onRetry}
            disabled={isLoading}
            className={`
                fixed bottom-6 right-6 z-50
                w-14 h-14 bg-red-500 hover:bg-red-600 
                text-white rounded-full shadow-lg
                flex items-center justify-center
                transition-all duration-200
                ${isLoading ? 'animate-pulse' : 'hover:scale-110'}
                ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <FaRedo className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
    );
};

// Hook for mobile error handling
export const useMobileErrorToast = () => {
    const [errors, setErrors] = useState([]);

    const showError = (error) => {
        const id = Date.now();
        const newError = {
            id,
            ...error,
            timestamp: Date.now()
        };

        setErrors(prev => [...prev, newError]);

        // Auto-remove after delay unless persistent
        if (!error.persistent) {
            setTimeout(() => {
                removeError(id);
            }, error.duration || 6000);
        }

        return id;
    };

    const removeError = (id) => {
        setErrors(prev => prev.filter(error => error.id !== id));
    };

    const clearAll = () => {
        setErrors([]);
    };

    // Convenience methods
    const networkError = (message = 'Network connection failed') =>
        showError({ type: 'network', message });

    const offlineError = () =>
        showError({ type: 'offline', persistent: true });

    const validationError = (message) =>
        showError({ type: 'validation', message, duration: 4000 });

    return {
        errors,
        showError,
        removeError,
        clearAll,
        networkError,
        offlineError,
        validationError
    };
};

// CSS for animations
export const mobileErrorToastStyles = `
@keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
}

@keyframes slideDownMobile {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideUpMobile {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.mobile-error-enter {
    animation: slideDownMobile 0.3s ease-out forwards;
}

.mobile-error-exit {
    animation: slideUpMobile 0.3s ease-in reverse forwards;
}
`;

export default MobileErrorToast;