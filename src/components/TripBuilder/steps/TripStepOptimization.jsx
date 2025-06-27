// src/components/TripBuilder/steps/TripStepOptimization.jsx
import React, { useState, useMemo } from 'react';
import {
    FaRoute,
    FaMapMarkerAlt,
    FaClock,
    FaDollarSign,
    FaBolt,
    FaExchangeAlt,
    FaCheckCircle,
    FaInfoCircle,
    FaCar,
    FaPlane,
    FaGasPump,
    FaMapSigns,
    FaCompass,
    FaMagic,
    FaArrowRight,
    FaArrowUp,
    FaArrowDown,
    FaSync
} from 'react-icons/fa';
import {
    optimizeTripRoute,
    calculateTotalDistance,
    haversineDistance,
    calculateEstimatedCost
} from '../../../utils/tripPlanner/tripCalculations';

const TripStepOptimization = ({ tripData, setTripData, errors, dismissError }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [showOptimizationDetails, setShowOptimizationDetails] = useState(false);
    const [optimizationHistory, setOptimizationHistory] = useState([]);

    // Calculate current route metrics
    const currentMetrics = useMemo(() => {
        if (!tripData.parks || tripData.parks.length < 2) {
            return {
                totalDistance: 0,
                estimatedDrivingTime: 0,
                estimatedCost: tripData.estimatedCost || 0,
                efficiency: 100
            };
        }

        const distance = calculateTotalDistance(tripData.parks);
        const drivingTime = tripData.transportationMode === 'driving'
            ? Math.round(distance / 65) // Assuming 65 mph average
            : Math.round(tripData.parks.length * 3); // Flight + travel time

        return {
            totalDistance: Math.round(distance),
            estimatedDrivingTime: drivingTime,
            estimatedCost: calculateEstimatedCost(tripData),
            efficiency: calculateRouteEfficiency(tripData.parks)
        };
    }, [tripData.parks, tripData.transportationMode]);

    // Calculate route efficiency (0-100 score)
    const calculateRouteEfficiency = (parks) => {
        if (parks.length < 3) return 100;

        let totalActualDistance = 0;
        let totalOptimalDistance = 0;

        // Calculate actual route distance
        for (let i = 0; i < parks.length - 1; i++) {
            const current = parks[i];
            const next = parks[i + 1];
            if (current.coordinates && next.coordinates) {
                totalActualDistance += haversineDistance(current.coordinates, next.coordinates);
            }
        }

        // Calculate optimal route distance
        const optimizedParks = optimizeTripRoute([...parks]);
        for (let i = 0; i < optimizedParks.length - 1; i++) {
            const current = optimizedParks[i];
            const next = optimizedParks[i + 1];
            if (current.coordinates && next.coordinates) {
                totalOptimalDistance += haversineDistance(current.coordinates, next.coordinates);
            }
        }

        if (totalOptimalDistance === 0) return 100;

        const efficiency = Math.round((totalOptimalDistance / totalActualDistance) * 100);
        return Math.min(100, Math.max(0, efficiency));
    };

    // Optimize route with animation
    const handleOptimizeRoute = async () => {
        if (tripData.parks.length < 2) return;

        setIsOptimizing(true);

        // Store current route for history
        const currentRoute = {
            parks: [...tripData.parks],
            metrics: { ...currentMetrics },
            timestamp: new Date()
        };

        try {
            // Simulate optimization process for UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            const optimizedParks = optimizeTripRoute([...tripData.parks]);
            const newMetrics = {
                totalDistance: calculateTotalDistance(optimizedParks),
                estimatedCost: calculateEstimatedCost({ ...tripData, parks: optimizedParks }),
                efficiency: 100 // Optimized route is 100% efficient
            };

            setTripData(prev => ({ ...prev, parks: optimizedParks }));

            // Update optimization history
            setOptimizationHistory(prev => [
                {
                    ...currentRoute,
                    optimizedTo: {
                        parks: optimizedParks,
                        metrics: newMetrics
                    }
                },
                ...prev.slice(0, 4) // Keep last 5 optimizations
            ]);

        } catch (error) {
            console.error('Optimization failed:', error);
        } finally {
            setIsOptimizing(false);
        }
    };

    // Manual reorder functions
    const moveParkUp = (index) => {
        if (index === 0) return;
        const newParks = [...tripData.parks];
        [newParks[index - 1], newParks[index]] = [newParks[index], newParks[index - 1]];
        setTripData(prev => ({ ...prev, parks: newParks }));
    };

    const moveParkDown = (index) => {
        if (index === tripData.parks.length - 1) return;
        const newParks = [...tripData.parks];
        [newParks[index], newParks[index + 1]] = [newParks[index + 1], newParks[index]];
        setTripData(prev => ({ ...prev, parks: newParks }));
    };

    // Get optimization suggestions
    const getOptimizationSuggestions = () => {
        const suggestions = [];

        if (currentMetrics.efficiency < 80) {
            suggestions.push({
                type: 'route',
                icon: FaRoute,
                title: 'Route Optimization Available',
                description: `Your current route efficiency is ${currentMetrics.efficiency}%. We can improve it!`,
                action: 'Optimize Route',
                severity: 'medium'
            });
        }

        if (tripData.transportationMode === 'driving' && currentMetrics.totalDistance > 2000) {
            suggestions.push({
                type: 'transport',
                icon: FaPlane,
                title: 'Consider Flying',
                description: 'Your route covers over 2,000 miles. Flying might be more efficient.',
                action: 'Switch to Air Travel',
                severity: 'low'
            });
        }

        if (tripData.parks.length > 5 && tripData.totalDuration < tripData.parks.length * 2) {
            suggestions.push({
                type: 'time',
                icon: FaClock,
                title: 'Consider More Time',
                description: 'You might be rushing through parks. Consider extending your trip.',
                action: 'Extend Duration',
                severity: 'low'
            });
        }

        return suggestions;
    };

    const suggestions = getOptimizationSuggestions();

    const getEfficiencyColor = (efficiency) => {
        if (efficiency >= 90) return 'text-green-600 bg-green-100';
        if (efficiency >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (!tripData.parks || tripData.parks.length === 0) {
        return (
            <div className="text-center py-16">
                <FaRoute className="text-6xl mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-600 mb-3">No Parks Selected</h3>
                <p className="text-gray-500 mb-6">
                    You need to select at least 2 parks before you can optimize your route.
                </p>
                <div className="text-sm text-gray-400">
                    Go back to the Parks step to add destinations to your trip.
                </div>
            </div>
        );
    }

    if (tripData.parks.length === 1) {
        return (
            <div className="text-center py-16">
                <FaMapMarkerAlt className="text-6xl mx-auto mb-6 text-blue-300" />
                <h3 className="text-xl font-bold text-gray-600 mb-3">Single Park Trip</h3>
                <p className="text-gray-500 mb-6">
                    You've selected one park. No route optimization needed!
                </p>
                <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-800 mb-2">{tripData.parks[0].parkName}</h4>
                    <p className="text-sm text-blue-600">
                        {tripData.parks[0].state} • {tripData.parks[0].stayDuration} day{tripData.parks[0].stayDuration > 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FaRoute className="text-green-500 text-2xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Route Optimization</h2>
                </div>
                <p className="text-gray-600">
                    Fine-tune your travel route for maximum efficiency and minimum travel time
                </p>
            </div>

            {/* Current Route Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-xl text-center">
                    <FaMapSigns className="text-2xl mx-auto mb-2" />
                    <div className="text-2xl font-bold">{currentMetrics.totalDistance}</div>
                    <div className="text-sm text-blue-100">Total Miles</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl text-center">
                    <FaClock className="text-2xl mx-auto mb-2" />
                    <div className="text-2xl font-bold">{currentMetrics.estimatedDrivingTime}h</div>
                    <div className="text-sm text-purple-100">Travel Time</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-xl text-center">
                    <FaDollarSign className="text-2xl mx-auto mb-2" />
                    <div className="text-2xl font-bold">${Math.round(currentMetrics.estimatedCost).toLocaleString()}</div>
                    <div className="text-sm text-green-100">Est. Cost</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-xl text-center">
                    <FaBolt className="text-2xl mx-auto mb-2" />
                    <div className="text-2xl font-bold">{currentMetrics.efficiency}%</div>
                    <div className="text-sm text-yellow-100">Efficiency</div>
                </div>
            </div>

            {/* Optimization Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaMagic className="text-purple-500" />
                        Route Optimization
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEfficiencyColor(currentMetrics.efficiency)}`}>
                        {currentMetrics.efficiency}% Efficient
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Auto Optimization */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <FaBolt className="text-yellow-500" />
                            Automatic Optimization
                        </h4>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                            <p className="text-sm text-purple-700 mb-4">
                                Our smart algorithm will reorder your parks to minimize travel distance and time using the
                                Traveling Salesman Problem (TSP) optimization.
                            </p>

                            <button
                                onClick={handleOptimizeRoute}
                                disabled={isOptimizing || currentMetrics.efficiency >= 95}
                                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                                    isOptimizing
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : currentMetrics.efficiency >= 95
                                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg'
                                }`}
                            >
                                {isOptimizing ? (
                                    <>
                                        <FaSync className="animate-spin" />
                                        Optimizing Route...
                                    </>
                                ) : currentMetrics.efficiency >= 95 ? (
                                    <>
                                        <FaCheckCircle />
                                        Route Already Optimized
                                    </>
                                ) : (
                                    <>
                                        <FaMagic />
                                        Optimize Route Automatically
                                    </>
                                )}
                            </button>
                        </div>

                        {suggestions.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="font-medium text-gray-700 text-sm">Suggestions:</h5>
                                {suggestions.map((suggestion, index) => {
                                    const Icon = suggestion.icon;
                                    return (
                                        <div key={index} className={`p-3 rounded-lg border ${
                                            suggestion.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                                        }`}>
                                            <div className="flex items-start gap-2">
                                                <Icon className={`mt-0.5 ${
                                                    suggestion.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                                                }`} />
                                                <div className="flex-1">
                                                    <h6 className="font-medium text-sm text-gray-800">{suggestion.title}</h6>
                                                    <p className="text-xs text-gray-600">{suggestion.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Manual Reordering */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <FaExchangeAlt className="text-blue-500" />
                            Manual Reordering
                        </h4>

                        <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                                {tripData.parks.map((park, index) => (
                                    <div key={park.parkId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h6 className="font-medium text-sm text-gray-800 truncate">{park.parkName}</h6>
                                            <p className="text-xs text-gray-500">{park.state}</p>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => moveParkUp(index)}
                                                disabled={index === 0}
                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Move up"
                                            >
                                                <FaArrowUp className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => moveParkDown(index)}
                                                disabled={index === tripData.parks.length - 1}
                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Move down"
                                            >
                                                <FaArrowDown className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Route Visualization */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaCompass className="text-orange-500" />
                    Route Visualization
                </h3>

                <div className="space-y-4">
                    {tripData.parks.map((park, index) => (
                        <div key={park.parkId} className="flex items-center gap-4">
                            <div className="flex items-center gap-3 flex-1 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{park.parkName}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>{park.state}</span>
                                        <span className="flex items-center gap-1">
                      <FaClock className="text-xs" />
                                            {park.stayDuration} day{park.stayDuration > 1 ? 's' : ''}
                    </span>
                                    </div>
                                </div>

                                {index < tripData.parks.length - 1 && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <FaMapSigns className="text-xs" />
                                        {Math.round(haversineDistance(
                                            park.coordinates,
                                            tripData.parks[index + 1].coordinates
                                        ))} mi
                                    </div>
                                )}
                            </div>

                            {index < tripData.parks.length - 1 && (
                                <div className="flex-shrink-0 text-gray-400">
                                    <FaArrowRight />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Transportation Mode Impact */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <FaInfoCircle className="text-blue-600" />
                    Transportation Impact
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-xl border-2 ${
                        tripData.transportationMode === 'driving'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white'
                    }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <FaCar className="text-green-500 text-xl" />
                            <h5 className="font-semibold text-gray-800">Road Trip</h5>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Distance:</span>
                                <span className="font-medium">{currentMetrics.totalDistance} miles</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Driving Time:</span>
                                <span className="font-medium">{Math.round(currentMetrics.totalDistance / 65)} hours</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gas + Wear:</span>
                                <span className="font-medium">${Math.round(currentMetrics.totalDistance * 0.35)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border-2 ${
                        tripData.transportationMode === 'flying'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 bg-white'
                    }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <FaPlane className="text-purple-500 text-xl" />
                            <h5 className="font-semibold text-gray-800">Air Travel</h5>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Flight Segments:</span>
                                <span className="font-medium">{tripData.parks.length - 1}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Travel Time:</span>
                                <span className="font-medium">{tripData.parks.length * 3} hours</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Flight Costs:</span>
                                <span className="font-medium">${Math.round((tripData.parks.length - 1) * 275)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripStepOptimization;