// src/components/TripViewer/tabs/TripBudget.jsx
import React, { useMemo, useState } from 'react';
import { FaDollarSign, FaBed, FaCar, FaPlane, FaUtensils, FaTicketAlt, FaInfoCircle, FaChartPie, FaCalculator } from 'react-icons/fa';
import { calculateEstimatedCost } from '../../../utils/tripPlanner/tripCalculations';
import { formatCurrency } from '../../../utils/common/formatters';

const TripBudget = ({ trip }) => {
    const [showBreakdown, setShowBreakdown] = useState(true);
    const [costView, setCostView] = useState('detailed'); // 'detailed' or 'summary'

    // Enhanced cost calculation using the utility function
    const costBreakdown = useMemo(() => {
        const duration = trip.totalDuration || 1;
        const distance = trip.totalDistance || 0;
        const parksCount = trip.parks?.length || 0;
        const nights = Math.max(0, duration - 1);

        // Base calculations
        const accommodation = nights * 85; // $85/night average
        const transportation = trip.transportationMode === 'flying'
            ? parksCount * 275 + (distance * 0.15) // Flights + local car rental
            : distance * 0.35 + (parksCount * 15); // Gas + wear + parking
        const parkFees = parksCount * 30; // $30/park average
        const food = duration * 55; // $55/day for meals
        const miscellaneous = Math.round((accommodation + transportation + parkFees + food) * 0.15); // 15% buffer

        const subtotal = accommodation + transportation + parkFees + food;
        const total = subtotal + miscellaneous;

        return {
            accommodation: Math.round(accommodation),
            transportation: Math.round(transportation),
            parkFees: Math.round(parkFees),
            food: Math.round(food),
            miscellaneous: Math.round(miscellaneous),
            subtotal: Math.round(subtotal),
            total: Math.round(total),
            // Additional metrics
            costPerDay: Math.round(total / duration),
            costPerPark: parksCount > 0 ? Math.round(total / parksCount) : 0,
            costPerMile: distance > 0 ? Math.round((total / distance) * 100) / 100 : 0
        };
    }, [trip]);

    // Budget categories for visualization
    const budgetCategories = [
        {
            category: 'Accommodation',
            amount: costBreakdown.accommodation,
            percentage: Math.round((costBreakdown.accommodation / costBreakdown.total) * 100),
            icon: FaBed,
            color: 'bg-blue-500',
            lightColor: 'bg-blue-100',
            textColor: 'text-blue-700',
            description: `${trip.totalDuration - 1} nights at $85/night average`
        },
        {
            category: 'Transportation',
            amount: costBreakdown.transportation,
            percentage: Math.round((costBreakdown.transportation / costBreakdown.total) * 100),
            icon: trip.transportationMode === 'flying' ? FaPlane : FaCar,
            color: 'bg-green-500',
            lightColor: 'bg-green-100',
            textColor: 'text-green-700',
            description: trip.transportationMode === 'flying'
                ? `Flights + rental car for ${Math.round(trip.totalDistance || 0)} miles`
                : `Gas + vehicle costs for ${Math.round(trip.totalDistance || 0)} miles`
        },
        {
            category: 'Park Fees',
            amount: costBreakdown.parkFees,
            percentage: Math.round((costBreakdown.parkFees / costBreakdown.total) * 100),
            icon: FaTicketAlt,
            color: 'bg-purple-500',
            lightColor: 'bg-purple-100',
            textColor: 'text-purple-700',
            description: `Entry fees for ${trip.parks?.length || 0} parks`
        },
        {
            category: 'Food',
            amount: costBreakdown.food,
            percentage: Math.round((costBreakdown.food / costBreakdown.total) * 100),
            icon: FaUtensils,
            color: 'bg-orange-500',
            lightColor: 'bg-orange-100',
            textColor: 'text-orange-700',
            description: `Meals for ${trip.totalDuration || 1} days at $55/day`
        },
        {
            category: 'Miscellaneous',
            amount: costBreakdown.miscellaneous,
            percentage: Math.round((costBreakdown.miscellaneous / costBreakdown.total) * 100),
            icon: FaCalculator,
            color: 'bg-gray-500',
            lightColor: 'bg-gray-100',
            textColor: 'text-gray-700',
            description: 'Souvenirs, tips, unexpected expenses (15% buffer)'
        }
    ];

    // Budget tips based on trip characteristics
    const getBudgetTips = () => {
        const tips = [];

        if (costBreakdown.costPerDay > 300) {
            tips.push("Consider camping or budget accommodations to reduce daily costs");
        }

        if (trip.transportationMode === 'driving' && trip.totalDistance > 2000) {
            tips.push("For long distances, compare flight costs including rental car");
        }

        if (trip.parks?.length > 5) {
            tips.push("Look into America the Beautiful Annual Pass ($80) for multiple parks");
        }

        if (costBreakdown.accommodation > costBreakdown.total * 0.4) {
            tips.push("Accommodation is 40%+ of budget - consider camping or hostels");
        }

        tips.push("Book accommodations 2-3 months ahead for better rates");
        tips.push("Pack snacks and lunch to reduce food costs");

        return tips;
    };

    const budgetTips = getBudgetTips();

    return (
        <div className="space-y-6">
            {/* Budget Summary Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaDollarSign className="text-green-600" />
                        Trip Budget
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCostView('detailed')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                costView === 'detailed'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Detailed
                        </button>
                        <button
                            onClick={() => setCostView('summary')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                costView === 'summary'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Summary
                        </button>
                    </div>
                </div>

                {/* Total Cost Display */}
                <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                        ${costBreakdown.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                        Total Estimated Cost for {trip.totalDuration || 1} day{(trip.totalDuration || 1) > 1 ? 's' : ''}
                    </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="font-bold text-blue-600">${costBreakdown.costPerDay}</div>
                        <div className="text-xs text-gray-500">Per Day</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-purple-600">${costBreakdown.costPerPark}</div>
                        <div className="text-xs text-gray-500">Per Park</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-orange-600">${costBreakdown.costPerMile}</div>
                        <div className="text-xs text-gray-500">Per Mile</div>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            {costView === 'detailed' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FaChartPie className="text-gray-600" />
                            Cost Breakdown
                        </h4>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {budgetCategories.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${item.lightColor}`}>
                                                <Icon className={`text-sm ${item.textColor}`} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">{item.category}</div>
                                                <div className="text-xs text-gray-500">{item.description}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-800">${item.amount.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">{item.percentage}%</div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${item.color}`}
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Subtotal and Total */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700">Subtotal</span>
                            <span className="font-semibold text-gray-800">${costBreakdown.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total with Buffer (15%)</span>
                            <span className="font-bold text-green-600 text-lg">${costBreakdown.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary View */}
            {costView === 'summary' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {budgetCategories.slice(0, 4).map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
                                <div className={`mx-auto w-12 h-12 rounded-full ${item.lightColor} flex items-center justify-center mb-3`}>
                                    <Icon className={`text-lg ${item.textColor}`} />
                                </div>
                                <div className="font-bold text-gray-800 mb-1">${item.amount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">{item.category}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Budget Tips */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-yellow-600" />
                    Money-Saving Tips
                </h4>
                <ul className="space-y-2">
                    {budgetTips.map((tip, index) => (
                        <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Budget Comparison */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Budget Comparison</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-bold text-green-600">${Math.round(costBreakdown.total * 0.75).toLocaleString()}</div>
                        <div className="text-xs text-green-700">Budget Option</div>
                        <div className="text-xs text-gray-500 mt-1">Camping + simple meals</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-bold text-blue-600">${costBreakdown.total.toLocaleString()}</div>
                        <div className="text-xs text-blue-700">Current Estimate</div>
                        <div className="text-xs text-gray-500 mt-1">Mixed accommodations</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="font-bold text-purple-600">${Math.round(costBreakdown.total * 1.5).toLocaleString()}</div>
                        <div className="text-xs text-purple-700">Luxury Option</div>
                        <div className="text-xs text-gray-500 mt-1">Hotels + dining out</div>
                    </div>
                </div>
            </div>

            {/* Cost Per Park Breakdown */}
            {trip.parks && trip.parks.length > 1 && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3">Cost Per Park</h4>
                    <div className="space-y-3">
                        {trip.parks.map((park, index) => {
                            const parkCost = Math.round(costBreakdown.total / trip.parks.length);
                            const stayDays = park.stayDuration || 2;
                            const costPerDay = Math.round(parkCost / stayDays);

                            return (
                                <div key={park.parkId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800">{park.parkName}</div>
                                            <div className="text-xs text-gray-500">{stayDays} day{stayDays > 1 ? 's' : ''} • {park.state}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-800">${parkCost.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">${costPerDay}/day</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* National Parks Pass Recommendation */}
            {trip.parks && trip.parks.length >= 3 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <FaTicketAlt className="text-purple-600" />
                        Annual Pass Savings
                    </h4>
                    <div className="text-sm text-purple-700">
                        <p className="mb-2">
                            With {trip.parks.length} parks, you could save money with an America the Beautiful Annual Pass:
                        </p>
                        <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-3 border border-purple-200">
                            <div>
                                <div className="text-xs text-gray-500">Individual Park Fees</div>
                                <div className="font-bold text-red-600">${costBreakdown.parkFees}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Annual Pass Cost</div>
                                <div className="font-bold text-green-600">$80</div>
                            </div>
                        </div>
                        {costBreakdown.parkFees > 80 && (
                            <p className="mt-2 text-green-700 font-medium">
                                💰 You would save ${costBreakdown.parkFees - 80} with an annual pass!
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <strong>Note:</strong> These are estimated costs based on national averages. Actual costs may vary significantly
                based on season, specific accommodations, dining choices, and current fuel prices. Always research specific
                costs for your travel dates and preferences. Park fees may vary by season and some parks offer different pass options.
            </div>
        </div>
    );
};

export default TripBudget;