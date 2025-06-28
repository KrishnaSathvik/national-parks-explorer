// src/components/shared/ui/ProgressIndicators.jsx
import React, { useState, useEffect } from 'react';
import { FaCheck, FaRoute, FaMapMarkerAlt, FaClock, FaPlane, FaCar, FaStar } from 'react-icons/fa';

/**
 * Comprehensive progress indicators for trip planning workflow
 * Provides visual feedback for multi-step processes and loading states
 */

// Basic Progress Bar
export const ProgressBar = ({
                                progress = 0,
                                className = "",
                                showPercentage = false,
                                color = "primary",
                                size = "md",
                                animated = true
                            }) => {
    const sizeClasses = {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4"
    };

    const colorClasses = {
        primary: "bg-gradient-to-r from-pink-500 to-purple-500",
        success: "bg-gradient-to-r from-green-500 to-emerald-500",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
        info: "bg-gradient-to-r from-blue-500 to-cyan-500",
        danger: "bg-gradient-to-r from-red-500 to-rose-500"
    };

    return (
        <div className={`w-full ${className}`}>
            <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`
            ${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out
            ${animated ? 'bg-[length:200%_100%] animate-gradient-x' : ''}
          `}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
            {showPercentage && (
                <div className="text-xs text-gray-600 mt-1 text-center">
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
};

// Trip Planning Step Progress
export const TripStepProgress = ({
                                     steps = [],
                                     currentStep = 0,
                                     className = "",
                                     orientation = "horizontal",
                                     showLabels = true,
                                     allowClickNavigation = false,
                                     onStepClick
                                 }) => {
    const handleStepClick = (stepIndex) => {
        if (allowClickNavigation && onStepClick && stepIndex <= currentStep) {
            onStepClick(stepIndex);
        }
    };

    const getStepStatus = (index) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'upcoming';
    };

    const stepStatusClasses = {
        completed: 'bg-green-500 text-white border-green-500',
        current: 'bg-pink-500 text-white border-pink-500 ring-4 ring-pink-200',
        upcoming: 'bg-gray-200 text-gray-500 border-gray-300'
    };

    const lineStatusClasses = {
        completed: 'bg-green-500',
        current: 'bg-gradient-to-r from-green-500 to-pink-500',
        upcoming: 'bg-gray-200'
    };

    if (orientation === 'vertical') {
        return (
            <div className={`flex flex-col ${className}`}>
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isClickable = allowClickNavigation && index <= currentStep;

                    return (
                        <div key={index} className="flex items-start">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => handleStepClick(index)}
                                    disabled={!isClickable}
                                    className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold 
                    transition-all duration-200 ${stepStatusClasses[status]}
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  `}
                                >
                                    {status === 'completed' ? <FaCheck className="text-xs" /> : index + 1}
                                </button>

                                {index < steps.length - 1 && (
                                    <div className={`w-0.5 h-12 mt-2 ${lineStatusClasses[status]}`} />
                                )}
                            </div>

                            {showLabels && (
                                <div className="ml-4 pb-8">
                                    <h4 className={`font-medium ${status === 'current' ? 'text-pink-600' : 'text-gray-700'}`}>
                                        {step.title}
                                    </h4>
                                    {step.description && (
                                        <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {steps.map((step, index) => {
                const status = getStepStatus(index);
                const isClickable = allowClickNavigation && index <= currentStep;

                return (
                    <div key={index} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => handleStepClick(index)}
                                disabled={!isClickable}
                                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold 
                  transition-all duration-200 ${stepStatusClasses[status]}
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                `}
                            >
                                {status === 'completed' ? <FaCheck className="text-xs" /> : index + 1}
                            </button>

                            {showLabels && (
                                <div className="mt-2 text-center">
                                    <div className={`text-xs font-medium ${status === 'current' ? 'text-pink-600' : 'text-gray-600'}`}>
                                        {step.title}
                                    </div>
                                </div>
                            )}
                        </div>

                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-4">
                                <div className={`h-0.5 ${lineStatusClasses[status]}`} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Trip Planning Progress with Icons
export const TripPlanningProgress = ({
                                         currentStep = 0,
                                         steps = [
                                             { id: 'basics', title: 'Trip Details', icon: FaRoute },
                                             { id: 'parks', title: 'Select Parks', icon: FaMapMarkerAlt },
                                             { id: 'review', title: 'Review & Save', icon: FaCheck }
                                         ],
                                         className = ""
                                     }) => {
    return (
        <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                Trip Planning Progress
            </h3>

            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isUpcoming = index > currentStep;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-pink-500 border-pink-500 text-white ring-4 ring-pink-200' : ''}
                  ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                `}>
                                    {isCompleted ? <FaCheck className="text-lg" /> : <Icon className="text-lg" />}
                                </div>
                                <div className="mt-2 text-center">
                                    <div className={`text-sm font-medium ${
                                        isCurrent ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </div>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-4">
                                    <div className={`h-1 rounded-full transition-all duration-300 ${
                                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Circular Progress Indicator
export const CircularProgress = ({
                                     progress = 0,
                                     size = 120,
                                     strokeWidth = 8,
                                     color = "primary",
                                     showPercentage = true,
                                     className = "",
                                     children
                                 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference.toFixed(3);
    const strokeDashoffset = (circumference - (progress / 100) * circumference).toFixed(3);

    const colorClasses = {
        primary: "#ec4899",
        success: "#10b981",
        warning: "#f59e0b",
        info: "#3b82f6",
        danger: "#ef4444"
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colorClasses[color]}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                {children || (showPercentage && (
                    <span className="text-2xl font-bold text-gray-700">
            {Math.round(progress)}%
          </span>
                ))}
            </div>
        </div>
    );
};

// Trip Save Progress
export const TripSaveProgress = ({
                                     isVisible = false,
                                     steps = [
                                         { label: 'Validating trip data', duration: 1000 },
                                         { label: 'Calculating routes', duration: 1500 },
                                         { label: 'Optimizing costs', duration: 1000 },
                                         { label: 'Saving to database', duration: 800 }
                                     ],
                                     onComplete
                                 }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCurrentStepIndex(0);
            setProgress(0);
            return;
        }

        let timeoutId;
        let totalTime = 0;

        const runStep = (stepIndex) => {
            if (stepIndex >= steps.length) {
                setProgress(100);
                if (onComplete) {
                    setTimeout(onComplete, 500);
                }
                return;
            }

            setCurrentStepIndex(stepIndex);
            const stepDuration = steps[stepIndex].duration;

            // Animate progress during this step
            const startProgress = (stepIndex / steps.length) * 100;
            const endProgress = ((stepIndex + 1) / steps.length) * 100;

            let elapsed = 0;
            const progressInterval = setInterval(() => {
                elapsed += 50;
                const stepProgress = Math.min(elapsed / stepDuration, 1);
                setProgress(startProgress + (endProgress - startProgress) * stepProgress);

                if (elapsed >= stepDuration) {
                    clearInterval(progressInterval);
                    setTimeout(() => runStep(stepIndex + 1), 100);
                }
            }, 50);
        };

        runStep(0);

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isVisible, steps, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="relative mx-auto mb-4">
                        <CircularProgress
                            progress={progress}
                            size={80}
                            color="primary"
                            showPercentage={false}
                        >
                            <FaRoute className="text-2xl text-pink-500" />
                        </CircularProgress>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Saving Your Trip</h3>
                    <p className="text-gray-600">Please wait while we process your amazing adventure...</p>
                </div>

                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={index} className={`flex items-center gap-3 transition-all duration-300 ${
                            index < currentStepIndex ? 'opacity-60' :
                                index === currentStepIndex ? 'opacity-100' : 'opacity-40'
                        }`}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                index < currentStepIndex ? 'bg-green-500 border-green-500' :
                                    index === currentStepIndex ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                            }`}>
                                {index < currentStepIndex && <FaCheck className="text-white text-xs" />}
                                {index === currentStepIndex && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                            </div>
                            <span className={`text-sm ${
                                index === currentStepIndex ? 'text-gray-800 font-medium' : 'text-gray-600'
                            }`}>
                {step.label}
              </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <ProgressBar progress={progress} color="primary" animated />
                </div>
            </div>
        </div>
    );
};

// Multi-step Form Progress
export const FormStepProgress = ({
                                     totalSteps,
                                     currentStep,
                                     stepNames = [],
                                     className = ""
                                 }) => {
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className={`${className}`}>
            <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
                <span className="text-sm text-gray-500">
          {Math.round(progressPercentage)}% Complete
        </span>
            </div>

            <ProgressBar
                progress={progressPercentage}
                color="primary"
                size="sm"
                animated
            />

            {stepNames[currentStep - 1] && (
                <div className="text-center mt-3">
                    <p className="text-sm font-medium text-gray-700">
                        {stepNames[currentStep - 1]}
                    </p>
                </div>
            )}
        </div>
    );
};

// Loading Progress with Transportation Theme
export const TransportationProgress = ({
                                           mode = 'driving',
                                           progress = 0,
                                           message = '',
                                           isVisible = false
                                       }) => {
    const transportConfig = {
        driving: {
            icon: FaCar,
            color: 'green',
            defaultMessage: 'Planning your road trip...'
        },
        flying: {
            icon: FaPlane,
            color: 'blue',
            defaultMessage: 'Booking your flights...'
        }
    };

    const config = transportConfig[mode] || transportConfig.driving;
    const Icon = config.icon;

    if (!isVisible) return null;

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="text-center mb-6">
                <Icon className={`mx-auto text-4xl text-${config.color}-500 mb-3 animate-bounce`} />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {message || config.defaultMessage}
                </h3>
                <p className="text-sm text-gray-600">
                    We're optimizing your {mode === 'flying' ? 'flight routes' : 'driving route'}...
                </p>
            </div>

            <div className="space-y-4">
                <ProgressBar
                    progress={progress}
                    color={config.color === 'green' ? 'success' : 'info'}
                    size="md"
                    animated
                    showPercentage
                />

                <div className="flex justify-center">
                    <div className="flex space-x-1">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full bg-${config.color}-500 animate-bounce`}
                                style={{ animationDelay: `${(i - 1) * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Analytics Loading Progress
export const AnalyticsProgress = ({
                                      isVisible = false,
                                      dataTypes = ['trips', 'costs', 'routes', 'insights'],
                                      onComplete
                                  }) => {
    const [currentDataType, setCurrentDataType] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCurrentDataType(0);
            setProgress(0);
            return;
        }

        let interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 2;

                if (newProgress >= 100) {
                    clearInterval(interval);
                    if (onComplete) {
                        setTimeout(onComplete, 500);
                    }
                    return 100;
                }

                // Update current data type based on progress
                const typeIndex = Math.floor((newProgress / 100) * dataTypes.length);
                if (typeIndex !== currentDataType && typeIndex < dataTypes.length) {
                    setCurrentDataType(typeIndex);
                }

                return newProgress;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isVisible, dataTypes.length, currentDataType, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-center mb-4">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-800">Generating Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Processing {dataTypes[currentDataType]}...
                </p>
            </div>

            <ProgressBar
                progress={progress}
                color="info"
                animated
                showPercentage
            />
        </div>
    );
};

// Export all components
export default {
    ProgressBar,
    TripStepProgress,
    TripPlanningProgress,
    CircularProgress,
    TripSaveProgress,
    FormStepProgress,
    TransportationProgress,
    AnalyticsProgress
};