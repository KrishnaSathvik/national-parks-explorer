// src/components/TripBuilder/TripBuilderWizard.jsx
import React from 'react';
import {
    FaInfoCircle,
    FaHeart,
    FaMapMarkerAlt,
    FaRoute,
    FaDollarSign,
    FaCheckCircle,
    FaChevronRight,
    FaCheck
} from 'react-icons/fa';
import { useTripPlanner } from '../TripPlanner/core/TripPlannerProvider';

const TripBuilderWizard = ({ className = '' }) => {
    const { currentStep, goToStep, currentTrip } = useTripPlanner();

    // Enhanced step configuration with new steps
    const steps = [
        {
            id: 1,
            title: 'Trip Basics',
            shortTitle: 'Basics',
            icon: FaInfoCircle,
            description: 'Title, dates, and transportation',
            color: 'pink',
            isRequired: true
        },
        {
            id: 2,
            title: 'Preferences',
            shortTitle: 'Preferences',
            icon: FaHeart,
            description: 'Activities and difficulty level',
            color: 'purple',
            isRequired: false
        },
        {
            id: 3,
            title: 'Select Parks',
            shortTitle: 'Parks',
            icon: FaMapMarkerAlt,
            description: 'Choose your destinations',
            color: 'blue',
            isRequired: true
        },
        {
            id: 4,
            title: 'Optimize Route',
            shortTitle: 'Route',
            icon: FaRoute,
            description: 'Optimize your travel path',
            color: 'green',
            isRequired: false
        },
        {
            id: 5,
            title: 'Budget Setup',
            shortTitle: 'Budget',
            icon: FaDollarSign,
            description: 'Customize cost estimates',
            color: 'yellow',
            isRequired: false
        },
        {
            id: 6,
            title: 'Review & Save',
            shortTitle: 'Review',
            icon: FaCheckCircle,
            description: 'Finalize your trip',
            color: 'emerald',
            isRequired: true
        }
    ];

    const getStepStatus = (step) => {
        if (currentStep > step.id) return 'completed';
        if (currentStep === step.id) return 'current';
        return 'upcoming';
    };

    const isStepClickable = (step) => {
        // Can always go back to completed steps
        if (currentStep > step.id) return true;

        // Can't skip required steps
        if (step.isRequired && currentStep < step.id) return false;

        // Can access current step
        if (currentStep === step.id) return true;

        // Can access next step if current is optional or completed
        if (currentStep === step.id - 1) return true;

        return false;
    };

    const getColorClasses = (color, status) => {
        const colorMap = {
            pink: {
                current: 'bg-pink-500 text-white border-pink-500',
                completed: 'bg-pink-100 text-pink-700 border-pink-300',
                upcoming: 'bg-gray-100 text-gray-400 border-gray-200'
            },
            purple: {
                current: 'bg-purple-500 text-white border-purple-500',
                completed: 'bg-purple-100 text-purple-700 border-purple-300',
                upcoming: 'bg-gray-100 text-gray-400 border-gray-200'
            },
            blue: {
                current: 'bg-blue-500 text-white border-blue-500',
                completed: 'bg-blue-100 text-blue-700 border-blue-300',
                upcoming: 'bg-gray-100 text-gray-400 border-gray-200'
            },
            green: {
                current: 'bg-green-500 text-white border-green-500',
                completed: 'bg-green-100 text-green-700 border-green-300',
                upcoming: 'bg-gray-100 text-gray-400 border-gray-200'
            },
            yellow: {
                current: 'bg-yellow-500 text-white border-yellow-500',
                completed: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                upcoming: 'bg-gray-100 text-gray-400 border-gray-200'
            },
            emerald: {
                current: 'bg-emerald-500 text-white border-emerald-500',
                completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                upcoming: 'bg-gray-100 text-gray-400 border-gray-200'
            }
        };

        return colorMap[color]?.[status] || colorMap.pink[status];
    };

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-4 text-white">
                <h3 className="font-bold text-lg mb-1">Trip Builder Progress</h3>
                <p className="text-sm text-pink-100">
                    {currentTrip?.title || 'New Trip'} • Step {currentStep} of {steps.length}
                </p>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block p-6">
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const status = getStepStatus(step);
                        const isClickable = isStepClickable(step);

                        return (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => isClickable && goToStep(step.id)}
                                    disabled={!isClickable}
                                    className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                                        getColorClasses(step.color, status)
                                    } ${
                                        isClickable
                                            ? 'hover:shadow-md transform hover:-translate-y-0.5'
                                            : 'cursor-not-allowed'
                                    }`}
                                >
                                    {/* Step Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                        status === 'completed'
                                            ? `bg-${step.color}-500 text-white border-${step.color}-500`
                                            : status === 'current'
                                                ? 'bg-white text-current border-current'
                                                : 'bg-current text-white border-current'
                                    }`}>
                                        {status === 'completed' ? <FaCheck className="text-sm" /> : <Icon className="text-sm" />}
                                    </div>

                                    {/* Step Info */}
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{step.title}</h4>
                                            {step.isRequired && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                                            )}
                                        </div>
                                        <p className="text-sm opacity-75">{step.description}</p>
                                    </div>

                                    {/* Arrow */}
                                    {status === 'current' && (
                                        <FaChevronRight className="text-sm opacity-75" />
                                    )}
                                </button>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="ml-9 my-2">
                                        <div className={`w-0.5 h-6 ${
                                            currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                                        }`}></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-sm text-gray-500">{currentStep}/{steps.length}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    ></div>
                </div>

                {/* Current Step */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            getColorClasses(steps[currentStep - 1]?.color || 'pink', 'current')
                        }`}>
                            {React.createElement(steps[currentStep - 1]?.icon || FaInfoCircle, { className: 'text-sm' })}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">
                                {steps[currentStep - 1]?.title || 'Unknown Step'}
                            </h4>
                            <p className="text-sm text-gray-600">
                                {steps[currentStep - 1]?.description || 'Step description'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {steps.map((step) => {
                        const status = getStepStatus(step);
                        const isClickable = isStepClickable(step);

                        return (
                            <button
                                key={step.id}
                                onClick={() => isClickable && goToStep(step.id)}
                                disabled={!isClickable}
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                                    getColorClasses(step.color, status)
                                } ${isClickable ? 'hover:shadow-md' : 'cursor-not-allowed'}`}
                                title={step.title}
                            >
                                {status === 'completed' ? <FaCheck /> : step.id}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer with Tips */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                    <strong>Tip:</strong> You can skip optional steps and return to them later.
                    Required steps must be completed to save your trip.
                </div>
            </div>
        </div>
    );
};

export default TripBuilderWizard;