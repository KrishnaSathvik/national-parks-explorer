// ============================================
// src/components/TripBuilder/TripStepReview.jsx
import React from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaDollarSign, FaRoute, FaCar, FaPlane, FaInfoCircle } from 'react-icons/fa';
import { formatDate, formatCurrency, formatDuration } from '../../../utils/common/formatters'; // ✅ Updated import
import { getCostBreakdown, generateTripItinerary } from '../../../utils/tripPlanner/tripHelpers'; // ✅ Updated import

const TripStepReview = ({ tripData }) => {
    const costBreakdown = getCostBreakdown(tripData);
    const itinerary = generateTripItinerary(tripData);

    return (
        <div className="space-y-6">
            {/* Trip Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaInfoCircle className="text-pink-500" />
                    Trip Overview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Trip Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-pink-500" />
                                    <span>{formatDate(tripData.startDate)} → {formatDate(tripData.endDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-purple-500" />
                                    <span>{formatDuration(tripData.totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {tripData.transportationMode === 'flying' ? (
                                        <FaPlane className="text-blue-500" />
                                    ) : (
                                        <FaCar className="text-green-500" />
                                    )}
                                    <span className="capitalize">{tripData.transportationMode} trip</span>
                                </div>
                            </div>
                        </div>

                        {tripData.description && (
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                    {tripData.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold">{tripData.parks?.length || 0}</div>
                                <div className="text-xs text-blue-100">Parks</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold">{tripData.totalDuration || 1}</div>
                                <div className="text-xs text-purple-100">Days</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-4 rounded-xl text-center col-span-2">
                                <div className="text-2xl font-bold">{formatCurrency(tripData.estimatedCost || 0)}</div>
                                <div className="text-xs text-green-100">Estimated Total Cost</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaRoute className="text-blue-500" />
                    Day-by-Day Itinerary
                </h2>

                {!tripData.parks || tripData.parks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No parks selected for itinerary</p>
                ) : (
                    <div className="space-y-3">
                        {itinerary.map((item, index) => (
                            <div key={index} className={`flex items-start gap-4 p-4 rounded-xl ${
                                item.type === 'visit' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                    item.type === 'visit' ? 'bg-blue-500' : 'bg-gray-400'
                                }`}>
                                    {item.type === 'visit' ? item.dayNumber : '✈️'}
                                </div>

                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">
                                        {item.type === 'visit' ? (
                                            <>Day {item.dayNumber}: {item.park?.name || 'Unknown Park'}</>
                                        ) : (
                                            <>Travel Day: {item.from} → {item.to}</>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatDate(item.date)} • {item.park?.state}
                                        {item.type === 'visit' && item.park?.totalStayDays > 1 && (
                                            <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                                Day {item.park.stayDay} of {item.park.totalStayDays}
                                            </span>
                                        )}
                                        {item.type === 'travel' && (
                                            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs capitalize">
                                                {item.mode}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaDollarSign className="text-green-500" />
                    Budget Breakdown
                </h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">🏨 Accommodation ({Math.max(0, (tripData.totalDuration || 1) - 1)} nights)</span>
                                <span className="font-semibold">{formatCurrency(costBreakdown.accommodation || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">
                                    {tripData.transportationMode === 'flying' ? '✈️' : '🚗'} Transportation
                                </span>
                                <span className="font-semibold">{formatCurrency(costBreakdown.transportation || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">🎫 Park Fees ({tripData.parks?.length || 0} parks)</span>
                                <span className="font-semibold">{formatCurrency(costBreakdown.parkFees || 0)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">🍽️ Food ({tripData.totalDuration || 1} days)</span>
                                <span className="font-semibold">{formatCurrency(costBreakdown.food || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">💼 Miscellaneous (15% buffer)</span>
                                <span className="font-semibold">{formatCurrency(costBreakdown.miscellaneous || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4 mt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-800">Total Estimated Cost</span>
                            <span className="text-2xl font-bold text-green-600">{formatCurrency(costBreakdown.total || 0)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            * Estimates based on average costs. Actual expenses may vary depending on your choices and travel style.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pre-Trip Checklist */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    📋 Pre-Trip Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-700">
                            <input type="checkbox" className="rounded" />
                            <span>Book accommodations for all locations</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                            <input type="checkbox" className="rounded" />
                            <span>Purchase or verify National Parks Annual Pass</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                            <input type="checkbox" className="rounded" />
                            <span>Check park alerts and road conditions</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-700">
                            <input type="checkbox" className="rounded" />
                            <span>Plan hiking routes and check trail conditions</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                            <input type="checkbox" className="rounded" />
                            <span>Pack appropriate gear for activities</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-700">
                            <input type="checkbox" className="rounded" />
                            <span>Download offline maps and park apps</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripStepReview;