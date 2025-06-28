// src/components/shared/ui/LoadingStates.jsx
import React from 'react';
import { FaSpinner, FaRoute, FaMapMarkerAlt, FaPlane, FaCar } from 'react-icons/fa';

/**
 * Comprehensive loading states and skeleton loaders
 * Provides consistent loading experiences across the app
 */

// Base skeleton component
const Skeleton = ({ className = "", animate = true, children }) => (
    <div className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}>
        {children}
    </div>
);

// Shimmer skeleton with gradient animation
const ShimmerSkeleton = ({ className = "", width = "100%", height = "20px" }) => (
    <div
        className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
        style={{
            width,
            height,
            animation: 'shimmer 2s infinite linear'
        }}
    />
);

// Spinner components
export const LoadingSpinner = ({ size = "md", color = "primary", className = "" }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
    };

    const colorClasses = {
        primary: "text-pink-500",
        secondary: "text-blue-500",
        gray: "text-gray-500",
        white: "text-white"
    };

    return (
        <FaSpinner
            className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        />
    );
};

export const TripLoadingSpinner = ({ message = "Loading trip data...", size = "lg" }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-4">
            <FaRoute className={`${size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'} text-pink-500 animate-pulse`} />
            <LoadingSpinner size="sm" className="absolute -top-1 -right-1 text-blue-500" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
    </div>
);

// Card skeleton loaders
export const TripCardSkeleton = ({ showActions = true }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            {showActions && (
                <Skeleton className="w-8 h-8 rounded-full ml-4" />
            )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center">
                    <Skeleton className="h-8 w-8 rounded-full mx-auto mb-1" />
                    <Skeleton className="h-3 w-full" />
                </div>
            ))}
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
        </div>

        {/* Footer */}
        {showActions && (
            <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
        )}
    </div>
);

export const TripListSkeleton = ({ count = 6, showFilters = true }) => (
    <div className="space-y-6">
        {/* Filters skeleton */}
        {showFilters && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-10 w-24 rounded-lg" />
                    ))}
                </div>
            </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }, (_, i) => (
                <TripCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

// Trip viewer skeleton
export const TripViewerSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <Skeleton className="h-8 w-2/3 mb-3 bg-white/20" animate={false} />
                    <div className="flex items-center gap-4 text-sm">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-4 w-16 bg-white/20" animate={false} />
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg bg-white/20" animate={false} />
                    <Skeleton className="w-8 h-8 rounded-lg bg-white/20" animate={false} />
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
            <div className="flex">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-12 w-24 m-2 rounded-lg" />
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
            </div>
        </div>
    </div>
);

