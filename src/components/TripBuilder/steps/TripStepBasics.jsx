// src/components/TripBuilder/steps/TripStepBasics.jsx (Enhanced from TripStepDetails)
import React, { useState } from 'react';
import { FaInfoCircle, FaCar, FaPlane, FaCalendarAlt, FaClock, FaBrain, FaMagic } from 'react-icons/fa';
import { calculateTripDuration } from '../../../utils/tripPlanner/tripCalculations';

const TripStepBasics = ({ tripData, setTripData, errors, dismissError }) => {
    const [suggestions] = useState({
        titles: [
            "Utah's Big 5 Adventure",
            "California Coastal Parks",
            "Yellowstone & Tetons Explorer",
            "Southwest Desert Circuit",
            "Alaska Wilderness Journey"
        ]
    });

    const updateField = (field, value) => {
        setTripData(prev => ({ ...prev, [field]: value }));
        if (dismissError) dismissError(field);
    };

    // Calculate minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    // Calculate trip duration for display
    const tripDuration = tripData.startDate && tripData.endDate
        ? calculateTripDuration(tripData.startDate, tripData.endDate)
        : 1;

    // Smart date suggestions
    const getDateSuggestions = () => {
        const now = new Date();
        const suggestions = [];

        // Next weekend
        const nextWeekend = new Date(now);
        nextWeekend.setDate(now.getDate() + (6 - now.getDay()) + 1); // Next Saturday
        const weekendEnd = new Date(nextWeekend);
        weekendEnd.setDate(nextWeekend.getDate() + 1); // Sunday

        // Next month
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        const nextMonthEnd = new Date(nextMonth);
        nextMonthEnd.setDate(nextMonth.getDate() + 6); // 7-day trip

        // Next season
        const nextSeason = new Date(now);
        nextSeason.setMonth(now.getMonth() + 3);
        const nextSeasonEnd = new Date(nextSeason);
        nextSeasonEnd.setDate(nextSeason.getDate() + 13); // 14-day trip

        return [
            {
                label: 'Weekend Trip',
                start: nextWeekend.toISOString().split('T')[0],
                end: weekendEnd.toISOString().split('T')[0],
                duration: 2
            },
            {
                label: 'Week-long Adventure',
                start: nextMonth.toISOString().split('T')[0],
                end: nextMonthEnd.toISOString().split('T')[0],
                duration: 7
            },
            {
                label: 'Extended Journey',
                start: nextSeason.toISOString().split('T')[0],
                end: nextSeasonEnd.toISOString().split('T')[0],
                duration: 14
            }
        ];
    };

    const dateSuggestions = getDateSuggestions();

    const handleSuggestionClick = (suggestion) => {
        updateField('startDate', suggestion.start);
        updateField('endDate', suggestion.end);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FaInfoCircle className="text-pink-500 text-2xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Trip Basics</h2>
                </div>
                <p className="text-gray-600">
                    Let's start with the fundamental details of your national parks adventure
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Trip Title */}
                    <div>
                        <label htmlFor="title" className="block font-semibold text-gray-700 mb-3">
                            Trip Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            className={`w-full p-4 border-2 rounded-xl text-sm transition-all duration-200 ${
                                errors.title
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500/20'
                            } focus:outline-none focus:ring-4`}
                            placeholder="e.g., Utah's Big 5 Adventure"
                            value={tripData.title || ''}
                            onChange={(e) => updateField('title', e.target.value)}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                {errors.title}
                            </p>
                        )}

                        {/* Title Suggestions */}
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <FaMagic className="text-purple-400" />
                                Quick suggestions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.titles.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => updateField('title', suggestion)}
                                        className="px-3 py-1 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-200 border border-purple-200"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block font-semibold text-gray-700 mb-3">
                            Description <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="description"
                            className="w-full p-4 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200 resize-none"
                            rows={4}
                            placeholder="Describe your adventure... What are you most excited about? Any special occasions or goals for this trip?"
                            value={tripData.description || ''}
                            onChange={(e) => updateField('description', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Help remember what made this trip special and share the story with others
                        </p>
                    </div>

                    {/* Transportation Mode */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-4">
                            Transportation Mode *
                        </label>
                        <div className="grid grid-cols-1 gap-4">
                            <label className={`cursor-pointer border-3 rounded-xl p-4 transition-all duration-200 ${
                                tripData.transportationMode === 'driving'
                                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}>
                                <input
                                    type="radio"
                                    name="transportationMode"
                                    value="driving"
                                    checked={tripData.transportationMode === 'driving'}
                                    onChange={(e) => updateField('transportationMode', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        tripData.transportationMode === 'driving'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        <FaCar className="text-xl" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-800 text-lg">Road Trip</div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            Drive between parks, enjoy scenic routes
                                        </div>
                                        <div className="flex gap-4 text-xs">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                More affordable
                                            </span>
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                Scenic routes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <label className={`cursor-pointer border-3 rounded-xl p-4 transition-all duration-200 ${
                                tripData.transportationMode === 'flying'
                                    ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}>
                                <input
                                    type="radio"
                                    name="transportationMode"
                                    value="flying"
                                    checked={tripData.transportationMode === 'flying'}
                                    onChange={(e) => updateField('transportationMode', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        tripData.transportationMode === 'flying'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-purple-100 text-purple-600'
                                    }`}>
                                        <FaPlane className="text-xl" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-800 text-lg">Air Travel</div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            Fly to destinations, maximize park time
                                        </div>
                                        <div className="flex gap-4 text-xs">
                                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                                Faster travel
                                            </span>
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                                More park time
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {errors.transportationMode && (
                            <p className="text-sm text-red-500 mt-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                {errors.transportationMode}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Date Selection */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-4">
                            Trip Dates *
                        </label>

                        {/* Smart Date Suggestions */}
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                <FaBrain className="text-purple-400" />
                                Quick date options:
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                {dateSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="p-3 text-left border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-800 group-hover:text-purple-700">
                                                    {suggestion.label}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {suggestion.duration} days
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(suggestion.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Manual Date Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-600 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    min={today}
                                    className={`w-full p-3 border-2 rounded-xl text-sm transition-all duration-200 ${
                                        errors.startDate
                                            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500/20'
                                    } focus:outline-none focus:ring-4`}
                                    value={tripData.startDate || ''}
                                    onChange={(e) => updateField('startDate', e.target.value)}
                                />
                                {errors.startDate && (
                                    <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-600 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    min={tripData.startDate || today}
                                    className={`w-full p-3 border-2 rounded-xl text-sm transition-all duration-200 ${
                                        errors.endDate
                                            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-pink-500 focus:ring-pink-500/20'
                                    } focus:outline-none focus:ring-4`}
                                    value={tripData.endDate || ''}
                                    onChange={(e) => updateField('endDate', e.target.value)}
                                />
                                {errors.endDate && (
                                    <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                                )}
                            </div>
                        </div>

                        {/* Trip Duration Display */}
                        {tripData.startDate && tripData.endDate && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <FaClock className="text-blue-500" />
                                    <span className="font-medium">
                                        Trip Duration: {tripDuration} day{tripDuration > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Planning Tips */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <FaInfoCircle className="text-blue-600" />
                            Smart Planning Tips
                        </h4>
                        <div className="space-y-3 text-sm text-blue-700">
                            <div className="flex gap-3">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                <div>
                                    <strong>Transportation:</strong> Road trips work best for parks within 500 miles.
                                    Flying is ideal for cross-country adventures or time-limited trips.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                                <div>
                                    <strong>Timing:</strong> Spring and fall offer the best weather and fewer crowds.
                                    Summer can be crowded but offers full access to high-elevation areas.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                                <div>
                                    <strong>Duration:</strong> Allow at least 2-3 days for major parks like Yellowstone,
                                    Yosemite, or Grand Canyon to fully experience their highlights.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripStepBasics;