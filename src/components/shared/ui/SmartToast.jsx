// src/components/shared/ui/SmartToast.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    FaCheck,
    FaTimes,
    FaExclamationTriangle,
    FaInfoCircle,
    FaRoute,
    FaPlane,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaDollarSign,
    FaShare,
    FaDownload,
    FaUpload,
    FaSave
} from 'react-icons/fa';

/**
 * Enhanced toast notification system with trip planner specific notifications
 * Supports different types, animations, and smart grouping
 */

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Provider
export const ToastProvider = ({ children, maxToasts = 5 }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            timestamp: Date.now(),
            ...toast
        };

        setToasts(prev => {
            const updated = [newToast, ...prev.slice(0, maxToasts - 1)];
            return updated;
        });

        // Auto dismiss if duration is specified
        if (toast.duration !== 0) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 4000);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearAll = () => {
        setToasts([]);
    };

    // Enhanced toast methods
    const toast = {
        success: (message, options = {}) => addToast({
            type: 'success',
            message,
            ...options
        }),
        error: (message, options = {}) => addToast({
            type: 'error',
            message,
            duration: 6000, // Errors stay longer
            ...options
        }),
        warning: (message, options = {}) => addToast({
            type: 'warning',
            message,
            ...options
        }),
        info: (message, options = {}) => addToast({
            type: 'info',
            message,
            ...options
        }),
        // Trip-specific toasts
        tripSaved: (tripName, options = {}) => addToast({
            type: 'trip-saved',
            message: `Trip "${tripName}" saved successfully`,
            icon: FaSave,
            ...options
        }),
        tripShared: (tripName, options = {}) => addToast({
            type: 'trip-shared',
            message: `Trip "${tripName}" shared successfully`,
            icon: FaShare,
            ...options
        }),
        routeOptimized: (savings, options = {}) => addToast({
            type: 'route-optimized',
            message: `Route optimized! Saved ${savings} hours of driving`,
            icon: FaRoute,
            ...options
        }),
        budgetAlert: (message, options = {}) => addToast({
            type: 'budget-alert',
            message,
            icon: FaDollarSign,
            ...options
        }),
        bookingSuccess: (venue, options = {}) => addToast({
            type: 'booking-success',
            message: `Booking confirmed for ${venue}`,
            icon: FaCalendarAlt,
            ...options
        }),
        exportReady: (format, options = {}) => addToast({
            type: 'export-ready',
            message: `Trip exported to ${format}`,
            icon: FaDownload,
            action: options.downloadAction,
            ...options
        }),
        loading: (message, options = {}) => addToast({
            type: 'loading',
            message,
            duration: 0, // Manual dismiss
            icon: FaRoute,
            ...options
        }),
        // Batch operations
        batch: (messages, type = 'info') => {
            messages.forEach((message, index) => {
                setTimeout(() => {
                    addToast({
                        type,
                        message,
                        duration: 3000 + (index * 500)
                    });
                }, index * 200);
            });
        }
    };

    return (
        <ToastContext.Provider value={{ toast, removeToast, clearAll }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

// Individual Toast Item
const ToastItem = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        // Slide in animation
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(onRemove, 300); // Wait for animation
    };

    const getToastStyles = () => {
        const base = "transform transition-all duration-300 ease-in-out";

        if (isRemoving) {
            return `${base} translate-x-full opacity-0 scale-95`;
        }

        if (isVisible) {
            return `${base} translate-x-0 opacity-100 scale-100`;
        }

        return `${base} translate-x-full opacity-0 scale-95`;
    };

    const getToastConfig = () => {
        const configs = {
            success: {
                bgColor: 'bg-green-500',
                textColor: 'text-white',
                icon: FaCheck,
                borderColor: 'border-green-600'
            },
            error: {
                bgColor: 'bg-red-500',
                textColor: 'text-white',
                icon: FaTimes,
                borderColor: 'border-red-600'
            },
            warning: {
                bgColor: 'bg-yellow-500',
                textColor: 'text-white',
                icon: FaExclamationTriangle,
                borderColor: 'border-yellow-600'
            },
            info: {
                bgColor: 'bg-blue-500',
                textColor: 'text-white',
                icon: FaInfoCircle,
                borderColor: 'border-blue-600'
            },
            'trip-saved': {
                bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
                textColor: 'text-white',
                icon: FaSave,
                borderColor: 'border-green-600'
            },
            'trip-shared': {
                bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
                textColor: 'text-white',
                icon: FaShare,
                borderColor: 'border-purple-600'
            },
            'route-optimized': {
                bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
                textColor: 'text-white',
                icon: FaRoute,
                borderColor: 'border-blue-600'
            },
            'budget-alert': {
                bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
                textColor: 'text-white',
                icon: FaDollarSign,
                borderColor: 'border-orange-600'
            },
            'booking-success': {
                bgColor: 'bg-gradient-to-r from-teal-500 to-cyan-500',
                textColor: 'text-white',
                icon: FaCalendarAlt,
                borderColor: 'border-teal-600'
            },
            'export-ready': {
                bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
                textColor: 'text-white',
                icon: FaDownload,
                borderColor: 'border-indigo-600'
            },
            'loading': {
                bgColor: 'bg-gradient-to-r from-gray-500 to-slate-500',
                textColor: 'text-white',
                icon: FaRoute,
                borderColor: 'border-gray-600'
            }
        };

        return configs[toast.type] || configs.info;
    };

    const config = getToastConfig();
    const IconComponent = toast.icon || config.icon;

    return (
        <div className={getToastStyles()}>
            <div className={`
                ${config.bgColor} ${config.textColor} 
                rounded-lg shadow-lg border-l-4 ${config.borderColor}
                p-4 min-w-0 max-w-sm backdrop-blur-sm
                ${toast.type.includes('gradient') ? 'shadow-xl' : 'shadow-lg'}
            `}>
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                        {toast.type === 'loading' ? (
                            <div className="animate-spin">
                                <IconComponent className="w-5 h-5" />
                            </div>
                        ) : (
                            <IconComponent className="w-5 h-5" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        {toast.title && (
                            <p className="font-semibold text-sm mb-1">
                                {toast.title}
                            </p>
                        )}

                        {/* Message */}
                        <p className="text-sm leading-5 break-words">
                            {toast.message}
                        </p>

                        {/* Description */}
                        {toast.description && (
                            <p className="text-xs mt-1 opacity-90">
                                {toast.description}
                            </p>
                        )}

                        {/* Action Button */}
                        {toast.action && (
                            <button
                                onClick={toast.action.onClick}
                                className="mt-2 text-xs underline hover:no-underline font-medium"
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>

                    {/* Close Button */}
                    {toast.dismissible !== false && (
                        <button
                            onClick={handleRemove}
                            className="flex-shrink-0 ml-2 hover:bg-white/20 rounded p-1 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Progress Bar for timed toasts */}
                {toast.duration > 0 && toast.showProgress !== false && (
                    <ToastProgressBar duration={toast.duration} onComplete={handleRemove} />
                )}
            </div>
        </div>
    );
};

// Progress Bar Component
const ToastProgressBar = ({ duration, onComplete }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = 50; // Update every 50ms
        const decrement = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev - decrement;
                if (next <= 0) {
                    clearInterval(timer);
                    onComplete();
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [duration, onComplete]);

    return (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
            <div
                className="h-full bg-white/60 transition-all duration-50 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

// Mobile Toast (for smaller screens)
export const MobileToast = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const config = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    return (
        <div className={`
            fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg
            ${config[toast.type] || config.info}
            transform transition-all duration-300
            ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{toast.message}</span>
                <button onClick={onRemove} className="ml-4">
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Batch Toast for multiple operations
export const BatchToastContainer = ({ operations = [], onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < operations.length) {
            const timer = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (!isComplete) {
            setIsComplete(true);
            setTimeout(onComplete, 1000);
        }
    }, [currentIndex, operations.length, isComplete, onComplete]);

    if (isComplete) return null;

    const progress = (currentIndex / operations.length) * 100;

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 min-w-80">
                <div className="text-center mb-4">
                    <FaUpload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">Processing Operations</h3>
                    <p className="text-sm text-gray-600">
                        {currentIndex} of {operations.length} completed
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Current Operation */}
                <div className="space-y-2">
                    {operations.slice(Math.max(0, currentIndex - 2), currentIndex + 1).map((op, index) => {
                        const realIndex = Math.max(0, currentIndex - 2) + index;
                        return (
                            <div
                                key={realIndex}
                                className={`flex items-center gap-2 text-sm p-2 rounded ${
                                    realIndex < currentIndex
                                        ? 'text-green-600 bg-green-50'
                                        : realIndex === currentIndex
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-400'
                                }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${
                                    realIndex < currentIndex
                                        ? 'bg-green-500'
                                        : realIndex === currentIndex
                                            ? 'bg-blue-500 animate-pulse'
                                            : 'bg-gray-300'
                                }`}></div>
                                <span>{op}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Smart Toast Hook with enhanced features
export const useSmartToast = () => {
    const { toast } = useToast();

    return {
        ...toast,
        // Trip-specific convenience methods
        tripCreated: (name) => toast.success(`Trip "${name}" created successfully!`),
        tripUpdated: (name) => toast.success(`Trip "${name}" updated`),
        tripDeleted: (name) => toast.success(`Trip "${name}" deleted`),

        // Validation errors
        validationError: (field) => toast.error(`Please check your ${field}`),

        // Network operations
        offline: () => toast.warning("You're offline. Changes will sync when connected.", {
            duration: 0,
            dismissible: true
        }),
        syncComplete: () => toast.success("All changes synced"),

        // Batch operations
        batchOperation: (operations, onComplete) => {
            return toast.batch(operations, 'info');
        }
    };
};

// CSS Animation styles (should be added to global CSS)
export const toastStyles = `
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.toast-enter {
    animation: slideInRight 0.3s ease-out forwards;
}

.toast-exit {
    animation: slideOutRight 0.3s ease-in forwards;
}
`;

export default {
    ToastProvider,
    useToast,
    useSmartToast,
    MobileToast,
    BatchToastContainer,
    toastStyles
};