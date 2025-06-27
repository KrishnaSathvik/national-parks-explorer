// src/components/TripBuilder/steps/TripStepBudget.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    FaDollarSign,
    FaHotel,
    FaCar,
    FaPlane,
    FaUtensils,
    FaTicketAlt,
    FaSuitcase,
    FaCalculator,
    FaChartPie,
    FaInfoCircle,
    FaEdit,
    FaSave,
    FaUndo,
    FaLightbulb,
    FaPercentage,
    FaExclamationTriangle,
    FaCheckCircle,
    FaArrowUp,
    FaArrowDown,
    FaTrendingUp,
    FaTrendingDown
} from 'react-icons/fa';
import { calculateTripDuration } from '../../../utils/tripPlanner/tripCalculations';

const TripStepBudget = ({ tripData, setTripData, errors, dismissError }) => {
    const [customBudget, setCustomBudget] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [budgetAlerts, setBudgetAlerts] = useState([]);

    // Default budget parameters based on user preferences
    const getDefaultBudgetParams = () => {
        const budgetStyle = tripData.preferences?.budget || 'moderate';
        const groupSize = tripData.preferences?.groupSize || 2;

        const baseParams = {
            budget: {
                accommodation: 85,
                foodPerDay: 55,
                transportationRate: 0.35,
                parkFeePerPark: 30,
                miscellaneousRate: 0.15
            },
            moderate: {
                accommodation: 120,
                foodPerDay: 75,
                transportationRate: 0.40,
                parkFeePerPark: 30,
                miscellaneousRate: 0.12
            },
            premium: {
                accommodation: 200,
                foodPerDay: 120,
                transportationRate: 0.50,
                parkFeePerPark: 35,
                miscellaneousRate: 0.10
            }
        };

        const params = baseParams[budgetStyle];

        // Adjust for group size
        return {
            accommodationPerNight: Math.round(params.accommodation * Math.sqrt(groupSize)),
            foodPerPersonPerDay: params.foodPerDay,
            transportationRate: params.transportationRate,
            parkFeePerPark: params.parkFeePerPark,
            miscellaneousRate: params.miscellaneousRate,
            groupSize
        };
    };

    const [budgetParams, setBudgetParams] = useState(() =>
        customBudget || getDefaultBudgetParams()
    );

    // Calculate detailed budget breakdown
    const budgetBreakdown = useMemo(() => {
        const duration = calculateTripDuration(tripData.startDate, tripData.endDate);
        const nights = Math.max(0, duration - 1);
        const parksCount = tripData.parks?.length || 0;
        const totalDistance = tripData.totalDistance || 0;

        // Base calculations
        const accommodation = nights * budgetParams.accommodationPerNight;
        const food = duration * budgetParams.foodPerPersonPerDay * budgetParams.groupSize;
        const parkFees = parksCount * budgetParams.parkFeePerPark;

        // Transportation calculation based on mode
        let transportation;
        if (tripData.transportationMode === 'flying') {
            const flightCost = 275; // Base flight cost per segment
            transportation = Math.max(1, parksCount - 1) * flightCost * budgetParams.groupSize;
        } else {
            transportation = totalDistance * budgetParams.transportationRate + (parksCount * 15); // Gas + parking
        }

        const subtotal = accommodation + food + parkFees + transportation;
        const miscellaneous = subtotal * budgetParams.miscellaneousRate;
        const total = subtotal + miscellaneous;

        // Calculate per-person costs
        const perPerson = {
            accommodation: accommodation / budgetParams.groupSize,
            food: food / budgetParams.groupSize,
            parkFees: parkFees / budgetParams.groupSize,
            transportation: transportation / budgetParams.groupSize,
            miscellaneous: miscellaneous / budgetParams.groupSize,
            total: total / budgetParams.groupSize
        };

        // Calculate daily averages
        const perDay = {
            accommodation: accommodation / Math.max(1, nights),
            food: food / duration,
            total: total / duration
        };

        return {
            accommodation: Math.round(accommodation),
            food: Math.round(food),
            parkFees: Math.round(parkFees),
            transportation: Math.round(transportation),
            miscellaneous: Math.round(miscellaneous),
            total: Math.round(total),
            perPerson,
            perDay
        };
    }, [tripData, budgetParams]);

    // Update trip data when budget changes
    useEffect(() => {
        setTripData(prev => ({
            ...prev,
            estimatedCost: budgetBreakdown.total,
            budgetBreakdown: budgetBreakdown
        }));
    }, [budgetBreakdown, setTripData]);

    // Generate budget alerts and recommendations
    useEffect(() => {
        const alerts = [];
        const costPerDay = budgetBreakdown.total / Math.max(1, calculateTripDuration(tripData.startDate, tripData.endDate));

        if (costPerDay > 400) {
            alerts.push({
                type: 'warning',
                icon: FaExclamationTriangle,
                title: 'High Daily Cost',
                message: `Your daily cost of $${Math.round(costPerDay)} is quite high. Consider budget accommodations or camping.`,
                suggestion: 'Reduce accommodation costs by 30%'
            });
        }

        if (budgetBreakdown.accommodation > budgetBreakdown.total * 0.5) {
            alerts.push({
                type: 'info',
                icon: FaInfoCircle,
                title: 'Accommodation Heavy',
                message: 'Accommodation is over 50% of your budget. Consider camping or budget hotels.',
                suggestion: 'Switch to camping for 40% savings'
            });
        }

        if (tripData.transportationMode === 'driving' && budgetBreakdown.transportation > 800) {
            alerts.push({
                type: 'info',
                icon: FaPlane,
                title: 'Consider Flying',
                message: 'Your driving costs are high. Flying might be competitive for this distance.',
                suggestion: 'Compare with flight costs'
            });
        }

        setBudgetAlerts(alerts);
    }, [budgetBreakdown, tripData]);

    // Budget customization functions
    const updateBudgetParam = (param, value) => {
        setBudgetParams(prev => ({
            ...prev,
            [param]: parseFloat(value) || 0
        }));
        setCustomBudget(true);
    };

    const resetToDefaults = () => {
        setBudgetParams(getDefaultBudgetParams());
        setCustomBudget(false);
        setIsEditing(false);
    };

    const saveBudgetCustomization = () => {
        setCustomBudget(budgetParams);
        setIsEditing(false);
    };

    // Budget category data for the pie chart
    const budgetCategories = [
        {
            name: 'Accommodation',
            amount: budgetBreakdown.accommodation,
            percentage: Math.round((budgetBreakdown.accommodation / budgetBreakdown.total) * 100),
            color: 'from-blue-500 to-cyan-500',
            icon: FaHotel
        },
        {
            name: 'Transportation',
            amount: budgetBreakdown.transportation,
            percentage: Math.round((budgetBreakdown.transportation / budgetBreakdown.total) * 100),
            color: tripData.transportationMode === 'flying' ? 'from-purple-500 to-pink-500' : 'from-green-500 to-emerald-500',
            icon: tripData.transportationMode === 'flying' ? FaPlane : FaCar
        },
        {
            name: 'Food',
            amount: budgetBreakdown.food,
            percentage: Math.round((budgetBreakdown.food / budgetBreakdown.total) * 100),
            color: 'from-orange-500 to-red-500',
            icon: FaUtensils
        },
        {
            name: 'Park Fees',
            amount: budgetBreakdown.parkFees,
            percentage: Math.round((budgetBreakdown.parkFees / budgetBreakdown.total) * 100),
            color: 'from-emerald-500 to-teal-500',
            icon: FaTicketAlt
        },
        {
            name: 'Miscellaneous',
            amount: budgetBreakdown.miscellaneous,
            percentage: Math.round((budgetBreakdown.miscellaneous / budgetBreakdown.total) * 100),
            color: 'from-gray-500 to-gray-600',
            icon: FaSuitcase
        }
    ];

    const duration = calculateTripDuration(tripData.startDate, tripData.endDate);
    const nights = Math.max(0, duration - 1);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FaDollarSign className="text-green-500 text-2xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Budget Planning</h2>
                </div>
                <p className="text-gray-600">
                    Customize your budget assumptions and see detailed cost breakdowns for your trip
                </p>
            </div>

            {/* Budget Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-xl text-center">
                    <FaCalculator className="text-3xl mx-auto mb-3" />
                    <div className="text-3xl font-bold">${budgetBreakdown.total.toLocaleString()}</div>
                    <div className="text-sm text-green-100">Total Trip Cost</div>
                    <div className="text-xs text-green-200 mt-1">
                        ${Math.round(budgetBreakdown.perPerson.total).toLocaleString()} per person
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-xl text-center">
                    <FaChartPie className="text-3xl mx-auto mb-3" />
                    <div className="text-3xl font-bold">${Math.round(budgetBreakdown.total / duration).toLocaleString()}</div>
                    <div className="text-sm text-blue-100">Cost Per Day</div>
                    <div className="text-xs text-blue-200 mt-1">
                        ${Math.round(budgetBreakdown.perDay.total / budgetParams.groupSize).toLocaleString()} per person/day
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl text-center">
                    <FaPercentage className="text-3xl mx-auto mb-3" />
                    <div className="text-3xl font-bold">{Math.round((budgetBreakdown.accommodation / budgetBreakdown.total) * 100)}%</div>
                    <div className="text-sm text-purple-100">Accommodation Share</div>
                    <div className="text-xs text-purple-200 mt-1">
                        Largest expense category
                    </div>
                </div>
            </div>

            {/* Budget Alerts */}
            {budgetAlerts.length > 0 && (
                <div className="space-y-3">
                    {budgetAlerts.map((alert, index) => {
                        const Icon = alert.icon;
                        return (
                            <div key={index} className={`p-4 rounded-xl border-l-4 ${
                                alert.type === 'warning'
                                    ? 'bg-yellow-50 border-yellow-400'
                                    : 'bg-blue-50 border-blue-400'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <Icon className={`mt-1 ${
                                        alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                    }`} />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">{alert.title}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaLightbulb className="text-yellow-500" />
                                            {alert.suggestion}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Budget Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Detailed Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Cost Breakdown</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                                isEditing
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                        >
                            <FaEdit />
                            {isEditing ? 'Stop Editing' : 'Customize'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {budgetCategories.map(category => {
                            const Icon = category.icon;
                            return (
                                <div key={category.name} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                                                <Icon />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {category.name === 'Accommodation' && `${nights} nights`}
                                                    {category.name === 'Food' && `${duration} days × ${budgetParams.groupSize} people`}
                                                    {category.name === 'Park Fees' && `${tripData.parks?.length || 0} parks`}
                                                    {category.name === 'Transportation' && tripData.transportationMode}
                                                    {category.name === 'Miscellaneous' && `${Math.round(budgetParams.miscellaneousRate * 100)}% buffer`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-800">${category.amount.toLocaleString()}</div>
                                            <div className="text-sm text-gray-500">{category.percentage}%</div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                                            style={{ width: `${category.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-800">Total Estimated Cost</span>
                            <span className="text-2xl font-bold text-green-600">
                ${budgetBreakdown.total.toLocaleString()}
              </span>
                        </div>
                    </div>
                </div>

                {/* Budget Customization Panel */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {isEditing ? 'Customize Budget Parameters' : 'Budget Parameters'}
                    </h3>

                    <div className="space-y-6">
                        {/* Accommodation */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">
                                Accommodation per night
                            </label>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={budgetParams.accommodationPerNight}
                                        onChange={(e) => updateBudgetParam('accommodationPerNight', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    />
                                    <span className="text-sm text-gray-500">per night</span>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold text-gray-800">
                                    ${budgetParams.accommodationPerNight} per night
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Includes hotels, camping, or other lodging for {budgetParams.groupSize} people
                            </p>
                        </div>

                        {/* Food */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">
                                Food per person per day
                            </label>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={budgetParams.foodPerPersonPerDay}
                                        onChange={(e) => updateBudgetParam('foodPerPersonPerDay', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    />
                                    <span className="text-sm text-gray-500">per person/day</span>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold text-gray-800">
                                    ${budgetParams.foodPerPersonPerDay} per person/day
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Mix of restaurant meals and groceries
                            </p>
                        </div>

                        {/* Transportation */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">
                                Transportation rate
                            </label>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={budgetParams.transportationRate}
                                        onChange={(e) => updateBudgetParam('transportationRate', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    />
                                    <span className="text-sm text-gray-500">per mile</span>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold text-gray-800">
                                    ${budgetParams.transportationRate} per mile
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                {tripData.transportationMode === 'driving'
                                    ? 'Gas, wear & tear, and parking fees'
                                    : 'Flight costs and local transportation'
                                }
                            </p>
                        </div>

                        {/* Park Fees */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">
                                Park fee per park
                            </label>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={budgetParams.parkFeePerPark}
                                        onChange={(e) => updateBudgetParam('parkFeePerPark', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    />
                                    <span className="text-sm text-gray-500">per park</span>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold text-gray-800">
                                    ${budgetParams.parkFeePerPark} per park
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                National Park entrance fees (consider Annual Pass for $80)
                            </p>
                        </div>

                        {/* Miscellaneous */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">
                                Miscellaneous buffer
                            </label>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={budgetParams.miscellaneousRate}
                                        onChange={(e) => updateBudgetParam('miscellaneousRate', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    />
                                    <span className="text-sm text-gray-500">× subtotal</span>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold text-gray-800">
                                    {Math.round(budgetParams.miscellaneousRate * 100)}% of subtotal
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Shopping, activities, and unexpected expenses
                            </p>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={saveBudgetCustomization}
                                    className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                >
                                    <FaSave />
                                    Save Changes
                                </button>
                                <button
                                    onClick={resetToDefaults}
                                    className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                >
                                    <FaUndo />
                                    Reset Defaults
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Budget Tips */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                    <FaLightbulb className="text-green-600" />
                    Money-Saving Tips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-green-700">
                            <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Accommodation:</strong> Mix camping with hotels, book early for discounts</span>
                        </div>
                        <div className="flex items-start gap-2 text-green-700">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Annual Pass:</strong> $80 pass pays for itself with 3+ parks</span>
                        </div>
                        <div className="flex items-start gap-2 text-green-700">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Food:</strong> Pack lunches, cook at campsites, shop at local stores</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-green-700">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Transportation:</strong> Group travel reduces per-person costs</span>
                        </div>
                        <div className="flex items-start gap-2 text-green-700">
                            <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Timing:</strong> Shoulder seasons offer lower prices</span>
                        </div>
                        <div className="flex items-start gap-2 text-green-700">
                            <span className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Activities:</strong> Many park activities are free or low-cost</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripStepBudget;