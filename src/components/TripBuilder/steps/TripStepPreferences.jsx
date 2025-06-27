// src/components/TripBuilder/steps/TripStepPreferences.jsx
import React, { useState } from 'react';
import {
    FaHeart,
    FaHiking,
    FaCamera,
    FaFish,
    FaBinoculars,
    FaTree,
    FaWater,
    FaMountain,
    FaStar,
    FaUsers,
    FaDollarSign,
    FaClock,
    FaInfoCircle,
    FaCheck,
    FaPlus
} from 'react-icons/fa';

const TripStepPreferences = ({ tripData, setTripData, errors, dismissError }) => {
    const [customActivity, setCustomActivity] = useState('');

    const updatePreferences = (field, value) => {
        setTripData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [field]: value
            }
        }));
        if (dismissError) dismissError(`preferences.${field}`);
    };

    const toggleActivity = (activity) => {
        const currentActivities = tripData.preferences?.activities || [];
        const isSelected = currentActivities.includes(activity);

        const newActivities = isSelected
            ? currentActivities.filter(a => a !== activity)
            : [...currentActivities, activity];

        updatePreferences('activities', newActivities);
    };

    const addCustomActivity = () => {
        if (customActivity.trim()) {
            const currentActivities = tripData.preferences?.activities || [];
            if (!currentActivities.includes(customActivity.trim())) {
                updatePreferences('activities', [...currentActivities, customActivity.trim()]);
            }
            setCustomActivity('');
        }
    };

    const removeActivity = (activity) => {
        const currentActivities = tripData.preferences?.activities || [];
        updatePreferences('activities', currentActivities.filter(a => a !== activity));
    };

    // Activity options with icons and descriptions
    const activityOptions = [
        {
            id: 'hiking',
            name: 'Hiking & Trails',
            icon: FaHiking,
            description: 'Day hikes, nature walks, backcountry trails',
            color: 'green',
            popularity: 95
        },
        {
            id: 'photography',
            name: 'Photography',
            icon: FaCamera,
            description: 'Landscape photography, wildlife shots, sunrise/sunset',
            color: 'purple',
            popularity: 87
        },
        {
            id: 'wildlife',
            name: 'Wildlife Viewing',
            icon: FaBinoculars,
            description: 'Animal watching, bird spotting, nature observation',
            color: 'blue',
            popularity: 82
        },
        {
            id: 'scenic-drives',
            name: 'Scenic Driving',
            icon: FaMountain,
            description: 'Scenic routes, overlooks, accessible viewpoints',
            color: 'orange',
            popularity: 78
        },
        {
            id: 'water-activities',
            name: 'Water Activities',
            icon: FaWater,
            description: 'Lakes, rivers, waterfalls, swimming, boating',
            color: 'cyan',
            popularity: 65
        },
        {
            id: 'fishing',
            name: 'Fishing',
            icon: FaFish,
            description: 'Lake fishing, river fishing, fly fishing',
            color: 'teal',
            popularity: 45
        },
        {
            id: 'camping',
            name: 'Camping',
            icon: FaTree,
            description: 'Tent camping, RV camping, backcountry camping',
            color: 'emerald',
            popularity: 72
        },
        {
            id: 'stargazing',
            name: 'Stargazing',
            icon: FaStar,
            description: 'Night sky viewing, astronomy programs, dark skies',
            color: 'indigo',
            popularity: 38
        }
    ];

    // Difficulty levels
    const difficultyLevels = [
        {
            id: 'easy',
            name: 'Easy & Accessible',
            description: 'Paved trails, short walks, accessible viewpoints',
            icon: '🚶‍♀️',
            color: 'green',
            features: ['Paved paths', 'Short distances', 'Minimal elevation', 'Family-friendly']
        },
        {
            id: 'moderate',
            name: 'Moderate Adventure',
            description: 'Mix of easy and challenging activities',
            icon: '🥾',
            color: 'yellow',
            features: ['Some hiking', 'Moderate distances', 'Varied terrain', 'Good fitness helpful']
        },
        {
            id: 'challenging',
            name: 'Challenging Explorer',
            description: 'Strenuous hikes, backcountry adventures',
            icon: '⛰️',
            color: 'red',
            features: ['Long hikes', 'Steep terrain', 'High elevation', 'Excellent fitness required']
        }
    ];

    // Budget preferences
    const budgetLevels = [
        {
            id: 'budget',
            name: 'Budget-Conscious',
            description: 'Camping, basic amenities, cost-effective choices',
            range: '< $1,000',
            icon: '💰',
            features: ['Camping', 'Self-catering', 'Basic accommodations']
        },
        {
            id: 'moderate',
            name: 'Balanced Comfort',
            description: 'Mix of camping and hotels, moderate dining',
            range: '$1,000 - $3,000',
            icon: '🏨',
            features: ['Mixed accommodations', 'Some dining out', 'Moderate comfort']
        },
        {
            id: 'premium',
            name: 'Premium Experience',
            description: 'Hotels, fine dining, guided tours, premium experiences',
            range: '$3,000+',
            icon: '✨',
            features: ['Quality hotels', 'Fine dining', 'Premium activities']
        }
    ];

    const selectedActivities = tripData.preferences?.activities || [];
    const selectedDifficulty = tripData.preferences?.difficulty || 'moderate';
    const selectedBudget = tripData.preferences?.budget || 'moderate';
    const groupSize = tripData.preferences?.groupSize || 2;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FaHeart className="text-pink-500 text-2xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Your Preferences</h2>
                </div>
                <p className="text-gray-600">
                    Tell us what you love to do so we can suggest the perfect parks and activities
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Activity Preferences */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaHiking className="text-green-500" />
                            Favorite Activities
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Select all activities you enjoy (we'll suggest parks that match)
                        </p>

                        <div className="grid grid-cols-1 gap-3">
                            {activityOptions.map(activity => {
                                const Icon = activity.icon;
                                const isSelected = selectedActivities.includes(activity.id);

                                return (
                                    <button
                                        key={activity.id}
                                        onClick={() => toggleActivity(activity.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                                            isSelected
                                                ? `border-${activity.color}-500 bg-${activity.color}-50 shadow-md`
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg ${
                                                isSelected
                                                    ? `bg-${activity.color}-500 text-white`
                                                    : `bg-${activity.color}-100 text-${activity.color}-600 group-hover:bg-${activity.color}-200`
                                            }`}>
                                                <Icon className="text-lg" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                                                    {isSelected && <FaCheck className={`text-${activity.color}-500 text-sm`} />}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        {activity.popularity}% popular
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Activity Input */}
                        <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Add custom activity..."
                                    value={customActivity}
                                    onChange={(e) => setCustomActivity(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addCustomActivity()}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                                />
                                <button
                                    onClick={addCustomActivity}
                                    disabled={!customActivity.trim()}
                                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                                >
                                    <FaPlus className="text-sm" />
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Selected Activities */}
                        {selectedActivities.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Selected Activities:</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedActivities.map(activity => (
                                        <span
                                            key={activity}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm"
                                        >
                      {activity}
                                            <button
                                                onClick={() => removeActivity(activity)}
                                                className="text-pink-500 hover:text-pink-700 ml-1"
                                            >
                        ×
                      </button>
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Group Size */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUsers className="text-blue-500" />
                            Group Size
                        </h3>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">Number of travelers:</label>
                            <select
                                value={groupSize}
                                onChange={(e) => updatePreferences('groupSize', parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                            >
                                {[1,2,3,4,5,6,7,8].map(size => (
                                    <option key={size} value={size}>
                                        {size} {size === 1 ? 'person' : 'people'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            This helps us suggest appropriate accommodations and activities
                        </p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Difficulty Level */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClock className="text-purple-500" />
                            Activity Level
                        </h3>
                        <div className="space-y-3">
                            {difficultyLevels.map(level => (
                                <label
                                    key={level.id}
                                    className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                                        selectedDifficulty === level.id
                                            ? `border-${level.color}-500 bg-${level.color}-50 shadow-md`
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value={level.id}
                                        checked={selectedDifficulty === level.id}
                                        onChange={(e) => updatePreferences('difficulty', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">{level.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 mb-1">{level.name}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {level.features.map((feature, index) => (
                                                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Budget Preference */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaDollarSign className="text-green-500" />
                            Budget Style
                        </h3>
                        <div className="space-y-3">
                            {budgetLevels.map(budget => (
                                <label
                                    key={budget.id}
                                    className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                                        selectedBudget === budget.id
                                            ? 'border-green-500 bg-green-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="budget"
                                        value={budget.id}
                                        checked={selectedBudget === budget.id}
                                        onChange={(e) => updatePreferences('budget', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">{budget.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-800">{budget.name}</h4>
                                                <span className="text-sm font-medium text-green-600">{budget.range}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{budget.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {budget.features.map((feature, index) => (
                                                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Recommendations Preview */}
            {selectedActivities.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                        <FaInfoCircle className="text-purple-600" />
                        Smart Recommendations Preview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-purple-700 mb-2">
                                <strong>Based on your preferences, we'll suggest:</strong>
                            </p>
                            <ul className="space-y-1 text-purple-600">
                                {selectedActivities.includes('hiking') && (
                                    <li>• Parks with excellent trail systems</li>
                                )}
                                {selectedActivities.includes('photography') && (
                                    <li>• Iconic viewpoints and photo opportunities</li>
                                )}
                                {selectedActivities.includes('wildlife') && (
                                    <li>• Parks known for wildlife viewing</li>
                                )}
                                {selectedActivities.includes('water-activities') && (
                                    <li>• Parks with lakes, rivers, and waterfalls</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <p className="text-purple-700 mb-2">
                                <strong>Activity level: {difficultyLevels.find(d => d.id === selectedDifficulty)?.name}</strong>
                            </p>
                            <p className="text-purple-700 mb-2">
                                <strong>Budget style: {budgetLevels.find(b => b.id === selectedBudget)?.name}</strong>
                            </p>
                            <p className="text-purple-600 text-xs">
                                These preferences will help us customize park suggestions and activity recommendations in the next step.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripStepPreferences;