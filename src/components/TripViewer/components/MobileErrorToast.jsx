// src/components/TripViewer/components/MobileErrorToast.jsx
import React, { useState, useEffect } from 'react';
import {
    FaTimes,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaInfoCircle,
    FaCheckCircle,
    FaWifi,
    FaRoute,
    FaMapMarkerAlt,
    FaRefresh
} from 'react-icons/fa';
import { MdWifiOff } from 'react-icons/md';

/**
 * Mobile-optimized error toast component for TripViewer
 * Provides contextual error messages with appropriate actions
 */

const MobileErrorToast = ({
                              message,
                              type = 'error',
                              isVisible = true,
                              onDismiss,
                              onRetry,
                              autoHide = true,
                              duration = 5000,
                              position = 'top',
                              actionLabel,
                              onActionClick,
                              context = 'general',
                              className = ""
                          }) => {
    const [shouldShow, setShouldShow] = useState(isVisible);
    const [progress, setProgress] = useState(100);

    // Auto-hide functionality
    useEffect(() => {
        if (!isVisible) {
            setShouldShow(false);
            return;
        }

        setShouldShow(true);
        setProgress(100);

        if (autoHide && duration > 0) {
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - (100 / (duration / 100));
                    if (newProgress <= 0) {
                        clearInterval(progressInterval);
                        setShouldShow(false);
                        if (onDismiss) {
                            setTimeout(onDismiss, 300); // Allow animation to complete
                        }
                        return 0;
                    }
                    return newProgress;
                });
            }, 100);

            return () => clearInterval(progressInterval);
        }
    }, [isVisible, autoHide, duration, onDismiss]);

    // Toast type configurations
    const toastConfig = {
        error: {
            icon: FaExclamationCircle,
            bgColor: 'bg-red-50 border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-500',
            progressColor: 'bg-red-500'
        },
        warning: {
            icon: FaExclamationTriangle,
            bgColor: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-500',
            progressColor: 'bg-yellow-500'
        },
        info: {
            icon: FaInfoCircle,
            bgColor: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-500',
            progressColor: 'bg-blue-500'
        },
        success: {
            icon: FaCheckCircle,
            bgColor: 'bg-green-50 border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-500',
            progressColor: 'bg-green-500'
        },
        offline: {
            icon: MdWifiOff,
            bgColor: 'bg-gray-50 border-gray-200',
            textColor: 'text-gray-800',
            iconColor: 'text-gray-500',
            progressColor: 'bg-gray-500'
        },
        online: {
            icon: FaWifi,
            bgColor: 'bg-green-50 border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-500',
            progressColor: 'bg-green-500'
        }
    };

    // Context-specific configurations
    const contextConfig = {
        trip: {
            icon: FaRoute,
            defaultMessage: 'Trip operation failed'
        },
        map: {
            icon: FaMapMarkerAlt,
            defaultMessage: 'Map loading failed'
        },
        network: {
            icon: FaWifi,
            defaultMessage: 'Network connection issue'
        },
        general: {
            icon: null,
            defaultMessage: 'An error occurred'
        }
    };

    const config = toastConfig[type] || toastConfig.error;
    const contextInfo = contextConfig[context] || contextConfig.general;
    const Icon = contextInfo.icon || config.icon;

    // Position classes
    const positionClasses = {
        top: 'top-4 left-4 right-4',
        bottom: 'bottom-4 left-4 right-4',
        center: 'top-1/2 left-4 right-4 transform -translate-y-1/2'
    };

    // Handle dismiss
    const handleDismiss = () => {
        setShouldShow(false);
        if (onDismiss) {
            setTimeout(onDismiss, 300);
        }
    };

    // Handle retry
    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        }
        handleDismiss();
    };

    // Handle custom action
    const handleAction = () => {
        if (onActionClick) {
            onActionClick();
        }
        handleDismiss();
    };

    if (!shouldShow) return null;

    return (
        <div
            className={`
        fixed z-50 ${positionClasses[position]} 
        animate-slide-down ${className}
      `}
            style={{
                animationDuration: shouldShow ? '0.3s' : '0.3s',
                animationFillMode: 'both'
            }}
        >
            <div className={`
        ${config.bgColor} rounded-xl border-2 shadow-lg backdrop-blur-sm 
        transform transition-all duration-300 ${shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
                {/* Progress bar */}
                {autoHide && duration > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
                        <div
                            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="p-4 pt-5">
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 ${config.iconColor} mt-0.5`}>
                            <Icon className="text-xl" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className={`${config.textColor} font-medium text-sm leading-relaxed`}>
                                {message || contextInfo.defaultMessage}
                            </p>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-3">
                                {onRetry && (
                                    <button
                                        onClick={handleRetry}
                                        className={`
                      flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                      bg-white ${config.textColor} border border-current hover:bg-opacity-10 hover:bg-current
                    `}
                                    >
                                        <FaRefresh className="text-xs" />
                                        Retry
                                    </button>
                                )}

                                {actionLabel && onActionClick && (
                                    <button
                                        onClick={handleAction}
                                        className={`
                      px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                      bg-white ${config.textColor} border border-current hover:bg-opacity-10 hover:bg-current
                    `}
                                    >
                                        {actionLabel}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className={`
                flex-shrink-0 p-1 rounded-full transition-colors duration-200
                ${config.textColor} hover:bg-black hover:bg-opacity-10
              `}
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Specialized error toasts for different contexts
export const TripErrorToast = ({ trip, ...props }) => (
    <MobileErrorToast
        {...props}
        context="trip"
        message={props.message || `Failed to load trip "${trip?.title || 'Unknown'}"`}
        onRetry={props.onRetry}
        actionLabel="View All Trips"
        onActionClick={() => window.location.href = '/trips'}
    />
);

export const MapErrorToast = (props) => (
    <MobileErrorToast
        {...props}
        context="map"
        message={props.message || "Map failed to load. Trip details are still available."}
        type="warning"
        onRetry={props.onRetry}
    />
);

export const NetworkErrorToast = (props) => (
    <MobileErrorToast
        {...props}
        context="network"
        type="offline"
        message={props.message || "You're offline. Some features may be limited."}
        autoHide={false}
        actionLabel="Refresh"
        onActionClick={() => window.location.reload()}
    />
);

export const LoadingErrorToast = ({ operation = "operation", ...props }) => (
    <MobileErrorToast
        {...props}
        message={props.message || `${operation} failed. Please try again.`}
        onRetry={props.onRetry}
    />
);

// Hook for managing multiple mobile toasts
export const useMobileToasts = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (toastProps) => {
        const id = Date.now().toString();
        const newToast = {
            id,
            ...toastProps,
            isVisible: true
        };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove if specified
        if (toastProps.autoHide !== false) {
            const duration = toastProps.duration || 5000;
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearAllToasts = () => {
        setToasts([]);
    };

    const showTripError = (trip, error) => {
        return showToast({
            type: 'error',
            context: 'trip',
            message: `Failed to load trip "${trip?.title || 'Unknown'}": ${error}`,
            onRetry: () => window.location.reload(),
            duration: 8000
        });
    };

    const showMapError = () => {
        return showToast({
            type: 'warning',
            context: 'map',
            message: 'Map failed to load. Trip details are still available.',
            duration: 6000
        });
    };

    const showNetworkError = () => {
        return showToast({
            type: 'offline',
            context: 'network',
            message: "You're offline. Some features may be limited.",
            autoHide: false,
            actionLabel: 'Refresh',
            onActionClick: () => window.location.reload()
        });
    };

    const showSuccess = (message) => {
        return showToast({
            type: 'success',
            message,
            duration: 3000
        });
    };

    return {
        toasts,
        showToast,
        removeToast,
        clearAllToasts,
        showTripError,
        showMapError,
        showNetworkError,
        showSuccess
    };
};

// Toast container for rendering multiple toasts
export const MobileToastContainer = ({ toasts, onRemoveToast, position = "top" }) => {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{
                        transform: `translateY(${index * 80}px)`,
                        zIndex: 50 + index
                    }}
                >
                    <MobileErrorToast
                        {...toast}
                        position={position}
                        onDismiss={() => onRemoveToast(toast.id)}
                        className="pointer-events-auto"
                    />
                </div>
            ))}
        </div>
    );
};

export default MobileErrorToast;