// Map skeleton
export const MapSkeleton = ({ className = "h-96" }) => (
    <div className={`relative bg-gradient-to-br from-blue-100 to-green-100 rounded-xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
                <FaMapMarkerAlt className="mx-auto text-4xl text-gray-400 mb-4 animate-pulse" />
                <p className="text-gray-500 font-medium">Loading map...</p>
            </div>
        </div>

        {/* Floating controls skeleton */}
        <div className="absolute top-4 right-4 space-y-2">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-10 h-10 rounded-lg" />
        </div>

        {/* Info panel skeleton */}
        <div className="absolute top-4 left-4">
            <div className="bg-white rounded-lg p-3 shadow-md border">
                <Skeleton className="h-5 w-20 mb-2" />
                <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </div>
    </div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 5 }) => (
    <div className="space-y-6">
        {Array.from({ length: fields }, (_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-11 w-full rounded-lg" />
            </div>
        ))}
        <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 w-24 rounded-lg" />
        </div>
    </div>
);

// Analytics skeleton
export const AnalyticsSkeleton = () => (
    <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                    <Skeleton className="h-8 w-8 rounded-full mb-3" />
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-4 w-12" />
                </div>
            ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    </div>
);

// Template skeleton
export const TemplateSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <Skeleton className="w-12 h-12 bg-white/20" animate={false} />
                        <div className="text-right">
                            <Skeleton className="h-6 w-16 mb-1 bg-white/20" animate={false} />
                            <Skeleton className="h-4 w-12 bg-white/20" animate={false} />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2 bg-white/20" animate={false} />
                    <Skeleton className="h-4 w-1/2 bg-white/20" animate={false} />
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3].map(j => (
                            <div key={j} className="text-center">
                                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 mb-6">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
            </div>
        ))}
    </div>
);

// Page loading with transportation theme
export const TripPlannerPageSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
            </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            {/* Hero section */}
            <div className="text-center py-12">
                <Skeleton className="h-12 w-2/3 mx-auto mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
                <div className="flex justify-center gap-4">
                    <Skeleton className="h-12 w-32 rounded-xl" />
                    <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
            </div>

            {/* Stats or content grid */}
            <TripListSkeleton />
        </div>
    </div>
);

// Loading states with transportation animations
export const TransportationLoader = ({ mode = "driving", message = "Planning your route..." }) => {
    const icons = {
        driving: FaCar,
        flying: FaPlane
    };

    const Icon = icons[mode] || FaCar;

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-blue-600 animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2">
                    <LoadingSpinner size="sm" color="primary" />
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {mode === 'flying' ? 'Preparing Flight Plan' : 'Mapping Your Route'}
            </h3>
            <p className="text-gray-600 mb-4">{message}</p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>Processing</span>
            </div>
        </div>
    );
};

// Progressive loading component
export const ProgressiveLoader = ({
                                      steps = [],
                                      currentStep = 0,
                                      message = "Loading...",
                                      showProgress = true
                                  }) => {
    const progress = steps.length > 0 ? (currentStep / steps.length) * 100 : 0;

    return (
        <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-6">
                <FaRoute className="w-8 h-8 text-white" />
            </div>

            {/* Progress bar */}
            {showProgress && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {/* Current step */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                {message}
            </h3>

            {/* Steps list */}
            {steps.length > 0 && (
                <div className="w-full space-y-2">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                                index < currentStep
                                    ? 'text-green-600 bg-green-50'
                                    : index === currentStep
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-400'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${
                                index < currentStep
                                    ? 'bg-green-500'
                                    : index === currentStep
                                        ? 'bg-blue-500 animate-pulse'
                                        : 'bg-gray-300'
                            }`}></div>
                            <span className="text-sm">{step}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Loading overlay
export const LoadingOverlay = ({
                                   isVisible = false,
                                   message = "Loading...",
                                   type = "spinner",
                                   onCancel = null
                               }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                {type === 'spinner' && (
                    <div className="text-center">
                        <LoadingSpinner size="xl" className="mx-auto mb-4" />
                        <p className="text-gray-700 font-medium">{message}</p>
                    </div>
                )}

                {type === 'progressive' && (
                    <ProgressiveLoader message={message} />
                )}

                {type === 'transportation' && (
                    <TransportationLoader message={message} />
                )}

                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

// Button loading states
export const LoadingButton = ({
                                  children,
                                  isLoading = false,
                                  loadingText = "Loading...",
                                  disabled = false,
                                  className = "",
                                  ...props
                              }) => (
    <button
        {...props}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 transition-all ${
            isLoading ? 'cursor-not-allowed opacity-75' : ''
        } ${className}`}
    >
        {isLoading && <LoadingSpinner size="sm" color="white" />}
        <span>{isLoading ? loadingText : children}</span>
    </button>
);

// Content placeholder
export const ContentPlaceholder = ({
                                       icon: Icon = FaRoute,
                                       title = "No content available",
                                       description = "Content will appear here when available.",
                                       action = null,
                                       className = ""
                                   }) => (
    <div className={`text-center py-12 px-6 ${className}`}>
        <Icon className="mx-auto text-5xl text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
        {action}
    </div>
);

// Export all components
export default {
    Skeleton,
    ShimmerSkeleton,
    LoadingSpinner,
    TripLoadingSpinner,
    TripCardSkeleton,
    TripListSkeleton,
    TripViewerSkeleton,
    MapSkeleton,
    FormSkeleton,
    AnalyticsSkeleton,
    TemplateSkeleton,
    TripPlannerPageSkeleton,
    TransportationLoader,
    ProgressiveLoader,
    LoadingOverlay,
    LoadingButton,
    ContentPlaceholder
};